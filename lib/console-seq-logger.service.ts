import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { SeqLogger } from './seq-logger.service';
import { safeStringify } from './utils';

/**
 * Nest system console logging to Seq through custom console logger
 * Added by Jason.Song (成长的小猪) on 2021-09-24 16:56:31
 * ```typescript
 *  import { NestFactory } from '@nestjs/core';
 *  import { AppModule } from './app.module';
 *  // Import the ConsoleSeqLogger from '@jasonsoft/nestjs-seq'
 *  import { ConsoleSeqLogger } from '@jasonsoft/nestjs-seq';
 *
 *  async function bootstrap() {
 *    // Set bufferLogs to true to ensure that all logs will be buffered until a custom logger (ConsoleSeqLogger) is attached.
 *    const app = await NestFactory.create(AppModule, {
 *      bufferLogs: true,
 *    });
 *    // Extend built-in logger
 *    app.useLogger(app.get(ConsoleSeqLogger));
 *
 *    await app.listen(3000);
 *  }
 *  bootstrap();
 * ```
 */
@Injectable()
export class ConsoleSeqLogger extends ConsoleLogger {
  constructor(private readonly logger: SeqLogger) {
    super();
  }

  /**
   * Logs a message at the 'log' level.
   * Updated by Jason.Song (成长的小猪) on 2024/04/09 23:25:35
   */
  log(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('log')) {
      return;
    }
    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParams,
    ]);
    this.forwardToSeqLogger('log', messages, context);
    super.log(message, ...optionalParams);
  }

  /**
   * Logs a message at the 'error' level.
   * Updated by Jason.Song (成长的小猪) on 2024/04/09 23:26:03
   */
  error(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('error')) {
      return;
    }
    const { messages, context, stack } = this.getContextAndStackAndMessages([
      message,
      ...optionalParams,
    ]);
    this.forwardToSeqLogger('error', messages, context, stack);
    super.error(message, ...optionalParams);
  }

  /**
   * Logs a message at the 'warn' level.
   * Updated by Jason.Song (成长的小猪) on 2024/04/09 23:26:31
   */
  warn(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('warn')) {
      return;
    }
    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParams,
    ]);
    this.forwardToSeqLogger('warn', messages, context);
    super.warn(message, ...optionalParams);
  }

  /**
   * Logs a message at the 'debug' level.
   * Updated by Jason.Song (成长的小猪) on 2024/04/09 23:26:55
   */
  debug(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('debug')) {
      return;
    }
    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParams,
    ]);
    this.forwardToSeqLogger('debug', messages, context);
    super.debug(message, ...optionalParams);
  }

  /**
   * Logs a message at the 'verbose' level.
   * Updated by Jason.Song (成长的小猪) on 2024/04/09 23:27:15
   */
  verbose(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('verbose')) {
      return;
    }
    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParams,
    ]);
    this.forwardToSeqLogger('verbose', messages, context);
    super.verbose(message, ...optionalParams);
  }

  /**
   * Logs a message at the 'fatal' level.
   * Updated by Jason.Song (成长的小猪) on 2024/04/09 23:27:35
   */
  fatal(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled('fatal')) {
      return;
    }
    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParams,
    ]);
    this.forwardToSeqLogger('fatal', messages, context);
    super.fatal(message, ...optionalParams);
  }

  /**
   * Forwards log messages to the SeqLogger service.
   * Updated by Jason.Song (成长的小猪) on 2024/04/09 23:31:14
   * @param level The logging level (e.g., debug, info, warn, error).
   * @param messages An array of messages to be logged.
   * @param context (Optional) The logging context, providing additional information.
   * @param stack (Optional) The stack trace in case of errors.
   */
  private forwardToSeqLogger(
    level: LogLevel,
    messages: unknown[],
    context?: string,
    stack?: string,
  ): void {
    const [message, ...optionalParams] = messages;
    let processedMessage;
    if (
      (message !== null && typeof message === 'object') ||
      Array.isArray(message)
    ) {
      const sensitiveKeys = this.logger.getSensitiveKeys();
      const partialMessage = safeStringify(message, {
        maxDepth: 10,
        maxLength: 1024 * 1024,
        sensitiveKeys,
      });
      processedMessage = ` - (Object/Array detected, please expand to view) ${partialMessage.substring(0, 50)}...`;
    } else {
      processedMessage = message;
    }
    this.logger[level](`[{context}] ${processedMessage}`, {
      logger: 'console',
      context,
      message,
      optionalParams: optionalParams.length ? optionalParams : undefined,
      stack,
    });
  }

  /**
   * Gets the context and messages from the arguments.
   * Updated by Jason.Song (成长的小猪) on 2024/04/09 23:52:14
   * @param args An array of arguments which may include log messages and optionally a context as the last element.
   * @returns An object containing the extracted messages and context.
   */
  private getContextAndMessages(args: unknown[]) {
    const params = args.filter((arg) => arg !== undefined);
    const lastElement = params[params.length - 1];
    const isContext = typeof lastElement === 'string';
    const context = isContext ? (lastElement as string) : this.context;
    const messages = isContext ? params.slice(0, -1) : params;

    return { messages, context };
  }

  /**
   * Gets the context, stack, and messages from the arguments.
   * Updated by Jason.Song (成长的小猪) on 2024/04/09 23:58:25
   * @param args An array of arguments which may include log messages and optionally a context as the last element.
   * @returns An object containing the extracted messages, context, and stack.
   */
  private getContextAndStackAndMessages(args: unknown[]) {
    let stack: string | undefined;
    const { messages, context } = this.getContextAndMessages(args);
    const stackOrErrorIndex = messages.findIndex(
      (msg) =>
        (typeof msg === 'string' && /\n\s+at\s+.+:\d+:\d+/.test(msg)) ||
        msg instanceof Error,
    );
    if (stackOrErrorIndex !== -1) {
      const stackOrError = messages[stackOrErrorIndex];
      messages.splice(stackOrErrorIndex, 1);
      if (typeof stackOrError === 'string') {
        stack = stackOrError;
        const errorMatch = stackOrError.match(/Error: (.+)/);
        if (messages.length === 0 && errorMatch && errorMatch[1]) {
          messages.push(errorMatch[1]);
        }
      } else if (stackOrError instanceof Error) {
        stack = stackOrError.stack;
        if (messages.length === 0) {
          messages.push(stackOrError.message);
        }
      }
    }
    return { messages, context, stack };
  }
}
