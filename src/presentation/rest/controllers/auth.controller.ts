import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Public } from '../../../frameworks/nest/decorators/public.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginCommand } from '../../../application/user/commands/login/login.command';
import { RegisterCommand } from '../../../application/user/commands/register/register.command';
import { ForgotPasswordCommand } from '../../../application/user/commands/forgot-password/forgot-password.command';
import { ResetPasswordCommand } from '../../../application/user/commands/reset-password/reset-password.command';
import { VerifyEmailCommand } from '../../../application/user/commands/verify-email/verify-email.command';
import { RefreshTokenCommand } from '../../../application/user/commands/refresh-token/refresh-token.command';
import { LogoutCommand } from '../../../application/user/commands/logout/logout.command';
import { JwtAuthGuard } from '../../../frameworks/nest/guards/jwt-auth.guard';
import { LoginRequest } from '../dtos/request/login.request';
import { RegisterRequest } from '../dtos/request/register.request';
import { ForgotPasswordRequest } from '../dtos/request/forgot-password.request';
import { ResetPasswordRequest } from '../dtos/request/reset-password.request';
import { VerifyEmailRequest } from '../dtos/request/verify-email.request';
import { RefreshTokenRequest } from '../dtos/request/refresh-token.request';
import { LogoutRequest } from '../dtos/request/logout.request';
import { AuthTokenResponse } from '../dtos/response/auth-token.response';
import { UserResponse } from '../dtos/response/user.response';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: UserResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or email already exists' })
  async register(@Body() request: RegisterRequest): Promise<UserResponse> {
    const command = new RegisterCommand(
      request.email,
      request.firstName,
      request.lastName,
      request.password,
    );

    return this.commandBus.execute(command);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthTokenResponse,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() request: LoginRequest): Promise<AuthTokenResponse> {
    const command = new LoginCommand(
      request.email,
      request.password,
    );

    return this.commandBus.execute(command);
  }

  @Post('verify-email')
  @Public()
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: UserResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async verifyEmail(@Body() request: VerifyEmailRequest): Promise<UserResponse> {
    try {
      const command = new VerifyEmailCommand(request.token);
      return this.commandBus.execute(command);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  @Post('forgot-password')
  @Public()
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if account exists',
  })
  async forgotPassword(@Body() request: ForgotPasswordRequest): Promise<void> {
    const command = new ForgotPasswordCommand(request.email);
    await this.commandBus.execute(command);
  }

  @Post('reset-password')
  @Public()
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: UserResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async resetPassword(@Body() request: ResetPasswordRequest): Promise<UserResponse> {
    try {
      const command = new ResetPasswordCommand(
        request.token,
        request.newPassword,
      );
      return this.commandBus.execute(command);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  @Post('refresh-token')
  @Public()
  @ApiOperation({ summary: 'Refresh authentication token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthTokenResponse,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() request: RefreshTokenRequest): Promise<AuthTokenResponse> {
    try {
      const command = new RefreshTokenCommand(request.refreshToken);
      return this.commandBus.execute(command);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  async logout(@Body() request: LogoutRequest): Promise<void> {
    const command = new LogoutCommand(request.refreshToken);
    await this.commandBus.execute(command);
  }
}