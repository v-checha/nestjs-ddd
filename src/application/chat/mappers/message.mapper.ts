import { Injectable } from '@nestjs/common';
import { Message } from '@domain/chat/entities/message.entity';
import { MessageDto } from '../dtos/message.dto';
import { UserMapper } from '../../user/mappers/user.mapper';

@Injectable()
export class MessageMapper {
  constructor(private readonly userMapper: UserMapper) {}

  toDomain(raw: any): Message {
    throw new Error('Method not implemented');
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
