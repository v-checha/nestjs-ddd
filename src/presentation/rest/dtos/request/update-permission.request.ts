import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResourceType } from '@domain/user/value-objects/resource.vo';
import { ActionType } from '@domain/user/value-objects/permission-action.vo';

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
    enum: ResourceType,
    example: ResourceType.USER,
    description: 'The resource the permission applies to',
    required: false,
  })
  @IsEnum(ResourceType, { message: 'Resource must be a valid resource type' })
  @IsOptional()
  resource?: ResourceType;

  @ApiProperty({
    enum: ActionType,
    example: ActionType.CREATE,
    description: 'The action the permission allows',
    required: false,
  })
  @IsEnum(ActionType, { message: 'Action must be a valid permission action' })
  @IsOptional()
  action?: ActionType;
}
