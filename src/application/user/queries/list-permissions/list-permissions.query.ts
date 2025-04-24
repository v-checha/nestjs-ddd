import { IQuery } from '@nestjs/cqrs';
import { Resource } from '../../../../domain/user/entities/permission.entity';

export class ListPermissionsQuery implements IQuery {
  constructor(
    public readonly resource?: Resource,
    public readonly page?: number,
    public readonly limit?: number
  ) {}
}
