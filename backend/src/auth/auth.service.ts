import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TasService } from '../tas/tas.service';
import { LoginDto } from './dto';
import { TaTokenPayload } from '../common/ta-token.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly tas: TasService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const ta = await this.tas.validateCredentials(dto.username, dto.password);
    if (!ta) throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');

    const payload: TaTokenPayload = {
      sub: String(ta._id),
      username: ta.username,
      displayName: ta.displayName,
      role: ta.role,
    };
    const token = await this.jwt.signAsync(payload);
    return { token, ta: this.toCurrentTa(payload) };
  }

  toCurrentTa(payload: TaTokenPayload) {
    return {
      id: payload.sub,
      username: payload.username,
      displayName: payload.displayName,
      role: payload.role,
    };
  }
}
