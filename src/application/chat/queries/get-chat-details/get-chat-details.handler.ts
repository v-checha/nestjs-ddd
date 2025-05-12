import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetChatDetailsQuery } from './get-chat-details.query';
import { PrivateChatRepositoryInterface } from '@domain/chat/repositories/private-chat-repository.interface';
import { GroupChatRepositoryInterface } from '@domain/chat/repositories/group-chat-repository.interface';
import { MessageRepositoryInterface } from '@domain/chat/repositories/message-repository.interface';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { ChatId } from '@domain/chat/value-objects/chat-id.vo';
import { PrivateChatMapper } from '../../mappers/private-chat.mapper';
import { GroupChatMapper } from '../../mappers/group-chat.mapper';
import { PrivateChatDto } from '../../dtos/private-chat.dto';
import { GroupChatDto } from '../../dtos/group-chat.dto';
import { UnauthorizedChatAccessException } from '../../../common/exceptions/application.exception';
import { ApplicationException } from '../../../common/exceptions/application.exception';

type ChatDetailsResult = PrivateChatDto | GroupChatDto;

@QueryHandler(GetChatDetailsQuery)
export class GetChatDetailsHandler
  implements IQueryHandler<GetChatDetailsQuery, ChatDetailsResult>
{
  constructor(
    @Inject('PrivateChatRepositoryInterface')
    private readonly privateChatRepository: PrivateChatRepositoryInterface,
    @Inject('GroupChatRepositoryInterface')
    private readonly groupChatRepository: GroupChatRepositoryInterface,
    @Inject('MessageRepositoryInterface')
    private readonly messageRepository: MessageRepositoryInterface,
    private readonly privateChatMapper: PrivateChatMapper,
    private readonly groupChatMapper: GroupChatMapper,
  ) {}

  async execute(query: GetChatDetailsQuery): Promise<ChatDetailsResult> {
    const userId = UserId.create(query.userId);
    const chatId = ChatId.create(query.chatId);

    // Try private chat first
    const privateChat = await this.privateChatRepository.findById(chatId);
    if (privateChat) {
      if (!privateChat.containsUser(userId)) {
        throw new UnauthorizedChatAccessException(userId.value, chatId.value);
      }

      // Get last message
      const messages = await this.messageRepository.findByChatId(chatId, { limit: 1 });
      const lastMessage = messages.length > 0 ? messages[0] : undefined;

      // Get unread count
      const unreadCount = await this.messageRepository.countUnreadByChatIdAndUserId(chatId, userId);

      return this.privateChatMapper.toDto(privateChat, lastMessage, unreadCount);
    }

    // Try group chat
    const groupChat = await this.groupChatRepository.findById(chatId);
    if (groupChat) {
      if (!groupChat.containsUser(userId)) {
        throw new UnauthorizedChatAccessException(userId.value, chatId.value);
      }

      // Get last message
      const messages = await this.messageRepository.findByChatId(chatId, { limit: 1 });
      const lastMessage = messages.length > 0 ? messages[0] : undefined;

      // Get unread count
      const unreadCount = await this.messageRepository.countUnreadByChatIdAndUserId(chatId, userId);

      return this.groupChatMapper.toDto(groupChat, lastMessage, unreadCount);
    }

    throw new ApplicationException(`Chat with ID ${chatId.value} not found`);
  }
}
