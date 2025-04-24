import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveRoleFromUserCommand } from './remove-role-from-user.command';
import { UserDto } from '../../dtos/user.dto';
import { Inject } from '@nestjs/common';
import { UserRepository } from '../../../../domain/user/repositories/user-repository.interface';
import { UserId } from '../../../../domain/user/value-objects/user-id.vo';
import { UserMapper } from '../../mappers/user.mapper';

@CommandHandler(RemoveRoleFromUserCommand)
export class RemoveRoleFromUserHandler
  implements ICommandHandler<RemoveRoleFromUserCommand, UserDto>
{
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(command: RemoveRoleFromUserCommand): Promise<UserDto> {
    // Find the user
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User with id ${command.userId} not found`);
    }

    // Remove the role from the user
    user.removeRole(command.roleId);

    // Save the updated user
    await this.userRepository.save(user);

    return this.userMapper.toDto(user);
  }
}
