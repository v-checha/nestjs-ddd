import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRepository } from '@domain/user/repositories/user-repository.interface';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Resource } from '@domain/user/value-objects/resource.vo';
import { PermissionAction } from '@domain/user/value-objects/permission-action.vo';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    @Inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is public (has the isPublic metadata)
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
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
    const isSuperAdmin = userEntity.roles.some(role => role.type.isSuperAdmin());
    if (isSuperAdmin) {
      return true;
    }

    // Check if the user has any of the required permissions
    // The format is 'resource:action' (e.g., 'user:create', 'role:read')
    const hasPermission = requiredPermissions.some(permissionString => {
      const [resourceStr, actionStr] = permissionString.split(':');

      if (!resourceStr || !actionStr) {
        this.logger.warn(`Invalid permission string format: ${permissionString}`);

        return false;
      }

      try {
        const resource = Resource.create(resourceStr);
        const action = PermissionAction.create(actionStr);

        // Check if the user has this permission through any of their roles
        return userEntity.roles.some(role => role.hasPermissionFor(resource, action));
      } catch (error) {
        this.logger.warn(`Invalid permission: ${permissionString}. Error: ${error.message}`);

        return false;
      }
    });

    if (!hasPermission) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return true;
  }
}
