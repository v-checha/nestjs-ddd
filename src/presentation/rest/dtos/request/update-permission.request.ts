import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionAction, Resource } from '../../../../domain/user/entities/permission.entity';

export class UpdatePermissionRequest {
  @ApiProperty({
    example: 'create_user',
    description: 'The name of the permission',
    required: false,
  })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Allows creating a new user',
    description: 'The description of the permission',
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: Resource,
    example: Resource.USER,
    description: 'The resource the permission applies to',
    required: false,
  })
  @IsEnum(Resource, { message: 'Resource must be a valid resource type' })
  @IsOptional()
  resource?: Resource;

  @ApiProperty({
    enum: PermissionAction,
    example: PermissionAction.CREATE,
    description: 'The action the permission allows',
    required: false,
  })
  @IsEnum(PermissionAction, { message: 'Action must be a valid permission action' })
  @IsOptional()
  action?: PermissionAction;
}
