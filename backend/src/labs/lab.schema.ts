import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LabDocument = HydratedDocument<Lab>;

@Schema({ _id: true })
export class Checkpoint {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // เช่น "CP1 — Compile ผ่าน"

  @Prop({ default: 0 })
  order: number;
}

export const CheckpointSchema = SchemaFactory.createForClass(Checkpoint);

@Schema({ timestamps: true, collection: 'labs' })
export class Lab {
  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true, index: true })
  subjectId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // เช่น "Lab 3 — Linked List"

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: [CheckpointSchema], default: [] })
  checkpoints: Checkpoint[];

  @Prop({ default: true })
  isActive: boolean;

  /** When true, students cannot self-join this lab's queue (TA can still add manually). */
  @Prop({ default: false })
  queuePaused: boolean;

  /** Optional message shown to students when this lab's queue is paused. */
  @Prop({ type: String, default: '' })
  pausedMessage: string;
}

export const LabSchema = SchemaFactory.createForClass(Lab);
LabSchema.index({ subjectId: 1, order: 1 });
