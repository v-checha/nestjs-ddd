import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResourceType } from '@domain/user/value-objects/resource.vo';
import { ActionType } from '@domain/user/value-objects/permission-action.vo';
import {
  RequirePermissions,
  createPermissionString,
} from '@frameworks/nest/decorators/permissions.decorator';
import { CreateRoleRequest } from '../dtos/request/create-role.request';
import { UpdateRoleRequest } from '../dtos/request/update-role.request';
import { RoleResponse } from '../dtos/response/role.response';
import { CreateRoleCommand } from '@application/user/commands/create-role/create-role.command';
import { UpdateRoleCommand } from '@application/user/commands/update-role/update-role.command';
import { GetRoleQuery } from '@application/user/queries/get-role/get-role.query';
import { ListRolesQuery } from '@application/user/queries/list-roles/list-roles.query';
import { ApiResponse, Meta } from '../dtos/response/api-response';

@ApiTags('roles')
@Controller('roles')
@ApiBearerAuth()
export class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermissions(createPermissionString(ResourceType.ROLE, ActionType.CREATE))
  @ApiOperation({ summary: 'Create a new role' })
  @SwaggerResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleResponse,
  })
  async createRole(@Body() request: CreateRoleRequest): Promise<ApiResponse<RoleResponse>> {
    const command = new CreateRoleCommand(request.name, request.description, request.permissionIds);

    const result = await this.commandBus.execute(command);

    return ApiResponse.success(result, new Meta({ message: 'Role created successfully' }));
  }

  @Get()
  @RequirePermissions(createPermissionString(ResourceType.ROLE, ActionType.READ))
  @ApiOperation({ summary: 'Get all roles' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    type: Number,
  })
  @SwaggerResponse({
    status: 200,
    description: 'List of roles',
    type: [RoleResponse],
  })
  async getRoles(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ApiResponse<RoleResponse[]>> {
    const result = await this.queryBus.execute(new ListRolesQuery(page, limit));

    return ApiResponse.success(result.data, {
      currentPage: result.page,
      totalPages: result.totalPages,
      totalCount: result.total,
      pageSize: result.limit,
      message: 'Roles retrieved successfully',
    });
  }

  @Get(':id')
  @RequirePermissions(createPermissionString(ResourceType.ROLE, ActionType.READ))
  @ApiOperation({ summary: 'Get a role by ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Role found',
    type: RoleResponse,
  })
  @SwaggerResponse({ status: 404, description: 'Role not found' })
  async getRole(@Param('id') id: string): Promise<ApiResponse<RoleResponse>> {
    const result = await this.queryBus.execute(new GetRoleQuery(id));

    return ApiResponse.success(result, new Meta({ message: 'Role retrieved successfully' }));
  }

  @Put(':id')
  @RequirePermissions(createPermissionString(ResourceType.ROLE, ActionType.UPDATE))
  @ApiOperation({ summary: 'Update a role' })
  @SwaggerResponse({
    status: 200,
    description: 'Role updated successfully',
    type: RoleResponse,
  })
  @SwaggerResponse({ status: 404, description: 'Role not found' })
  async updateRole(
    @Param('id') id: string,
    @Body() request: UpdateRoleRequest,
  ): Promise<ApiResponse<RoleResponse>> {
    const command = new UpdateRoleCommand(
      id,
      request.name,
      request.description,
      request.permissionIds,
    );

    const result = await this.commandBus.execute(command);

    return ApiResponse.success(result, new Meta({ message: 'Role updated successfully' }));
  }
}
