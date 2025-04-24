import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserController } from './controllers/user.controller';
import { RoleController } from './controllers/role.controller';
import { PermissionController } from './controllers/permission.controller';
import { AuthController } from './controllers/auth.controller';
import { UserApplicationModule } from '../../application/user/application.module';
import { AuthModule } from '../../infrastructure/authentication/auth.module';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { GuardsModule } from '../../frameworks/nest/modules/guards.module';
import { UserModule } from '../../frameworks/nest/modules/user.module';

@Module({
  imports: [
    CqrsModule,
    UserApplicationModule,
    AuthModule,
    GuardsModule,
    UserModule,
  ],
  controllers: [UserController, RoleController, PermissionController, AuthController],
})
export class RestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply auth middleware to protected routes
    consumer
      .apply(AuthMiddleware)
      .exclude('users/(.*)', 'auth/(.*)')
      .forRoutes('*');
  }
}