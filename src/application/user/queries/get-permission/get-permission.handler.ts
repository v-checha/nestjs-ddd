import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPermissionQuery } from './get-permission.query';
import { PermissionDto } from '../../dtos/permission.dto';
import { Inject } from '@nestjs/common';
import { PermissionRepository } from '@domain/user/repositories/permission-repository.interface';
import { PermissionMapper } from '../../mappers/permission.mapper';
import { PermissionNotFoundException } from '../../../common/exceptions/application.exception';

@QueryHandler(GetPermissionQuery)
export class GetPermissionHandler implements IQueryHandler<GetPermissionQuery, PermissionDto> {
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionMapper: PermissionMapper,
  ) {}

  async execute(query: GetPermissionQuery): Promise<PermissionDto> {
    const permission = await this.permissionRepository.findById(query.id);

    if (!permission) {
      throw new PermissionNotFoundException(query.id);
    }

    return this.permissionMapper.toDto(permission);
  }
}
