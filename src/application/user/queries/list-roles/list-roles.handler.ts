import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListRolesQuery } from './list-roles.query';
import { RoleDto } from '../../dtos/role.dto';
import { Inject } from '@nestjs/common';
import {
  PaginatedResult,
  RoleRepository,
} from '@domain/user/repositories/role-repository.interface';
import { RoleMapper } from '../../mappers/role.mapper';

@QueryHandler(ListRolesQuery)
export class ListRolesHandler implements IQueryHandler<ListRolesQuery, PaginatedResult<RoleDto>> {
  constructor(
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
    private readonly roleMapper: RoleMapper,
  ) {}

  async execute(query: ListRolesQuery): Promise<PaginatedResult<RoleDto>> {
    const { page = 1, limit = 10 } = query;
    const result = await this.roleRepository.findAll(page, limit);

    return {
      data: this.roleMapper.toDtoList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
