import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRoleQuery } from './get-role.query';
import { RoleDto } from '../../dtos/role.dto';
import { Inject } from '@nestjs/common';
import { RoleRepository } from '@domain/user/repositories/role-repository.interface';
import { RoleMapper } from '../../mappers/role.mapper';
import { EntityNotFoundException } from '@domain/common/exceptions/domain.exception';

@QueryHandler(GetRoleQuery)
export class GetRoleHandler implements IQueryHandler<GetRoleQuery, RoleDto> {
  constructor(
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
    private readonly roleMapper: RoleMapper,
  ) {}

  async execute(query: GetRoleQuery): Promise<RoleDto> {
    const role = await this.roleRepository.findById(query.id);

    if (!role) {
      throw new EntityNotFoundException('Role', query.id);
    }

    return this.roleMapper.toDto(role);
  }
}
