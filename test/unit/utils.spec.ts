import { afterEach, describe } from "mocha";
import { parsePackageJson, versionFromString } from "../../src/utils.js";
import { expect } from "@infra-blocks/test";
import mockFs from "mock-fs";

describe("util", function () {
  describe(versionFromString.name, function () {
    it("should work for patch", function () {
      expect(versionFromString("patch")).to.equal("patch");
    });
    it("should work for minor", function () {
      expect(versionFromString("minor")).to.equal("minor");
    });
    it("should work for major", function () {
      expect(versionFromString("major")).to.equal("major");
    });
    it("should throw for anything else", function () {
      expect(() => versionFromString("premajor")).to.throw();
    });
  });
  describe(parsePackageJson.name, function () {
    afterEach("restore fs", function () {
      mockFs.restore();
    });

    it("should work with the default file path", async function () {
      const packageJson = {
        name: "@big/package",
        version: "0.1.0",
        type: "module",
        scripts: {
          test: "echo 'no tests here'",
        },
      };
      mockFs({
        "package.json": JSON.stringify(packageJson, null, 2),
      });
      expect(await parsePackageJson()).to.deep.equal(packageJson);
    });
    it("should work in a different working directory", async function () {
      const packageJson = {
        name: "@big/package",
        version: "0.1.1",
        type: "module",
        scripts: {
          test: "echo 'still no tests'",
        },
      };
      mockFs({
        "big/package/package.json": JSON.stringify(packageJson, null, 2),
      });
      expect(await parsePackageJson("big/package/package.json")).to.deep.equal(
        packageJson
      );
    });
    it("should throw if the package.json is missing", async function () {
      mockFs({});
      await expect(parsePackageJson()).to.be.rejected;
    });
  });
});
