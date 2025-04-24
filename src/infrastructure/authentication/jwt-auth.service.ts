import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../domain/user/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtAuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email.value,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('app.jwtSecret'),
      expiresIn: this.configService.get<string>('app.jwtExpiresIn'),
    });
  }

  validateToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.configService.get<string>('app.jwtSecret'),
    });
  }
}
