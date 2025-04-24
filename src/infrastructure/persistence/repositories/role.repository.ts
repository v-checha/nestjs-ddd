import { Injectable, Logger } from '@nestjs/common';
import { PaginatedResult, RoleRepository } from '../../../domain/user/repositories/role-repository.interface';
import { Role } from '../../../domain/user/entities/role.entity';
import { RoleType } from '../../../domain/user/value-objects/role-type.vo';
import { Permission } from '../../../domain/user/entities/permission.entity';
import { Resource } from '../../../domain/user/value-objects/resource.vo';
import { PermissionAction } from '../../../domain/user/value-objects/permission-action.vo';
import { PrismaService } from '../prisma/prisma.service';
import { EntityDeleteException, EntitySaveException } from '../../../domain/common/exceptions/domain.exception';

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  private readonly logger = new Logger(PrismaRoleRepository.name);

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

  async findByType(type: RoleType): Promise<Role | null> {
    try {
      const typeStr = type.toString();
      const roleData = await this.prisma.role.findFirst({
        where: { type: typeStr },
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
      this.logger.error(`Error finding role by type: ${error.message}`);
      return null;
    }
  }

  async findDefault(): Promise<Role | null> {
    try {
      const roleData = await this.prisma.role.findFirst({
        where: { isDefault: true },
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
      this.logger.error(`Error finding default role: ${error.message}`);
      return null;
    }
  }

  async save(role: Role): Promise<void> {
    try {
      // Start a transaction to handle role and permission relationships
      await this.prisma.$transaction(async (prisma) => {
        // Handle scenarios where this is the new default role
        if (role.isDefault) {
          // Clear default flag on all other roles
          await prisma.role.updateMany({
            where: { 
              isDefault: true,
              NOT: { id: role.id }
            },
            data: { isDefault: false }
          });
        }
        
        // Upsert the role
        await prisma.role.upsert({
          where: { id: role.id },
          update: {
            name: role.name,
            description: role.description,
            type: role.type.toString(),
            isDefault: role.isDefault,
            updatedAt: new Date(),
          },
          create: {
            id: role.id,
            name: role.name,
            description: role.description,
            type: role.type.toString(),
            isDefault: role.isDefault,
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
      throw new EntitySaveException('Role', error.message);
    }
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<Role>> {
    try {
      const skip = (page - 1) * limit;

      // Get total count
      const total = await this.prisma.role.count();
      
      // Calculate total pages
      const totalPages = Math.ceil(total / limit);
      
      // Get paginated data with relationships
      const roles = await this.prisma.role.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });
      
      return {
        data: roles.map((role) => this.mapToDomain(role)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`Error finding all roles: ${error.message}`);
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
      await this.prisma.role.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Error deleting role: ${error.message}`);
      throw new EntityDeleteException('Role', error.message);
    }
  }

  private mapToDomain(roleData: any): Role {
    // Map the permissions
    const permissions = roleData.rolePermissions?.map((rolePermission: any) => {
      const permissionData = rolePermission.permission;
      return Permission.create({
        name: permissionData.name,
        description: permissionData.description,
        resource: Resource.create(permissionData.resource),
        action: PermissionAction.create(permissionData.action),
        createdAt: permissionData.createdAt,
        updatedAt: permissionData.updatedAt,
      }, permissionData.id);
    }) || [];
    
    return Role.create({
      name: roleData.name,
      description: roleData.description,
      permissions: permissions,
      type: RoleType.create(roleData.type),
      isDefault: roleData.isDefault,
      createdAt: roleData.createdAt,
      updatedAt: roleData.updatedAt,
    }, roleData.id);
  }
}