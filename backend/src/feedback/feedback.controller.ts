import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, UpdateFeedbackStatusDto } from './dto';

@Controller('feedback')
export class FeedbackController {
  constructor(
    private readonly feedback: FeedbackService,
    private readonly realtime: RealtimeGateway,
  ) {}

  // --- Public: student submits a suggestion (no auth required) ---
  @Post()
  async create(@Body() dto: CreateFeedbackDto) {
    const created = await this.feedback.create(dto);
    this.realtime.emitChange({ type: 'feedback' });
    return created;
  }

  // --- Admin: inbox ---
  @UseGuards(AdminGuard)
  @Get()
  findAll(@Query('status') status?: 'new' | 'read') {
    return this.feedback.findAll(status);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateFeedbackStatusDto) {
    const updated = await this.feedback.updateStatus(id, dto);
    this.realtime.emitChange({ type: 'feedback' });
    return updated;
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const res = await this.feedback.remove(id);
    this.realtime.emitChange({ type: 'feedback' });
    return res;
  }
}
