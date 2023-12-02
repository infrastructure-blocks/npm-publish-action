import { Context } from "@actions/github/lib/context.js";

// TODO: move into lib?
export type Outputs = Record<string, string>;

export interface Handler<O extends Outputs = Outputs> {
  handle(): Promise<O>;
}

export interface Config {
  example: string;
}

export interface ExampleOutputs extends Outputs {
  ["example-output"]: string;
}

export class HandlerImpl implements Handler<ExampleOutputs> {
  private static ERROR_NAME = "HandlerImplError";

  private readonly context: Context;
  private readonly config: Config;

  constructor(params: { context: Context; config: Config }) {
    const { context, config } = params;
    this.context = context;
    this.config = config;
  }

  handle(): Promise<ExampleOutputs> {
    const outputs = {
      ["example-output"]: `got input ${this.config.example}`,
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
