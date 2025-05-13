import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { ChatController } from '../controllers/chat.controller';
import { ChatWebsocketModule } from '../../websocket/chat/chat.module';
import { UserModule } from '@frameworks/nest/modules/user.module';
import { ChatModule } from '@frameworks/nest/modules/chat.module';

import { chatRepositoryProviders } from '@infrastructure/persistence/repositories';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';

@Module({
  imports: [
    CqrsModule,
    ChatModule,
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
  providers: [...chatRepositoryProviders],
})
export class ChatRestModule {}
