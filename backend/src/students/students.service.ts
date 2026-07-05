import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from './student.schema';
import { BulkUpdateDto, CreateStudentDto, UpdateStudentDto } from './dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  findAll(activeOnly = false, subjectId?: string) {
    const filter: Record<string, unknown> = activeOnly ? { isActive: true } : {};
    if (subjectId) filter.subjectIds = new Types.ObjectId(subjectId);
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
    const update: Record<string, unknown> = {};
    if (isActive !== undefined) update.$set = { isActive };
    if (addSubjectId)
      update.$addToSet = { subjectIds: new Types.ObjectId(addSubjectId) };
    if (removeSubjectId)
      update.$pull = { subjectIds: new Types.ObjectId(removeSubjectId) };

    if (Object.keys(update).length === 0) return { modifiedCount: 0 };

    const result = await this.studentModel
      .updateMany({ _id: { $in: ids } }, update)
      .exec();
    return { modifiedCount: result.modifiedCount ?? 0 };
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
