import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../frameworks/nest/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../frameworks/nest/guards/permissions.guard';
import { RequirePermissions } from '../../../frameworks/nest/decorators/permissions.decorator';
import { CreateRoleRequest } from '../dtos/request/create-role.request';
import { UpdateRoleRequest } from '../dtos/request/update-role.request';
import { RoleResponse } from '../dtos/response/role.response';
import { CreateRoleCommand } from '../../../application/user/commands/create-role/create-role.command';
import { UpdateRoleCommand } from '../../../application/user/commands/update-role/update-role.command';
import { GetRoleQuery } from '../../../application/user/queries/get-role/get-role.query';
import { ListRolesQuery } from '../../../application/user/queries/list-roles/list-roles.query';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('role:create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleResponse,
  })
  async createRole(@Body() request: CreateRoleRequest): Promise<RoleResponse> {
    const command = new CreateRoleCommand(
      request.name,
      request.description,
      request.permissionIds,
    );

    return this.commandBus.execute(command);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'List of roles',
    type: [RoleResponse],
  })
  async getRoles(): Promise<RoleResponse[]> {
    return this.queryBus.execute(new ListRolesQuery());
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Get a role by ID' })
  @ApiResponse({
    status: 200,
    description: 'Role found',
    type: RoleResponse,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async getRole(@Param('id') id: string): Promise<RoleResponse> {
    return this.queryBus.execute(new GetRoleQuery(id));
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('role:update')
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: RoleResponse,
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async updateRole(
    @Param('id') id: string,
    @Body() request: UpdateRoleRequest,
  ): Promise<RoleResponse> {
    const command = new UpdateRoleCommand(
      id,
      request.name,
      request.description,
      request.permissionIds,
    );

    return this.commandBus.execute(command);
  }
}