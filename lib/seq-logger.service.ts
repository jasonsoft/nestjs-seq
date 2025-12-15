import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { JASONSOFT_SEQ_LOGGER } from './seq-logger.constants';
import { SeqLoggerCore } from './core';
import { isPlainObject, logToConsole } from './utils';
import { SeqEvent } from './interfaces';
import { LOG_LEVELS_VALUES, LogLevel, SeqLevel } from './enums';

/**
 * Seq logger service for sending log messages to Seq.
 * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:18:37
 * Added by Jason.Song (成长的小猪) on 2021/07/05 16:59:39
 */
@Injectable()
export class SeqLogger implements OnApplicationShutdown {
  private static levelMapping = {
    verbose: SeqLevel.Verbose,
    debug: SeqLevel.Debug,
    info: SeqLevel.Information,
    log: SeqLevel.Information,
    warn: SeqLevel.Warning,
    error: SeqLevel.Error,
    fatal: SeqLevel.Fatal,
  };

  private static instance: SeqLogger;
  /**
   * Retrieves the singleton instance of SeqLogger.
   * If the instance has not been initialized, it returns undefined.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 22:09:17
   */
  public static getInstance(level: LogLevel): SeqLogger | undefined {
    if (!SeqLogger.instance) {
      const errorMessage =
        `SeqLogger instance has not been initialized.\n` +
        `   Please ensure SeqLoggerModule dependencies are initialized before calling \`SeqLogger.${level}()\`.`;
      if (process.env.NODE_ENV !== 'production') {
        const stack = new Error(errorMessage).stack || '';
        const lines = stack.split('\n');
        const filteredLines = lines.filter(
          (line: string) => !line.includes('seq-logger.service'),
        );
        const filteredStack = filteredLines.join('\n');
        logToConsole('error', filteredStack);
      } else {
        logToConsole('error', errorMessage);
      }
    }
    return SeqLogger.instance;
  }

  constructor(
    @Inject(JASONSOFT_SEQ_LOGGER)
    private readonly seqLogger: SeqLoggerCore,
  ) {
    if (!SeqLogger.instance) {
      SeqLogger.instance = this;
    }
  }

  /**
   * Gets the sensitive keys configuration for masking sensitive data.
   * Added by Jason.Song (成长的小猪) on 2025/01/27
   * @returns Array of sensitive key patterns
   */
  getSensitiveKeys(): string[] | undefined {
    return this.seqLogger.getSensitiveKeys();
  }

  /**
   * Determines if a log message should be logged based on the configured log level.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 22:44:27
   * @param level The log level to check.
   * @returns boolean indicating if logging should proceed.
   */
  private shouldLog(level: LogLevel): boolean {
    const logLevels = this.seqLogger.options.logLevels;
    if (!logLevels) {
      return true;
    }
    if (Array.isArray(logLevels)) {
      return logLevels.includes(level);
    }
    const minLevel = LOG_LEVELS_VALUES[logLevels];
    return LOG_LEVELS_VALUES[level] >= minLevel;
  }

