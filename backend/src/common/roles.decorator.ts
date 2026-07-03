import { SetMetadata } from '@nestjs/common';
import type { TaRole } from '../tas/ta.schema';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given TA roles. Must be combined with @UseGuards(AdminGuard, RolesGuard). */
export const Roles = (...roles: TaRole[]) => SetMetadata(ROLES_KEY, roles);
