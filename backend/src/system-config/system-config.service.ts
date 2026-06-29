import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemConfig, SystemConfigDocument } from './system-config.schema';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectModel(SystemConfig.name)
    private readonly configModel: Model<SystemConfigDocument>,
    private readonly realtime: RealtimeGateway,
  ) {}

  /** Returns the singleton config document, creating it if it doesn't exist. */
  async getConfig(): Promise<SystemConfigDocument> {
    const existing = await this.configModel.findOne({});
    if (existing) return existing;

    // Bootstrap the singleton on first access
    return this.configModel.create({
      queueDisabled: false,
      disabledMessage: '',
      disabledAt: null,
    });
  }

  /**
   * Enables or disables the queue system.
   * Immediately notifies ALL connected clients via WebSocket so the
   * banner / block appears instantly without waiting for a poll.
   */
  async setQueueDisabled(
    disabled: boolean,
    message = '',
  ): Promise<SystemConfigDocument> {
    const config = await this.configModel.findOneAndUpdate(
      {},
      {
        $set: {
          queueDisabled: disabled,
          disabledMessage: message,
          disabledAt: disabled ? new Date() : null,
        },
      },
      { new: true, upsert: true },
    );

    // Broadcast immediately to all connected students / TAs
    this.realtime.emitChange({
      type: 'system',
      queueDisabled: disabled,
      disabledMessage: message,
    });

    return config;
  }
}
