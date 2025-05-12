import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendMessageCommand } from './send-message.command';
import { Message } from '@domain/chat/entities/message.entity';
import { MessageRepositoryInterface } from '@domain/chat/repositories/message-repository.interface';
import { PrivateChatRepositoryInterface } from '@domain/chat/repositories/private-chat-repository.interface';
import { GroupChatRepositoryInterface } from '@domain/chat/repositories/group-chat-repository.interface';
import { MessageContent } from '@domain/chat/value-objects/message-content.vo';
import { ChatId } from '@domain/chat/value-objects/chat-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { Inject } from '@nestjs/common';
import { ApplicationException } from '../../../common/exceptions/application.exception';
import { MessageMapper } from '../../mappers/message.mapper';
import { MessageDto } from '../../dtos/message.dto';
import { MessageSentEvent } from '@domain/chat/events/message-sent.event';
import { UnauthorizedChatAccessException } from '../../../common/exceptions/application.exception';

@CommandHandler(SendMessageCommand)
export class SendMessageHandler implements ICommandHandler<SendMessageCommand, MessageDto> {
  constructor(
    @Inject('MessageRepositoryInterface')
    private readonly messageRepository: MessageRepositoryInterface,
    @Inject('PrivateChatRepositoryInterface')
    private readonly privateChatRepository: PrivateChatRepositoryInterface,
    @Inject('GroupChatRepositoryInterface')
    private readonly groupChatRepository: GroupChatRepositoryInterface,
    private readonly messageMapper: MessageMapper,
  ) {}

  async execute(command: SendMessageCommand): Promise<MessageDto> {
    const senderId = UserId.create(command.senderId);
    const chatId = ChatId.create(command.chatId);
    const content = MessageContent.create(command.content);

    // Check if chat exists and sender is a member
    let isPrivateChat = false;
    let isAuthorized = false;

    // Try private chat first
    const privateChat = await this.privateChatRepository.findById(chatId);
    if (privateChat) {
      isPrivateChat = true;
      isAuthorized = privateChat.containsUser(senderId);

      if (!isAuthorized) {
        throw new UnauthorizedChatAccessException(senderId.value, chatId.value);
      }
    } else {
      // Try group chat
      const groupChat = await this.groupChatRepository.findById(chatId);
      if (!groupChat) {
        throw new ApplicationException(`Chat with ID ${chatId.value} not found`);
      }

      isAuthorized = groupChat.containsUser(senderId);
      if (!isAuthorized) {
        throw new UnauthorizedChatAccessException(senderId.value, chatId.value);
      }
    }

    // Create message
    const message = Message.create({
      content,
      senderId,
      chatId,
      privateChatId: isPrivateChat ? chatId.value : undefined,
      groupChatId: !isPrivateChat ? chatId.value : undefined,
    });

    // Add domain event
    message.addDomainEvent(
      new MessageSentEvent(
        message.messageId,
        chatId,
        senderId,
        isPrivateChat,
        content.value,
        new Date(),
      ),
    );

    // Save message
    await this.messageRepository.save(message);

    return this.messageMapper.toDto(message);
  }
}
