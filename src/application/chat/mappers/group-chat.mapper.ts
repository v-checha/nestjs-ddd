import { Injectable } from '@nestjs/common';
import { GroupChat } from '@domain/chat/entities/group-chat.entity';
import { GroupChatDto, GroupChatParticipantDto } from '../dtos/group-chat.dto';
import { Message } from '@domain/chat/entities/message.entity';

@Injectable()
export class GroupChatMapper {
  toDomain(raw: any): GroupChat {
    throw new Error('Method not implemented');
  }

  toDto(entity: GroupChat, lastMessage?: Message, unreadCount = 0): GroupChatDto {
    const participantDtos: GroupChatParticipantDto[] = entity.participants.map(p => ({
      userId: p.userId.value,
      isAdmin: p.isAdmin,
      isActive: p.isActive,
      joinedAt: p.joinedAt,
    }));

    return {
      id: entity.id,
      name: entity.name.value,
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

  // Map a list of group chats to DTOs
  toDtoList(
    entities: GroupChat[],
    lastMessagesMap: Map<string, Message> = new Map(),
    unreadCountsMap: Map<string, number> = new Map(),
  ): GroupChatDto[] {
    return entities.map(entity =>
      this.toDto(entity, lastMessagesMap.get(entity.id), unreadCountsMap.get(entity.id) || 0),
    );
  }
}
