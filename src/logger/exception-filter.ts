import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { CustomLoggerService } from './logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const status = exception instanceof Error ? 500 : 400;

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
      `Error in ${request.method} ${request.originalUrl} - ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      statusCode: status,
      message:
        exception instanceof Error
          ? exception.message
          : 'Internal server error',
    });
  }
}
