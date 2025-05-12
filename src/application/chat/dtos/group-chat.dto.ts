export class GroupChatParticipantDto {
  userId: string;
  isAdmin: boolean;
  isActive: boolean;
  joinedAt: Date;
}

export class GroupChatDto {
  id: string;
  name: string;
  participants: GroupChatParticipantDto[];
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
