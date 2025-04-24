import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateRoleCommand } from './update-role.command';
import { RoleDto } from '../../dtos/role.dto';
import { Inject } from '@nestjs/common';
import { RoleRepository } from '../../../../domain/user/repositories/role-repository.interface';
import { PermissionRepository } from '../../../../domain/user/repositories/permission-repository.interface';
import { RoleMapper } from '../../mappers/role.mapper';

@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler implements ICommandHandler<UpdateRoleCommand, RoleDto> {
  constructor(
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
    private readonly roleMapper: RoleMapper,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<RoleDto> {
    // Find the role
    const role = await this.roleRepository.findById(command.id);
    if (!role) {
      throw new Error(`Role with id ${command.id} not found`);
    }

    // Update role properties
    if (command.name !== undefined && command.description !== undefined) {
      role.updateDetails(command.name, command.description);
    }

    // Update permissions if provided
    if (command.permissionIds !== undefined) {
      // Clear existing permissions (they'll be re-added if they're in the new list)
      role.permissions.forEach((permission) => {
        role.removePermission(permission.id);
      });

      // Add new permissions
      for (const permissionId of command.permissionIds) {
        const permission = await this.permissionRepository.findById(permissionId);
        if (permission) {
          role.addPermission(permission);
        }
      }
    }

    // Save the updated role
    await this.roleRepository.save(role);

    return this.roleMapper.toDto(role);
  }
}
