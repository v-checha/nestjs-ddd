import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageRepositoryInterface } from '@domain/chat/repositories/message-repository.interface';
import { Message } from '@domain/chat/entities/message.entity';
import { MessageId } from '@domain/chat/value-objects/message-id.vo';
import { ChatId } from '@domain/chat/value-objects/chat-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { MessageContent } from '@domain/chat/value-objects/message-content.vo';
import { MessageReadStatus } from '@domain/chat/entities/message-read-status.entity';

@Injectable()
export class MessageRepository implements MessageRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: MessageId): Promise<Message | null> {
    const message = await this.prisma.message.findUnique({
      where: { id: id.value },
    });

    if (!message) {
      return null;
    }

    return this.toDomain(message);
  }

  async findByChatId(
    chatId: ChatId,
    options?: {
      limit?: number;
      offset?: number;
      beforeMessageId?: MessageId;
    },
  ): Promise<Message[]> {
    let cursor = undefined;

    if (options?.beforeMessageId) {
      cursor = { id: options.beforeMessageId.value };
    }

    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ privateChatId: chatId.value }, { groupChatId: chatId.value }],
      },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
      cursor: cursor,
      orderBy: { createdAt: 'desc' },
    });

    return messages.map(message => this.toDomain(message));
  }

  async countUnreadByChatIdAndUserId(chatId: ChatId, userId: UserId): Promise<number> {
    return await this.prisma.message.count({
      where: {
        OR: [{ privateChatId: chatId.value }, { groupChatId: chatId.value }],
        senderId: { not: userId.value },
        readByUsers: {
          none: {
            userId: userId.value,
          },
        },
      },
    });
  }

  async save(message: Message): Promise<void> {
    const exists = await this.prisma.message.findUnique({
      where: { id: message.id },
    });

    if (exists) {
      // Update existing message
      await this.prisma.message.update({
        where: { id: message.id },
        data: {
          content: message.content.value,
          updatedAt: message.updatedAt,
        },
      });
    } else {
      // Create new message
      await this.prisma.message.create({
        data: {
          id: message.id,
          content: message.content.value,
          senderId: message.senderId.value,
          privateChatId: message.privateChatId,
          groupChatId: message.groupChatId,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        },
      });
    }
  }

  async saveReadStatus(readStatus: MessageReadStatus): Promise<void> {
    await this.prisma.messageReadStatus.upsert({
      where: {
        messageId_userId: {
          messageId: readStatus.messageId.value,
          userId: readStatus.userId.value,
        },
      },
      update: {
        readAt: readStatus.readAt,
      },
      create: {
        messageId: readStatus.messageId.value,
        userId: readStatus.userId.value,
        readAt: readStatus.readAt,
      },
    });
  }

  async delete(id: MessageId): Promise<void> {
    await this.prisma.message.delete({
      where: { id: id.value },
    });
  }

  private toDomain(rawData: any): Message {
    return Message.create(
      {
        content: MessageContent.create(rawData.content),
        senderId: UserId.create(rawData.senderId),
        chatId: ChatId.create(rawData.privateChatId || rawData.groupChatId),
        privateChatId: rawData.privateChatId,
        groupChatId: rawData.groupChatId,
      },
      rawData.id,
    );
  }
}
