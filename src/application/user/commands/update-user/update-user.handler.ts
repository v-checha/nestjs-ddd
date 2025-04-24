import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from './update-user.command';
import { UserDto } from '../../dtos/user.dto';
import { UserRepository } from '@domain/user/repositories/user-repository.interface';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { UserMapper } from '../../mappers/user.mapper';
import { Inject } from '@nestjs/common';
import { UserNotFoundException } from '../../../common/exceptions/application.exception';
import { Email } from '@domain/user/value-objects/email.vo';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, UserDto> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UserDto> {
    const userId = UserId.create(command.id);

    // Find the user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(command.id);
    }

    // Update the user properties
    if (command.firstName !== undefined && command.lastName !== undefined) {
      user.updateName(command.firstName, command.lastName);
    }

    if (command.email !== undefined) {
      const email = Email.create(command.email);
      user.updateEmail(email);
    }

    // Save the updated user
    await this.userRepository.save(user);

    return this.userMapper.toDto(user);
  }
}
