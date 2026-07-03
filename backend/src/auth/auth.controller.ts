import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { CurrentTa } from '../common/current-ta.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { TaTokenPayload } from '../common/ta-token.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  /** Lets the frontend re-validate a stored token and know who's logged in. */
  @UseGuards(AdminGuard)
  @Get('me')
  me(@CurrentTa() ta: TaTokenPayload) {
    return this.auth.toCurrentTa(ta);
  }
}
