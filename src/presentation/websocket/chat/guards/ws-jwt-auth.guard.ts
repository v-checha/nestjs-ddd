import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const userId = this.getUserFromSocket(client);

    if (!userId) {
      throw new WsException('Unauthorized');
    }

    return true;
  }

  getUserFromSocket(client: Socket): string | null {
    const token =
      client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return null;
    }

    try {
      const decoded = this.jwtService.verify(token);

      return decoded.sub;
    } catch (_) {
      return null;
    }
  }
}
