import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SubjectsModule } from './subjects/subjects.module';
import { LabsModule } from './labs/labs.module';
import { QueueModule } from './queue/queue.module';
import { RealtimeModule } from './realtime/realtime.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://localhost:27017/lab_queue',
    ),
    RealtimeModule,
    SubjectsModule,
    LabsModule,
    QueueModule,
    StudentsModule,
  ],
})
export class AppModule {}
