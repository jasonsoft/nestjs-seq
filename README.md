<p align="center">
  <a href="https://github.com/jasonsoft/" target="blank"><img src="https://avatars.githubusercontent.com/u/90173752?s=200&v=4" width="120" alt="JasonSoft Logo" /></a>
  <a href="http://nestjs.com/" target="blank"><img src="https://avatars.githubusercontent.com/u/28507035?s=200&v=4" width="120" alt="Nest Logo" /></a>
  <a href="https://datalust.co/" target="blank"><img src="https://datalust.co/img/seq-logo-dark.svg" height="120"  alt="datalust Logo" /></a>
</p>

# nestjs-seq

Seq logging module for Nest framework (node.js) 🐷

[![NPM version][npm-img]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]
[![License][license-img]][license-url]

[![NPM](https://nodei.co/npm/@jasonsoft/nestjs-seq.png?stars&downloads)](https://nodei.co/npm/@jasonsoft/nestjs-seq/)
[![NPM](https://nodei.co/npm-dl/@jasonsoft/nestjs-seq.png)](https://nodei.co/npm/@jasonsoft/nestjs-seq/)

### Installation

```bash
$ npm i --save @jasonsoft/nestjs-seq
```

### Quick Start

> Once the installation process is complete, we can import the JasonSoftSeqModule into the root AppModule.

```js
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
/**
 * Import the JasonSoftSeqModule into the root AppModule
 * Added by Jason.Song (成长的小猪) on 2021/09/08
 */
import { JasonSoftSeqModule } from '@jasonsoft/nestjs-seq';

@Module({
  imports: [
    /**
     * we can import the JasonSoftSeqModule. Typically, we'll import it into the root AppModule and control its behavior using the .forRoot() static method.
     * Added by Jason.Song (成长的小猪) on 2021/09/08
     */
    JasonSoftSeqModule.forRoot({
      /** Customize a log name to facilitate log filtering */
      serviceName: 'product-service',
      /** The HTTP endpoint address of the Seq server */
      serverUrl: 'http://localhost:5341',
      /** The API Key to use when connecting to Seq */
      apiKey: 'K7iUhZ9OSp6oX5EOCfPt',
      /**
       * Use module globally
       * When you want to use JasonSoftSeqModule in other modules,
       * you'll need to import it (as is standard with any Nest module).
       * Alternatively, declare it as a global module by setting the options object's isGlobal property to true, as shown below.
       * In that case, you will not need to import JasonSoftSeqModule in other modules once it's been loaded in the root module
       */
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

```js
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
/**
 * import the JasonSoftSeqService
 * Added by Jason.Song (成长的小猪) on 2021/09/08
 */
import { JasonSoftSeqService } from '@jasonsoft/nestjs-seq';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    /**
     * Inject the JasonSoftSeqService logger
     * We can also inject JasonSoftSeqService into controllers and services, etc.
     * Added by Jason.Song (成长的小猪) on 2021/09/08
     */
    private readonly logger: JasonSoftSeqService,
  ) {}

  @Get()
  getHello(): string {
    this.logger.info('getHello - start');

    const result = this.appService.getHello();
    this.logger.info('getHello - call {service}', {
      service: 'appService',
      result,
      remark: 'Record the returned result',
    });

    try {
      throw new Error('Wow, I reported an error');
    } catch (error) {
      this.logger.error('Record the error', error);
    }
    return result;
  }
}

```

### Seq

> Seq is a centralized log file with superpowers. Check out the logs we collected

![log rendering](https://github.com/jasonsoft/nestjs-seq/raw/main/rendering.jpg)

[npm-img]: https://img.shields.io/npm/v/@jasonsoft/nestjs-seq.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@jasonsoft/nestjs-seq
[license-img]: https://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dt/@jasonsoft/nestjs-seq.svg?style=flat-square
[project-icon]: https://avatars.githubusercontent.com/u/22167571?v=4
