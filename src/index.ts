import * as core from "@actions/core";
import { context } from "@actions/github";
import { createHandler } from "./handler.js";
import VError from "verror";
import {
  checkSupportedEvent,
  Event,
  getInputs,
  stringInput,
} from "@infra-blocks/github";

async function main() {
  core.debug(`received context: ${JSON.stringify(context, null, 2)}`);
  checkSupportedEvent(context.eventName, [Event.Push]);
  const inputs = getInputs({
    example: stringInput(),
  });
  const handler = createHandler({
    context,
    config: {
      example: inputs.example,
    },
  });
  const outputs = await handler.handle();
  for (const [key, value] of Object.entries(outputs)) {
    core.debug(`setting output ${key}=${value}`);
    core.setOutput(key, value);
  }
}

main().catch((err: Error) => core.setFailed(VError.fullStack(err)));
