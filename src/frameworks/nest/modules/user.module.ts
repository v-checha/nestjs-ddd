import { Module } from '@nestjs/common';
import { UserDomainModule } from '../../../domain/user/domain.module';
import { PrismaModule } from '../../../infrastructure/persistence/prisma/prisma.module';
import { UserRepository } from '../../../infrastructure/persistence/repositories/user.repository';

@Module({
  imports: [UserDomainModule, PrismaModule],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: ['IUserRepository'],
})
export class UserModule {}