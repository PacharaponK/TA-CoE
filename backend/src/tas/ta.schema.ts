import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaRole = 'admin' | 'ta';

export type TaDocument = HydratedDocument<Ta>;

/** One row of a TA's weekly duty schedule, shown on the public Contact page. */
@Schema({ _id: false })
export class ScheduleEntry {
  @Prop({ required: true, trim: true })
  day: string; // เช่น "วันจันทร์"

  @Prop({ required: true, trim: true })
  time: string; // เช่น "08:00 – 09:50"

  @Prop({ trim: true, default: '' })
  note: string; // เช่น "240-216 EXPLORING SOFTWARE (Sec 02) · COM 1"
}

export const ScheduleEntrySchema = SchemaFactory.createForClass(ScheduleEntry);

@Schema({ timestamps: true, collection: 'tas' })
export class Ta {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  displayName: string;

  @Prop({ required: true, enum: ['admin', 'ta'], default: 'ta' })
  role: TaRole;

  @Prop({ default: true })
  isActive: boolean;

  // --- Public contact-page profile (all optional; only shown when showOnContactPage is true) ---

  /** Job title / position label, e.g. "หัวหน้า TA". Distinct from the auth `role` above. */
  @Prop({ trim: true, default: '' })
  title: string;

  @Prop({ trim: true, default: '' })
  email: string;

  @Prop({ trim: true, default: '' })
  facebookName: string;

  @Prop({ trim: true, default: '' })
  facebookUrl: string;

  @Prop({ trim: true, default: '' })
  igName: string;

  @Prop({ trim: true, default: '' })
  location: string;

  @Prop({ trim: true, default: '' })
  statusText: string;

  /** Drives the Active/Offline badge on the Contact page. */
  @Prop({ default: true })
  available: boolean;

  /** Opt-in flag — a TA account is only listed on the public Contact page once this is true. */
  @Prop({ default: false })
  showOnContactPage: boolean;

  @Prop({ type: [ScheduleEntrySchema], default: [] })
  schedule: ScheduleEntry[];
}

export const TaSchema = SchemaFactory.createForClass(Ta);
