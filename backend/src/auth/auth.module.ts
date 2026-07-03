import { Module } from '@nestjs/common';
import { TasModule } from '../tas/tas.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [TasModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
