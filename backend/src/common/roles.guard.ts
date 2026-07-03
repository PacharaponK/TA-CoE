import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from './roles.decorator';
import { TaTokenPayload } from './ta-token.types';
import type { TaRole } from '../tas/ta.schema';

/** Runs after AdminGuard — checks req.ta.role against @Roles(...) metadata. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<TaRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<Request & { ta?: TaTokenPayload }>();
    if (!req.ta || !required.includes(req.ta.role)) {
      throw new ForbiddenException('สิทธิ์ไม่เพียงพอสำหรับการดำเนินการนี้');
    }
    return true;
  }
}
