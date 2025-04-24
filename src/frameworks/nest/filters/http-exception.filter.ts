import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../../../domain/common/exceptions/domain.exception';
import { ApplicationException } from '../../../application/common/exceptions/application.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message =
        typeof errorResponse === 'object' && 'message' in errorResponse
          ? (errorResponse as any).message
          : exception.message;
      error =
        typeof errorResponse === 'object' && 'error' in errorResponse
          ? (errorResponse as any).error
          : exception.name;
    } else if (exception instanceof DomainException) {
      // Handle domain exceptions
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = exception.name;
    } else if (exception instanceof ApplicationException) {
      // Handle application exceptions
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = exception.name;
    } else {
      // Handle unknown exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'InternalServerError';

      // Log the unknown error
      this.logger.error(
        `Unhandled exception: ${exception}`,
        (exception as Error)?.stack,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
