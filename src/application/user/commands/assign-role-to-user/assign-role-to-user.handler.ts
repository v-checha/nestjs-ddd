import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRoleToUserCommand } from './assign-role-to-user.command';
import { UserDto } from '../../dtos/user.dto';
import { Inject } from '@nestjs/common';
import { IUserRepository } from '../../../../domain/user/repositories/user-repository.interface';
import { IRoleRepository } from '../../../../domain/user/repositories/role-repository.interface';
import { UserId } from '../../../../domain/user/value-objects/user-id.vo';
import { UserMapper } from '../../mappers/user.mapper';

@CommandHandler(AssignRoleToUserCommand)
export class AssignRoleToUserHandler
  implements ICommandHandler<AssignRoleToUserCommand, UserDto>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(command: AssignRoleToUserCommand): Promise<UserDto> {
    // Find the user and role
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User with id ${command.userId} not found`);
    }

    const role = await this.roleRepository.findById(command.roleId);
    if (!role) {
      throw new Error(`Role with id ${command.roleId} not found`);
    }

    // Assign the role to the user
    user.assignRole(role);

    // Save the updated user
    await this.userRepository.save(user);

    return this.userMapper.toDto(user);
  }
}
