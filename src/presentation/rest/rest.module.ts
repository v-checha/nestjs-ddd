import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_GUARD } from '@nestjs/core';
import { UserController } from './controllers/user.controller';
import { RoleController } from './controllers/role.controller';
import { PermissionController } from './controllers/permission.controller';
import { AuthController } from './controllers/auth.controller';
import { ChatController } from './controllers/chat.controller';
import { UserApplicationModule } from '@application/user/application.module';
import { AuthModule } from '@infrastructure/authentication/auth.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { GuardsModule } from '@frameworks/nest/modules/guards.module';
import { UserModule } from '@frameworks/nest/modules/user.module';
import { ChatRestModule } from './modules/chat.module';
import { JwtAuthGuard } from '@frameworks/nest/guards/jwt-auth.guard';
import { PermissionsGuard } from '@frameworks/nest/guards/permissions.guard';

@Module({
  imports: [
    CqrsModule,
    UserApplicationModule,
    AuthModule,
    GuardsModule,
    UserModule,
    ChatRestModule,
  ],
  controllers: [
    UserController,
    RoleController,
    PermissionController,
    AuthController,
    ChatController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class RestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply auth middleware to protected routes
    // More info - https://docs.nestjs.com/migration-guide
    consumer
      .apply(AuthMiddleware)
      .exclude('users/*wildcard', 'auth/*wildcard', 'chats/*wildcard')
      .forRoutes('{*wildcard}');
  }
}
