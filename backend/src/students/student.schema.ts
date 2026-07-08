import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudentDocument = HydratedDocument<Student>;

/**
 * One subject the student is enrolled in, together with the section they
 * belong to *for that subject*. A student can be in a different section in
 * each subject, so section lives here — not on the student as a whole.
 */
@Schema({ _id: false })
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId;

  @Prop({ trim: true, default: '' })
  section: string; // e.g. "01" — the student's section in this subject
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);

@Schema({ timestamps: true, collection: 'students' })
export class Student {
  /**
   * Subjects this student is enrolled in — gates which subject's queue they
   * can be added to — each carrying that subject's section for this student.
   */
  @Prop({ type: [EnrollmentSchema], default: [] })
  enrollments: Enrollment[];

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
  email: string;

  @Prop({ trim: true, default: '' })
  phone: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
