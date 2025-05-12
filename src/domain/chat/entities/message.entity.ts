import { AggregateRoot } from '../../common/base/aggregate-root';
import { UserId } from '../../user/value-objects/user-id.vo';
import { MessageId } from '../value-objects/message-id.vo';
import { MessageContent } from '../value-objects/message-content.vo';
import { ChatId } from '../value-objects/chat-id.vo';
import { DomainException } from '../../common/exceptions/domain.exception';

export interface MessageProps {
  content: MessageContent;
  senderId: UserId;
  chatId: ChatId;
  privateChatId?: string;
  groupChatId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Message extends AggregateRoot<MessageProps> {
  private constructor(props: MessageProps, id?: string) {
    super(props, id);
  }

  static create(props: Omit<MessageProps, 'createdAt' | 'updatedAt'>, id?: string): Message {
    if (!props.privateChatId && !props.groupChatId) {
      throw new DomainException('Message must belong to either a private chat or a group chat');
    }

    return new Message(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id ?? MessageId.create().value,
    );
  }

  get messageId(): MessageId {
    return MessageId.create(this.id);
  }

  get content(): MessageContent {
    return this.props.content;
  }

  get senderId(): UserId {
    return this.props.senderId;
  }

  get chatId(): ChatId {
    return this.props.chatId;
  }

  get isPrivateChat(): boolean {
    return !!this.props.privateChatId;
  }

  get privateChatId(): string | undefined {
    return this.props.privateChatId;
  }

  get groupChatId(): string | undefined {
    return this.props.groupChatId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateContent(content: MessageContent): void {
    this.props.content = content;
    this.props.updatedAt = new Date();
  }
}
