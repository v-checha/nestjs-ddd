import { RoleDto } from './role.dto';

export class UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  roles: RoleDto[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
