import { createHandler } from "../../src/handler.js";
import { context } from "@actions/github";
import { expect } from "@infra-blocks/test";

describe("handler", function () {
  describe(createHandler.name, function () {
    it("should create handler", function () {
      const handler = createHandler({
        context,
        config: { example: "stuff" },
      });
      expect(handler).to.not.be.null;
    });
  });
});
