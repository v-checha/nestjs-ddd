import { IQuery } from '@nestjs/cqrs';
import { ResourceType } from '../../../../domain/user/value-objects/resource.vo';

export class ListPermissionsQuery implements IQuery {
  constructor(
    public readonly resource?: ResourceType,
    public readonly page?: number,
    public readonly limit?: number
  ) {}
}