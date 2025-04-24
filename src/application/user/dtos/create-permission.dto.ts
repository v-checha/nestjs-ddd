import { PermissionAction } from '../../../domain/user/entities/permission.entity';

export class CreatePermissionDto {
  name: string;
  description: string;
  resource: string;
  action: PermissionAction;
}
