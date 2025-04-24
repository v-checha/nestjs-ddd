import { Module } from '@nestjs/common';
import { AuthModule as InfraAuthModule } from '../../../infrastructure/authentication/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [InfraAuthModule, ConfigModule],
  exports: [InfraAuthModule],
})
export class AuthModule {}