import { Injectable } from '@nestjs/common';
import { Message, MessageProps } from '@domain/chat/entities/message.entity';
import { MessageDto } from '../dtos/message.dto';
import { UserMapper } from '../../user/mappers/user.mapper';
import { PrismaMessageModel } from '@infrastructure/persistence/prisma/prisma.types';
import { MessageContent } from '@domain/chat/value-objects/message-content.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { ChatId } from '@domain/chat/value-objects/chat-id.vo';

@Injectable()
export class MessageMapper {
  constructor(private readonly userMapper: UserMapper) {}

  toDomain(raw: PrismaMessageModel): Message {
    // Create the domain entity from Prisma model
    const messageProps: Omit<MessageProps, 'createdAt' | 'updatedAt'> = {
      content: MessageContent.create(raw.content),
      senderId: UserId.create(raw.senderId),
      chatId: ChatId.create(raw.chatId),
      privateChatId: raw.privateChatId,
      groupChatId: raw.groupChatId,
    };

    return Message.create(messageProps, raw.id);
  }

  toDto(entity: Message, readByUserIds: string[] = []): MessageDto {
    return {
      id: entity.id,
      content: entity.content.value,
      senderId: entity.senderId.value,
      senderName: '', // This would be populated from the user service
      chatId: entity.chatId.value,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      isRead: readByUserIds.length > 0,
      readBy: readByUserIds,
    };
  }

  // Map a list of messages to DTOs
  toDtoList(entities: Message[], readMessageMap: Map<string, string[]> = new Map()): MessageDto[] {
    return entities.map(entity => this.toDto(entity, readMessageMap.get(entity.id) || []));
  }
}
