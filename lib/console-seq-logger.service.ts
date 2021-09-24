import { ConsoleLogger, Injectable } from '@nestjs/common';
import { SeqLogger } from './seq-logger.service';

@Injectable()
export class ConsoleSeqLogger extends ConsoleLogger {
  constructor(private readonly logger: SeqLogger) {
    super();
  }

  log(message: any, context?: string): void {
    this.logger.info(`[{context}] ${message}`, { logger: 'console', context });
    super.log(message, context);
  }

  error(message: any, stack?: string, context?: string): void {
    this.logger.error(`[{context}] ${message}`, {
      logger: 'console',
      context,
      stack,
    });
    super.error(message, stack, context);
  }

  warn(message: any, context?: string): void {
    this.logger.warn(`[{context}] ${message}`, { logger: 'console', context });
    super.warn(message, context);
  }

  debug(message: any, context?: string): void {
    this.logger.debug(`[{context}] ${message}`, { logger: 'console', context });
    super.debug(message, context);
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose(`[{context}] ${message}`, {
      logger: 'console',
      context,
    });
    super.verbose(message, context);
  }
}
