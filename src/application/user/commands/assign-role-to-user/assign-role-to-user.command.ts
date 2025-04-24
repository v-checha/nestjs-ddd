import { ICommand } from '@nestjs/cqrs';

export class AssignRoleToUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
  ) {}
}
