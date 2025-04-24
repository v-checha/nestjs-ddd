import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRepository } from '../../../domain/user/repositories/user-repository.interface';
import { UserId } from '../../../domain/user/value-objects/user-id.vo';
import { PermissionAction, Resource } from '../../../domain/user/entities/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    @Inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user from the request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User is not authenticated');
    }

    // Get the user entity with roles and permissions
    const userEntity = await this.userRepository.findById(UserId.create(user.id));
    if (!userEntity) {
      throw new UnauthorizedException('User not found');
    }

    // Check if the user has super_admin role - they have access to everything
    const isSuperAdmin = userEntity.roles.some(role => role.type === 'super_admin');
    if (isSuperAdmin) {
      return true;
    }

    // Check if the user has any of the required permissions
    // The format is 'resource:action' (e.g., 'user:create', 'role:read')
    const hasPermission = requiredPermissions.some(permissionString => {
      const [resourceStr, actionStr] = permissionString.split(':');
      
      // Validate the permission string
      if (!Object.values(Resource).includes(resourceStr as Resource)) {
        this.logger.warn(`Invalid resource in permission string: ${permissionString}`);
        return false;
      }
      
      if (!Object.values(PermissionAction).includes(actionStr as PermissionAction)) {
        this.logger.warn(`Invalid action in permission string: ${permissionString}`);
        return false;
      }
      
      const resource = resourceStr as Resource;
      const action = actionStr as PermissionAction;
      
      // Check if the user has this permission through any of their roles
      return userEntity.roles.some(role => 
        role.permissions.some(perm => 
          perm.resource === resource && 
          (perm.action === action || perm.action === PermissionAction.MANAGE)
        )
      );
    });

    if (!hasPermission) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return true;
  }
}