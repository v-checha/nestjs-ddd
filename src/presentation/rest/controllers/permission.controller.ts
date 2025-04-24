import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../frameworks/nest/guards/jwt-auth.guard';
import { CreatePermissionRequest } from '../dtos/request/create-permission.request';
import { UpdatePermissionRequest } from '../dtos/request/update-permission.request';
import { PermissionResponse } from '../dtos/response/permission.response';
import { CreatePermissionCommand } from '../../../application/user/commands/create-permission/create-permission.command';
import { UpdatePermissionCommand } from '../../../application/user/commands/update-permission/update-permission.command';
import { GetPermissionQuery } from '../../../application/user/queries/get-permission/get-permission.query';
import { ListPermissionsQuery } from '../../../application/user/queries/list-permissions/list-permissions.query';

@ApiTags('permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermissionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    type: PermissionResponse,
  })
  async createPermission(
    @Body() request: CreatePermissionRequest,
  ): Promise<PermissionResponse> {
    const command = new CreatePermissionCommand(
      request.name,
      request.description,
      request.resource,
      request.action,
    );

    return this.commandBus.execute(command);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiQuery({
    name: 'resource',
    required: false,
    description: 'Filter permissions by resource',
  })
  @ApiResponse({
    status: 200,
    description: 'List of permissions',
    type: [PermissionResponse],
  })
  async getPermissions(
    @Query('resource') resource?: string,
  ): Promise<PermissionResponse[]> {
    return this.queryBus.execute(new ListPermissionsQuery(resource));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission found',
    type: PermissionResponse,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async getPermission(@Param('id') id: string): Promise<PermissionResponse> {
    return this.queryBus.execute(new GetPermissionQuery(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: PermissionResponse,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async updatePermission(
    @Param('id') id: string,
    @Body() request: UpdatePermissionRequest,
  ): Promise<PermissionResponse> {
    const command = new UpdatePermissionCommand(
      id,
      request.name,
      request.description,
      request.resource,
      request.action,
    );

    return this.commandBus.execute(command);
  }
}