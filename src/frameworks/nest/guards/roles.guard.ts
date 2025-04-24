import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRepository } from '../../../domain/user/repositories/user-repository.interface';
import { UserId } from '../../../domain/user/value-objects/user-id.vo';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('UserRepository')
    private userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from the request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User is not authenticated');
    }

    // Get the user entity with roles
    const userEntity = await this.userRepository.findById(UserId.create(user.id));
    if (!userEntity) {
      throw new UnauthorizedException('User not found');
    }

    // Check if the user has any of the required roles
    const hasRole = requiredRoles.some(role => 
      userEntity.roles.some(userRole => userRole.name === role)
    );

    if (!hasRole) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return true;
  }
}