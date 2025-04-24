import { ICommand } from '@nestjs/cqrs';
import { ActionType } from '../../../../domain/user/value-objects/permission-action.vo';
import { ResourceType } from '../../../../domain/user/value-objects/resource.vo';

export class CreatePermissionCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly resource: ResourceType,
    public readonly action: ActionType,
  ) {}
}