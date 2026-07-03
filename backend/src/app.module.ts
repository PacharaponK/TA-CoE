import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { TasModule } from './tas/tas.module';
import { SubjectsModule } from './subjects/subjects.module';
import { LabsModule } from './labs/labs.module';
import { QueueModule } from './queue/queue.module';
import { RealtimeModule } from './realtime/realtime.module';
import { StudentsModule } from './students/students.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://localhost:27017/lab_queue',
    ),
    CommonModule,
    TasModule,
    AuthModule,
    RealtimeModule,
    SubjectsModule,
    LabsModule,
    QueueModule,
    StudentsModule,
    SystemConfigModule,
    FeedbackModule,
  ],
})
export class AppModule {}
