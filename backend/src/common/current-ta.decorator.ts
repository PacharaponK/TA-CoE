import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { TaTokenPayload } from './ta-token.types';

/** Reads the authenticated TA attached by AdminGuard. Only valid on routes guarded by it. */
export const CurrentTa = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TaTokenPayload => {
    const req = ctx.switchToHttp().getRequest<Request & { ta: TaTokenPayload }>();
    return req.ta;
  },
);
