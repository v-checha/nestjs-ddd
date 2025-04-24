import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { HttpResponseInterceptor } from '../interceptors/http-response.interceptor';
import { ApiExceptionFilter } from '../filters/api-exception.filter';

export function setupApp(app: INestApplication) {
  const configService = app.get(ConfigService);

  // Set global prefix for all routes
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Apply global pipes, filters, and interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new HttpResponseInterceptor());

  return app;
}
