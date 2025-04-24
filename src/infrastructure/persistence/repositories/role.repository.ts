import { Injectable, Logger } from '@nestjs/common';
import { IRoleRepository } from '../../../domain/user/repositories/role-repository.interface';
import { Role } from '../../../domain/user/entities/role.entity';
import { Permission, PermissionAction } from '../../../domain/user/entities/permission.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleRepository implements IRoleRepository {
  private readonly logger = new Logger(RoleRepository.name);

  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Role | null> {
    try {
      const roleData = await this.prisma.role.findUnique({
        where: { id },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!roleData) return null;

      return this.mapToDomain(roleData);
    } catch (error) {
      this.logger.error(`Error finding role by ID: ${error.message}`);
      return null;
    }
  }

  async findByName(name: string): Promise<Role | null> {
    try {
      const roleData = await this.prisma.role.findUnique({
        where: { name },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!roleData) return null;

      return this.mapToDomain(roleData);
    } catch (error) {
      this.logger.error(`Error finding role by name: ${error.message}`);
      return null;
    }
  }

  async save(role: Role): Promise<void> {
    try {
      // Start a transaction to handle role and permission relationships
      await this.prisma.$transaction(async (prisma) => {
        // Upsert the role
        await prisma.role.upsert({
          where: { id: role.id },
          update: {
            name: role.name,
            description: role.description,
            updatedAt: new Date(),
          },
          create: {
            id: role.id,
            name: role.name,
            description: role.description,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
          },
        });

        // Delete existing permission assignments that are no longer assigned
        const existingPermissionIds = role.permissions.map(permission => permission.id);
        if (existingPermissionIds.length > 0) {
          await prisma.rolePermission.deleteMany({
            where: {
              roleId: role.id,
              NOT: {
                permissionId: { in: existingPermissionIds }
              }
            }
          });
        } else {
          // If no permissions are assigned, remove all permissions
          await prisma.rolePermission.deleteMany({
            where: { roleId: role.id }
          });
        }

        // Create new permission assignments
        for (const permission of role.permissions) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id,
              },
            },
            update: {},  // No updates needed for the relationship
            create: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      });
    } catch (error) {
      this.logger.error(`Error saving role: ${error.message}`);
      throw new Error(`Failed to save role: ${error.message}`);
    }
  }

  async findAll(): Promise<Role[]> {
    try {
      const roles = await this.prisma.role.findMany({
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });
      return roles.map((role) => this.mapToDomain(role));
    } catch (error) {
      this.logger.error(`Error finding all roles: ${error.message}`);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.role.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Error deleting role: ${error.message}`);
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  }

  private mapToDomain(roleData: any): Role {
    // Map the permissions
    const permissions = roleData.rolePermissions?.map((rolePermission: any) => {
      const permissionData = rolePermission.permission;
      return Permission.create({
        name: permissionData.name,
        description: permissionData.description,
        resource: permissionData.resource,
        action: permissionData.action as PermissionAction,
        createdAt: permissionData.createdAt,
        updatedAt: permissionData.updatedAt,
      }, permissionData.id);
    }) || [];
    
    return Role.create({
      name: roleData.name,
      description: roleData.description,
      permissions: permissions,
      createdAt: roleData.createdAt,
      updatedAt: roleData.updatedAt,
    }, roleData.id);
  }
}
