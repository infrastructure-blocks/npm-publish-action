import fs from "node:fs/promises";
import { PackageJson } from "types-package-json";

export type NpmPublishVersion = "patch" | "minor" | "major";

export function versionFromString(version: string): NpmPublishVersion {
  switch (version) {
    case "patch":
    case "minor":
    case "major":
      return version;
    default:
      throw new Error(`unknown npm version: ${version}`);
  }
}

// TODO: in node/npm utility library.
/**
 * Parses the package JSON into a typed object.
 *
 * It doesn't validate the package file.
 *
 * @param options.packagePath
 */
export async function parsePackageJson(
  packagePath?: string
): Promise<PackageJson> {
  const filePath = packagePath || "package.json";

  return JSON.parse(
    await fs.readFile(filePath, { encoding: "utf-8" })
  ) as PackageJson;
}

export function getNpmJsRegistryLink(params: {
  packageName: string;
  ref: string;
}) {
  const { packageName, ref } = params;
  return `https://www.npmjs.com/package/${packageName}/v/${ref}`;
}
