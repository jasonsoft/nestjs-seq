import { DynamicModule, Module } from '@nestjs/common';
import { Logger } from 'seq-logging';
import { ConsoleSeqLogger } from './console-seq-logger.service';
import { SeqLoggerModuleOptions, SeqLoggerOptions } from './interfaces';
import { JASONSOFT_SEQ_LOGGER } from './seq-logger.constants';
import { SeqLogger } from './seq-logger.service';

/**
 * JasonSoft Seq logger Module
 * Added by Jason.Song (成长的小猪) on 2021/07/05 16:44:10
 */
@Module({})
export class SeqLoggerModule {
  static forRoot(options: SeqLoggerModuleOptions): DynamicModule {
    return {
      module: SeqLoggerModule,
      global: options.isGlobal,
      providers: [
        {
          provide: JASONSOFT_SEQ_LOGGER,
          useFactory: () => {
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
          },
        },
        SeqLogger,
        ConsoleSeqLogger,
      ],
      exports: [SeqLogger, ConsoleSeqLogger],
    };
  }
}
