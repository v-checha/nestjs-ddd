# Chat Feature Setup Instructions

## Database Setup

First, run the database migrations to add the chat-related tables:

```bash
npx prisma migrate dev --name add-chat-feature
```

Then seed the database with the required chat permissions:

```bash
npx ts-node prisma/chat-permissions-seed.ts
```

## Running the Application

To run the application with WebSocket support:

```bash
npm run start:dev
```

## Using the Chat Feature

### REST API

The chat feature includes REST endpoints for:

- Creating private and group chats
- Getting the list of user's chats
- Getting chat details
- Getting chat messages
- Sending messages
- Marking messages as read

All endpoints are protected with JWT authentication and require appropriate permissions.

Example HTTP requests:

```bash
# Create a private chat
POST /chats/private
{
  "participantId": "user-id-here"
}

# Create a group chat
POST /chats/group
{
  "name": "Project Discussion",
  "participantIds": ["user-id-1", "user-id-2"]
}

# Send a message
POST /messages
{
  "chatId": "chat-id-here",
  "content": "Hello, how are you?"
}

# Mark a message as read
POST /messages/{messageId}/read
```

### WebSocket

The chat feature also includes real-time messaging via WebSockets:

1. Connect to the WebSocket server at `/chat` namespace
2. Authenticate by providing your JWT token in the handshake
3. Join a chat room to start receiving messages
4. Send and receive messages in real-time

Example client-side code:

```javascript
// Connect to the WebSocket server
const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join a chat room
socket.emit('joinChat', 'chat-id-here');

// Send a message
socket.emit('sendMessage', {
  chatId: 'chat-id-here',
  content: 'Hello, how are you?'
});

// Listen for new messages
socket.on('messageReceived', (message) => {
  console.log('New message:', message);
});

// Mark a message as read
socket.emit('markMessageRead', {
  messageId: 'message-id-here'
});
```

## Permissions

The chat feature requires the following permissions:

- `chat:create` - Ability to create chats
- `chat:read` - Ability to view chats and messages
- `chat:write` - Ability to send messages
- `chat:manage` - Ability to manage group chats (add/remove users, etc.)

These permissions are added automatically by the seed script.

## Testing

To test the WebSocket functionality, you can use a tool like `wscat`:

```bash
wscat -c ws://localhost:3000/chat -H "Authorization: Bearer your-jwt-token"
```

Or use a browser-based WebSocket client to interact with the server.