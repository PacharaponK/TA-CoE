import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../common/admin.guard';
import { SystemConfigService } from './system-config.service';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

class SetQueueDisabledDto {
  @IsBoolean()
  queueDisabled: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  disabledMessage?: string;
}

@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly svc: SystemConfigService) {}

  /**
   * Public endpoint — students and TAs need this to hydrate initial state
   * on page load / after a hard refresh.
   */
  @Get()
  async getConfig() {
    const cfg = await this.svc.getConfig();
    return {
      queueDisabled: cfg.queueDisabled,
      disabledMessage: cfg.disabledMessage,
      disabledAt: cfg.disabledAt,
    };
  }

  /** Admin-only — toggle the kill-switch. */
  @UseGuards(AdminGuard)
  @Patch()
  async setConfig(@Body() dto: SetQueueDisabledDto) {
    const cfg = await this.svc.setQueueDisabled(
      dto.queueDisabled,
      dto.disabledMessage ?? '',
    );
    return {
      queueDisabled: cfg.queueDisabled,
      disabledMessage: cfg.disabledMessage,
      disabledAt: cfg.disabledAt,
    };
  }
}
