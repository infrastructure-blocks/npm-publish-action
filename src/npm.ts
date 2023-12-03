// TODO: lib.
import { BaseCli, CliOptions } from "./cli.js";
import { isString } from "@infra-blocks/types";
import VError from "verror";

const ERROR_NAME = "NpmCliError";

/**
 * Class encapsulating operations with the NPM CLI installed on the executing code's machine.
 *
 * All operations are asynchronous.
 */
export class NpmCli extends BaseCli<NpmCli> {
  constructor(options?: CliOptions) {
    super({ command: "npm", ...options });
  }

  withOptions(options?: CliOptions): NpmCli {
    return new NpmCli(options);
  }

  /**
   * Returns the latest package's version.
   *
   * @param packageName - The package name to query
   */
  async fetchLatestVersion(packageName: string): Promise<string> {
    const { stdout } = await this.runAsync(["view", packageName, "version"]);
    return stdout;
  }

  /**
   * Returns the list of versions of the package.
   *
   * The list includes pre-releases and versions are ordered in ascending semver order.
   *
   * @param packageName - The package name.
   */
  async listVersions(packageName: string): Promise<string[]> {
    const { stdout } = await this.runAsync([
      "view",
      packageName,
      "versions",
      "--json",
    ]);
    // Npm replies with a single string when there is only one version.
    const json = JSON.parse(stdout) as string | string[];
    if (isString(json)) {
      return [json];
    }
    if (!Array.isArray(json)) {
      throw new VError(
        { name: ERROR_NAME },
        `unexpected response from NPM cli: ${stdout} when listing versions for ${packageName}`
      );
    }
    return json;
  }

  /**
   * Checks the existence of a package.
   *
   * @param packageName - The package to verify whether it exists in the registry
   */
  async packageExists(packageName: string): Promise<boolean> {
    try {
      await this.fetchLatestVersion(packageName);
      return true;
    } catch (err) {
      if (
        VError.fullStack(err as Error).includes("npm ERR! 404 Not Found") ||
        VError.fullStack(err as Error).includes("npm ERR! code E404")
      ) {
        return false;
      }
      throw err;
    }
  }

  /**
   * Installs the provided package.
   *
   * Optionally, the user can install globally or specify its version. Note that
   * the default version is the one marked with the "latest" tag.
   *
   * @param packageName - The name of the package. Example: @breather/infra
   * @param options.global - Whether to install globally.
   * @param options.version - The package version to install.
   */
  async install(
    packageName: string,
    options?: { global?: boolean; version?: string }
  ): Promise<void> {
    const { global = false, version = "" } = options || {};

    const commandArguments = ["install"];
    if (global) {
      commandArguments.push("--global");
    }

    if (version !== "") {
      commandArguments.push(`${packageName}@${version}`);
    } else {
      commandArguments.push(packageName);
    }

    await this.runAsync(commandArguments);
  }

  /**
   * Runs npm version with the provided version.
   *
   * The version can be symbolic, like "major", "minor", "patch", etc... or it can
   * be an exact version number.
   *
   * @param version - The new bumped version. Either symbolic or literal.
   * @param options.gitTagVersion - Whether to produce a git commit with a tag. Defaults to true.
   * @param options.preReleaseId - The prerelease identifier when using symbolic version bumps like prerelease or premajor
   *                       for example.
   * @param options.gitCommitHooks - Whether to run git commit hooks when creating a commit. Defaults to true.
   * @param options.allowSameVerion - Whether to allow setting the same version as in the package.json. Defaults to false.
   */
  async version(
    version: string,
    options?: {
      gitTagVersion?: boolean;
      preReleaseId?: string;
      gitCommitHooks?: boolean;
      allowSameVersion?: boolean;
    }
  ): Promise<string> {
    const {
      gitTagVersion = true,
      preReleaseId,
      gitCommitHooks = true,
      allowSameVersion = false,
    } = options || {};

    const commandArguments = ["version"];
    if (!gitTagVersion) {
      commandArguments.push("--no-git-tag-version");
    }
    if (!gitCommitHooks) {
      commandArguments.push("--no-commit-hooks");
    }
    if (allowSameVersion) {
      commandArguments.push("--allow-same-version");
    }
    if (preReleaseId != null) {
      commandArguments.push("--preid");
      commandArguments.push(preReleaseId);
    }

    commandArguments.push(version);
    const { stdout } = await this.runAsync(commandArguments);
    return stdout;
  }

  /**
   * Runs NPM publish.
   *
   * The user can decide to assign a distribution tag to the publication. It defaults
   * to "latest".
   *
   * @param options.tag - The distribution tag of the published package. Defaults to latest.
   * @param options.dryRun - Whether to actually publish, or just check.
   * @param options.access - Restricted or public package.
   */
  async publish(options?: {
    tag?: string;
    dryRun?: boolean;
    access?: "restricted" | "public";
  }): Promise<void> {
    const { tag, dryRun = false, access } = options || {};

    const commandArguments = ["publish"];
    if (dryRun) {
      commandArguments.push("--dry-run");
    }
    if (tag != null) {
      commandArguments.push("--tag");
      commandArguments.push(tag);
    }
    if (access != null) {
      commandArguments.push("--access");
      commandArguments.push(access);
    }

    await this.runAsync(commandArguments);
  }
}

/**
 * Returns a {@link NpmCli} instance that will operate with the provided options.
 *
 * @param options - See {@link CliOptions}
 */
export function createNpmCli(options?: CliOptions): NpmCli {
  return new NpmCli(options);
}
