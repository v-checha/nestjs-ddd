import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtAuthService } from '@infrastructure/authentication/jwt-auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtAuthService: JwtAuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtAuthService.validateToken(token);
      req['user'] = { id: payload.sub, email: payload.email };
      next();
    } catch (_error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
