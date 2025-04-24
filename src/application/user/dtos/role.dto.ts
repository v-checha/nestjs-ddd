import { PermissionDto } from './permission.dto';
import { RoleTypeEnum } from '../../../domain/user/value-objects/role-type.vo';

export class RoleDto {
  id: string;
  name: string;
  description: string;
  type: RoleTypeEnum;
  isDefault: boolean;
  permissions: PermissionDto[];
  createdAt: Date;
  updatedAt: Date;
}
