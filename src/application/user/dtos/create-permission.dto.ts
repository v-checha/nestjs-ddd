import { ActionType } from '@domain/user/value-objects/permission-action.vo';
import { ResourceType } from '@domain/user/value-objects/resource.vo';

export class CreatePermissionDto {
  name: string;
  description: string;
  resource: ResourceType;
  action: ActionType;
}
