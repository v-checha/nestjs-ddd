import { ApiProperty } from '@nestjs/swagger';
import { RoleResponse } from './role.response';

export class UserResponse {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user',
  })
  id: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
  })
  lastName: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user has verified their email address',
  })
  isVerified: boolean;

  @ApiProperty({
    type: [RoleResponse],
    description: 'The roles assigned to the user',
  })
  roles: RoleResponse[];

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date when the user last logged in',
    required: false,
  })
  lastLogin?: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date when the user was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date when the user was last updated',
  })
  updatedAt: Date;
}
