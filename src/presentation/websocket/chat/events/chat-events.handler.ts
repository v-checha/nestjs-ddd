import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ChatGateway } from '../chat.gateway';
import { MessageSentEvent } from '@domain/chat/events/message-sent.event';
import { PrivateChatCreatedEvent } from '@domain/chat/events/private-chat-created.event';
import { GroupChatCreatedEvent } from '@domain/chat/events/group-chat-created.event';
import { UserAddedToGroupEvent } from '@domain/chat/events/user-added-to-group.event';

@Injectable()
@EventsHandler(MessageSentEvent)
export class MessageSentEventHandler implements IEventHandler<MessageSentEvent> {
  constructor(private readonly chatGateway: ChatGateway) {}

  handle(event: MessageSentEvent) {
    // No need to notify the sender
    this.chatGateway.notifyChat(event.chatId.value, 'messageReceived', {
      id: event.messageId.value,
      content: event.content,
      senderId: event.senderId.value,
      chatId: event.chatId.value,
      timestamp: event.eventDate,
    });
  }
}

@Injectable()
@EventsHandler(PrivateChatCreatedEvent)
export class PrivateChatCreatedEventHandler implements IEventHandler<PrivateChatCreatedEvent> {
  constructor(private readonly chatGateway: ChatGateway) {}

  handle(event: PrivateChatCreatedEvent) {
    const participants = event.participants.map(p => p.value);

    this.chatGateway.notifyUsers(participants, 'chatCreated', {
      type: 'private',
      id: event.chatId.value,
      participants,
      timestamp: event.eventDate,
    });
  }
}

@Injectable()
@EventsHandler(GroupChatCreatedEvent)
export class GroupChatCreatedEventHandler implements IEventHandler<GroupChatCreatedEvent> {
  constructor(private readonly chatGateway: ChatGateway) {}

  handle(event: GroupChatCreatedEvent) {
    // Get all participants including creator
    const allParticipants = [event.creatorId.value, ...event.participants.map(p => p.value)];

    this.chatGateway.notifyUsers(allParticipants, 'chatCreated', {
      type: 'group',
      id: event.chatId.value,
      name: event.name,
      creatorId: event.creatorId.value,
      participants: allParticipants,
      timestamp: event.eventDate,
    });
  }
}

@Injectable()
@EventsHandler(UserAddedToGroupEvent)
export class UserAddedToGroupEventHandler implements IEventHandler<UserAddedToGroupEvent> {
  constructor(private readonly chatGateway: ChatGateway) {}

  handle(event: UserAddedToGroupEvent) {
    this.chatGateway.notifyUsers([event.userId.value], 'addedToGroup', {
      chatId: event.chatId.value,
      addedBy: event.addedBy.value,
      timestamp: event.eventDate,
    });
  }
}
