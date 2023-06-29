import { Context } from "@actions/github/lib/context.js";
export interface Config {
    example: string;
}
export interface Handler {
    handle(): Promise<void>;
}
export declare class HandlerImpl implements Handler {
    private static ERROR_NAME;
    private readonly context;
    private readonly config;
    constructor(params: {
        context: Context;
        config: Config;
    });
    handle(): Promise<void>;
}
export declare function createHandler(params: {
    context: Context;
    config: Config;
}): Handler;
