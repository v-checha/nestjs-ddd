import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '@domain/common/exceptions/domain.exception';
import { ApplicationException } from '@application/common/exceptions/application.exception';

// Define types for HTTP exception responses
interface HttpExceptionResponseObject {
  message: string | string[];
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
}

type HttpExceptionResponse = string | HttpExceptionResponseObject;

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
      const errorResponse = exception.getResponse() as HttpExceptionResponse;

      if (typeof errorResponse === 'string') {
        message = errorResponse;
        error = exception.name;
      } else {
        message = Array.isArray(errorResponse.message)
          ? errorResponse.message.join(', ')
          : (errorResponse.message as string);
        error = errorResponse.error || exception.name;
      }
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

      if (exception instanceof Error) {
        // Log the unknown error with stack trace if it's an Error object
        this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
      } else {
        // Log the unknown error without stack trace
        this.logger.error(`Unhandled exception: ${String(exception)}`);
      }
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
