export class PrivateChatParticipantDto {
  userId: string;
  isActive: boolean;
  joinedAt: Date;
}

export class PrivateChatDto {
  id: string;
  participants: PrivateChatParticipantDto[];
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
  };
  unreadCount?: number;
}
