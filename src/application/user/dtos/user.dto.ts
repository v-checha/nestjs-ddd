import { RoleDto } from './role.dto';

export class UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: RoleDto[];
  createdAt: Date;
  updatedAt: Date;
}
