import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupChatRepositoryInterface } from '@domain/chat/repositories/group-chat-repository.interface';
import { GroupChat } from '@domain/chat/entities/group-chat.entity';
import { ChatId } from '@domain/chat/value-objects/chat-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { ChatName } from '@domain/chat/value-objects/chat-name.vo';

@Injectable()
export class GroupChatRepository implements GroupChatRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: ChatId): Promise<GroupChat | null> {
    const groupChat = await this.prisma.groupChat.findUnique({
      where: { id: id.value },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });

    if (!groupChat) {
      return null;
    }

    return this.toDomain(groupChat);
  }

  async findByUserId(userId: UserId): Promise<GroupChat[]> {
    const chats = await this.prisma.groupChat.findMany({
      where: {
        participants: {
          some: {
            userId: userId.value,
          },
        },
      },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });

    return chats.map(chat => this.toDomain(chat));
  }

  async save(groupChat: GroupChat): Promise<void> {
    const exists = await this.prisma.groupChat.findUnique({
      where: { id: groupChat.id },
    });

    if (exists) {
      // Update existing chat
      await this.prisma.$transaction(async prisma => {
        // Update chat
        await prisma.groupChat.update({
          where: { id: groupChat.id },
          data: {
            name: groupChat.name.value,
            updatedAt: groupChat.updatedAt,
          },
        });

        // Update participants
        for (const participant of groupChat.participants) {
          await prisma.groupChatUser.upsert({
            where: {
              chatId_userId: {
                chatId: groupChat.id,
                userId: participant.userId.value,
              },
            },
            update: {
              isAdmin: participant.isAdmin,
              isActive: participant.isActive,
            },
            create: {
              chatId: groupChat.id,
              userId: participant.userId.value,
              joinedAt: participant.joinedAt,
              isAdmin: participant.isAdmin,
              isActive: participant.isActive,
            },
          });
        }
      });
    } else {
      // Create new chat
      await this.prisma.$transaction(async prisma => {
        // Create chat
        await prisma.groupChat.create({
          data: {
            id: groupChat.id,
            name: groupChat.name.value,
            createdAt: groupChat.createdAt,
            updatedAt: groupChat.updatedAt,
            participants: {
              create: groupChat.participants.map(participant => ({
                userId: participant.userId.value,
                joinedAt: participant.joinedAt,
                isAdmin: participant.isAdmin,
                isActive: participant.isActive,
              })),
            },
          },
        });
      });
    }
  }

  async delete(id: ChatId): Promise<void> {
    await this.prisma.groupChat.delete({
      where: { id: id.value },
    });
  }

  private toDomain(rawData: any): GroupChat {
    const participants = rawData.participants.map((p: any) => ({
      userId: UserId.create(p.userId),
      joinedAt: p.joinedAt,
      isAdmin: p.isAdmin,
      isActive: p.isActive,
    }));

    // Find the creator (first admin)
    const creator = participants.find((p: any) => p.isAdmin) || participants[0];

    // Reconstruct the GroupChat aggregate
    return GroupChat.create(
      ChatName.create(rawData.name),
      creator.userId,
      participants
        .filter((p: any) => !p.userId.equals(creator.userId))
        .map((p: any) => ({ userId: p.userId })),
      rawData.id,
    );
  }
}
