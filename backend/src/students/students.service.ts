import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from './student.schema';
import { CreateStudentDto, UpdateStudentDto } from './dto';

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
}
