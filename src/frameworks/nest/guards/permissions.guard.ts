import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRepository } from '../../../domain/user/repositories/user-repository.interface';
import { UserId } from '../../../domain/user/value-objects/user-id.vo';

@Injectable()
export class PermissionsGuard implements CanActivate {
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

    // Check if the user has any of the required permissions
    // The format is 'resource:action' (e.g., 'user:create', 'role:read')
    const hasPermission = requiredPermissions.some(permission => {
      const [resource, action] = permission.split(':');
      
      return userEntity.roles.some(role => 
        role.permissions.some(perm => 
          perm.resource === resource && 
          (perm.action === action || perm.action === 'manage')
        )
      );
    });

    if (!hasPermission) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return true;
  }
}