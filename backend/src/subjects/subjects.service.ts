import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from './subject.schema';
import { CreateSubjectDto, UpdateSubjectDto } from './dto';
import { Lab, LabDocument } from '../labs/lab.schema';
import {
  QueueEntry,
  QueueEntryDocument,
} from '../queue/queue-entry.schema';
import { Student, StudentDocument } from '../students/student.schema';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,
    @InjectModel(Lab.name) private readonly labModel: Model<LabDocument>,
    @InjectModel(QueueEntry.name)
    private readonly queueModel: Model<QueueEntryDocument>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
  ) {}

  async findAll(activeOnly = false) {
    const filter = activeOnly ? { isActive: true } : {};
    return this.subjectModel.find(filter).sort({ code: 1 }).lean().exec();
  }

  async findOne(id: string) {
    const subject = await this.subjectModel.findById(id).lean().exec();
    if (!subject) throw new NotFoundException('ไม่พบวิชานี้');
    return subject;
  }

  async create(dto: CreateSubjectDto) {
    const exists = await this.subjectModel.exists({ code: dto.code });
    if (exists) throw new ConflictException('รหัสวิชานี้ถูกใช้ไปแล้ว');
    return this.subjectModel.create(dto);
  }

  async update(id: string, dto: UpdateSubjectDto) {
    if (dto.code) {
      const clash = await this.subjectModel.exists({
        code: dto.code,
        _id: { $ne: id },
      });
      if (clash) throw new ConflictException('รหัสวิชานี้ถูกใช้ไปแล้ว');
    }
    const updated = await this.subjectModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();
    if (!updated) throw new NotFoundException('ไม่พบวิชานี้');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.subjectModel.findByIdAndDelete(id).lean().exec();
    if (!deleted) throw new NotFoundException('ไม่พบวิชานี้');
    // cascade: remove the subject's labs and queue entries, and drop the
    // enrollment reference from any student still pointing at it
    await this.labModel.deleteMany({ subjectId: id }).exec();
    await this.queueModel.deleteMany({ subjectId: id }).exec();
    await this.studentModel
      .updateMany({ subjectIds: id }, { $pull: { subjectIds: id } })
      .exec();
    return { deleted: true, id };
  }
}
