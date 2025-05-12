# Chat Feature Documentation

The chat feature provides real-time messaging capabilities with both one-to-one private chats and group chats, implemented using Domain-Driven Design principles.

## Architecture

The chat feature follows the modular architecture of the application:

- **Domain Layer**: Contains entities, value objects, and domain events for chats, messages, and participants
- **Application Layer**: Implements CQRS pattern with commands and queries 
- **Persistence Layer**: Uses Prisma for database operations
- **Presentation Layer**: Provides REST controllers and WebSocket gateway for real-time communication

## Features

- Private chat (1-to-1) between users
- Group chats with multiple participants
- Real-time message delivery via WebSockets
- Message read status tracking
- Role-based permissions
- User presence detection

## API Endpoints

### Chats

- `POST /chats/private` - Create a private chat
- `POST /chats/group` - Create a group chat
- `GET /chats` - Get all chats for current user
- `GET /chats/:id` - Get details of a specific chat
- `GET /chats/:id/messages` - Get messages from a chat

### Messages

- `POST /messages` - Send a message to a chat
- `POST /messages/:id/read` - Mark a message as read

## WebSocket Events

### Client to Server

- `joinChat` - Join a chat room (required before sending messages)
- `leaveChat` - Leave a chat room
- `sendMessage` - Send a message to a chat
- `markMessageRead` - Mark a message as read

### Server to Client

- `messageReceived` - New message notification
- `chatCreated` - Notification when added to a new chat
- `messageRead` - Notification when message is read
- `addedToGroup` - Notification when added to a group

## Required Permissions

The following permissions are needed for chat operations:

- `chat:create` - Ability to create chats
- `chat:read` - Ability to view chats and messages
- `chat:write` - Ability to send messages
- `chat:manage` - Ability to manage group chats (add/remove users, etc.)

These should be added to the appropriate roles in your system.

## Usage Example (WebSocket)

```typescript
// Client-side connection
const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join a chat room
socket.emit('joinChat', chatId);

// Send a message
socket.emit('sendMessage', {
  chatId: 'chat-id',
  content: 'Hello, how are you?'
});

// Listen for new messages
socket.on('messageReceived', (message) => {
  console.log('New message:', message);
});

// Mark message as read
socket.emit('markMessageRead', {
  messageId: 'message-id'
});
```