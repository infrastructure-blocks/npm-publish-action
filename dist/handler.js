import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
const VError = __require("verror");
export class HandlerImpl {
    static ERROR_NAME = "HandlerImplError";
    context;
    config;
    constructor(params) {
        const { context, config } = params;
        this.context = context;
        this.config = config;
    }
    handle() {
        throw new VError({ name: HandlerImpl.ERROR_NAME }, "implement me!");
    }
}
export function createHandler(params) {
    return new HandlerImpl(params);
}
//# sourceMappingURL=handler.js.map