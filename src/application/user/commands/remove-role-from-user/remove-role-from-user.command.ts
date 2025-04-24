import { ICommand } from '@nestjs/cqrs';

export class RemoveRoleFromUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
  ) {}
}
