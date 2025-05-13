import { Injectable } from '@nestjs/common';
import { GroupChat, GroupChatProps } from '@domain/chat/entities/group-chat.entity';
import { GroupChatDto, GroupChatParticipantDto } from '../dtos/group-chat.dto';
import { Message } from '@domain/chat/entities/message.entity';
import { PrismaGroupChatModel } from '@infrastructure/persistence/prisma/prisma.types';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { ChatName } from '@domain/chat/value-objects/chat-name.vo';

@Injectable()
export class GroupChatMapper {
  toDomain(raw: PrismaGroupChatModel): GroupChat {
    if (!raw.participants || !raw.creatorId) {
      throw new Error('Group chat requires participants and a creator');
    }

    const creatorId = UserId.create(raw.creatorId);
    const name = ChatName.create(raw.name);

    // Filter out the creator, who will be added automatically in the create method
    const participantsWithoutCreator = raw.participants
      .filter(p => p.id !== raw.creatorId)
      .map(p => ({
        userId: UserId.create(p.id)
      }));

    return GroupChat.create(name, creatorId, participantsWithoutCreator, raw.id);
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
