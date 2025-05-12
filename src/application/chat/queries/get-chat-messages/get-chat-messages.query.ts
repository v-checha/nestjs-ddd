export class GetChatMessagesQuery {
  constructor(
    public readonly userId: string,
    public readonly chatId: string,
    public readonly limit: number = 20,
    public readonly beforeMessageId?: string,
  ) {}
}
