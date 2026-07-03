import type { TaRole } from '../tas/ta.schema';

/** Shape of the JWT payload issued by AuthService.login and verified by AdminGuard. */
export interface TaTokenPayload {
  sub: string;
  username: string;
  displayName: string;
  role: TaRole;
}
