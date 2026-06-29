import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StudentDocument = HydratedDocument<Student>;

@Schema({ timestamps: true, collection: 'students' })
export class Student {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  surname: string;

  @Prop({ trim: true, default: '' })
  nickname: string;

  @Prop({ required: true, unique: true, trim: true })
  studentId: string; // e.g. "6530123456"

  @Prop({ required: true, min: 1, max: 6 })
  year: number; // 1–6

  @Prop({ trim: true, default: '' })
  section: string; // e.g. "SEC1"

  @Prop({ trim: true, default: '' })
  email: string;

  @Prop({ trim: true, default: '' })
  phone: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
