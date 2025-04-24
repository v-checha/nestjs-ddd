import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './login.command';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '@domain/user/repositories/user-repository.interface';
import { Email } from '@domain/user/value-objects/email.vo';
import { JwtAuthService } from '@infrastructure/authentication/jwt-auth.service';
import { PasswordService } from '@infrastructure/services/password.service';
import { TokenService } from '@infrastructure/services/token.service';
import { AuthTokenDto } from '../../dtos/auth-token.dto';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, AuthTokenDto> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly jwtAuthService: JwtAuthService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthTokenDto> {
    const email = Email.create(command.email);

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Validate password
    const isPasswordValid = await this.passwordService.compare(command.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const token = this.jwtAuthService.generateToken(user);

    // Generate refresh token
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);

    // Update login timestamp
    user.updateLoginTimestamp();
    await this.userRepository.save(user);

    return {
      token,
      refreshToken,
      userId: user.id,
      email: user.email.value,
    };
  }
}
