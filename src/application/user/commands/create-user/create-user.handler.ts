import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { UserDto } from '../../dtos/user.dto';
import { UserRepository } from '../../../../domain/user/repositories/user-repository.interface';
import { User } from '../../../../domain/user/entities/user.entity';
import { Email } from '../../../../domain/user/value-objects/email.vo';
import { UserMapper } from '../../mappers/user.mapper';
import { Inject } from '@nestjs/common';
import { EmailAlreadyExistsException } from '../../../common/exceptions/application.exception';
import { PasswordService } from '../../../../infrastructure/services/password.service';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, UserDto> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
    private readonly eventBus: EventBus,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserDto> {
    const email = Email.create(command.email);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new EmailAlreadyExistsException(email.value);
    }

    // Hash the password
    const hashedPassword = await this.passwordService.hash(command.password);

    // Create a new user
    const user = User.create({
      email,
      firstName: command.firstName,
      lastName: command.lastName,
      password: hashedPassword,
      roles: [],
    });

    // Save the user
    await this.userRepository.save(user);

    // Publish domain events
    this.eventBus.publishAll(user.domainEvents);
    user.clearEvents();

    return this.userMapper.toDto(user);
  }
}
