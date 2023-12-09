import semver, { SemVer } from "semver";
import { checkNotNull } from "@infra-blocks/checks";
import { checkType } from "@infra-blocks/checks";

export type ReleaseVersion = "patch" | "minor" | "major";
export type PrereleaseVersion = "prepatch" | "preminor" | "premajor";

export function prereleaseVersion(version: ReleaseVersion): PrereleaseVersion {
  return `pre${version}`;
}

export function findLatestLineageSemver(params: {
  versions: ReadonlyArray<string>;
  lineage: string;
}): string {
  const { versions, lineage } = params;

  const lineageComponents = checkSemverPrerelease(lineage);
  // Checking that the versions are valid semver versions and ordering them in reverse order.
  const sorted = [...versions].sort((left, right) =>
    checkSemver(right).compare(checkSemver(left))
  );

  return checkNotNull(
    sorted.find((version) => {
      const parsed = checkNotNull(semver.parse(version));
      return (
        parsed.major === lineageComponents.major &&
        parsed.minor === lineageComponents.minor &&
        parsed.patch === lineageComponents.patch &&
        // That's the preid.
        parsed.prerelease[0] === lineageComponents.prerelease[0]
      );
    })
  );
}

export function getPreId(version: string): string {
  const parsed = checkSemverPrerelease(version);
  if (parsed.prerelease.length > 1) {
    return checkType(parsed.prerelease[0], "string");
  }
  return "";
}

export function checkSemver(value: string): SemVer {
  const parsed = semver.parse(value);
  if (parsed == null) {
    throw new Error(`invalid semver version: ${value}`);
  }
  return parsed;
}

export function checkSemverRelease(value: string): SemVer {
  const parsed = checkSemver(value);
  if (parsed.prerelease.length > 0 || parsed.build.length > 0) {
    throw new Error(`invalid semver release ${value}`);
  }
  return parsed;
}

export function checkSemverPrerelease(value: string): SemVer {
  const parsed = checkSemver(value);
  if (parsed.prerelease.length == 0) {
    throw new Error(`invalid semver prerelease ${value}`);
  }
  return parsed;
}
