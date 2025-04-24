import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserController } from './controllers/user.controller';
import { UserApplicationModule } from '../../application/user/application.module';
import { AuthModule } from '../../infrastructure/authentication/auth.module';
import { AuthMiddleware } from './middlewares/auth.middleware';

@Module({
  imports: [
    CqrsModule,
    UserApplicationModule,
    AuthModule,
  ],
  controllers: [UserController],
})
export class RestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply auth middleware to protected routes
    consumer
      .apply(AuthMiddleware)
      .exclude('users/(.*)')
      .forRoutes('*');
  }
}