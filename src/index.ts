import * as core from "@actions/core";
import { context } from "@actions/github";
import { createHandler } from "./handler.js";
import VError from "verror";
import { booleanInput, getInputs, stringInput } from "@infra-blocks/github";
import { versionFromString } from "./utils.js";

async function main() {
  core.debug(`received env: ${JSON.stringify(process.env, null, 2)}`);
  core.debug(`received context: ${JSON.stringify(context, null, 2)}`);

  const inputs = getInputs({
    version: stringInput(),
    prerelease: booleanInput({ default: false }),
    ["dry-run"]: booleanInput({ default: false }),
    ["dist-tags"]: stringInput({ default: "latest" }),
  });
  const handler = createHandler({
    config: {
      // TODO: as enum in getInputs.
      version: versionFromString(inputs.version),
      prerelease: inputs.prerelease,
      dryRun: inputs["dry-run"],
      // TODO: as CSV from lib.
      distTags: inputs["dist-tags"].split(",").map((token) => token.trim()),
      cwd: process.env.GITHUB_WORKPSACE || process.cwd(),
    },
  });
  const outputs = await handler.handle();
  for (const [key, value] of Object.entries(outputs)) {
    core.debug(`setting output ${key}=${value}`);
    core.setOutput(key, value);
  }
}

main().catch((err: Error) => core.setFailed(VError.fullStack(err)));
