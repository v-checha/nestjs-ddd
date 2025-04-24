import { Module } from '@nestjs/common';
import { UserDomainModule } from '../../../domain/user/domain.module';
import { PrismaModule } from '../../../infrastructure/persistence/prisma/prisma.module';
import { UserRepository } from '../../../infrastructure/persistence/repositories/user.repository';
import { RoleRepository } from '../../../infrastructure/persistence/repositories/role.repository';
import { PermissionRepository } from '../../../infrastructure/persistence/repositories/permission.repository';

@Module({
  imports: [UserDomainModule, PrismaModule],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IRoleRepository',
      useClass: RoleRepository,
    },
    {
      provide: 'IPermissionRepository',
      useClass: PermissionRepository,
    },
  ],
  exports: ['IUserRepository', 'IRoleRepository', 'IPermissionRepository'],
})
export class UserModule {}