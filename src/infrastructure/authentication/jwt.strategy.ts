import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './jwt-auth.service';
import { UserRepository } from '../../domain/user/repositories/user-repository.interface';
import { UserId } from '../../domain/user/value-objects/user-id.vo';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @Inject('UserRepository')
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('app.jwtSecret'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findById(UserId.create(payload.sub));

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { id: user.id, email: user.email.value };
  }
}
