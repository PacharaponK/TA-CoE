import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Subject, SubjectSchema } from './subject.schema';
import { Lab, LabSchema } from '../labs/lab.schema';
import { QueueEntry, QueueEntrySchema } from '../queue/queue-entry.schema';
import { Student, StudentSchema } from '../students/student.schema';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subject.name, schema: SubjectSchema },
      { name: Lab.name, schema: LabSchema },
      { name: QueueEntry.name, schema: QueueEntrySchema },
      { name: Student.name, schema: StudentSchema },
    ]),
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService, MongooseModule],
})
export class SubjectsModule {}
