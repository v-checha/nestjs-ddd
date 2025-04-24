import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiResponse, ErrorDetail, Meta } from '../../../presentation/rest/dtos/response/api-response';
import { ApplicationException } from '../../../application/common/exceptions/application.exception';
import { DomainException } from '../../../domain/common/exceptions/domain.exception';
import { ValidationError } from 'class-validator';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Default to internal server error
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage = 'An unexpected error occurred';
    let errors: ErrorDetail[] = [];
    
    // Log the error
    this.logger.error(`${request.method} ${request.url} - ${exception.message}`, exception.stack);
    
    if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
      } else {
        const exceptionObj = exceptionResponse as Record<string, any>;
        
        // Handle validation errors (array of message strings)
        if (Array.isArray(exceptionObj.message)) {
          errors = this.formatValidationErrors(exceptionObj.message);
        } else {
          errorMessage = exceptionObj.message || exception.message;
        }
        
        errorCode = this.getErrorCodeFromStatus(status);
      }
    } else if (exception instanceof ApplicationException) {
      // Handle application exceptions
      status = HttpStatus.BAD_REQUEST;
      errorCode = exception.constructor.name.replace('Exception', '').toUpperCase();
      errorMessage = exception.message;
    } else if (exception instanceof DomainException) {
      // Handle domain exceptions
      status = HttpStatus.BAD_REQUEST;
      errorCode = exception.constructor.name.replace('Exception', '').toUpperCase();
      errorMessage = exception.message;
    }
    
    // If no errors were generated, create a default one
    if (errors.length === 0) {
      errors.push(new ErrorDetail(errorCode, errorMessage));
    }
    
    // Create metadata
    const meta = new Meta({
      timestamp: new Date().toISOString()
    });
    
    // Format the error response
    const errorResponse = ApiResponse.error(errors, meta);
    
    // Send the response
    response.status(status).json(errorResponse);
  }
  
  private formatValidationErrors(validationErrors: any[]): ErrorDetail[] {
    const errors: ErrorDetail[] = [];
    
    // Handle class-validator ValidationError objects
    if (validationErrors.length > 0 && 'constraints' in validationErrors[0]) {
      (validationErrors as ValidationError[]).forEach(error => {
        const constraints = error.constraints || {};
        
        Object.values(constraints).forEach(message => {
          errors.push(new ErrorDetail('VALIDATION_ERROR', message, error.property));
        });
      });
    } else {
      // Handle simple string messages
      validationErrors.forEach(message => {
        errors.push(new ErrorDetail('VALIDATION_ERROR', message));
      });
    }
    
    return errors;
  }
  
  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.METHOD_NOT_ALLOWED:
        return 'METHOD_NOT_ALLOWED';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}