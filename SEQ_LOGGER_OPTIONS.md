<p align="center">
  <a href="https://github.com/jasonsoft/" target="blank"><img src="https://avatars.githubusercontent.com/u/90173752?s=200&v=4" width="120" alt="JasonSoft Logo" /></a>
</p>

# Seq Logger Options Documentation

This document provides detailed explanations of the configuration options available for the Seq Logger, as defined in the `SeqLoggerOptions` interface. Enhanced by Jason.Song (成长的小猪) on 2024/04/09.

## Configuration Options

### `serverUrl`

- **Type:** `string`
- **Description:** The HTTP/S endpoint address of the Seq server. This is where your logs will be sent.
- **Default Value:** `http://localhost:5341`
- **Required:** Yes

### `apiKey`

- **Type:** `string`
- **Optional**
- **Description:** Optional API Key for Seq server authentication. This is required only if the Seq service configuration mandates API key usage for enhanced security.

### `serviceName`

- **Type:** `string`
- **Optional**
- **Deprecated:** Yes
- **Description:** The name of the application service used for log filtering. This attribute is deprecated and will not be supported in future versions. It is recommended to use the `extendMetaProperties` to specify the service name.
- **Example:**

  ```json
  {
    "extendMetaProperties": {
      "serviceName": "your-service-name"
    }
  }
  ```

### `batchPayloadLimit`

- **Type:** `number`
- **Description:** Limits the batch payload size for logs sent to Seq. This helps in managing the load on the Seq server and ensures efficient log processing.
- **Default Value:** `10485760` (10 MB)
- **Recommendation:** Increasing this value is not recommended due to potential performance impacts.

### `eventBodyLimit`

- **Type:** `number`
- **Description:** Limits the size of individual log events accepted by Seq. This ensures that each log event is within a manageable size for processing and storage.
- **Default Value:** `262144` (256 KB)
- **Recommendation:** Increasing this value is not recommended as it may affect the performance and storage efficiency.

### `maxRetries`

- **Type:** `number`
- **Description:** Maximum retry attempts for sending logs to Seq. This ensures that transient network issues or temporary Seq server unavailability does not result in lost logs.
- **Default Value:** `5` retries

### `delay`

- **Type:** `number`
- **Description:** Delay (in seconds) before retrying to send logs to Seq. This provides a simple back-off mechanism in case of failures.
- **Default Value:** `5` seconds

### `timeout`

- **Type:** `number`
- **Description:** Maximum time (in seconds) to wait before timing out a log send attempt to Seq. This ensures that log sending does not indefinitely block the application in case of issues.
- **Default Value:** `30` seconds

### `metaFieldName`

- **Type:** `string`
- **Description:** Name of the custom meta property. This can be used to attach additional metadata to each log event for more detailed context.
- **Default Value:** `meta`

### `extendMetaProperties`

- **Type:** `Record<string, any>`
- **Optional**
- **Description:** A record of additional metadata properties to include with each log event. These properties are merged with the default metadata, allowing for more detailed and customized log information.

This configuration interface allows for detailed customization of the Seq logging behavior, ensuring that logging can be tailored to the specific needs of your application while maintaining efficient and reliable log management.

### `logLevels`

- **Type:** `LogLevel | LogLevel[]`
- **Optional**
- **Description:** Specifies the permissible log levels for recording events. This can be a single log level, acting as the minimum threshold, or an array of log levels, specifying exactly which levels are allowed to be recorded.

### `sensitiveKeys`

- **Type:** `string[]`
- **Optional**
- **Description:** Specifies an array of sensitive key patterns (like `"password"`, `"secret"`, `"token"`, `"apiKey"`, etc.) whose values will be masked in log outputs to prevent accidental leakage of confidential or sensitive information. This applies to all logs processed through the SeqLoggerModule.

### SeqLoggerModule Basic Configuration Example

```js
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
/**
 * Import the SeqLoggerModule into the root AppModule
 * Added by Jason.Song (成长的小猪) on 2021/09/08
 */
import { SeqLoggerModule } from '@jasonsoft/nestjs-seq';

@Module({
  imports: [
    /**
     * Import the SeqLoggerModule. Typically, it's imported into the root AppModule and configured using the .forRoot() static method.
     * Added by Jason.Song (成长的小猪) on 2021/09/08
     */
    SeqLoggerModule.forRoot({
      /** Seq server's HTTP/S endpoint address */
      serverUrl: 'http(s)://your-seq-server:5341',
      /** API Key for Seq server connection */
      apiKey: 'your-api-key',
      /** Batch payload size limit for logs sent to Seq */
      batchPayloadLimit: 10485760, // 10 MB
      /** Individual log event size limit accepted by Seq */
      eventBodyLimit: 262144, // 256 KB
      /** Maximum retry attempts for sending logs */
      maxRetries: 5,
      /** Delay before retrying to send logs */
      delay: 5, // in seconds
      /** Maximum time to wait before timing out a log send attempt */
      timeout: 30, // in seconds
      /** Custom meta property name */
      metaFieldName: 'meta',
      /** Optional additional metadata properties */
      extendMetaProperties: {
        serviceName: 'your-service-name',
        version: '1.0.0',
      },
      /** Optional permissible log levels */
      logLevels: ['info', 'error'],
      /** Array of sensitive key patterns to mask in log output */
      sensitiveKeys: ['password', 'secret', 'token', 'apiKey'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
