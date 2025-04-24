import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { setupApp } from '@frameworks/nest/config/app.config';
import { setupSwagger } from '@frameworks/nest/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger is available at: http://localhost:${port}/api/docs`);
}

bootstrap();
