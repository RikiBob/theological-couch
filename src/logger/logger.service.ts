import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
import { LogtailTransport } from './logtail-transport';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class CustomLoggerService implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    const logtailTransport = new LogtailTransport(process.env.LOGGER_TOKEN);

    this.logger = createLogger({
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
      transports: [
        // new transports.Console({
        //   format: format.combine(format.colorize(), format.simple()),
        // }),
        logtailTransport,
      ],
    });
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }
}
