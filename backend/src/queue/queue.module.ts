import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueEntry, QueueEntrySchema } from './queue-entry.schema';
import { Subject, SubjectSchema } from '../subjects/subject.schema';
import { Lab, LabSchema } from '../labs/lab.schema';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QueueEntry.name, schema: QueueEntrySchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Lab.name, schema: LabSchema },
    ]),
    SystemConfigModule,
  ],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
