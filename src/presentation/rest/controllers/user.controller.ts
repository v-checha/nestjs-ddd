import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResourceType } from '@domain/user/value-objects/resource.vo';
import { ActionType } from '@domain/user/value-objects/permission-action.vo';
import {
  RequirePermissions,
  createPermissionString,
} from '@frameworks/nest/decorators/permissions.decorator';
import { ApiResponse, Meta } from '../dtos/response/api-response';
import { CreateUserCommand } from '@application/user/commands/create-user/create-user.command';
import { UpdateUserCommand } from '@application/user/commands/update-user/update-user.command';
import { GetUserQuery } from '@application/user/queries/get-user/get-user.query';
import { ListUsersQuery } from '@application/user/queries/list-users/list-users.query';
import { CreateUserRequest } from '../dtos/request/create-user.request';
import { UserResponse } from '../dtos/response/user.response';
import { AssignRoleToUserCommand } from '@application/user/commands/assign-role-to-user/assign-role-to-user.command';
import { RemoveRoleFromUserCommand } from '@application/user/commands/remove-role-from-user/remove-role-from-user.command';
import { AssignRoleRequest } from '../dtos/request/assign-role.request';
import { User } from '@frameworks/nest/decorators/user.decorator';
import { UserDto } from '@application/user/dtos/user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(createPermissionString(ResourceType.USER, ActionType.CREATE))
  @ApiOperation({ summary: 'Create a new user' })
  @SwaggerResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponse,
  })
  async createUser(@Body() request: CreateUserRequest): Promise<ApiResponse<UserResponse>> {
    const command = new CreateUserCommand(
      request.email,
      request.firstName,
      request.lastName,
      request.password,
    );

    const result = await this.commandBus.execute(command);

    return ApiResponse.success(result, new Meta({ message: 'User created successfully' }));
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged-in user information' })
  @SwaggerResponse({
    status: 200,
    description: 'Current user information',
    type: UserResponse,
  })
  @SwaggerResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@User() user: UserDto): Promise<ApiResponse<UserResponse>> {
    // The user is already available through the @User() decorator via JWT authentication
    // We just need to get the full user profile with all details
    const result = await this.queryBus.execute(new GetUserQuery(user.id));

    return ApiResponse.success(
      result,
      new Meta({ message: 'Current user retrieved successfully' }),
    );
  }

  @Get()
  @ApiBearerAuth()
  @RequirePermissions(createPermissionString(ResourceType.USER, ActionType.READ))
  @ApiOperation({ summary: 'Get all users' })
  @SwaggerResponse({
    status: 200,
    description: 'List of users',
    type: [UserResponse],
  })
  async getUsers(): Promise<ApiResponse<UserResponse[]>> {
    const result = await this.queryBus.execute(new ListUsersQuery());

    return ApiResponse.success(result, new Meta({ message: 'Users retrieved successfully' }));
  }

  @Get(':id')
  @ApiBearerAuth()
  @RequirePermissions(createPermissionString(ResourceType.USER, ActionType.READ))
  @ApiOperation({ summary: 'Get a user by ID' })
  @SwaggerResponse({
    status: 200,
    description: 'User found',
    type: UserResponse,
  })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string): Promise<ApiResponse<UserResponse>> {
    const result = await this.queryBus.execute(new GetUserQuery(id));

    return ApiResponse.success(result, new Meta({ message: 'User retrieved successfully' }));
  }

  @Put(':id')
  @ApiBearerAuth()
  @RequirePermissions(createPermissionString(ResourceType.USER, ActionType.UPDATE))
  @ApiOperation({ summary: 'Update a user' })
  @SwaggerResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponse,
  })
  @SwaggerResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() request: Partial<CreateUserRequest>,
  ): Promise<ApiResponse<UserResponse>> {
    const command = new UpdateUserCommand(id, request.firstName, request.lastName, request.email);

    const result = await this.commandBus.execute(command);

    return ApiResponse.success(result, new Meta({ message: 'User updated successfully' }));
  }

  @Post(':id/roles')
  @ApiBearerAuth()
  @RequirePermissions(createPermissionString(ResourceType.USER, ActionType.UPDATE))
  @ApiOperation({ summary: 'Assign a role to a user' })
  @SwaggerResponse({
    status: 200,
    description: 'Role assigned to user successfully',
    type: UserResponse,
  })
  @SwaggerResponse({ status: 404, description: 'User or role not found' })
  async assignRole(
    @Param('id') userId: string,
    @Body() request: AssignRoleRequest,
  ): Promise<ApiResponse<UserResponse>> {
    const command = new AssignRoleToUserCommand(userId, request.roleId);

    const result = await this.commandBus.execute(command);

    return ApiResponse.success(result, new Meta({ message: 'Role assigned successfully' }));
  }

  @Delete(':userId/roles/:roleId')
  @ApiBearerAuth()
  @RequirePermissions(createPermissionString(ResourceType.USER, ActionType.UPDATE))
  @ApiOperation({ summary: 'Remove a role from a user' })
  @SwaggerResponse({
    status: 200,
    description: 'Role removed from user successfully',
    type: UserResponse,
  })
  @SwaggerResponse({ status: 404, description: 'User or role not found' })
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ): Promise<ApiResponse<UserResponse>> {
    const command = new RemoveRoleFromUserCommand(userId, roleId);

    const result = await this.commandBus.execute(command);

    return ApiResponse.success(result, new Meta({ message: 'Role removed successfully' }));
  }
}
