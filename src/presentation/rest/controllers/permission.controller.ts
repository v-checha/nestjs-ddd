import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResourceType } from '@domain/user/value-objects/resource.vo';
import { ActionType } from '@domain/user/value-objects/permission-action.vo';
import { JwtAuthGuard } from '@frameworks/nest/guards/jwt-auth.guard';
import { PermissionsGuard } from '@frameworks/nest/guards/permissions.guard';
import {
  RequirePermissions,
  createPermissionString,
} from '@frameworks/nest/decorators/permissions.decorator';
import { CreatePermissionRequest } from '../dtos/request/create-permission.request';
import { UpdatePermissionRequest } from '../dtos/request/update-permission.request';
import { PermissionResponse } from '../dtos/response/permission.response';
import { ApiResponse, Meta } from '../dtos/response/api-response';
import { CreatePermissionCommand } from '@application/user/commands/create-permission/create-permission.command';
import { UpdatePermissionCommand } from '@application/user/commands/update-permission/update-permission.command';
import { GetPermissionQuery } from '@application/user/queries/get-permission/get-permission.query';
import { ListPermissionsQuery } from '@application/user/queries/list-permissions/list-permissions.query';

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
  @UseGuards(PermissionsGuard)
  @RequirePermissions(createPermissionString(ResourceType.PERMISSION, ActionType.CREATE))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new permission' })
  @SwaggerResponse({
    status: 201,
    description: 'Permission created successfully',
    type: PermissionResponse,
  })
  async createPermission(
    @Body() request: CreatePermissionRequest,
  ): Promise<ApiResponse<PermissionResponse>> {
    const command = new CreatePermissionCommand(
      request.name,
      request.description,
      request.resource,
      request.action,
    );

    const result = await this.commandBus.execute(command);

    return ApiResponse.success(result, new Meta({ message: 'Permission created successfully' }));
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(createPermissionString(ResourceType.PERMISSION, ActionType.READ))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiQuery({
    name: 'resource',
    required: false,
    description: 'Filter permissions by resource',
    enum: ResourceType,
  })
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
    description: 'List of permissions',
    type: [PermissionResponse],
  })
  async getPermissions(
    @Query('resource') resource?: ResourceType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ApiResponse<PermissionResponse[]>> {
    const result = await this.queryBus.execute(new ListPermissionsQuery(resource, page, limit));

    return ApiResponse.success(result.data, {
      currentPage: result.page,
      totalPages: result.totalPages,
      totalCount: result.total,
      pageSize: result.limit,
      message: 'Permissions retrieved successfully'
    });
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(createPermissionString(ResourceType.PERMISSION, ActionType.READ))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a permission by ID' })
  @SwaggerResponse({
    status: 200,
    description: 'Permission found',
    type: PermissionResponse,
  })
  @SwaggerResponse({ status: 404, description: 'Permission not found' })
  async getPermission(@Param('id') id: string): Promise<ApiResponse<PermissionResponse>> {
    const result = await this.queryBus.execute(new GetPermissionQuery(id));

    return ApiResponse.success(result, new Meta({ message: 'Permission retrieved successfully' }));
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(createPermissionString(ResourceType.PERMISSION, ActionType.UPDATE))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a permission' })
  @SwaggerResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: PermissionResponse,
  })
  @SwaggerResponse({ status: 404, description: 'Permission not found' })
  async updatePermission(
    @Param('id') id: string,
    @Body() request: UpdatePermissionRequest,
  ): Promise<ApiResponse<PermissionResponse>> {
    const command = new UpdatePermissionCommand(
      id,
      request.name,
      request.description,
      request.resource,
      request.action,
    );

    const result = await this.commandBus.execute(command);

    return ApiResponse.success(result, new Meta({ message: 'Permission updated successfully' }));
  }
}
