export class CreateGroupChatCommand {
  constructor(
    public readonly creatorId: string,
    public readonly name: string,
    public readonly participantIds: string[],
  ) {}
}
