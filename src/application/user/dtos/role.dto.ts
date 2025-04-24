import { PermissionDto } from './permission.dto';

export class RoleDto {
  id: string;
  name: string;
  description: string;
  permissions: PermissionDto[];
  createdAt: Date;
  updatedAt: Date;
}
