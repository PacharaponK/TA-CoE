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
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto';

@Controller('subjects')
export class SubjectsController {
  constructor(
    private readonly subjects: SubjectsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  // --- Public (viewer) ---
  @Get()
  findAll(@Query('activeOnly') activeOnly?: string) {
    return this.subjects.findAll(activeOnly === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjects.findOne(id);
  }

  // --- Admin ---
  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() dto: CreateSubjectDto) {
    const created = await this.subjects.create(dto);
    this.realtime.emitChange({ type: 'subject' });
    return created;
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    const updated = await this.subjects.update(id, dto);
    this.realtime.emitChange({ type: 'subject' });
    return updated;
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const res = await this.subjects.remove(id);
    this.realtime.emitChange({ type: 'subject' });
    return res;
  }
}
