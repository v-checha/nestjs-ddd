import { ApiProperty } from '@nestjs/swagger';
import { PermissionResponse } from './permission.response';
import { RoleTypeEnum } from '../../../../domain/user/value-objects/role-type.vo';

export class RoleResponse {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the role',
  })
  id: string;

  @ApiProperty({
    example: 'admin',
    description: 'The name of the role',
  })
  name: string;

  @ApiProperty({
    example: 'Administrator role with all permissions',
    description: 'The description of the role',
  })
  description: string;

  @ApiProperty({
    enum: RoleTypeEnum,
    example: RoleTypeEnum.ADMIN,
    description: 'The type of the role',
  })
  type: RoleTypeEnum;

  @ApiProperty({
    example: false,
    description: 'Whether this role is the default role for new users',
  })
  isDefault: boolean;

  @ApiProperty({
    type: [PermissionResponse],
    description: 'The permissions assigned to the role',
  })
  permissions: PermissionResponse[];

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date when the role was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date when the role was last updated',
  })
  updatedAt: Date;
}
