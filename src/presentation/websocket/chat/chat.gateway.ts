import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CommandBus } from '@nestjs/cqrs';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { SendMessageCommand } from '@application/chat/commands/send-message/send-message.command';
import { MarkMessageReadCommand } from '@application/chat/commands/mark-message-read/mark-message-read.command';

// Type definition for WebSocket event data
type WebSocketEventData = Record<string, unknown>;

interface ChatMessagePayload {
  chatId: string;
  content: string;
}

interface MarkMessageReadPayload {
  messageId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);
  private userSocketMap = new Map<string, string[]>();
  private socketUserMap = new Map<string, string>();

  constructor(
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
  ) {}

  afterInit() {
    this.logger.log('Chat WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth
      const token =
        client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} tried to connect without a token`);
        client.disconnect();

        return;
      }

      // Verify token
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      if (!userId) {
        this.logger.warn(`Client ${client.id} provided an invalid token`);
        client.disconnect();

        return;
      }

      // Associate socket with user
      this.socketUserMap.set(client.id, userId);

      // Track sockets for this user
      const userSockets = this.userSocketMap.get(userId) || [];
      userSockets.push(client.id);
      this.userSocketMap.set(userId, userSockets);

      // Join user's personal room
      client.join(`user:${userId}`);

      this.logger.log(`Client connected: ${client.id} for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Socket connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);

    if (userId) {
      // Remove from user's socket list
      const userSockets = this.userSocketMap.get(userId) || [];
      const updatedSockets = userSockets.filter(socketId => socketId !== client.id);

      if (updatedSockets.length > 0) {
        this.userSocketMap.set(userId, updatedSockets);
      } else {
        this.userSocketMap.delete(userId);
      }

      // Remove from socket map
      this.socketUserMap.delete(client.id);
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('joinChat')
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.join(`chat:${chatId}`);

    return { event: 'joinedChat', data: { chatId } };
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('leaveChat')
  handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.leave(`chat:${chatId}`);

    return { event: 'leftChat', data: { chatId } };
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatMessagePayload,
  ) {
    const userId = this.socketUserMap.get(client.id);

    if (!userId) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }

    try {
      const command = new SendMessageCommand(userId, payload.chatId, payload.content);

      const message = await this.commandBus.execute(command);

      // Emit to all users in the chat room
      this.server.to(`chat:${payload.chatId}`).emit('messageReceived', message);

      return { event: 'messageSent', data: message };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);

      return { event: 'error', data: { message: error.message } };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('markMessageRead')
  async handleMarkMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MarkMessageReadPayload,
  ) {
    const userId = this.socketUserMap.get(client.id);

    if (!userId) {
      return { event: 'error', data: { message: 'Unauthorized' } };
    }

    try {
      const command = new MarkMessageReadCommand(userId, payload.messageId);

      await this.commandBus.execute(command);

      // Return success acknowledgment
      return { event: 'messageRead', data: { messageId: payload.messageId } };
    } catch (error) {
      this.logger.error(`Error marking message as read: ${error.message}`);

      return { event: 'error', data: { message: error.message } };
    }
  }

  // Method to notify specific users about events
  notifyUsers(userIds: string[], event: string, data: WebSocketEventData) {
    userIds.forEach(userId => {
      this.server.to(`user:${userId}`).emit(event, data);
    });
  }

  // Method to notify everyone in a chat
  notifyChat(chatId: string, event: string, data: WebSocketEventData) {
    this.server.to(`chat:${chatId}`).emit(event, data);
  }
}
