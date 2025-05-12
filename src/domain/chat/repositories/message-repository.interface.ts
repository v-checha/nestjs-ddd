import { Message } from '../entities/message.entity';
import { MessageId } from '../value-objects/message-id.vo';
import { ChatId } from '../value-objects/chat-id.vo';
import { MessageReadStatus } from '../entities/message-read-status.entity';
import { UserId } from '../../user/value-objects/user-id.vo';

export interface MessageRepositoryInterface {
  findById(id: MessageId): Promise<Message | null>;
  findByChatId(
    chatId: ChatId,
    options?: {
      limit?: number;
      offset?: number;
      beforeMessageId?: MessageId;
    },
  ): Promise<Message[]>;
  countUnreadByChatIdAndUserId(chatId: ChatId, userId: UserId): Promise<number>;
  save(message: Message): Promise<void>;
  saveReadStatus(readStatus: MessageReadStatus): Promise<void>;
  delete(id: MessageId): Promise<void>;
}
