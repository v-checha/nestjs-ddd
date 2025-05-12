import { PrivateChat } from '../entities/private-chat.entity';
import { ChatId } from '../value-objects/chat-id.vo';
import { UserId } from '../../user/value-objects/user-id.vo';

export interface PrivateChatRepositoryInterface {
  findById(id: ChatId): Promise<PrivateChat | null>;
  findByParticipants(userIdA: UserId, userIdB: UserId): Promise<PrivateChat | null>;
  findByUserId(userId: UserId): Promise<PrivateChat[]>;
  save(privateChat: PrivateChat): Promise<void>;
  delete(id: ChatId): Promise<void>;
}
