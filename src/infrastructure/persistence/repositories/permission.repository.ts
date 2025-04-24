import { Injectable, Logger } from '@nestjs/common';
import { PermissionRepository } from '../../../domain/user/repositories/permission-repository.interface';
import { Permission, PermissionAction } from '../../../domain/user/entities/permission.entity';
import { PrismaService } from '../prisma/prisma.service';

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

  async findByResource(resource: string): Promise<Permission[]> {
    try {
      const permissions = await this.prisma.permission.findMany({
        where: { resource },
      });
      return permissions.map((permission) => this.mapToDomain(permission));
    } catch (error) {
      this.logger.error(`Error finding permissions by resource: ${error.message}`);
      return [];
    }
  }

  async save(permission: Permission): Promise<void> {
    try {
      await this.prisma.permission.upsert({
        where: { id: permission.id },
        update: {
          name: permission.name,
          description: permission.description,
          resource: permission.resource,
          action: permission.action,
          updatedAt: new Date(),
        },
        create: {
          id: permission.id,
          name: permission.name,
          description: permission.description,
          resource: permission.resource,
          action: permission.action,
          createdAt: permission.createdAt,
          updatedAt: permission.updatedAt,
        },
      });
    } catch (error) {
      this.logger.error(`Error saving permission: ${error.message}`);
      throw new Error(`Failed to save permission: ${error.message}`);
    }
  }

  async findAll(): Promise<Permission[]> {
    try {
      const permissions = await this.prisma.permission.findMany();
      return permissions.map((permission) => this.mapToDomain(permission));
    } catch (error) {
      this.logger.error(`Error finding all permissions: ${error.message}`);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.permission.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Error deleting permission: ${error.message}`);
      throw new Error(`Failed to delete permission: ${error.message}`);
    }
  }

  private mapToDomain(permissionData: any): Permission {
    return Permission.create({
      name: permissionData.name,
      description: permissionData.description,
      resource: permissionData.resource,
      action: permissionData.action as PermissionAction,
      createdAt: permissionData.createdAt,
      updatedAt: permissionData.updatedAt,
    }, permissionData.id);
  }
}
