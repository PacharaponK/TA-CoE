import {
  Injectable,
  ConflictException,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from './student.schema';
import { BulkUpdateDto, CreateStudentDto, UpdateStudentDto } from './dto';

@Injectable()
export class StudentsService implements OnModuleInit {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  /**
   * One-time, idempotent, non-destructive backfill: students created before
   * sections became per-subject carry a legacy flat `subjectIds` array + a
   * single `section`. Derive `enrollments` from them (giving every subject the
   * old flat section) for any document that doesn't have `enrollments` yet.
   * Legacy fields are left untouched, so this can never lose data and re-running
   * it is a no-op.
   */
  async onModuleInit() {
    const res = await this.studentModel.collection.updateMany(
      { enrollments: { $exists: false } },
      [
        {
          $set: {
            enrollments: {
              $map: {
                input: { $ifNull: ['$subjectIds', []] },
                as: 'sid',
                in: {
                  subjectId: '$$sid',
                  section: { $ifNull: ['$section', ''] },
                },
              },
            },
          },
        },
      ],
    );
    if (res.modifiedCount) {
      this.logger.log(
        `Backfilled enrollments for ${res.modifiedCount} legacy student(s).`,
      );
    }
  }

  findAll(activeOnly = false, subjectId?: string) {
    const filter: Record<string, unknown> = activeOnly ? { isActive: true } : {};
    if (subjectId)
      filter['enrollments.subjectId'] = new Types.ObjectId(subjectId);
    return this.studentModel.find(filter).sort({ studentId: 1 }).exec();
  }

  async findOne(id: string) {
    const student = await this.studentModel.findById(id).exec();
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async findByStudentId(studentId: string) {
    const student = await this.studentModel.findOne({ studentId }).exec();
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async create(dto: CreateStudentDto) {
    const exists = await this.studentModel.findOne({ studentId: dto.studentId }).exec();
    if (exists) throw new ConflictException('Student ID already exists');
    return this.studentModel.create(dto);
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.studentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async remove(id: string) {
    const student = await this.studentModel.findByIdAndDelete(id).exec();
    if (!student) throw new NotFoundException('Student not found');
    return { deleted: true };
  }

  async removeMany(ids: string[]) {
    const result = await this.studentModel
      .deleteMany({ _id: { $in: ids } })
      .exec();
    return { deletedCount: result.deletedCount ?? 0 };
  }

  async bulkUpdate(dto: BulkUpdateDto) {
    const { ids, isActive, addSubjectId, removeSubjectId } = dto;
    let modifiedCount = 0;

    if (isActive !== undefined) {
      const r = await this.studentModel
        .updateMany({ _id: { $in: ids } }, { $set: { isActive } })
        .exec();
      modifiedCount += r.modifiedCount ?? 0;
    }

    // Enroll with an empty section, but only where the subject isn't already
    // present — so we never clobber a section the student already has.
    if (addSubjectId) {
      const sid = new Types.ObjectId(addSubjectId);
      const r = await this.studentModel
        .updateMany(
          { _id: { $in: ids }, 'enrollments.subjectId': { $ne: sid } },
          { $push: { enrollments: { subjectId: sid, section: '' } } },
        )
        .exec();
      modifiedCount += r.modifiedCount ?? 0;
    }

    if (removeSubjectId) {
      const sid = new Types.ObjectId(removeSubjectId);
      const r = await this.studentModel
        .updateMany(
          { _id: { $in: ids } },
          { $pull: { enrollments: { subjectId: sid } } },
        )
        .exec();
      modifiedCount += r.modifiedCount ?? 0;
    }

    return { modifiedCount };
  }

  /** Create-or-update by `studentId` for each row; per-row failures don't abort the batch. */
  async importMany(rows: CreateStudentDto[]) {
    let created = 0;
    let updated = 0;
    const errors: { row: number; studentId: string; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const dto = rows[i];
      try {
        const existing = await this.studentModel
          .findOne({ studentId: dto.studentId })
          .exec();
        if (existing) {
          await this.studentModel.updateOne({ _id: existing._id }, dto).exec();
          updated++;
        } else {
          await this.studentModel.create(dto);
          created++;
        }
      } catch (e) {
        errors.push({
          row: i + 1,
          studentId: dto.studentId,
          message: e instanceof Error ? e.message : 'Unknown error',
        });
      }
    }
    return { created, updated, errors };
  }
}
