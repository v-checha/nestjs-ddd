import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserChatsQuery } from './get-user-chats.query';
import { PrivateChatRepositoryInterface } from '@domain/chat/repositories/private-chat-repository.interface';
import { GroupChatRepositoryInterface } from '@domain/chat/repositories/group-chat-repository.interface';
import { MessageRepositoryInterface } from '@domain/chat/repositories/message-repository.interface';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { PrivateChatMapper } from '../../mappers/private-chat.mapper';
import { GroupChatMapper } from '../../mappers/group-chat.mapper';
import { PrivateChatDto } from '../../dtos/private-chat.dto';
import { GroupChatDto } from '../../dtos/group-chat.dto';

interface ChatsResult {
  privateChats: PrivateChatDto[];
  groupChats: GroupChatDto[];
}

@QueryHandler(GetUserChatsQuery)
export class GetUserChatsHandler implements IQueryHandler<GetUserChatsQuery, ChatsResult> {
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

  async execute(query: GetUserChatsQuery): Promise<ChatsResult> {
    const userId = UserId.create(query.userId);

    // Get user's private chats
    const privateChats = await this.privateChatRepository.findByUserId(userId);

    // Get user's group chats
    const groupChats = await this.groupChatRepository.findByUserId(userId);

    // Get last message and unread counts for each chat
    const privateChatLastMessages = new Map();
    const privateChatUnreadCounts = new Map();

    for (const chat of privateChats) {
      // Get last message
      const messages = await this.messageRepository.findByChatId(chat.chatId, { limit: 1 });
      if (messages.length > 0) {
        privateChatLastMessages.set(chat.id, messages[0]);
      }

      // Get unread count
      const unreadCount = await this.messageRepository.countUnreadByChatIdAndUserId(
        chat.chatId,
        userId,
      );
      privateChatUnreadCounts.set(chat.id, unreadCount);
    }

    // Same for group chats
    const groupChatLastMessages = new Map();
    const groupChatUnreadCounts = new Map();

    for (const chat of groupChats) {
      // Get last message
      const messages = await this.messageRepository.findByChatId(chat.chatId, { limit: 1 });
      if (messages.length > 0) {
        groupChatLastMessages.set(chat.id, messages[0]);
      }

      // Get unread count
      const unreadCount = await this.messageRepository.countUnreadByChatIdAndUserId(
        chat.chatId,
        userId,
      );
      groupChatUnreadCounts.set(chat.id, unreadCount);
    }

    return {
      privateChats: this.privateChatMapper.toDtoList(
        privateChats,
        privateChatLastMessages,
        privateChatUnreadCounts,
      ),
      groupChats: this.groupChatMapper.toDtoList(
        groupChats,
        groupChatLastMessages,
        groupChatUnreadCounts,
      ),
    };
  }
}
