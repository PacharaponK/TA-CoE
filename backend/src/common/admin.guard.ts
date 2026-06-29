import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Phase 1 auth: a single shared secret (no per-user login).
 * The TA (Admin) sends it in the `x-admin-secret` header. Read-only
 * (viewer) endpoints are left unguarded.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const provided =
      (req.headers['x-admin-secret'] as string | undefined) ?? '';
    const expected = process.env.ADMIN_SECRET ?? '';

    if (!expected) {
      throw new UnauthorizedException(
        'ADMIN_SECRET is not configured on the server',
      );
    }
    if (provided !== expected) {
      throw new UnauthorizedException('รหัสผ่าน Admin ไม่ถูกต้อง');
    }
    return true;
  }
}
