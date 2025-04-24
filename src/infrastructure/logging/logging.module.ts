import { Global, Module } from '@nestjs/common';
import { WinstonLoggerService } from './winston-logger.service';

@Global()
@Module({
  providers: [
    {
      provide: 'LoggerService',
      useClass: WinstonLoggerService,
    },
  ],
  exports: ['LoggerService'],
})
export class LoggingModule {}
