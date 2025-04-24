import { IQuery } from '@nestjs/cqrs';

export class ListPermissionsQuery implements IQuery {
  constructor(public readonly resource?: string) {}
}
