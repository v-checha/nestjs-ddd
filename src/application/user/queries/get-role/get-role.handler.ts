import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRoleQuery } from './get-role.query';
import { RoleDto } from '../../dtos/role.dto';
import { Inject } from '@nestjs/common';
import { IRoleRepository } from '../../../../domain/user/repositories/role-repository.interface';
import { RoleMapper } from '../../mappers/role.mapper';

@QueryHandler(GetRoleQuery)
export class GetRoleHandler implements IQueryHandler<GetRoleQuery, RoleDto> {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    private readonly roleMapper: RoleMapper,
  ) {}

  async execute(query: GetRoleQuery): Promise<RoleDto> {
    const role = await this.roleRepository.findById(query.id);

    if (!role) {
      throw new Error(`Role with id ${query.id} not found`);
    }

    return this.roleMapper.toDto(role);
  }
}
