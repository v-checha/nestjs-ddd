import { User } from '@domain/user/entities/user.entity';
import { UserDto } from '../dtos/user.dto';
import { Injectable } from '@nestjs/common';
import { RoleMapper } from './role.mapper';

@Injectable()
export class UserMapper {
  constructor(private roleMapper: RoleMapper) {}

  toDto(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.email = user.email.value;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.isVerified = user.isVerified;
    dto.roles = this.roleMapper.toDtoList(user.roles);
    dto.lastLogin = user.lastLogin;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;

    return dto;
  }

  toDtoList(users: User[]): UserDto[] {
    return users.map(user => this.toDto(user));
  }
}
