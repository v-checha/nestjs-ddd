import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePermissionCommand } from './update-permission.command';
import { PermissionDto } from '../../dtos/permission.dto';
import { Inject } from '@nestjs/common';
import { PermissionRepository } from '@domain/user/repositories/permission-repository.interface';
import { PermissionMapper } from '../../mappers/permission.mapper';
import { Permission } from '@domain/user/entities/permission.entity';
import { EntityNotFoundException } from '@domain/common/exceptions/domain.exception';

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
      throw new EntityNotFoundException('Permission', command.id);
    }

    // Update the permission
    const updatedPermission = Permission.create(
      {
        name: command.name || permission.name,
        description: command.description || permission.description,
        resource: command.resource || permission.resource.value,
        action: command.action || permission.action.value,
        createdAt: permission.createdAt,
        updatedAt: new Date(),
      },
      permission.id,
    );

    // Save the updated permission
    await this.permissionRepository.save(updatedPermission);

    return this.permissionMapper.toDto(updatedPermission);
  }
}
