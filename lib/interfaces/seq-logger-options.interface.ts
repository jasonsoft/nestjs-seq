import { Logger } from 'seq-logging';

/**
 * Seq Logger Options interface
 * Added by Jason.Song (成长的小猪) on 2021/07/05 16:50:10
 */
export interface SeqLoggerOptions {
  /**
   * App Service Name
   */
  serviceName: string;
  /**
   * Seq Logger
   */
  logger: Logger;
}
