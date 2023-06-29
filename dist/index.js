import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
import * as core from "@actions/core";
import { context } from "@actions/github";
import { createHandler } from "./handler.js";
const VError = __require("verror");
import { checkSupportedEvent, Event, getInputs, stringInput, } from "@infra-blocks/github";
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
    await handler.handle();
}
main().catch((err) => core.setFailed(VError.fullStack(err)));
//# sourceMappingURL=index.js.map