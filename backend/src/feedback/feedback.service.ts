import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback, FeedbackDocument } from './feedback.schema';
import { Subject, SubjectDocument } from '../subjects/subject.schema';
import { CreateFeedbackDto, UpdateFeedbackStatusDto } from './dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private readonly feedbackModel: Model<FeedbackDocument>,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,
  ) {}

  async findAll(status?: 'new' | 'read') {
    const filter = status ? { status } : {};
    return this.feedbackModel.find(filter).sort({ createdAt: -1 }).lean().exec();
  }

  async create(dto: CreateFeedbackDto) {
    let subjectName = '';
    if (dto.subjectId) {
      const subject = await this.subjectModel.findById(dto.subjectId).lean().exec();
      if (subject) subjectName = subject.name;
    }
    return this.feedbackModel.create({
      studentId: dto.studentId ?? '',
      studentName: dto.studentName ?? '',
      subjectId: dto.subjectId ?? null,
      subjectName,
      message: dto.message,
    });
  }

  async updateStatus(id: string, dto: UpdateFeedbackStatusDto) {
    const updated = await this.feedbackModel
      .findByIdAndUpdate(id, { status: dto.status }, { new: true })
      .lean()
      .exec();
    if (!updated) throw new NotFoundException('ไม่พบข้อเสนอแนะนี้');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.feedbackModel.findByIdAndDelete(id).lean().exec();
    if (!deleted) throw new NotFoundException('ไม่พบข้อเสนอแนะนี้');
    return { deleted: true, id };
  }
}
