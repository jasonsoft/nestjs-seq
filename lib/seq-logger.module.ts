import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { Logger } from 'seq-logging';
import { ConsoleSeqLogger } from './console-seq-logger.service';
import {
  SeqLoggerAsyncOptions,
  SeqLoggerModuleOptions,
  SeqLoggerModuleOptionsFactory,
  SeqLoggerOptions,
} from './interfaces';
import {
  JASONSOFT_SEQ_LOGGER,
  JASONSOFT_SEQ_LOGGER_OPTIONS,
} from './seq-logger.constants';
import { SeqLogger } from './seq-logger.service';

/**
 * JasonSoft Seq logger Module
 * Added by Jason.Song (成长的小猪) on 2021/07/05 16:44:10
 */
@Module({})
export class SeqLoggerModule {
  /**
   * Static configuration
   * Register a globally available configuration for seq logger service.
   * Added by Jason.Song (成长的小猪) on 2021/10/18 17:15:51
   * @param options Seq logger configuration object
   */
  static forRoot(options: SeqLoggerModuleOptions): DynamicModule {
    return {
      module: SeqLoggerModule,
      global: options.isGlobal,
      providers: [
        {
          provide: JASONSOFT_SEQ_LOGGER,
          useFactory: () => {
            return this.createSeqLoggerOptions(options);
          },
        },
        SeqLogger,
        ConsoleSeqLogger,
      ],
      exports: [SeqLogger, ConsoleSeqLogger],
    };
  }

  private static createSeqLoggerOptions(options: SeqLoggerModuleOptions) {
    const seqLoggerOptions: SeqLoggerOptions = {
      serviceName: options.serviceName,
      logger: new Logger({
        serverUrl: options.serverUrl,
        apiKey: options.apiKey,
        onError: function (e: Error) {
          console.error('[JasonSoft-Seq] Log batch failed\n', e);
        },
      }),
    };
    return seqLoggerOptions;
  }

  /**
   * Async configuration
   * Register a globally available configuration for the seq logger service.
   * Added by Jason.Song (成长的小猪) on 2021/10/18 15:43:38
   * @param options Seq logger configuration async factory
   */
  static forRootAsync(options: SeqLoggerAsyncOptions): DynamicModule {
    return {
      module: SeqLoggerModule,
      global: true,
      imports: options.imports || [],
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: JASONSOFT_SEQ_LOGGER,
          useFactory: (config: SeqLoggerModuleOptions) => {
            return this.createSeqLoggerOptions(config);
          },
          inject: [JASONSOFT_SEQ_LOGGER_OPTIONS],
        },
        SeqLogger,
        ConsoleSeqLogger,
      ],
      exports: [SeqLogger, ConsoleSeqLogger],
    };
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
