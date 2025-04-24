import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { UserDto } from '../../dtos/user.dto';
import { IUserRepository } from '../../../../domain/user/repositories/user-repository.interface';
import { User } from '../../../../domain/user/entities/user.entity';
import { Email } from '../../../../domain/user/value-objects/email.vo';
import { UserMapper } from '../../mappers/user.mapper';
import { Inject } from '@nestjs/common';
import { EmailAlreadyExistsException } from '../../../common/exceptions/application.exception';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, UserDto> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserDto> {
    const email = Email.create(command.email);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new EmailAlreadyExistsException(email.value);
    }

    // Create a new user
    const user = User.create({
      email,
      firstName: command.firstName,
      lastName: command.lastName,
      password: command.password, // In a real app, hash the password first
    });

    // Save the user
    await this.userRepository.save(user);

    // Publish domain events
    this.eventBus.publishAll(user.domainEvents);
    user.clearEvents();

    return this.userMapper.toDto(user);
  }
}
