import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PasswordService } from './password.service';
import { EmailService } from './email.service';
import { TokenService } from './token.service';
import { UserModule } from '@frameworks/nest/modules/user.module';

@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule,
    UserModule, // Import UserModule to get access to the repositories
  ],
  providers: [PasswordService, EmailService, TokenService],
  exports: [PasswordService, EmailService, TokenService],
})
export class ServicesModule {}
