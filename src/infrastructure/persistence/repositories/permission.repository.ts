import { Injectable, Logger } from '@nestjs/common';
import { PermissionRepository } from '../../../domain/user/repositories/permission-repository.interface';
import { Permission } from '../../../domain/user/entities/permission.entity';
import { Resource } from '../../../domain/user/value-objects/resource.vo';
import { PermissionAction } from '../../../domain/user/value-objects/permission-action.vo';
import { PrismaService } from '../prisma/prisma.service';
import {
  EntityDeleteException,
  EntitySaveException,
} from '../../../domain/common/exceptions/domain.exception';
import { PrismaPermissionModel } from '../prisma/prisma.types';
import { PaginatedResult } from '../../../domain/user/repositories/role-repository.interface';

@Injectable()
export class PrismaPermissionRepository implements PermissionRepository {
  private readonly logger = new Logger(PrismaPermissionRepository.name);

  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Permission | null> {
    try {
      const permissionData = await this.prisma.permission.findUnique({
        where: { id },
      });

      if (!permissionData) return null;

      return this.mapToDomain(permissionData);
    } catch (error) {
      this.logger.error(`Error finding permission by ID: ${error.message}`);

      return null;
    }
  }

  async findByName(name: string): Promise<Permission | null> {
    try {
      const permissionData = await this.prisma.permission.findUnique({
        where: { name },
      });

      if (!permissionData) return null;

      return this.mapToDomain(permissionData);
    } catch (error) {
      this.logger.error(`Error finding permission by name: ${error.message}`);

      return null;
    }
  }

  async findByResource(resource: Resource): Promise<Permission[]> {
    try {
      const resourceStr = resource.toString();
      const permissions = await this.prisma.permission.findMany({
        where: { resource: resourceStr },
      });

      return permissions.map(permission => this.mapToDomain(permission));
    } catch (error) {
      this.logger.error(`Error finding permissions by resource: ${error.message}`);

      return [];
    }
  }

  async findByAction(action: PermissionAction): Promise<Permission[]> {
    try {
      const actionStr = action.toString();
      const permissions = await this.prisma.permission.findMany({
        where: { action: actionStr },
      });

      return permissions.map(permission => this.mapToDomain(permission));
    } catch (error) {
      this.logger.error(`Error finding permissions by action: ${error.message}`);

      return [];
    }
  }

  async findByResourceAndAction(
    resource: Resource,
    action: PermissionAction,
  ): Promise<Permission | null> {
    try {
      const resourceStr = resource.toString();
      const actionStr = action.toString();
      const permissionData = await this.prisma.permission.findFirst({
        where: {
          resource: resourceStr,
          action: actionStr,
        },
      });

      if (!permissionData) return null;

      return this.mapToDomain(permissionData);
    } catch (error) {
      this.logger.error(`Error finding permission by resource and action: ${error.message}`);

      return null;
    }
  }

  async save(permission: Permission): Promise<void> {
    try {
      await this.prisma.permission.upsert({
        where: { id: permission.id },
        update: {
          name: permission.name,
          description: permission.description,
          resource: permission.resource.toString(),
          action: permission.action.toString(),
          updatedAt: new Date(),
        },
        create: {
          id: permission.id,
          name: permission.name,
          description: permission.description,
          resource: permission.resource.toString(),
          action: permission.action.toString(),
          createdAt: permission.createdAt,
          updatedAt: permission.updatedAt,
        },
      });
    } catch (error) {
      this.logger.error(`Error saving permission: ${error.message}`);
      throw new EntitySaveException('Permission', error.message);
    }
  }

  async saveMany(permissions: Permission[]): Promise<void> {
    try {
      // Start a transaction to save multiple permissions
      await this.prisma.$transaction(async prisma => {
        for (const permission of permissions) {
          await prisma.permission.upsert({
            where: { id: permission.id },
            update: {
              name: permission.name,
              description: permission.description,
              resource: permission.resource.toString(),
              action: permission.action.toString(),
              updatedAt: new Date(),
            },
            create: {
              id: permission.id,
              name: permission.name,
              description: permission.description,
              resource: permission.resource.toString(),
              action: permission.action.toString(),
              createdAt: permission.createdAt,
              updatedAt: permission.updatedAt,
            },
          });
        }
      });
    } catch (error) {
      this.logger.error(`Error saving multiple permissions: ${error.message}`);
      throw new EntitySaveException('Permission', error.message);
    }
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<Permission>> {
    try {
      const skip = (page - 1) * limit;

      // Get total count
      const total = await this.prisma.permission.count();

      // Calculate total pages
      const totalPages = Math.ceil(total / limit);

      // Get paginated data
      const permissions = await this.prisma.permission.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      return {
        data: permissions.map(permission => this.mapToDomain(permission)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`Error finding all permissions: ${error.message}`);

      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.permission.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Error deleting permission: ${error.message}`);
      throw new EntityDeleteException('Permission', error.message);
    }
  }

  private mapToDomain(permissionData: PrismaPermissionModel): Permission {
    return Permission.create(
      {
        name: permissionData.name,
        description: permissionData.description,
        resource: Resource.create(permissionData.resource),
        action: PermissionAction.create(permissionData.action),
        createdAt: permissionData.createdAt,
        updatedAt: permissionData.updatedAt,
      },
      permissionData.id,
    );
  }
}
