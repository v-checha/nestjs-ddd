import { ActionType } from '@domain/user/value-objects/permission-action.vo';
import { ResourceType } from '@domain/user/value-objects/resource.vo';

export class UpdatePermissionDto {
  id: string;
  name?: string;
  description?: string;
  resource?: ResourceType;
  action?: ActionType;
}
