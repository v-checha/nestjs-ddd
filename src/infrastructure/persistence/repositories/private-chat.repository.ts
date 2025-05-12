import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrivateChatRepositoryInterface } from '@domain/chat/repositories/private-chat-repository.interface';
import { PrivateChat } from '@domain/chat/entities/private-chat.entity';
import { ChatId } from '@domain/chat/value-objects/chat-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';

@Injectable()
export class PrivateChatRepository implements PrivateChatRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: ChatId): Promise<PrivateChat | null> {
    const privateChat = await this.prisma.privateChat.findUnique({
      where: { id: id.value },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });

    if (!privateChat) {
      return null;
    }

    return this.toDomain(privateChat);
  }

  async findByParticipants(userIdA: UserId, userIdB: UserId): Promise<PrivateChat | null> {
    // Find a chat where both users are participants
    const chats = await this.prisma.privateChat.findMany({
      where: {
        participants: {
          every: {
            userId: {
              in: [userIdA.value, userIdB.value],
            },
          },
        },
      },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });

    // Find the chat with exactly these two participants
    const chat = chats.find(
      chat =>
        chat.participants.length === 2 &&
        chat.participants.some(p => p.userId === userIdA.value) &&
        chat.participants.some(p => p.userId === userIdB.value),
    );

    if (!chat) {
      return null;
    }

    return this.toDomain(chat);
  }

  async findByUserId(userId: UserId): Promise<PrivateChat[]> {
    const chats = await this.prisma.privateChat.findMany({
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

  async save(privateChat: PrivateChat): Promise<void> {
    const exists = await this.prisma.privateChat.findUnique({
      where: { id: privateChat.id },
    });

    if (exists) {
      // Update existing chat
      await this.prisma.$transaction(async prisma => {
        // Update chat
        await prisma.privateChat.update({
          where: { id: privateChat.id },
          data: {
            updatedAt: privateChat.updatedAt,
          },
        });

        // Update participants
        for (const participant of privateChat.participants) {
          await prisma.privateChatUser.upsert({
            where: {
              chatId_userId: {
                chatId: privateChat.id,
                userId: participant.userId.value,
              },
            },
            update: {
              isActive: participant.isActive,
            },
            create: {
              chatId: privateChat.id,
              userId: participant.userId.value,
              joinedAt: participant.joinedAt,
              isActive: participant.isActive,
            },
          });
        }
      });
    } else {
      // Create new chat
      await this.prisma.$transaction(async prisma => {
        // Create chat
        await prisma.privateChat.create({
          data: {
            id: privateChat.id,
            createdAt: privateChat.createdAt,
            updatedAt: privateChat.updatedAt,
            participants: {
              create: privateChat.participants.map(participant => ({
                userId: participant.userId.value,
                joinedAt: participant.joinedAt,
                isActive: participant.isActive,
              })),
            },
          },
        });
      });
    }
  }

  async delete(id: ChatId): Promise<void> {
    await this.prisma.privateChat.delete({
      where: { id: id.value },
    });
  }

  private toDomain(rawData: any): PrivateChat {
    const participants = rawData.participants.map((p: any) => ({
      userId: UserId.create(p.userId),
      joinedAt: p.joinedAt,
      isActive: p.isActive,
    }));

    // Reconstruct the PrivateChat aggregate
    return PrivateChat.create(
      participants.map((p: any) => ({ userId: p.userId })),
      rawData.id,
    );
  }
}
