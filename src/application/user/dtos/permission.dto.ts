import { PermissionAction } from '../../../domain/user/entities/permission.entity';

export class PermissionDto {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: PermissionAction;
  createdAt: Date;
  updatedAt: Date;
}
