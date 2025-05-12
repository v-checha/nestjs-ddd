export class MarkMessageReadCommand {
  constructor(
    public readonly userId: string,
    public readonly messageId: string,
  ) {}
}
