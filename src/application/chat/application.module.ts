import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserDomainModule } from '@domain/user/domain.module';
import { ChatDomainModule } from '@domain/chat/domain.module';
import { UserApplicationModule } from '../user/application.module';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import { PrivateChatRepository } from '@infrastructure/persistence/repositories/private-chat.repository';
import { GroupChatRepository } from '@infrastructure/persistence/repositories/group-chat.repository';
import { MessageRepository } from '@infrastructure/persistence/repositories/message.repository';
import { PrismaUserRepository } from '@infrastructure/persistence/repositories/user.repository';

// Command Handlers
import { CreatePrivateChatHandler } from './commands/create-private-chat/create-private-chat.handler';
import { CreateGroupChatHandler } from './commands/create-group-chat/create-group-chat.handler';
import { SendMessageHandler } from './commands/send-message/send-message.handler';
import { MarkMessageReadHandler } from './commands/mark-message-read/mark-message-read.handler';

// Query Handlers
import { GetUserChatsHandler } from './queries/get-user-chats/get-user-chats.handler';
import { GetChatMessagesHandler } from './queries/get-chat-messages/get-chat-messages.handler';
import { GetChatDetailsHandler } from './queries/get-chat-details/get-chat-details.handler';

// Mappers
import { MessageMapper } from './mappers/message.mapper';
import { PrivateChatMapper } from './mappers/private-chat.mapper';
import { GroupChatMapper } from './mappers/group-chat.mapper';

const CommandHandlers = [
  CreatePrivateChatHandler,
  CreateGroupChatHandler,
  SendMessageHandler,
  MarkMessageReadHandler,
];

const QueryHandlers = [GetUserChatsHandler, GetChatMessagesHandler, GetChatDetailsHandler];

const Mappers = [MessageMapper, PrivateChatMapper, GroupChatMapper];

@Module({
  imports: [CqrsModule, UserDomainModule, ChatDomainModule, UserApplicationModule, PrismaModule],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Mappers,
    {
      provide: 'PrivateChatRepositoryInterface',
      useClass: PrivateChatRepository,
    },
    {
      provide: 'GroupChatRepositoryInterface',
      useClass: GroupChatRepository,
    },
    {
      provide: 'MessageRepositoryInterface',
      useClass: MessageRepository,
    },
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
  ],
  exports: [...Mappers],
})
export class ChatApplicationModule {}
