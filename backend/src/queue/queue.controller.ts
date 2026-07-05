import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminGuard } from '../common/admin.guard';
import { CurrentTa } from '../common/current-ta.decorator';
import { TaTokenPayload } from '../common/ta-token.types';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { SystemConfigService } from '../system-config/system-config.service';
import { TelegramService } from '../telegram/telegram.service';
import { QueueService } from './queue.service';
import { EnqueueDto, ResolveDto } from './dto';

@Controller('queue')
export class QueueController {
  constructor(
    private readonly queue: QueueService,
    private readonly realtime: RealtimeGateway,
    private readonly systemConfig: SystemConfigService,
    private readonly telegram: TelegramService,
  ) {}

  // --- Public (viewer) ---
  @Get()
  getActive(
    @Query('subjectId') subjectId?: string,
    @Query('labId') labId?: string,
    @Query('checkpointId') checkpointId?: string,
  ) {
    return this.queue.getActive({ subjectId, labId, checkpointId });
  }

  // --- Public: student self-enqueue (no admin required) ---
  @Post('join')
  async join(@Body() dto: EnqueueDto) {
    const cfg = await this.systemConfig.getConfig();
    if (cfg.queueDisabled) {
      throw new ServiceUnavailableException(
        cfg.disabledMessage || 'ระบบคิวถูกปิดชั่วคราว กรุณารอสักครู่',
      );
    }
    const created = await this.queue.enqueue(dto, { selfJoin: true });
    this.realtime.emitChange({ type: 'queue' });
    this.telegram.notifyQueueJoined(created);
    return created;
  }

  // --- Admin: History ---
  @UseGuards(AdminGuard)
  @Get('history')
  getHistory(
    @Query('subjectId') subjectId?: string,
    @Query('labId') labId?: string,
    @Query('checkpointId') checkpointId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.queue.getHistory({ subjectId, labId, checkpointId, studentId });
  }

  // --- Admin: CSV export ---
  @UseGuards(AdminGuard)
  @Get('export')
  async export(
    @Res() res: Response,
    @Query('subjectId') subjectId?: string,
    @Query('labId') labId?: string,
    @Query('checkpointId') checkpointId?: string,
    @Query('studentId') studentId?: string,
  ) {
    const csv = await this.queue.exportCsv({
      subjectId,
      labId,
      checkpointId,
      studentId,
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="lab-queue-export-${Date.now()}.csv"`,
    );
    res.send(csv);
  }

  // --- Admin: mutations ---
  @UseGuards(AdminGuard)
  @Post()
  async enqueue(@Body() dto: EnqueueDto) {
    const cfg = await this.systemConfig.getConfig();
    if (cfg.queueDisabled) {
      throw new ServiceUnavailableException(
        cfg.disabledMessage || 'ระบบคิวถูกปิดชั่วคราว กรุณารอสักครู่',
      );
    }
    const created = await this.queue.enqueue(dto);
    this.realtime.emitChange({ type: 'queue' });
    return created;
  }

  @UseGuards(AdminGuard)
  @Patch(':id/call')
  async call(@Param('id') id: string) {
    const res = await this.queue.call(id);
    this.realtime.emitChange({ type: 'queue' });
    return res;
  }

  @UseGuards(AdminGuard)
  @Patch(':id/skip')
  async skip(@Param('id') id: string) {
    const res = await this.queue.skip(id);
    this.realtime.emitChange({ type: 'queue' });
    return res;
  }

  @UseGuards(AdminGuard)
  @Patch(':id/resolve')
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveDto,
    @CurrentTa() ta: TaTokenPayload,
  ) {
    const res = await this.queue.resolve(id, dto, ta.displayName);
    this.realtime.emitChange({ type: 'queue' });
    return res;
  }

  @UseGuards(AdminGuard)
  @Post(':id/requeue')
  async requeue(@Param('id') id: string) {
    const res = await this.queue.requeue(id);
    this.realtime.emitChange({ type: 'queue' });
    return res;
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const res = await this.queue.remove(id);
    this.realtime.emitChange({ type: 'queue' });
    return res;
  }
}
