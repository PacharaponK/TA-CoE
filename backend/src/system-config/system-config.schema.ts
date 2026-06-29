import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SystemConfigDocument = HydratedDocument<SystemConfig>;

/**
 * Singleton document that stores system-wide runtime configuration.
 * There is always exactly one document in this collection.
 * We use findOne() / findOneAndUpdate({}) — never query by _id.
 */
@Schema({ collection: 'systemConfig' })
export class SystemConfig {
  /** When true, the queue system is disabled — students cannot join. */
  @Prop({ default: false })
  queueDisabled: boolean;

  /** Optional message shown to students when the queue is disabled. */
  @Prop({ type: String, default: '' })
  disabledMessage: string;

  /** Timestamp of the last state change. */
  @Prop({ type: Date, default: null })
  disabledAt: Date | null;
}

export const SystemConfigSchema = SchemaFactory.createForClass(SystemConfig);
