import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';

/**
 * Seq Logger Module Options interface
 * Added by Jason.Song (成长的小猪) on 2021/07/05 16:42:59
 */
export interface SeqLoggerModuleOptions {
  /**
   * Customize a log name to facilitate log filtering
   */
  serviceName: string;
  /**
   * The HTTP endpoint address of the Seq server
   */
  serverUrl: string;
  /**
   * The API Key to use when connecting to Seq
   */
  apiKey: string;
  /**
   * Use module globally
   * When you want to use SeqLoggerModule in other modules,
   * you'll need to import it (as is standard with any Nest module).
   * Alternatively, declare it as a global module by setting the options object's isGlobal property to true, as shown below.
   * In that case, you will not need to import SeqLoggerModule in other modules once it's been loaded in the root module
   */
  isGlobal?: boolean;
}

export interface SeqLoggerModuleOptionsFactory {
  createSeqLoggerOptions():
    | Promise<SeqLoggerModuleOptions>
    | SeqLoggerModuleOptions;
}

/**
 * Seq Logger Module Async Options interface
 * Added by Jason.Song (成长的小猪) on 2021/10/18 15:26:56
 */
export interface SeqLoggerAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Existing Provider to be used.
   */
  useExisting?: Type<SeqLoggerModuleOptionsFactory>;

  /**
   * Type (class name) of provider (instance to be registered and injected).
   */
  useClass?: Type<SeqLoggerModuleOptionsFactory>;

  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory?: (
    ...args: any[]
  ) => Promise<SeqLoggerModuleOptions> | SeqLoggerModuleOptions;

  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: FactoryProvider['inject'];
}
