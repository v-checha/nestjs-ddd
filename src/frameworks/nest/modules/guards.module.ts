import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from './user.module';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthModule } from './auth.module';

@Module({
  imports: [UserModule, AuthModule, CqrsModule],
  providers: [JwtAuthGuard, RolesGuard, PermissionsGuard],
  exports: [JwtAuthGuard, RolesGuard, PermissionsGuard],
})
export class GuardsModule {}
