import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtAuthService } from '@infrastructure/authentication/jwt-auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtAuthService: JwtAuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtAuthService.validateToken(token);
      req['user'] = { id: payload.sub, email: payload.email };
      next();
    } catch (_error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
}
