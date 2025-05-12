import { ApiProperty } from '@nestjs/swagger';

export class MessageResponse {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Hello, how are you?' })
  content: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  senderId: string;

  @ApiProperty({ example: 'John Doe' })
  senderName: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  chatId: string;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ example: true })
  isRead: boolean;

  @ApiProperty({ example: ['123e4567-e89b-12d3-a456-426614174000'], required: false })
  readBy?: string[];
}

export class ChatMessagesResponse {
  @ApiProperty({ type: [MessageResponse] })
  messages: MessageResponse[];
}
