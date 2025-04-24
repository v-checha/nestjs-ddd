import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListRolesQuery } from './list-roles.query';
import { RoleDto } from '../../dtos/role.dto';
import { Inject } from '@nestjs/common';
import { RoleRepository } from '../../../../domain/user/repositories/role-repository.interface';
import { RoleMapper } from '../../mappers/role.mapper';

@QueryHandler(ListRolesQuery)
export class ListRolesHandler implements IQueryHandler<ListRolesQuery, RoleDto[]> {
  constructor(
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
    private readonly roleMapper: RoleMapper,
  ) {}

  async execute(_: ListRolesQuery): Promise<RoleDto[]> {
    const roles = await this.roleRepository.findAll();
    return this.roleMapper.toDtoList(roles);
  }
}
