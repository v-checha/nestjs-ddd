import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPermissionsQuery } from './list-permissions.query';
import { PermissionDto } from '../../dtos/permission.dto';
import { Inject } from '@nestjs/common';
import { PermissionRepository } from '../../../../domain/user/repositories/permission-repository.interface';
import { PermissionMapper } from '../../mappers/permission.mapper';

@QueryHandler(ListPermissionsQuery)
export class ListPermissionsHandler implements IQueryHandler<ListPermissionsQuery, PermissionDto[]> {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionMapper: PermissionMapper,
  ) {}

  async execute(query: ListPermissionsQuery): Promise<PermissionDto[]> {
    if (query.resource) {
      const permissions = await this.permissionRepository.findByResource(query.resource);
      return this.permissionMapper.toDtoList(permissions);
    }
    
    const permissions = await this.permissionRepository.findAll();
    return this.permissionMapper.toDtoList(permissions);
  }
}
