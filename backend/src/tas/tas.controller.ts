import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentTa } from '../common/current-ta.decorator';
import { TaTokenPayload } from '../common/ta-token.types';
import { TasService } from './tas.service';
import { CreateTaDto, UpdateOwnProfileDto, UpdateTaDto } from './dto';

@Controller('tas')
export class TasController {
  constructor(private readonly tas: TasService) {}

  // --- Public: Contact page profile listing ---
  @Get('public')
  findPublic() {
    return this.tas.findPublic();
  }

  // --- Any authenticated TA: edit their own contact profile ---
  // Declared before the ":id" routes below so "/tas/me" doesn't get swallowed by ":id".
  @UseGuards(AdminGuard)
  @Get('me')
  findOwn(@CurrentTa() ta: TaTokenPayload) {
    return this.tas.findOwn(ta.sub);
  }

  @UseGuards(AdminGuard)
  @Patch('me')
  updateOwn(@CurrentTa() ta: TaTokenPayload, @Body() dto: UpdateOwnProfileDto) {
    return this.tas.updateOwnProfile(ta.sub, dto);
  }

  // --- Admin: TA account management ---
  @UseGuards(AdminGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.tas.findAll();
  }

  @UseGuards(AdminGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateTaDto) {
    return this.tas.create(dto);
  }

  @UseGuards(AdminGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaDto) {
    return this.tas.update(id, dto);
  }

  @UseGuards(AdminGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tas.remove(id);
  }
}
