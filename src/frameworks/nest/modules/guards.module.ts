import { Module } from '@nestjs/common';
import { UserModule } from './user.module';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

@Module({
  imports: [UserModule],
  providers: [RolesGuard, PermissionsGuard],
  exports: [RolesGuard, PermissionsGuard],
})
export class GuardsModule {}