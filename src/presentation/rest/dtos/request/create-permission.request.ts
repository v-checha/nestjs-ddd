import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionAction } from '../../../../domain/user/entities/permission.entity';

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
    example: 'user',
    description: 'The resource the permission applies to',
  })
  @IsString({ message: 'Resource must be a string' })
  @IsNotEmpty({ message: 'Resource is required' })
  resource: string;

  @ApiProperty({
    enum: PermissionAction,
    example: PermissionAction.CREATE,
    description: 'The action the permission allows',
  })
  @IsEnum(PermissionAction, { message: 'Action must be a valid permission action' })
  @IsNotEmpty({ message: 'Action is required' })
  action: PermissionAction;
}
