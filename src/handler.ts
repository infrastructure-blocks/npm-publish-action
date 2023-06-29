import { Context } from "@actions/github/lib/context.js";
import VError = require("verror");

export interface Config {
  example: string;
}

export interface Handler {
  handle(): Promise<void>;
}

export class HandlerImpl implements Handler {
  private static ERROR_NAME = "HandlerImplError";

  private readonly context: Context;
  private readonly config: Config;

  constructor(params: { context: Context; config: Config }) {
    const { context, config } = params;
    this.context = context;
    this.config = config;
  }

  handle(): Promise<void> {
    throw new VError({ name: HandlerImpl.ERROR_NAME }, "implement me!");
  }
}

export function createHandler(params: {
  context: Context;
  config: Config;
}): Handler {
  return new HandlerImpl(params);
}
