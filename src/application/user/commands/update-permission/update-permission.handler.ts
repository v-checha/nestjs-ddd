import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePermissionCommand } from './update-permission.command';
import { PermissionDto } from '../../dtos/permission.dto';
import { Inject } from '@nestjs/common';
import { PermissionRepository } from '../../../../domain/user/repositories/permission-repository.interface';
import { PermissionMapper } from '../../mappers/permission.mapper';

@CommandHandler(UpdatePermissionCommand)
export class UpdatePermissionHandler
  implements ICommandHandler<UpdatePermissionCommand, PermissionDto>
{
  constructor(
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionMapper: PermissionMapper,
  ) {}

  async execute(command: UpdatePermissionCommand): Promise<PermissionDto> {
    // Find the permission
    const permission = await this.permissionRepository.findById(command.id);
    if (!permission) {
      throw new Error(`Permission with id ${command.id} not found`);
    }

    // Update basic properties
    if (command.name !== undefined && command.description !== undefined) {
      permission.updateDetails(command.name, command.description);
    }

    // Update resource and action if provided
    if (command.resource !== undefined) {
      permission.props.resource = command.resource;
      permission.props.updatedAt = new Date();
    }

    if (command.action !== undefined) {
      permission.props.action = command.action;
      permission.props.updatedAt = new Date();
    }

    // Save the updated permission
    await this.permissionRepository.save(permission);

    return this.permissionMapper.toDto(permission);
  }
}
