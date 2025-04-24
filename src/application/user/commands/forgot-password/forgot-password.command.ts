import { ICommand } from '@nestjs/cqrs';

export class ForgotPasswordCommand implements ICommand {
  constructor(
    public readonly email: string,
  ) {}
}