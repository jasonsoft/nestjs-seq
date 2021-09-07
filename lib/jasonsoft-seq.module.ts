import { DynamicModule, Module } from '@nestjs/common';
import { Logger } from 'seq-logging';
import { SeqModuleOptions, SeqLogger } from './interfaces';
import { JASONSOFT_SEQ_LOGGER } from './jasonsoft-seq.constants';
import { JasonSoftSeqService } from './jasonsoft-seq.service';

/**
 * JasonSoft Seq logger Module
 * Added by Jason.Song (成长的小猪) on 2021/07/05 16:44:10
 */
@Module({})
export class JasonSoftSeqModule {
  static forRoot(options: SeqModuleOptions): DynamicModule {
    return {
      module: JasonSoftSeqModule,
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
                  console.error('[JasonSoft-Seq] Log batch failed\n', e);
                },
              }),
            };
            return seqLogger;
          },
        },
        JasonSoftSeqService,
      ],
      exports: [JasonSoftSeqService],
    };
  }
}