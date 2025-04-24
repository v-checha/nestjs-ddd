import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleRequest {
  @ApiProperty({
    example: 'admin',
    description: 'The name of the role',
    required: false,
  })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Administrator role with all permissions',
    description: 'The description of the role',
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    description: 'The IDs of the permissions assigned to the role',
    isArray: true,
    type: String,
    required: false,
  })
  @IsArray({ message: 'Permission IDs must be an array' })
  @IsString({ each: true, message: 'Permission ID must be a string' })
  @IsOptional()
  permissionIds?: string[];
}
