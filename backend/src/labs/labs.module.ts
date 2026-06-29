import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lab, LabSchema } from './lab.schema';
import { Subject, SubjectSchema } from '../subjects/subject.schema';
import { QueueEntry, QueueEntrySchema } from '../queue/queue-entry.schema';
import { LabsService } from './labs.service';
import { LabsController } from './labs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lab.name, schema: LabSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: QueueEntry.name, schema: QueueEntrySchema },
    ]),
  ],
  controllers: [LabsController],
  providers: [LabsService],
  exports: [LabsService, MongooseModule],
})
export class LabsModule {}
