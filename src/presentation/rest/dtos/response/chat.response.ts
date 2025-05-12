import { ApiProperty } from '@nestjs/swagger';

export class ChatParticipantResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: 'John Doe' })
  userName: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  joinedAt: Date;

  @ApiProperty({ example: false, required: false })
  isAdmin?: boolean;
}

export class LastMessageResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Hello, how are you?' })
  content: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  senderId: string;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  createdAt: Date;
}

export class BaseChatResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ type: LastMessageResponse, required: false })
  lastMessage?: LastMessageResponse;

  @ApiProperty({ example: 5 })
  unreadCount: number;
}

export class PrivateChatResponse extends BaseChatResponse {
  @ApiProperty({ type: [ChatParticipantResponse] })
  participants: ChatParticipantResponse[];
}

export class GroupChatResponse extends BaseChatResponse {
  @ApiProperty({ example: 'Project Discussion Group' })
  name: string;

  @ApiProperty({ type: [ChatParticipantResponse] })
  participants: ChatParticipantResponse[];
}

export class ChatListResponse {
  @ApiProperty({ type: [PrivateChatResponse] })
  privateChats: PrivateChatResponse[];

  @ApiProperty({ type: [GroupChatResponse] })
  groupChats: GroupChatResponse[];
}
