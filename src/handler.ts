import { NpmPublishVersion, parsePackageJson } from "./utils.js";
import path from "node:path";
import { PackageJson } from "types-package-json";
import { createNpmCli, NpmCli } from "./npm.js";
import * as core from "@actions/core";
import { checkNotNull } from "@infra-blocks/checks";
import semver from "semver";
import {
  checkSemverRelease,
  findLatestLineageSemver,
  getPreId,
  prereleaseVersion,
} from "./semver.js";
import VError from "verror";

export type Outputs = Record<string, string>;

export interface Handler<O extends Outputs = Outputs> {
  handle(): Promise<O>;
}

export interface Config {
  version: NpmPublishVersion;
  distTags: string[];
  prerelease: boolean;
  dryRun: boolean;
}

export interface NpmPublishOutputs extends Outputs {
  released: string;
  ["git-tag"]: string;
}

abstract class BaseNpmPublishHandler implements Handler<NpmPublishOutputs> {
  static ERROR_NAME = "NpmPublishHandlerError";

  protected readonly config: Config;
  protected readonly npm: NpmCli;

  protected constructor(params: { config: Config; npm: NpmCli }) {
    const { config, npm } = params;
    this.config = config;
    this.npm = npm;
  }

  async handle(): Promise<NpmPublishOutputs> {
    try {
      if (core.isDebug()) {
        core.debug(
          `handling event with config: ${JSON.stringify(this.config, null, 2)}`
        );

        const npmConfig = await this.npm.run(["config", "ls", "-l"]);
        core.debug(`npm config: \n${npmConfig.stdout}`);
      }

      const packageJson = await this.parseWorkspacePackageJson();
      const version = await this.inferVersion({ packageJson });
      const gitTag = await this.bumpVersion({ version });
      await this.publish({ packageJson, version });

      return {
        released: version,
        "git-tag": gitTag,
      };
    } catch (err) {
      throw new VError(
        {
          name: BaseNpmPublishHandler.ERROR_NAME,
          cause: err as Error,
        },
        `error while handling npm publish ${
          this.config.prerelease ? "prerelease" : "release"
        }`
      );
    }
  }

  protected abstract inferVersion(params: {
    packageJson: PackageJson;
  }): Promise<string>;

  protected abstract bumpVersion(params: { version: string }): Promise<string>;

  protected async parseWorkspacePackageJson() {
    // Take the caller's package and not ours.
    const packagePath = path.join(process.cwd(), "package.json");
    core.info(`reading package version from ${packagePath}`);
    return parsePackageJson(packagePath);
  }

  protected async publish(params: {
    packageJson: PackageJson;
    version: string;
  }) {
    const { packageJson, version } = params;
    core.info(`publishing package under ${packageJson.name}@${version}`);
    core.info(
      `publishing package under ${packageJson.name}@${this.config.distTags[0]}`
    );
    await this.npm.publish({
      dryRun: this.config.dryRun,
      tag: this.config.distTags[0],
    });

    if (!this.config.dryRun) {
      for (const distTag of this.config.distTags.slice(1)) {
        core.info(`publishing package under ${packageJson.name}@${distTag}`);
        await this.npm.run([
          "dist-tag",
          "add",
          `${packageJson.name}@${version}`,
          distTag,
        ]);
      }
    }
  }
}

export class NpmPublishReleaseHandler extends BaseNpmPublishHandler {
  constructor(params: { config: Config; npm: NpmCli }) {
    super(params);
  }

  protected inferVersion(params: {
    packageJson: PackageJson;
  }): Promise<string> {
    const { packageJson } = params;
    const version = checkNotNull(
      semver.inc(packageJson.version, this.config.version)
    );
    checkSemverRelease(version);
    return Promise.resolve(version);
  }

  protected async bumpVersion(params: { version: string }) {
    const { version } = params;

    core.info(`bumping package version to ${version}`);
    // Not creating commits if running in dry mode.
    await this.npm.version(version, { gitTagVersion: !this.config.dryRun });
    return this.config.dryRun ? "" : `v${version}`;
  }
}

/**
 * In prerelease mode, we do not commit anything.
 *
 * We query the registry to figure out what version we should use and attempt to publish that version.
 */
export class NpmPublishPrereleaseHandler extends BaseNpmPublishHandler {
  constructor(params: { config: Config; npm: NpmCli }) {
    super(params);
  }

  protected async inferVersion(params: {
    packageJson: PackageJson;
  }): Promise<string> {
    const { packageJson } = params;

    const packageVersion = packageJson.version;

    /*
     Because the prerelease ID comes from the .npmrc file, we run npm version to get what it would look like.
     The side effect, is that we possibly have to allow running npm version with the same version later on.
     */
    await this.npm.version(prereleaseVersion(this.config.version), {
      gitTagVersion: false,
    });
    const lineage = (await this.parseWorkspacePackageJson()).version;
    const preId = getPreId(lineage);

    const versions = await this.npm.listVersions(packageJson.name);
    core.debug(`found package versions: ${JSON.stringify(versions, null, 2)}`);

    // If the lineage doesn't exist, create it.
    if (!versions.includes(lineage)) {
      core.info(
        `lineage ${lineage} for pre${packageVersion} of ${packageVersion} doesn't exist, creating it`
      );
      return lineage;
    }

    // Otherwise we pick the latest prerelease of the lineage, then increment the prerelease number.
    core.info(
      `lineage ${lineage} for pre${packageVersion} of ${packageVersion} exists, finding latest prerelease`
    );
    const latestLineageVersion = findLatestLineageSemver({ versions, lineage });
    core.info(`latest prerelease found ${latestLineageVersion}`);

    return checkNotNull(semver.inc(latestLineageVersion, `prerelease`, preId));
  }

  protected async bumpVersion(params: { version: string }) {
    const { version } = params;

    core.info(`bumping package version to ${version}`);
    // We allow the same version because we already ran npm version to determine the lineage.
    await this.npm.version(version, {
      gitTagVersion: false,
      allowSameVersion: true,
    });
    return "";
  }
}

export function createHandler(params: { config: Config }): Handler {
  const { config } = params;
  const npm = createNpmCli();
  if (config.prerelease) {
    return new NpmPublishPrereleaseHandler({ config, npm });
  }
  return new NpmPublishReleaseHandler({ config, npm });
}
