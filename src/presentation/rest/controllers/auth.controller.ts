import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { Public } from '@frameworks/nest/decorators/public.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';
import { LoginCommand } from '@application/user/commands/login/login.command';
import { RegisterCommand } from '@application/user/commands/register/register.command';
import { ForgotPasswordCommand } from '@application/user/commands/forgot-password/forgot-password.command';
import { ResetPasswordCommand } from '@application/user/commands/reset-password/reset-password.command';
import { VerifyEmailCommand } from '@application/user/commands/verify-email/verify-email.command';
import { RefreshTokenCommand } from '@application/user/commands/refresh-token/refresh-token.command';
import { LogoutCommand } from '@application/user/commands/logout/logout.command';
import { LoginRequest } from '../dtos/request/login.request';
import { RegisterRequest } from '../dtos/request/register.request';
import { ForgotPasswordRequest } from '../dtos/request/forgot-password.request';
import { ResetPasswordRequest } from '../dtos/request/reset-password.request';
import { VerifyEmailRequest } from '../dtos/request/verify-email.request';
import { RefreshTokenRequest } from '../dtos/request/refresh-token.request';
import { LogoutRequest } from '../dtos/request/logout.request';
import { AuthTokenResponse } from '../dtos/response/auth-token.response';
import { UserResponse } from '../dtos/response/user.response';
import { ApiResponse, Meta } from '../dtos/response/api-response';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @SwaggerResponse({
    status: 201,
    description: 'User registered successfully',
    type: UserResponse,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid input or email already exists' })
  async register(@Body() request: RegisterRequest): Promise<ApiResponse<UserResponse>> {
    const command = new RegisterCommand(
      request.email,
      request.firstName,
      request.lastName,
      request.password,
    );

    const result = await this.commandBus.execute(command);

    return ApiResponse.success(result, new Meta({ message: 'User registered successfully' }));
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @SwaggerResponse({
    status: 200,
    description: 'Login successful',
    type: AuthTokenResponse,
  })
  @SwaggerResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() request: LoginRequest): Promise<ApiResponse<AuthTokenResponse>> {
    const command = new LoginCommand(request.email, request.password);

    const result = await this.commandBus.execute(command);

    return ApiResponse.success(result, new Meta({ message: 'Login successful' }));
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  @SwaggerResponse({
    status: 200,
    description: 'Email verified successfully',
    type: UserResponse,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid token' })
  async verifyEmail(@Body() request: VerifyEmailRequest): Promise<ApiResponse<UserResponse>> {
    const command = new VerifyEmailCommand(request.token);
    const result = await this.commandBus.execute(command);

    return ApiResponse.success(result, new Meta({ message: 'Email verified successfully' }));
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @SwaggerResponse({
    status: 200,
    description: 'Password reset email sent if account exists',
  })
  async forgotPassword(@Body() request: ForgotPasswordRequest): Promise<ApiResponse<null>> {
    const command = new ForgotPasswordCommand(request.email);
    await this.commandBus.execute(command);

    return ApiResponse.success(null, { message: 'Password reset email sent' });
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @SwaggerResponse({
    status: 200,
    description: 'Password reset successfully',
    type: UserResponse,
  })
  @SwaggerResponse({ status: 400, description: 'Invalid token' })
  async resetPassword(@Body() request: ResetPasswordRequest): Promise<ApiResponse<UserResponse>> {
    const command = new ResetPasswordCommand(request.token, request.newPassword);
    const result = await this.commandBus.execute(command);

    return ApiResponse.success(result, new Meta({ message: 'Password reset successfully' }));
  }

  @Post('refresh-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh authentication token' })
  @SwaggerResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthTokenResponse,
  })
  @SwaggerResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body() request: RefreshTokenRequest,
  ): Promise<ApiResponse<AuthTokenResponse>> {
    const command = new RefreshTokenCommand(request.refreshToken);
    const result = await this.commandBus.execute(command);

    return ApiResponse.success(result, new Meta({ message: 'Token refreshed successfully' }));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @SwaggerResponse({
    status: 200,
    description: 'Logout successful',
  })
  async logout(@Body() request: LogoutRequest): Promise<ApiResponse<null>> {
    const command = new LogoutCommand(request.refreshToken);
    await this.commandBus.execute(command);

    return ApiResponse.success(null, { message: 'Logout successful' });
  }
}
