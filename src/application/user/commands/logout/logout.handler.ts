import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';
import { Inject } from '@nestjs/common';
import { TokenService } from '../../../../infrastructure/services/token.service';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    // Revoke the refresh token
    await this.tokenService.revokeRefreshToken(command.refreshToken);
  }
}