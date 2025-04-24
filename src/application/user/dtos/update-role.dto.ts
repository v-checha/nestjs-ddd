export class UpdateRoleDto {
  id: string;
  name?: string;
  description?: string;
  permissionIds?: string[];
}
