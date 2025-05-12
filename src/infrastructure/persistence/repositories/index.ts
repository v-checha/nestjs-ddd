import { Provider } from '@nestjs/common';
import { PrivateChatRepository } from './private-chat.repository';
import { GroupChatRepository } from './group-chat.repository';
import { MessageRepository } from './message.repository';

export const chatRepositoryProviders: Provider[] = [
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
];
