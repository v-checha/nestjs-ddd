import { Injectable } from '@nestjs/common';
import { Role } from '@domain/user/entities/role.entity';
import { RoleDto } from '../dtos/role.dto';
import { PermissionMapper } from './permission.mapper';

@Injectable()
export class RoleMapper {
  constructor(private permissionMapper: PermissionMapper) {}

  toDto(role: Role): RoleDto {
    const dto = new RoleDto();
    dto.id = role.id;
    dto.name = role.name;
    dto.description = role.description;
    dto.type = role.type.value;
    dto.isDefault = role.isDefault;
    dto.permissions = this.permissionMapper.toDtoList(role.permissions);
    dto.createdAt = role.createdAt;
    dto.updatedAt = role.updatedAt;

    return dto;
  }

  toDtoList(roles: Role[]): RoleDto[] {
    return roles.map(role => this.toDto(role));
  }
}
