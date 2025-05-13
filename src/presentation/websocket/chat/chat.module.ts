import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { chatRepositoryProviders } from '@infrastructure/persistence/repositories';
import { ChatModule } from '@frameworks/nest/modules/chat.module';

// Event handlers
import {
  MessageSentEventHandler,
  PrivateChatCreatedEventHandler,
  GroupChatCreatedEventHandler,
  UserAddedToGroupEventHandler,
} from './events/chat-events.handler';

const EventHandlers = [
  MessageSentEventHandler,
  PrivateChatCreatedEventHandler,
  GroupChatCreatedEventHandler,
  UserAddedToGroupEventHandler,
];

@Module({
  imports: [
    CqrsModule,
    ChatModule,
    PrismaModule,
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
  providers: [ChatGateway, ...EventHandlers, ...chatRepositoryProviders],
  exports: [ChatGateway],
})
export class ChatWebsocketModule {}
