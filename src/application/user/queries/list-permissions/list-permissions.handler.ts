import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPermissionsQuery } from './list-permissions.query';
import { PermissionDto } from '../../dtos/permission.dto';
import { Inject } from '@nestjs/common';
import { PermissionRepository } from '../../../../domain/user/repositories/permission-repository.interface';
import { PaginatedResult } from '../../../../domain/user/repositories/role-repository.interface';
import { PermissionMapper } from '../../mappers/permission.mapper';
import { Resource } from '../../../../domain/user/value-objects/resource.vo';

@QueryHandler(ListPermissionsQuery)
export class ListPermissionsHandler
  implements IQueryHandler<ListPermissionsQuery, PaginatedResult<PermissionDto>>
{
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionMapper: PermissionMapper,
  ) {}

  async execute(query: ListPermissionsQuery): Promise<PaginatedResult<PermissionDto>> {
    const { page = 1, limit = 10, resource } = query;

    if (resource) {
      const resourceObj = Resource.create(resource);
      const permissions = await this.permissionRepository.findByResource(resourceObj);
      return {
        data: this.permissionMapper.toDtoList(permissions),
        total: permissions.length,
        page: 1,
        limit: permissions.length,
        totalPages: 1,
      };
    }

    const result = await this.permissionRepository.findAll(page, limit);
    return {
      data: this.permissionMapper.toDtoList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
