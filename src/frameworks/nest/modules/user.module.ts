import { Module } from '@nestjs/common';
import { UserDomainModule } from '@domain/user/domain.module';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { PrismaUserRepository } from '@infrastructure/persistence/repositories/user.repository';
import { PrismaRoleRepository } from '@infrastructure/persistence/repositories/role.repository';
import { PrismaPermissionRepository } from '@infrastructure/persistence/repositories/permission.repository';
import { PrismaRefreshTokenRepository } from '@infrastructure/persistence/repositories/refresh-token.repository';
import { PrismaVerificationTokenRepository } from '@infrastructure/persistence/repositories/verification-token.repository';

@Module({
  imports: [UserDomainModule, PrismaModule],
  providers: [
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'RoleRepository',
      useClass: PrismaRoleRepository,
    },
    {
      provide: 'PermissionRepository',
      useClass: PrismaPermissionRepository,
    },
    {
      provide: 'RefreshTokenRepository',
      useClass: PrismaRefreshTokenRepository,
    },
    {
      provide: 'VerificationTokenRepository',
      useClass: PrismaVerificationTokenRepository,
    },
  ],
  exports: [
    'UserRepository',
    'RoleRepository',
    'PermissionRepository',
    'RefreshTokenRepository',
    'VerificationTokenRepository',
  ],
})
export class UserModule {}