  /**
   * Logs a message with a specified level, message template, and optional properties or context.
   * This method is used internally to handle the actual logging logic.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 22:53:56
   *
   * @param level The severity level of the log message, defined by LogLevel enum.
   * @param messageTemplate The message template string that forms the basis of the log message.
   * @param propsOrContext Optional. Can be either a string representing the logging context or an object containing properties to log.
   * @param context Optional. Provides additional context for the log message, used when propsOrContext is an object.
   */
  private logMessage(
    level: LogLevel,
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }
    const [messageTpl, props] = this.getMessageTemplateAndProperties(
      messageTemplate,
      propsOrContext,
      context,
    );
    this.commit(level, messageTpl, props);
  }

  /**
   * Logs a message statically with the specified level, message template, and optional properties or context.
   * This static method delegates the logging task to an instance method of a possibly existing SeqLogger instance.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 22:59:33
   *
   * @param level The severity level of the log message.
   * @param messageTemplate The message template string that forms the basis of the log message.
   * @param propsOrContext Optional. Can be either a string representing the logging context or an object containing properties to log.
   * @param context Optional. Provides additional context for the log message, used when propsOrContext is an object.
   */
  private static logStaticMessage(
    level: LogLevel,
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    const logger = SeqLogger.getInstance(level);
    if (logger) {
      logger.logMessage(level, messageTemplate, propsOrContext, context);
    }
  }

  /**
   * Logs a verbose message with optional properties and context.
   * This method supports method overloading to accommodate different combinations of parameters, allowing for flexible usage depending on the provided arguments.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:18:52
   *
   * Overloads:
   * - verbose(messageTemplate: string, context?: string): void
   *   Logs a message with an optional context. This form does not include additional properties.
   * - verbose(messageTemplate: string, properties: object, context?: string): void
   *   Logs a message with additional properties and an optional context.
   *
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log. This parameter is considered only in the second overload.
   * @param context (Optional) The logging context. This is considered in both overloads but is mandatory in the second overload if properties are provided.
   */
  public verbose(messageTemplate: string, context?: string): void;
  public verbose(
    messageTemplate: string,
    properties: object,
    context?: string,
  ): void;
  public verbose(
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    this.logMessage('verbose', messageTemplate, propsOrContext, context);
  }

  /**
   * Logs a verbose message statically with optional properties and context.
   * This method supports method overloading to accommodate different combinations of parameters, allowing for flexible usage depending on the provided arguments.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 22:27:45
   *
   * Overloads:
   * - verbose(messageTemplate: string, context?: string): void
   *   Logs a message with an optional context. This form does not include additional properties.
   * - verbose(messageTemplate: string, properties: object, context?: string): void
   *   Logs a message with additional properties and an optional context.
   *
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log. This parameter is considered only in the second overload.
   * @param context (Optional) The logging context. This is considered in both overloads but is mandatory in the second overload if properties are provided.
   */
  public static verbose(messageTemplate: string, context?: string): void;
  public static verbose(
    messageTemplate: string,
    properties: object,
    context?: string,
  ): void;
  public static verbose(
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    SeqLogger.logStaticMessage(
      'verbose',
      messageTemplate,
      propsOrContext,
      context,
    );
  }

  /**
   * Logs a debug message with optional properties and context.
   * This method supports method overloading to accommodate different combinations of parameters, allowing for flexible usage depending on the provided arguments.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:19:02
   *
   * Overloads:
   * - debug(messageTemplate: string, context?: string): void
   *   Logs a message with an optional context. This form does not include additional properties.
   * - debug(messageTemplate: string, properties: object, context?: string): void
   *   Logs a message with additional properties and an optional context.
   *
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log. This parameter is considered only in the second overload.
   * @param context (Optional) The logging context. This is considered in both overloads but is mandatory in the second overload if properties are provided.
   */
  public debug(messageTemplate: string, context?: string): void;
  public debug(
    messageTemplate: string,
    properties: object,
    context?: string,
  ): void;
  public debug(
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    this.logMessage('debug', messageTemplate, propsOrContext, context);
  }

  /**
   * Static method to log a debug message with optional properties and context.
   * This method allows for logging without an instance of the class and supports overloading.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 22:22:51
   *
   * Overloads:
   * - debug(messageTemplate: string, context?: string): void
   *   Logs a message with an optional context when properties are not provided.
   * - debug(messageTemplate: string, properties: object, context?: string): void
   *   Logs a message with properties and an optional context.
   *
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log. This parameter is ignored if the first overload is used.
   * @param context (Optional) The logging context. This is considered only if the second parameter is an object, indicating the use of the second overload.
   */
  public static debug(messageTemplate: string, context?: string): void;
  public static debug(
    messageTemplate: string,
    properties: object,
    context?: string,
  ): void;
  public static debug(
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    SeqLogger.logStaticMessage(
      'debug',
      messageTemplate,
      propsOrContext,
      context,
    );
  }

  /**
   * Logs an informational message with optional properties and context.
   * This method supports overloading, allowing for flexible parameter combinations to accommodate optional properties and context.
   * Updated by Jason.Song (成长的小猪) on 2024/04/09 23:23:07
   *
   * Overloads:
   * - info(messageTemplate: string, context?: string): void
   *   Logs a message with an optional context when properties are not provided.
   * - info(messageTemplate: string, properties: object, context?: string): void
   *   Logs a message with properties and an optional context.
   *
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log. This parameter is ignored if the first overload is used.
   * @param context (Optional) The logging context. This is considered only if the second parameter is an object, indicating the use of the second overload.
   */
  public info(messageTemplate: string, context?: string): void;
  public info(
    messageTemplate: string,
    properties: object,
    context?: string,
  ): void;
  public info(
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    this.logMessage('info', messageTemplate, propsOrContext, context);
  }

  /**
   * Logs an informational message statically with optional properties and context.
   * This method supports method overloading to accommodate different combinations of parameters, allowing for flexible usage depending on the provided arguments.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 22:29:59
   *
   * Overloads:
   * - info(messageTemplate: string, context?: string): void
   *   Logs a message with an optional context. This form does not include additional properties.
   * - info(messageTemplate: string, properties: object, context?: string): void
   *   Logs a message with additional properties and an optional context.
   *
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log. This parameter is considered only in the second overload.
   * @param context (Optional) The logging context. This is considered in both overloads but is mandatory in the second overload if properties are provided.
   */
  public static info(messageTemplate: string, context?: string): void;
  public static info(
    messageTemplate: string,
    properties: object,
    context?: string,
  ): void;
  public static info(
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    SeqLogger.logStaticMessage(
      'info',
      messageTemplate,
      propsOrContext,
      context,
    );
  }

  /**
   * Logs an informational message with optional properties and context, making it compatible with the NestJS framework logging standards.
   * This method supports method overloading to accommodate different combinations of parameters, allowing for flexible usage depending on the provided arguments.
   * Added by Jason.Song (成长的小猪) on 2024/04/09 23:17:34
   *
   * Overloads:
   * - log(messageTemplate: string, context?: string): void
   *   Logs a message with an optional context when properties are not provided.
   * - log(messageTemplate: string, properties: object, context?: string): void
   *   Logs a message with properties and an optional context.
   *
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log. This parameter is ignored if the first overload is used.
   * @param context (Optional) The logging context. This is considered only if the second parameter is an object, indicating the use of the second overload.
   */
  public log(messageTemplate: string, context?: string): void;
  public log(
    messageTemplate: string,
    properties: object,
    context?: string,
  ): void;
  public log(
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    this.logMessage('log', messageTemplate, propsOrContext, context);
  }

  /**
   * Logs a message with optional properties and context statically.
   * This method supports method overloading to accommodate different combinations of parameters, allowing for flexible usage depending on the provided arguments.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 22:13:10
   *
   * Overloads:
   * - log(messageTemplate: string, context?: string): void
   *   Logs a message with an optional context when properties are not provided.
   * - log(messageTemplate: string, properties: object, context?: string): void
   *   Logs a message with properties and an optional context.
   *
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log. This parameter is considered only in the second overload.
   * @param context (Optional) The logging context. This is considered in both overloads.
   */
  public static log(messageTemplate: string, context?: string): void;
  public static log(
    messageTemplate: string,
    properties: object,
    context?: string,
  ): void;
  public static log(
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    SeqLogger.logStaticMessage('log', messageTemplate, propsOrContext, context);
  }

  /**
   * Logs a warning message with optional properties and context.
   * This method supports overloading, allowing for flexible parameter combinations to accommodate optional properties and context.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:19:34
   *
   * Overloads:
   * - warn(messageTemplate: string, context?: string): void
   *   Logs a warning message with an optional context when properties are not provided.
   * - warn(messageTemplate: string, properties: object, context?: string): void
   *   Logs a warning message with properties and an optional context.
   *
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log. This parameter is considered only if the method is called with more than one argument, indicating the use of the second overload.
   * @param context (Optional) The logging context. This is considered only if the second parameter is an object, indicating the use of the second overload.
   */
  public warn(messageTemplate: string, context?: string): void;
  public warn(
    messageTemplate: string,
    properties: object,
    context?: string,
  ): void;
  public warn(
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    this.logMessage('warn', messageTemplate, propsOrContext, context);
  }

  /**
   * Logs a warning message with optional properties and context.
   * This method supports overloading, allowing for flexible parameter combinations to accommodate optional properties and context.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 22:34:12
   *
   * Overloads:
   * - warn(messageTemplate: string, context?: string): void
   *   Logs a warning message with an optional context when properties are not provided.
   * - warn(messageTemplate: string, properties: object, context?: string): void
   *   Logs a warning message with properties and an optional context.
   *
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log. This parameter is considered only if the method is called with more than one argument, indicating the use of the second overload.
   * @param context (Optional) The logging context. This is considered only if the second parameter is an object, indicating the use of the second overload.
   */
  public static warn(messageTemplate: string, context?: string): void;
  public static warn(
    messageTemplate: string,
    properties: object,
    context?: string,
  ): void;
  public static warn(
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    SeqLogger.logStaticMessage(
      'warn',
      messageTemplate,
      propsOrContext,
      context,
    );
  }

  /**
   * Analyzes an object to determine if it contains error information, and extracts relevant details.
   * This method checks if the input is an Error object or a plain object containing error-like properties.
   * It extracts and returns the error message, stack trace, and a sanitized object without error details.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 23:19:38
   *
   * @param obj The object or Error to analyze.
   * @returns A tuple containing:
   *          - A sanitized object with error details removed.
   *          - A string representing the error message.
   *          - An optional string representing the stack trace.
   */
  private analyzeErrorPresence(obj: object | Error): [object, string, string?] {
    if (obj instanceof Error) {
      return [{ stack: obj.stack }, obj.message, obj.stack];
    } else if (isPlainObject(obj)) {
      const newObj: Record<string, any> = {};
      let errorMessage: string = '';
      let errorStack: string | undefined;

      Object.entries(obj).forEach(([key, value]) => {
        if (value instanceof Error) {
          errorMessage = value.message;
          errorStack = value.stack;
        } else if (
          typeof value === 'string' &&
          /\n\s+at\s+.+:\d+:\d+/.test(value)
        ) {
          errorStack = value;
          const errorMatch = value.match(/Error: (.+)/);
          if (errorMatch && errorMatch[1]) {
            errorMessage = errorMatch[1];
          }
        } else {
          newObj[key] = value;
        }
      });

      if (errorStack) {
        newObj.stack = errorStack;
        return [newObj, errorMessage, errorStack];
      }
    }
    return [obj, '', ''];
  }

  /**
   * Handles error logging with flexible parameter inputs.
   * This method can accept a message, properties, or an Error object as the first parameter,
   * and optionally a second Error object or context as the second parameter, with an additional context as the third parameter.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 22:50:23
   *
   * @param messageOrPropsOrError A string message, properties object, or Error object.
   * @param propsOrErrorOrContext Optional. Can be a string, properties object, or Error object.
   * @param context Optional. A string specifying the logging context.
   */
  private handleErrorLogging(
    messageOrPropsOrError: string | object | Error,
    propsOrErrorOrContext?: string | object | Error,
    context?: string,
  ): void {
    if (!this.shouldLog('error')) {
      return;
    }
    const defaultMessage = '(No message provided)';
    let messageTemplate = defaultMessage;
    let properties: Record<string, any> = {};

    if (typeof messageOrPropsOrError === 'string') {
      if (/\n\s+at\s+.+:\d+:\d+/.test(messageOrPropsOrError)) {
        properties.stack = messageOrPropsOrError;
        const errorMatch = messageOrPropsOrError.match(/Error: (.+)/);
        if (errorMatch && errorMatch[1]) {
          messageTemplate = errorMatch[1];
        }
      } else {
        messageTemplate = messageOrPropsOrError;
      }
    } else {
      const [propsOrContext, errorMessage] = this.analyzeErrorPresence(
        messageOrPropsOrError,
      );
      if (errorMessage) {
        messageTemplate = errorMessage;
      }
      const [messageTpl, props] = this.getMessageTemplateAndProperties(
        messageTemplate,
        propsOrContext,
        context,
      );
      messageTemplate = messageTpl;
      properties = props;
    }

    if (propsOrErrorOrContext) {
      let propsOrContext = propsOrErrorOrContext;
      let stack = properties.stack;
      if (typeof propsOrErrorOrContext !== 'string') {
        const [errorObj, errorMessage, errorStack] = this.analyzeErrorPresence(
          propsOrErrorOrContext,
        );
        if (
          errorMessage &&
          (!messageTemplate || messageTemplate === defaultMessage)
        ) {
          messageTemplate = errorMessage;
        }
        stack = errorStack
          ? stack
            ? `${stack}\nCaused by: ${errorStack}`
            : errorStack
          : stack;
        propsOrContext = errorObj;
      }

      const [messageTpl, props] = this.getMessageTemplateAndProperties(
        messageTemplate,
        propsOrContext,
        context,
      );
      messageTemplate = messageTpl;
      properties = { ...properties, ...props, stack };
    }

    if (context) {
      properties.context = context;
    }

    this.commit('error', messageTemplate, properties);
  }

  /**
   * Logs an error with flexible input parameters to accommodate various logging needs.
   * This method is designed to handle different combinations of inputs, including message templates, property objects, and Error objects, providing a versatile approach to error logging.
   * Updated by Jason.Song (成长的小猪) on 2024/04/09 23:10:54
   *
   * Overloads:
   * 1. error(messageTemplate: string, context?: string): void
   *    - Logs an error message using a string template. An optional context can be provided to categorize or scope the error message.
   * 2. error(propsOrError: object | Error, context?: string): void
   *    - Logs an error using either a set of properties or an Error object. An optional context can be included for additional message categorization. This overload is selected when the first argument is not a string.
   * 3. error(messageTemplate: string, propsOrError: object | Error, context?: string): void
   *    - Logs an error message using a string template, supplemented with either additional properties or an Error object for more detailed logging. An optional context can also be provided.
   *
   * @param messageTemplate Can be a string message template, an object containing properties, or an Error object. This parameter adapts based on the overload used.
   * @param propsOrError Optional. Can be an object containing properties or an Error object. This parameter is considered when the first argument is a string message template, providing additional details or context for the error being logged.
   * @param context Optional. Specifies the logging context. This is considered in overloads where it is applicable, providing a way to categorize or scope the error message.
   */
  public error(messageTemplate: string, context?: string): void;
  public error(propsOrError: object | Error, context?: string): void;
  public error(
    messageTemplate: string,
    propsOrError: object | Error,
    context?: string,
  ): void;
  public error(
    messageOrPropsOrError: string | object | Error,
    propsOrErrorOrContext?: string | object | Error,
    context?: string,
  ): void {
    this.handleErrorLogging(
      messageOrPropsOrError,
      propsOrErrorOrContext,
      context,
    );
  }

  /**
   * Logs an error message with optional properties and context.
   * This method supports method overloading to accommodate different combinations of parameters, allowing for flexible usage depending on the provided arguments.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 22:52:44
   *
   * Overloads:
   * - error(messageTemplate: string, context?: string): void
   *   Logs an error message with a simple string template and an optional context.
   * - error(propsOrError: object | Error, context?: string): void
   *   Logs an error with properties or an error object, and an optional context.
   * - error(messageTemplate: string, propsOrError: object | Error, context?: string): void
   *   Logs an error message with a string template, additional properties or an error object, and an optional context.
   *
   * @param messageTemplate The message template to log or the first parameter can be an object or Error if using the second overload.
   * @param propsOrError (Optional) Additional properties to log or an Error object. This parameter is considered only in the third overload.
   * @param context (Optional) The logging context. This is considered in all overloads.
   */
  public static error(messageTemplate: string, context?: string): void;
  public static error(propsOrError: object | Error, context?: string): void;
  public static error(
    messageTemplate: string,
    propsOrError: object | Error,
    context?: string,
  ): void;
  public static error(
    messageOrPropsOrError: string | object | Error,
    propsOrErrorOrContext?: string | object | Error,
    context?: string,
  ): void {
    const logger = SeqLogger.getInstance('error');
    if (logger) {
      logger.handleErrorLogging(
        messageOrPropsOrError,
        propsOrErrorOrContext,
        context,
      );
    }
  }

  /**
   * Logs a fatal message with optional properties and context.
   * This method supports overloading, allowing for flexible parameter combinations to accommodate optional properties and context.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:20:03
   *
   * Overloads:
   * - fatal(messageTemplate: string, context?: string): void
   *   Logs a message with an optional context when properties are not provided.
   * - fatal(messageTemplate: string, properties: object, context?: string): void
   *   Logs a message with properties and an optional context.
   *
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log. This parameter is ignored if the first overload is used.
   * @param context (Optional) The logging context. This is considered only if the second parameter is an object, indicating the use of the second overload.
   */
  public fatal(messageTemplate: string, context?: string): void;
  public fatal(
    messageTemplate: string,
    properties: object,
    context?: string,
  ): void;
  public fatal(
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    this.logMessage('fatal', messageTemplate, propsOrContext, context);
  }

  /**
   * Logs a fatal message statically with optional properties and context.
   * This method supports method overloading to accommodate different combinations of parameters, allowing for flexible usage depending on the provided arguments.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 22:54:30
   *
   * Overloads:
   * - fatal(messageTemplate: string, context?: string): void
   *   Logs a message with an optional context. This form does not include additional properties.
   * - fatal(messageTemplate: string, properties: object, context?: string): void
   *   Logs a message with properties and an optional context.
   *
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log. This parameter is considered only in the second overload.
   * @param context (Optional) The logging context. This is considered in both overloads but is mandatory in the second overload if properties are provided.
   */
  public static fatal(messageTemplate: string, context?: string): void;
  public static fatal(
    messageTemplate: string,
    properties: object,
    context?: string,
  ): void;
  public static fatal(
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): void {
    SeqLogger.logStaticMessage(
      'fatal',
      messageTemplate,
      propsOrContext,
      context,
    );
  }

  /**
   * Constructs the message template and properties for logging.
   * This method formats the message template and merges any given properties or context into a single object.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 22:49:37
   *
   * @param messageTemplate The base message template.
   * @param propsOrContext Optional parameter that can be either additional properties as an object or a context string.
   * @param context Optional context string, providing additional context for the log message.
   * @returns A tuple containing the formatted message template and the properties object.
   */
  private getMessageTemplateAndProperties(
    messageTemplate: string,
    propsOrContext?: string | object,
    context?: string,
  ): [string, object] {
    let messageTpl = messageTemplate;
    let props: Record<string, any> = {};

    if (propsOrContext) {
      if (typeof propsOrContext === 'string') {
        props.context = propsOrContext;
      } else if (isPlainObject(propsOrContext)) {
        props = propsOrContext as Record<string, any>;
      } else {
        props.properties = propsOrContext;
      }
    }

    if (context) {
      props.context = context;
    }

    if (props.context && !messageTemplate.includes('[{context}]')) {
      messageTpl = `[{context}] ${messageTemplate}`;
    }

    return [messageTpl, props];
  }

  /**
   * Prepares properties for logging by extracting stack trace and other metadata.
   * This method separates the stack trace from the properties if present and ensures all other properties are serialized safely.
   * Added by Jason.Song (成长的小猪) on 2024/04/17 23:12:28
   *
   * @param properties Optional properties object that may contain a stack trace and other logging metadata.
   * @returns An object containing sanitized properties and an optional stack trace.
   */
  private prepareProperties(properties?: Record<string, any>): {
    props: Record<string, any>;
    stack: string | undefined;
  } {
    const { stack, logger = 'seq', ...props } = properties || {};
    const metaFieldName = this.seqLogger.options.metaFieldName;
    return {
      props: {
        ...props,
        [metaFieldName]: {
          ...this.seqLogger.metaProperties,
          logger,
        },
      },
      stack,
    };
  }

  /**
   * Commits the log message to the Seq logger.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:20:23
   * @param level The log level.
   * @param messageTemplate The message template to log.
   * @param properties (Optional) Additional properties to log.
   */
  private commit(
    level: LogLevel,
    messageTemplate: string,
    properties?: Record<string, any>,
  ): void {
    const { props, stack } = this.prepareProperties(properties);
    try {
      const seqEvent: SeqEvent = {
        Timestamp: new Date(),
        Level: SeqLogger.levelMapping[level] || SeqLevel.Information,
        MessageTemplate: messageTemplate,
        Properties: props,
        Exception: stack,
      };
      this.seqLogger.emit(seqEvent);
    } catch (error) {
      logToConsole(
        'error',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * Handles the application shutdown event.
   * Updated by Jason.Song (成长的小猪) on 2023/11/22 19:20:40
   * Added by Jason.Song (成长的小猪) on 2023/01/11 14:14:13
   * @param signal The signal received for the shutdown.
   */
  async onApplicationShutdown(signal?: string): Promise<void> {
    await this.seqLogger.close();
    if (signal) {
      logToConsole('log', `Seq logger closed by ${signal} signal`);
    }
  }
}
