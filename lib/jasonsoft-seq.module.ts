import { DynamicModule, Module } from '@nestjs/common';
import { Logger } from 'seq-logging';
import { SeqModuleOptions, SeqLogger } from './interfaces';
import { JASONSOFT_SEQ_LOGGER } from './jasonsoft-seq.constants';
import { JasonsoftSeqService } from './jasonsoft-seq.service';

/**
 * Jasonsoft Seq logger Module
 * Added by Jason.Song (成长的小猪) on 2021/07/05 16:44:10
 */
@Module({})
export class JasonsoftSeqModule {
  static forRoot(options: SeqModuleOptions): DynamicModule {
    return {
      module: JasonsoftSeqModule,
      global: options.isGlobal,
      providers: [
        {
          provide: JASONSOFT_SEQ_LOGGER,
          useFactory: () => {
            const seqLogger:SeqLogger = {
              serviceName: options.serviceName,
              logger: new Logger({
                serverUrl: options.serverUrl,
                apiKey: options.apiKey,
                onError: function (e: Error) {
                  console.error('[Jasonsoft-Seq] Log batch failed\n', e);
                },
              }),
            };
            return seqLogger;
          },
        },
        JasonsoftSeqService,
      ],
      exports: [JasonsoftSeqService],
    };
  }
}