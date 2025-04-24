import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../../domain/user/repositories/user-repository.interface';
import { User } from '../../../domain/user/entities/user.entity';
import { Email } from '../../../domain/user/value-objects/email.vo';
import { UserId } from '../../../domain/user/value-objects/user-id.vo';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../../../domain/user/entities/role.entity';
import { Permission } from '../../../domain/user/entities/permission.entity';
import { PermissionAction } from '../../../domain/user/value-objects/permission-action.vo';
import { Resource } from '../../../domain/user/value-objects/resource.vo';
import { RoleType } from '../../../domain/user/value-objects/role-type.vo';
import { EntityDeleteException, EntitySaveException } from '../../../domain/common/exceptions/domain.exception';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  private readonly logger = new Logger(PrismaUserRepository.name);

  constructor(private prisma: PrismaService) {}

  async findById(id: UserId): Promise<User | null> {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id: id.value },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!userData) return null;

      return this.mapToDomain(userData);
    } catch (error) {
      this.logger.error(`Error finding user by ID: ${error.message}`);
      return null;
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { email: email.value },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!userData) return null;

      return this.mapToDomain(userData);
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`);
      return null;
    }
  }


  async save(user: User): Promise<void> {
    try {
      // Start a transaction to handle user and role/permission relationships
      await this.prisma.$transaction(async (prisma) => {
        // Upsert the user
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email.value,
            firstName: user.firstName,
            lastName: user.lastName,
            password: user.password,
            updatedAt: user.updatedAt,
          },
          create: {
            id: user.id,
            email: user.email.value,
            firstName: user.firstName,
            lastName: user.lastName,
            password: user.password,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });

        // Delete existing role assignments that are no longer assigned
        const existingRoleIds = user.roles.map(role => role.id);
        if (existingRoleIds.length > 0) {
          await prisma.userRole.deleteMany({
            where: {
              userId: user.id,
              NOT: {
                roleId: { in: existingRoleIds }
              }
            }
          });
        } else {
          // If no roles are assigned, remove all roles
          await prisma.userRole.deleteMany({
            where: { userId: user.id }
          });
        }

        // Create new role assignments
        for (const role of user.roles) {
          await prisma.userRole.upsert({
            where: {
              userId_roleId: {
                userId: user.id,
                roleId: role.id,
              },
            },
            update: {},  // No updates needed for the relationship
            create: {
              userId: user.id,
              roleId: role.id,
            },
          });
        }
      });
    } catch (error) {
      this.logger.error(`Error saving user: ${error.message}`);
      throw new EntitySaveException('User', error.message);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      return users.map((user) => this.mapToDomain(user));
    } catch (error) {
      this.logger.error(`Error finding all users: ${error.message}`);
      return [];
    }
  }

  async delete(id: UserId): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id: id.value },
      });
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`);
      throw new EntityDeleteException('User', error.message);
    }
  }

  private mapToDomain(userData: any): User {
    // Map the roles and their permissions
    const roles = userData.userRoles?.map((userRole: any) => {
      const roleData = userRole.role;
      
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
    }) || [];
    
    return User.create(
      {
        email: Email.create(userData.email),
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        roles: roles,
        isVerified: userData.isVerified,
        lastLogin: userData.lastLogin,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      userData.id,
    );
  }
}