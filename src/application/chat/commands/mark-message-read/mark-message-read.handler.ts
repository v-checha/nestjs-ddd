import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkMessageReadCommand } from './mark-message-read.command';
import { MessageReadStatus } from '@domain/chat/entities/message-read-status.entity';
import { MessageRepositoryInterface } from '@domain/chat/repositories/message-repository.interface';
import { PrivateChatRepositoryInterface } from '@domain/chat/repositories/private-chat-repository.interface';
import { GroupChatRepositoryInterface } from '@domain/chat/repositories/group-chat-repository.interface';
import { MessageId } from '@domain/chat/value-objects/message-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { Inject } from '@nestjs/common';
import { ApplicationException } from '../../../common/exceptions/application.exception';
import {
  UnauthorizedChatAccessException,
  MessageNotFoundException,
} from '../../../common/exceptions/application.exception';

@CommandHandler(MarkMessageReadCommand)
export class MarkMessageReadHandler implements ICommandHandler<MarkMessageReadCommand, void> {
  constructor(
    @Inject('MessageRepositoryInterface')
    private readonly messageRepository: MessageRepositoryInterface,
    @Inject('PrivateChatRepositoryInterface')
    private readonly privateChatRepository: PrivateChatRepositoryInterface,
    @Inject('GroupChatRepositoryInterface')
    private readonly groupChatRepository: GroupChatRepositoryInterface,
  ) {}

  async execute(command: MarkMessageReadCommand): Promise<void> {
    const userId = UserId.create(command.userId);
    const messageId = MessageId.create(command.messageId);

    // Get message
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new MessageNotFoundException(messageId.value);
    }

    // Check if user is allowed to mark this message as read
    let isAuthorized = false;

    if (message.isPrivateChat) {
      const privateChat = await this.privateChatRepository.findById(message.chatId);
      if (!privateChat) {
        throw new ApplicationException('Chat not found for this message');
      }
      isAuthorized = privateChat.containsUser(userId);
    } else {
      const groupChat = await this.groupChatRepository.findById(message.chatId);
      if (!groupChat) {
        throw new ApplicationException('Chat not found for this message');
      }
      isAuthorized = groupChat.containsUser(userId);
    }

    if (!isAuthorized) {
      throw new UnauthorizedChatAccessException(userId.value, message.chatId.value);
    }

    // Create read status
    const readStatus = MessageReadStatus.create({
      messageId,
      userId,
      readAt: new Date(),
    });

    // Save read status
    await this.messageRepository.saveReadStatus(readStatus);
  }
}
