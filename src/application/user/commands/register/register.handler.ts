import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from './register.command';
import { UserDto } from '../../dtos/user.dto';
import { UserRepository } from '../../../../domain/user/repositories/user-repository.interface';
import { User } from '../../../../domain/user/entities/user.entity';
import { Email } from '../../../../domain/user/value-objects/email.vo';
import { UserMapper } from '../../mappers/user.mapper';
import { Inject } from '@nestjs/common';
import { EmailAlreadyExistsException } from '../../../common/exceptions/application.exception';
import { PasswordService } from '../../../../infrastructure/services/password.service';
import { TokenService } from '../../../../infrastructure/services/token.service';
import { EmailService } from '../../../../infrastructure/services/email.service';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand, UserDto> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
    private readonly eventBus: EventBus,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: RegisterCommand): Promise<UserDto> {
    const email = Email.create(command.email);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new EmailAlreadyExistsException(email.value);
    }

    // Hash the password
    const hashedPassword = await this.passwordService.hash(command.password);

    // Create a new user (not verified yet)
    const user = User.create({
      email,
      firstName: command.firstName,
      lastName: command.lastName,
      password: hashedPassword,
      roles: [],
      isVerified: false,
    });

    // Save the user
    await this.userRepository.save(user);

    // Generate verification token
    const verificationToken = await this.tokenService.generateVerificationToken(user.id);

    // Send verification email
    await this.emailService.sendVerificationEmail(command.email, verificationToken);

    // Publish domain events
    this.eventBus.publishAll(user.domainEvents);
    user.clearEvents();

    return this.userMapper.toDto(user);
  }
}