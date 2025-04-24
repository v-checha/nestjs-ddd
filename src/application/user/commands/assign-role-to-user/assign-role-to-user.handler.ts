import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRoleToUserCommand } from './assign-role-to-user.command';
import { UserDto } from '../../dtos/user.dto';
import { Inject } from '@nestjs/common';
import { UserRepository } from '../../../../domain/user/repositories/user-repository.interface';
import { RoleRepository } from '../../../../domain/user/repositories/role-repository.interface';
import { UserId } from '../../../../domain/user/value-objects/user-id.vo';
import { UserMapper } from '../../mappers/user.mapper';
import { EntityNotFoundException } from '../../../../domain/common/exceptions/domain.exception';

@CommandHandler(AssignRoleToUserCommand)
export class AssignRoleToUserHandler
  implements ICommandHandler<AssignRoleToUserCommand, UserDto>
{
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(command: AssignRoleToUserCommand): Promise<UserDto> {
    // Find the user and role
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new EntityNotFoundException('User', command.userId);
    }

    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      throw new EntityNotFoundException('Role', command.roleId);
    }

    // Assign the role to the user
    user.assignRole(role);

    // Save the updated user
    await this.userRepository.save(user);

    return this.userMapper.toDto(user);
  }
}
