import { Injectable } from '@nestjs/common';
import { PrivateChat } from '@domain/chat/entities/private-chat.entity';
import { PrivateChatDto, PrivateChatParticipantDto } from '../dtos/private-chat.dto';
import { Message } from '@domain/chat/entities/message.entity';

@Injectable()
export class PrivateChatMapper {
  toDomain(raw: any): PrivateChat {
    throw new Error('Method not implemented');
  }

  toDto(entity: PrivateChat, lastMessage?: Message, unreadCount = 0): PrivateChatDto {
    const participantDtos: PrivateChatParticipantDto[] = entity.participants.map(p => ({
      userId: p.userId.value,
      isActive: p.isActive,
      joinedAt: p.joinedAt,
    }));

    return {
      id: entity.id,
      participants: participantDtos,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            content: lastMessage.content.value,
            senderId: lastMessage.senderId.value,
            createdAt: lastMessage.createdAt,
          }
        : undefined,
      unreadCount,
    };
  }

  // Map a list of private chats to DTOs
  toDtoList(
    entities: PrivateChat[],
    lastMessagesMap: Map<string, Message> = new Map(),
    unreadCountsMap: Map<string, number> = new Map(),
  ): PrivateChatDto[] {
    return entities.map(entity =>
      this.toDto(entity, lastMessagesMap.get(entity.id), unreadCountsMap.get(entity.id) || 0),
    );
  }
}
