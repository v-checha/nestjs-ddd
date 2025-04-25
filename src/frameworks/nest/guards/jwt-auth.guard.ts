import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

// Define a user interface based on your application's user structure
interface User {
  id: string;
  email: string;
  // Add other properties your user object has
  [key: string]: unknown;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if the route is public (has the isPublic metadata)
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<T extends User>(err: Error | null, user: T | false, _info: Error | null): T {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }

    return user as T;
  }
}
