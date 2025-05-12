import { GroupChat } from '../entities/group-chat.entity';
import { ChatId } from '../value-objects/chat-id.vo';
import { UserId } from '../../user/value-objects/user-id.vo';

export interface GroupChatRepositoryInterface {
  findById(id: ChatId): Promise<GroupChat | null>;
  findByUserId(userId: UserId): Promise<GroupChat[]>;
  save(groupChat: GroupChat): Promise<void>;
  delete(id: ChatId): Promise<void>;
}
