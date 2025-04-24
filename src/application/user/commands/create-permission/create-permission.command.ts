import { ICommand } from '@nestjs/cqrs';
import { PermissionAction, Resource } from '../../../../domain/user/entities/permission.entity';

export class CreatePermissionCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly resource: Resource,
    public readonly action: PermissionAction,
  ) {}
}
