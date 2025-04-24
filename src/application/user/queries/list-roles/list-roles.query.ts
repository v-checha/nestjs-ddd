import { IQuery } from '@nestjs/cqrs';

export class ListRolesQuery implements IQuery {
  constructor(
    public readonly page?: number,
    public readonly limit?: number
  ) {}
}
