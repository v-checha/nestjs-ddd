import { PermissionAction } from '../../../domain/user/entities/permission.entity';

export class UpdatePermissionDto {
  id: string;
  name?: string;
  description?: string;
  resource?: string;
  action?: PermissionAction;
}
