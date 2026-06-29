import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { LabsService } from './labs.service';
import { CreateLabDto, UpdateLabDto } from './dto';

@Controller('labs')
export class LabsController {
  constructor(
    private readonly labs: LabsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  // --- Public (viewer) ---
  @Get()
  findAll(
    @Query('subjectId') subjectId?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.labs.findAll(subjectId, activeOnly === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labs.findOne(id);
  }

  // --- Admin ---
  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() dto: CreateLabDto) {
    const created = await this.labs.create(dto);
    this.realtime.emitChange({ type: 'lab' });
    return created;
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateLabDto) {
    const updated = await this.labs.update(id, dto);
    this.realtime.emitChange({ type: 'lab' });
    return updated;
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const res = await this.labs.remove(id);
    this.realtime.emitChange({ type: 'lab' });
    return res;
  }
}
