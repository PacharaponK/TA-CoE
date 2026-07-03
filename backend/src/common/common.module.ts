import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminGuard } from './admin.guard';
import { RolesGuard } from './roles.guard';

/**
 * Global module so AdminGuard/RolesGuard (and JwtService) can be injected
 * from any controller via @UseGuards without every module importing JwtModule.
 * Import once in AppModule — Nest makes @Global() exports available everywhere.
 *
 * Uses registerAsync so process.env is read during Nest's DI instantiation
 * phase, not at this file's module-load time — ConfigModule.forRoot() (which
 * loads .env into process.env) runs as part of AppModule's own decorator body,
 * which only executes *after* this file has already been imported/evaluated.
 */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.ADMIN_SECRET;
        if (!secret) {
          throw new Error('ADMIN_SECRET is not configured on the server');
        }
        return { secret, signOptions: { expiresIn: '7d' } };
      },
    }),
  ],
  providers: [AdminGuard, RolesGuard],
  exports: [JwtModule, AdminGuard, RolesGuard],
})
export class CommonModule {}
