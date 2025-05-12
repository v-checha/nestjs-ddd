export class MessageDto {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  chatId: string;
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean;
  readBy?: string[];
}
