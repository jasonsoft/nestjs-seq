import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { ConsoleSeqLogger } from './console-seq-logger.service';
import {
  SeqLoggerAsyncOptions,
  SeqLoggerModuleOptions,
  SeqLoggerModuleOptionsFactory,
} from './interfaces';
import {
  JASONSOFT_SEQ_LOGGER,
  JASONSOFT_SEQ_LOGGER_OPTIONS,
} from './seq-logger.constants';
import { SeqLogger } from './seq-logger.service';
import { logToConsole, defaultIfNullOrUndefined } from './utils';
import { SeqLevel } from './enums';
import { SeqLoggerCore } from './core';

/**
 * JasonSoft Seq Logger Module
 * This module facilitates the integration of Seq as a logging service in NestJS applications,
 * providing both static and asynchronous configuration options.
 *
 * Added by Jason.Song (成长的小猪) on 2021/07/05 16:44:10
 */
@Module({})
export class SeqLoggerModule {
  /**
   * Registers the Seq Logger service with static configuration options.
   * This method is ideal for scenarios where configuration settings are immediately available and do not depend on asynchronous resources.
   *
   * Added by Jason.Song (成长的小猪) on 2021/10/18 17:15:51
   *
   * Example usage:
   * ```typescript
    SeqLoggerModule.forRoot({
      serverUrl: 'http(s)://your-seq-server:5341',
      apiKey: 'your-api-key',
      extendMetaProperties: {
        serviceName: 'your-service-name',
      },
    }),
   * ```
   *
   * @param options Configuration options for the Seq Logger service. This includes settings like the Seq server URL, API key, and service name, among others.
   * 
   * For additional properties and configuration options, refer to the Seq Logger Options Documentation:
   * [Seq Logger Options Documentation](https://github.com/jasonsoft/nestjs-seq/blob/v2.x.x/SEQ_LOGGER_OPTIONS.md)
   * @returns A DynamicModule that NestJS can use to register the Seq Logger service globally, based on the provided configuration.
   * @throws Error if required configuration options are missing or invalid.
   */
  static forRoot(options: SeqLoggerModuleOptions): DynamicModule {
    if (options.serverUrl !== undefined) {
      if (typeof options.serverUrl !== 'string') {
        throw new Error(
          'SeqLoggerModule: serverUrl must be a string when provided',
        );
      }
      try {
        new URL(options.serverUrl);
      } catch {
        throw new Error(
          `SeqLoggerModule: Invalid serverUrl format: ${options.serverUrl}`,
        );
      }
    }
    return {
      module: SeqLoggerModule,
      global: defaultIfNullOrUndefined(options.isGlobal, true),
      providers: [
        {
          provide: JASONSOFT_SEQ_LOGGER_OPTIONS,
          useValue: options,
        },
        {
          provide: JASONSOFT_SEQ_LOGGER,
          useFactory: () => {
            return this.createSeqLogger(options);
          },
        },
        SeqLogger,
        ConsoleSeqLogger,
      ],
      exports: [SeqLogger, ConsoleSeqLogger],
    };
  }

  /**
   * Registers the Seq Logger service with asynchronous configuration options.
   * This method is suitable for scenarios where configuration settings need to be resolved asynchronously, such as fetching them from a database or a remote configuration service.
   *
   * Added by Jason.Song (成长的小猪) on 2021/10/18 15:43:38
   *
   * Example usage:
   * ```typescript
   * SeqLoggerModule.forRootAsync({
   *   imports: [ConfigModule],
   *   useFactory: async (configService: ConfigService) => ({
   *     serverUrl: configService.get('SEQ_SERVER_URL'),
   *     apiKey: configService.get('SEQ_API_KEY'),
   *     extendMetaProperties: {
   *       serviceName: configService.get('SEQ_SERVICE_NAME'),
   *     },
   *   }),
   *   inject: [ConfigService],
   * }),
   * ```
   *
   * For additional properties and configuration options, refer to the Seq Logger Options Documentation:
   * [Seq Logger Options Documentation](https://github.com/jasonsoft/nestjs-seq/blob/v2.x.x/SEQ_LOGGER_OPTIONS.md)
   *
   * Note: When using `forRootAsync`, ensure that any services or modules required for resolving the configuration are properly injected and imported.
   *
   * @param options Asynchronous configuration options for the Seq Logger service. This can include using a factory function, an existing service, or a class to provide the configuration.
   * @returns A DynamicModule that NestJS can use to register the Seq Logger service globally, based on the asynchronously provided configuration.
   */
  static forRootAsync(options: SeqLoggerAsyncOptions): DynamicModule {
    return {
      module: SeqLoggerModule,
      global: defaultIfNullOrUndefined(options.isGlobal, true),
      imports: options.imports || [],
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: JASONSOFT_SEQ_LOGGER,
          useFactory: (config: SeqLoggerModuleOptions) => {
            return this.createSeqLogger(config);
          },
          inject: [JASONSOFT_SEQ_LOGGER_OPTIONS],
        },
        SeqLogger,
        ConsoleSeqLogger,
      ],
      exports: [SeqLogger, ConsoleSeqLogger],
    };
  }

  private static createSeqLogger(options: SeqLoggerModuleOptions) {
    // Validate URL format if serverUrl is provided
    if (options.serverUrl !== undefined) {
      if (typeof options.serverUrl !== 'string') {
        throw new Error(
          'SeqLoggerModule: serverUrl must be a string when provided',
        );
      }
      try {
        new URL(options.serverUrl);
      } catch {
        throw new Error(
          `SeqLoggerModule: Invalid serverUrl format: ${options.serverUrl}`,
        );
      }
    }

    logToConsole('log', 'Seq logger is initializing...');
    const seqLogger = new SeqLoggerCore(options);
    seqLogger.emit({
      Timestamp: new Date(),
      Level: SeqLevel.Information,
      MessageTemplate: `[{context}] Seq logger initialized`,
      Properties: {
        context: 'jasonsoft/nestjs-seq',
        [seqLogger.options.metaFieldName]: seqLogger.metaProperties,
      },
    });
    return seqLogger;
  }

  private static createAsyncProviders(
    options: SeqLoggerAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<SeqLoggerModuleOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    asyncOptions: SeqLoggerAsyncOptions,
  ): Provider {
    if (asyncOptions.useFactory) {
      return {
        provide: JASONSOFT_SEQ_LOGGER_OPTIONS,
        useFactory: asyncOptions.useFactory,
        inject: asyncOptions.inject || [],
      };
    }
    return {
      provide: JASONSOFT_SEQ_LOGGER_OPTIONS,
      useFactory: async (optionsFactory: SeqLoggerModuleOptionsFactory) =>
        optionsFactory.createSeqLoggerOptions(),
      inject: [
        (asyncOptions.useClass ||
          asyncOptions.useExisting) as Type<SeqLoggerModuleOptionsFactory>,
      ],
    };
  }
}
