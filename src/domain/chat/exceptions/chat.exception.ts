import { DomainException } from '../../common/exceptions/domain.exception';

export class ChatException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'ChatException';
  }
}

export class UnauthorizedChatAccessException extends ChatException {
  constructor(userId: string, chatId: string) {
    super(`User ${userId} is not authorized to access chat ${chatId}`);
    this.name = 'UnauthorizedChatAccessException';
  }
}

export class ChatNotFoundException extends ChatException {
  constructor(chatId: string) {
    super(`Chat with ID ${chatId} not found`);
    this.name = 'ChatNotFoundException';
  }
}

export class MessageNotFoundException extends ChatException {
  constructor(messageId: string) {
    super(`Message with ID ${messageId} not found`);
    this.name = 'MessageNotFoundException';
  }
}

export class InvalidChatOperationException extends ChatException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidChatOperationException';
  }
}
