import { Logger } from 'seq-logging';

/**
 * Seq Logger interface
 * Added by Jason.Song (成长的小猪) on 2021/07/05 16:50:10
 */
export interface SeqLogger {
  /**
   * App Service Name
   */
  serviceName: string;
  /**
   * Seq Logger
   */
  logger: Logger;
}