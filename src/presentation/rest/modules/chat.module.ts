import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { ChatController } from '../controllers/chat.controller';
import { JwtAuthGuard } from '@frameworks/nest/guards/jwt-auth.guard';
import { PermissionsGuard } from '@frameworks/nest/guards/permissions.guard';
import { ChatApplicationModule } from '@application/chat/application.module';
import { ChatWebsocketModule } from '../../websocket/chat/chat.module';
import { UserModule } from '@frameworks/nest/modules/user.module';

import { chatRepositoryProviders } from '@infrastructure/persistence/repositories';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';

@Module({
  imports: [
    CqrsModule,
    ChatApplicationModule,
    ChatWebsocketModule,
    PrismaModule,
    UserModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
        },
      }),
    }),
  ],
  controllers: [ChatController],
  providers: [
    JwtAuthGuard,
    PermissionsGuard,
    ...chatRepositoryProviders
  ],
  exports: [JwtAuthGuard, PermissionsGuard],
})
export class ChatRestModule {}
