import { ICommand } from '@nestjs/cqrs';
import { PermissionAction } from '../../../../domain/user/entities/permission.entity';

export class UpdatePermissionCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly resource?: string,
    public readonly action?: PermissionAction,
  ) {}
}
