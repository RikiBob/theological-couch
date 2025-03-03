import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { CustomLoggerService } from '../logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      message =
        typeof responseBody === 'string'
          ? responseBody
          : (responseBody as any).message || message;
    }

    if (exception instanceof BadRequestException) {
      const responseBody = exception.getResponse();
      const validationErrors = Array.isArray((responseBody as any).message)
        ? (responseBody as any).message
        : [responseBody];

      this.logger.warn(
        `Validation error in ${request.method} ${request.originalUrl}`,
        JSON.stringify(validationErrors),
      );

      response.status(status).json({
        statusCode: status,
        message: 'Validation failed',
        errors: validationErrors,
      });
      return;
    }

    this.logger.error(
      `Error in ${request.method} ${request.originalUrl} - ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
