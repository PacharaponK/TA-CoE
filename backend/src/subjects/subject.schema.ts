import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubjectDocument = HydratedDocument<Subject>;

@Schema({ timestamps: true, collection: 'subjects' })
export class Subject {
  @Prop({ required: true, unique: true, trim: true })
  code: string; // รหัสวิชา เช่น "CS101"

  @Prop({ required: true, trim: true })
  name: string; // ชื่อวิชา

  @Prop({ required: true, trim: true })
  semester: string; // เช่น "2026/1"

  @Prop({ default: true })
  isActive: boolean;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
// unique index is declared via `@Prop({ unique: true })` on `code`
