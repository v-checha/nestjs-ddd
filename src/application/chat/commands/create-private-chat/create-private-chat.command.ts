export class CreatePrivateChatCommand {
  constructor(
    public readonly initiatorId: string,
    public readonly participantId: string,
  ) {}
}
