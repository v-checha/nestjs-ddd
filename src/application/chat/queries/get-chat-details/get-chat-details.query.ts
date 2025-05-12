export class GetChatDetailsQuery {
  constructor(
    public readonly userId: string,
    public readonly chatId: string,
  ) {}
}
