import { Context } from "@actions/github/lib/context.js";

export interface Config {
  example: string;
}

export interface Outputs {
  ["example-output"]: string;
}

export interface Handler {
  handle(): Promise<Outputs>;
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

  handle(): Promise<Outputs> {
    const outputs = {
      ["example-output"]: "hello-world",
    };
    return Promise.resolve(outputs);
  }
}

export function createHandler(params: {
  context: Context;
  config: Config;
}): Handler {
  return new HandlerImpl(params);
}
