import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupApp } from '@frameworks/nest/config/app.config';
import { setupSwagger } from '@frameworks/nest/config/swagger.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Create a new logger instance
  const logger = new Logger('Bootstrap');

  // Create the application with logger enabled
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Setup app configuration (global pipes, filters, etc.)
  setupApp(app);

  // Setup Swagger documentation
  setupSwagger(app);

  // Enable CORS
  app.enableCors();

  // Get port from config
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);

  await app.listen(port);

  // Use the Nest.js logger instead of console.log
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger is available at: http://localhost:${port}/api/docs`);
}

bootstrap().catch(err => {
  // Handle bootstrap errors with the logger
  const logger = new Logger('Bootstrap');
  logger.error(`Failed to start application: ${err.message}`, err.stack);
  process.exit(1);
});
