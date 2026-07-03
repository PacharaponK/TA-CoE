import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TaTokenPayload } from './ta-token.types';

/**
 * Phase 2 auth: named TA accounts. The client sends `Authorization: Bearer <jwt>`
 * (issued by POST /auth/login). Read-only (viewer) endpoints are left unguarded.
 * Verified payload is attached to `req.ta` for downstream use (see CurrentTa, RolesGuard).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers['authorization'];
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    if (!token) throw new UnauthorizedException('กรุณาเข้าสู่ระบบ');

    try {
      const payload = await this.jwt.verifyAsync<TaTokenPayload>(token);
      (req as Request & { ta: TaTokenPayload }).ta = payload;
    } catch {
      throw new UnauthorizedException('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
    }
    return true;
  }
}
