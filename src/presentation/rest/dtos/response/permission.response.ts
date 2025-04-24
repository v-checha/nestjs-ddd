import { ApiProperty } from '@nestjs/swagger';
import { ActionType } from '@domain/user/value-objects/permission-action.vo';
import { ResourceType } from '@domain/user/value-objects/resource.vo';

export class PermissionResponse {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the permission',
  })
  id: string;

  @ApiProperty({
    example: 'create_user',
    description: 'The name of the permission',
  })
  name: string;

  @ApiProperty({
    example: 'Allows creating a new user',
    description: 'The description of the permission',
  })
  description: string;

  @ApiProperty({
    enum: ResourceType,
    example: ResourceType.USER,
    description: 'The resource the permission applies to',
  })
  resource: ResourceType;

  @ApiProperty({
    enum: ActionType,
    example: ActionType.CREATE,
    description: 'The action the permission allows',
  })
  action: ActionType;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date when the permission was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date when the permission was last updated',
  })
  updatedAt: Date;
}
