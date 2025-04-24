import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResourceType } from '../../../../domain/user/value-objects/resource.vo';
import { ActionType } from '../../../../domain/user/value-objects/permission-action.vo';

export class CreatePermissionRequest {
  @ApiProperty({
    example: 'create_user',
    description: 'The name of the permission',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    example: 'Allows creating a new user',
    description: 'The description of the permission',
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({
    enum: ResourceType,
    example: ResourceType.USER,
    description: 'The resource the permission applies to',
  })
  @IsEnum(ResourceType, { message: 'Resource must be a valid resource type' })
  @IsNotEmpty({ message: 'Resource is required' })
  resource: ResourceType;

  @ApiProperty({
    enum: ActionType,
    example: ActionType.CREATE,
    description: 'The action the permission allows',
  })
  @IsEnum(ActionType, { message: 'Action must be a valid permission action' })
  @IsNotEmpty({ message: 'Action is required' })
  action: ActionType;
}
