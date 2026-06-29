import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QueueEntryDocument = HydratedDocument<QueueEntry>;

export type QueueStatus = 'waiting' | 'checking' | 'passed' | 'failed';

@Schema({ timestamps: true, collection: 'queueEntries' })
export class QueueEntry {
  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lab', required: true })
  labId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  checkpointId: Types.ObjectId | null;

  // snapshot of the student (entered manually in Phase 1)
  @Prop({ required: true, trim: true })
  studentId: string;

  @Prop({ required: true, trim: true })
  studentName: string;

  @Prop({ default: '', trim: true })
  section: string;

  // denormalized names to keep history stable + ready for CSV
  @Prop({ required: true })
  subjectName: string;

  @Prop({ required: true })
  labName: string;

  @Prop({ type: String, default: null })
  checkpointName: string | null;

  @Prop({ default: 1 })
  attempt: number;

  @Prop({
    type: String,
    enum: ['waiting', 'checking', 'passed', 'failed'],
    default: 'waiting',
    index: true,
  })
  status: QueueStatus;

  @Prop({ default: () => new Date() })
  enqueuedAt: Date;

  @Prop({ type: Date, default: null })
  calledAt: Date | null;

  @Prop({ type: Date, default: null })
  resolvedAt: Date | null;

  @Prop({ type: String, default: null })
  resolvedBy: string | null;
}

export const QueueEntrySchema = SchemaFactory.createForClass(QueueEntry);

// active queue, ordered by arrival
QueueEntrySchema.index({
  status: 1,
  subjectId: 1,
  labId: 1,
  enqueuedAt: 1,
});
// attempt counting + per-student history
QueueEntrySchema.index({ studentId: 1, labId: 1, checkpointId: 1 });
