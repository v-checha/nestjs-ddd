import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateRoleCommand } from './create-role.command';
import { RoleDto } from '../../dtos/role.dto';
import { Inject } from '@nestjs/common';
import { RoleRepository } from '../../../../domain/user/repositories/role-repository.interface';
import { PermissionRepository } from '../../../../domain/user/repositories/permission-repository.interface';
import { Role } from '../../../../domain/user/entities/role.entity';
import { RoleMapper } from '../../mappers/role.mapper';
import { InvalidRoleException } from '../../../../domain/common/exceptions/domain.exception';

@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand, RoleDto> {
  constructor(
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
    private readonly roleMapper: RoleMapper,
  ) {}

  async execute(command: CreateRoleCommand): Promise<RoleDto> {
    // Check if role with the same name already exists
    const existingRole = await this.roleRepository.findByName(command.name);
    if (existingRole) {
      throw new InvalidRoleException(`Role with name ${command.name} already exists`);
    }

    // Get permissions by IDs
    const permissions = [];
    for (const permissionId of command.permissionIds) {
      const permission = await this.permissionRepository.findById(permissionId);
      if (permission) {
        permissions.push(permission);
      }
    }

    // Create a new role
    const role = Role.create({
      name: command.name,
      description: command.description,
      permissions: permissions,
    });

    // Save the role
    await this.roleRepository.save(role);

    return this.roleMapper.toDto(role);
  }
}
