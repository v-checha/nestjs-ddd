import { ICommand } from '@nestjs/cqrs';

export class CreateRoleCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly permissionIds: string[],
  ) {}
}
