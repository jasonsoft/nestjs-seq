import { LogLevel } from '../enums';

/**
 * Seq Logger Options
 * Enhanced by Jason.Song (成长的小猪) on 2021/07/05 16:50:10
 */
export interface SeqLoggerOptions {
  /**
   * The HTTP/S endpoint address of the Seq server.
   * If not specified, defaults to http://localhost:5341.
   */
  serverUrl: string;

  /**
   * Optional API Key for Seq server authentication.
   * Required only if the Seq service configuration mandates API key usage.
   */
  apiKey?: string;

  /**
   * The name of the application service for log filtering.
   *
   * This attribute is deprecated due to the availability of a more flexible configuration method. Future versions will not support this attribute. Instead, use the `extendMetaProperties` to specify the service name as demonstrated below:
   *
   * Example:
   * ```
   * extendMetaProperties: {
   *   serviceName: 'your-service-name'
   * }
   * ```
   *
   * @deprecated Since version 2.1.2. It is recommended to use `extendMetaProperties` with a `serviceName` property.
   */
  serviceName?: string;

  /**
   * Limits the batch payload size for logs sent to Seq.
   * Defaults to 10485760 (10 MB). Increasing this value is not recommended.
   */
  batchPayloadLimit: number;

  /**
   * Limits the size of individual log events accepted by Seq.
   * Defaults to 262144 (256 KB). Increasing this value is not recommended.
   */
  eventBodyLimit: number;

  /**
   * Maximum retry attempts for sending logs to Seq.
   * Defaults to 5 retries.
   */
  maxRetries: number;

  /**
   * Delay (in seconds) before retrying to send logs to Seq.
   * Defaults to 5 seconds.
   */
  delay: number;

  /**
   * Maximum time (in seconds) to wait before timing out a log send attempt to Seq.
   * Defaults to 30 seconds.
   */
  timeout: number;

  /**
   * Name of the custom meta property.
   * Defaults to 'meta' if not specified.
   */
  metaFieldName: string;

  /**
   * A record of additional metadata properties to include with each log event.
   * These properties are merged with the default metadata.
   */
  extendMetaProperties?: Record<string, any>;

  /**
   * Specifies the permissible log levels for recording events.
   * - When a single LogLevel is provided, it acts as the minimum threshold; any log levels below this will not be recorded.
   * - When an array of LogLevel is provided, only the log levels in this array are allowed to be recorded.
   */
  logLevels?: LogLevel | LogLevel[];

  /**
   * Array of sensitive key patterns to mask in log output.
   * Keys containing these patterns (case-insensitive) will be replaced with '[Sensitive data masked]'.
   * Defaults to common sensitive patterns if not specified.
   */
  sensitiveKeys?: string[];
}
