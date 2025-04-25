import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(`${method} ${url} - ${responseTime}ms`, context.getClass().name);
        },
        error: error => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `${method} ${url} - ${responseTime}ms - Error: ${error.message}`,
            error.stack,
            context.getClass().name,
          );
        },
      }),
    );
  }
}
