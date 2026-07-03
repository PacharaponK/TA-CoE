import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FeedbackDocument = HydratedDocument<Feedback>;

@Schema({ timestamps: true, collection: 'feedbacks' })
export class Feedback {
  @Prop({ trim: true, default: '' })
  studentId: string; // optional — students may submit anonymously

  @Prop({ trim: true, default: '' })
  studentName: string;

  @Prop({ type: Types.ObjectId, ref: 'Subject', default: null })
  subjectId: Types.ObjectId | null;

  @Prop({ trim: true, default: '' })
  subjectName: string; // denormalized, same rationale as queueEntries

  @Prop({ required: true, trim: true, maxlength: 2000 })
  message: string;

  @Prop({ enum: ['new', 'read'], default: 'new' })
  status: 'new' | 'read';
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
