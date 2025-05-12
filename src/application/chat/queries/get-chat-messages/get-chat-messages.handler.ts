import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetChatMessagesQuery } from './get-chat-messages.query';
import { PrivateChatRepositoryInterface } from '@domain/chat/repositories/private-chat-repository.interface';
import { GroupChatRepositoryInterface } from '@domain/chat/repositories/group-chat-repository.interface';
import { MessageRepositoryInterface } from '@domain/chat/repositories/message-repository.interface';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { ChatId } from '@domain/chat/value-objects/chat-id.vo';
import { MessageId } from '@domain/chat/value-objects/message-id.vo';
import { MessageMapper } from '../../mappers/message.mapper';
import { MessageDto } from '../../dtos/message.dto';
import { UnauthorizedChatAccessException } from '../../../common/exceptions/application.exception';
import { ApplicationException } from '../../../common/exceptions/application.exception';

@QueryHandler(GetChatMessagesQuery)
export class GetChatMessagesHandler implements IQueryHandler<GetChatMessagesQuery, MessageDto[]> {
  constructor(
    @Inject('PrivateChatRepositoryInterface')
    private readonly privateChatRepository: PrivateChatRepositoryInterface,
    @Inject('GroupChatRepositoryInterface')
    private readonly groupChatRepository: GroupChatRepositoryInterface,
    @Inject('MessageRepositoryInterface')
    private readonly messageRepository: MessageRepositoryInterface,
    private readonly messageMapper: MessageMapper,
  ) {}

  async execute(query: GetChatMessagesQuery): Promise<MessageDto[]> {
    const userId = UserId.create(query.userId);
    const chatId = ChatId.create(query.chatId);
    const beforeMessageId = query.beforeMessageId
      ? MessageId.create(query.beforeMessageId)
      : undefined;

    // Check if user has access to this chat
    let isAuthorized = false;

    // Try private chat first
    const privateChat = await this.privateChatRepository.findById(chatId);
    if (privateChat) {
      isAuthorized = privateChat.containsUser(userId);
    } else {
      // Try group chat
      const groupChat = await this.groupChatRepository.findById(chatId);
      if (!groupChat) {
        throw new ApplicationException(`Chat with ID ${chatId.value} not found`);
      }

      isAuthorized = groupChat.containsUser(userId);
    }

    if (!isAuthorized) {
      throw new UnauthorizedChatAccessException(userId.value, chatId.value);
    }

    // Get messages
    const messages = await this.messageRepository.findByChatId(chatId, {
      limit: query.limit,
      beforeMessageId,
    });

    // Create a map of message IDs to read status user IDs
    // This would be populated from the repository in a real implementation
    const readMessageMap = new Map<string, string[]>();

    // Convert to DTOs
    return this.messageMapper.toDtoList(messages, readMessageMap);
  }
}
