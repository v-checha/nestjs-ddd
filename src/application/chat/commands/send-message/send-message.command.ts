export class SendMessageCommand {
  constructor(
    public readonly senderId: string,
    public readonly chatId: string,
    public readonly content: string,
  ) {}
}
