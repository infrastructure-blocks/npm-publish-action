import { describe } from "mocha";
import {
  findLatestLineageSemver,
  getPreId,
  prereleaseVersion,
} from "../../src/semver.js";
import { expect } from "@infra-blocks/test";

describe("semver", function () {
  describe(prereleaseVersion.name, function () {
    it("should work with patch", function () {
      expect(prereleaseVersion("patch")).to.equal("prepatch");
    });
    it("should work with minor", function () {
      expect(prereleaseVersion("minor")).to.equal("preminor");
    });
    it("should work with major", function () {
      expect(prereleaseVersion("major")).to.equal("premajor");
    });
  });
  describe(getPreId.name, function () {
    it("should work with v1.2.3-alpha.0", function () {
      expect(getPreId("v1.2.3-alpha.0")).to.equal("alpha");
    });
    it("should work with v1.2.3-0", function () {
      expect(getPreId("v1.2.3-0")).to.equal("");
    });
    it("should throw with v1.2.3", function () {
      expect(() => getPreId("v1.2.3")).to.throw();
    });
  });
  describe(findLatestLineageSemver.name, function () {
    it("should work with singleton array", function () {
      expect(
        findLatestLineageSemver({
          versions: ["1.2.3-test.0"],
          lineage: "1.2.3-test.0",
        })
      ).to.equal("1.2.3-test.0");
    });
    it("should work with a sorted versions array", function () {
      expect(
        findLatestLineageSemver({
          versions: [
            "1.2.3-test.0",
            "1.2.3-test.1",
            "1.2.3-test.2",
            "1.2.3-test.3",
          ],
          lineage: "1.2.3-test.0",
        })
      ).to.equal("1.2.3-test.3");
    });
    it("should work with a sorted versions array in descending order", function () {
      expect(
        findLatestLineageSemver({
          versions: [
            "1.2.3-test.3",
            "1.2.3-test.2",
            "1.2.3-test.1",
            "1.2.3-test.0",
          ],
          lineage: "1.2.3-test.0",
        })
      ).to.equal("1.2.3-test.3");
    });
    it("should work with a mish-mash of values", function () {
      expect(
        findLatestLineageSemver({
          versions: [
            "1.2.3",
            "1.2.3-alpha.2",
            "0.0.0",
            "1.2.3-test.2",
            "1.2.3-test.1",
            "1.0.1",
            "1.2.3-alpha.4",
            "1.2.3-alpha.3",
            "1.2.3-test.3",
            "1.0.0",
            "1.2.3-alpha.0",
            "1.2.3-test.0",
            "0.0.1",
            "0.0.2",
            "1.2.3-alpha.1",
          ],
          lineage: "1.2.3-test.0",
        })
      ).to.equal("1.2.3-test.3");
    });
  });
});
