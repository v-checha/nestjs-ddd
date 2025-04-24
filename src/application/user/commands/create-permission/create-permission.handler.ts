import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePermissionCommand } from './create-permission.command';
import { PermissionDto } from '../../dtos/permission.dto';
import { Inject } from '@nestjs/common';
import { IPermissionRepository } from '../../../../domain/user/repositories/permission-repository.interface';
import { Permission } from '../../../../domain/user/entities/permission.entity';
import { PermissionMapper } from '../../mappers/permission.mapper';

@CommandHandler(CreatePermissionCommand)
export class CreatePermissionHandler implements ICommandHandler<CreatePermissionCommand, PermissionDto> {
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    private readonly permissionMapper: PermissionMapper,
  ) {}

  async execute(command: CreatePermissionCommand): Promise<PermissionDto> {
    // Check if permission with the same name already exists
    const existingPermission = await this.permissionRepository.findByName(command.name);
    if (existingPermission) {
      throw new Error(`Permission with name ${command.name} already exists`);
    }

    // Create a new permission
    const permission = Permission.create({
      name: command.name,
      description: command.description,
      resource: command.resource,
      action: command.action,
    });

    // Save the permission
    await this.permissionRepository.save(permission);

    return this.permissionMapper.toDto(permission);
  }
}
