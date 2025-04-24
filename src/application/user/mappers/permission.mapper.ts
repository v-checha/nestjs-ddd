import { Injectable } from '@nestjs/common';
import { Permission } from '../../../domain/user/entities/permission.entity';
import { PermissionDto } from '../dtos/permission.dto';
import { ResourceType } from '../../../domain/user/value-objects/resource.vo';
import { ActionType } from '../../../domain/user/value-objects/permission-action.vo';

@Injectable()
export class PermissionMapper {
  toDto(permission: Permission): PermissionDto {
    const dto = new PermissionDto();
    dto.id = permission.id;
    dto.name = permission.name;
    dto.description = permission.description;
    dto.resource = permission.resource.value as ResourceType;
    dto.action = permission.action.value as ActionType;
    dto.createdAt = permission.createdAt;
    dto.updatedAt = permission.updatedAt;
    return dto;
  }

  toDtoList(permissions: Permission[]): PermissionDto[] {
    return permissions.map((permission) => this.toDto(permission));
  }
}
