import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserCommand } from '@application/user/commands/create-user/create-user.command';
import { UpdateUserCommand } from '@application/user/commands/update-user/update-user.command';
import { GetUserQuery } from '@application/user/queries/get-user/get-user.query';
import { ListUsersQuery } from '@application/user/queries/list-users/list-users.query';
import { JwtAuthGuard } from '@frameworks/nest/guards/jwt-auth.guard';
import { CreateUserRequest } from '../dtos/request/create-user.request';
import { UserResponse } from '../dtos/response/user.response';
import { AssignRoleToUserCommand } from '@application/user/commands/assign-role-to-user/assign-role-to-user.command';
import { RemoveRoleFromUserCommand } from '@application/user/commands/remove-role-from-user/remove-role-from-user.command';
import { AssignRoleRequest } from '../dtos/request/assign-role.request';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponse,
  })
  async createUser(@Body() request: CreateUserRequest): Promise<UserResponse> {
    const command = new CreateUserCommand(
      request.email,
      request.firstName,
      request.lastName,
      request.password,
    );

    return this.commandBus.execute(command);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [UserResponse],
  })
  async getUsers(): Promise<UserResponse[]> {
    return this.queryBus.execute(new ListUsersQuery());
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponse,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string): Promise<UserResponse> {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponse,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() request: Partial<CreateUserRequest>,
  ): Promise<UserResponse> {
    const command = new UpdateUserCommand(id, request.firstName, request.lastName, request.email);

    return this.commandBus.execute(command);
  }

  @Post(':id/roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({
    status: 200,
    description: 'Role assigned to user successfully',
    type: UserResponse,
  })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  async assignRole(
    @Param('id') userId: string,
    @Body() request: AssignRoleRequest,
  ): Promise<UserResponse> {
    const command = new AssignRoleToUserCommand(userId, request.roleId);

    return this.commandBus.execute(command);
  }

  @Delete(':userId/roles/:roleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a role from a user' })
  @ApiResponse({
    status: 200,
    description: 'Role removed from user successfully',
    type: UserResponse,
  })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ): Promise<UserResponse> {
    const command = new RemoveRoleFromUserCommand(userId, roleId);

    return this.commandBus.execute(command);
  }
}
