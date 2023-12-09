//TODO: https://github.com/orgs/infrastructure-blocks/projects/1/views/1?pane=issue&itemId=46399930
import { execa, ExecaChildProcess } from "execa";
import VError from "verror";
import { checkType } from "@infra-blocks/checks";
import { isFunction } from "@infra-blocks/types";

/**
 * Options used to customize the behavior of CLI commands.
 */
export interface CliOptions {
  /**
   * The working directory in which the command executes.
   */
  workingDirectory?: string;
  /**
   * The extra environment variables passed to the command.
   *
   * The default is to load process.env.
   */
  env?: Record<string, string>;
}

export type CliProcess = ExecaChildProcess;

/**
 * Common CLI operations grouped under one interface.
 */
export interface Cli<T> {
  /**
   * Returns a new instance of the CLI with the provided options.
   *
   * @param options - The new options of the CLI
   */
  withOptions(options?: CliOptions): T;

  /**
   * Returns a new instance of the CLI running in the provided directory.
   *
   * @param workingDirectory - The new working directory of the CLI.
   */
  inDirectory(workingDirectory: string): T;

  /**
   * Returns a new instance of the CLI configured with extra environment
   * variables.
   *
   * @param env - The extra environment variables.
   */
  withEnv(env: Record<string, string>): T;
}

/**
 * Convenience base class for CLI implementations.
 *
 * It leverages execa to run commands.
 *
 * It provides some default implementations, but also the {@link BaseCli#runAsync} method that
 * centralizes conventional operations, like encapsulating the errors of execa.
 */
export abstract class BaseCli<T> implements Cli<T> {
  /**
   * The command name to invoke on every operation.
   */
  protected readonly command: string;
  protected readonly workingDirectory: string;
  protected readonly env: Record<string, string>;

  protected constructor(params: { command: string } & CliOptions) {
    const { command, workingDirectory = process.cwd(), env = {} } = params;
    this.command = command;
    this.workingDirectory = workingDirectory;
    this.env = env;
  }

  abstract withOptions(options?: CliOptions): T;

  inDirectory(workingDirectory: string): T {
    return this.withOptions({ workingDirectory });
  }

  withEnv(env: Record<string, string>): T {
    return this.withOptions({ env });
  }

  /**
   * Allows users to run a command using any discretionary arguments.
   *
   * @param args
   *
   * @returns A CliProcess that can be awaited on.
   */
  run(args: string[]): CliProcess {
    return this.runAsync(args);
  }

  /**
   * Runs the command with the arguments provided.
   *
   * The error messages coming from execa are wrapped into something a little more meaningful
   * and chained with verror.
   *
   * @param args - The command arguments.
   */
  protected runAsync(args: string[]): CliProcess {
    const options = {
      cwd: this.workingDirectory,
      env: this.env,
    };
    const command = execa(this.command, args, options);
    const tweakedPromise = command.catch((err) => {
      throw new VError(
        { name: "CliError", cause: err },
        `error while running ${this.command} ${args.join(" ")}`
      );
    });
    return new Proxy(command, {
      get(target, prop) {
        if (prop === "then" || prop === "catch") {
          const native = checkType(
            Reflect.get(tweakedPromise, prop),
            "function"
          );
          return native.bind(tweakedPromise) as unknown;
        }

        const result: unknown = Reflect.get(command, prop);
        if (isFunction(result)) {
          return result.bind(command) as unknown;
        } else {
          return result;
        }
      },
    });
  }
}
