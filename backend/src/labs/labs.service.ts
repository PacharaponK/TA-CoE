import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lab, LabDocument } from './lab.schema';
import { CreateLabDto, UpdateLabDto } from './dto';
import { Subject, SubjectDocument } from '../subjects/subject.schema';
import {
  QueueEntry,
  QueueEntryDocument,
} from '../queue/queue-entry.schema';

@Injectable()
export class LabsService {
  constructor(
    @InjectModel(Lab.name) private readonly labModel: Model<LabDocument>,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,
    @InjectModel(QueueEntry.name)
    private readonly queueModel: Model<QueueEntryDocument>,
  ) {}

  async findAll(subjectId?: string, activeOnly = false) {
    const filter: Record<string, unknown> = {};
    if (subjectId) filter.subjectId = new Types.ObjectId(subjectId);
    if (activeOnly) filter.isActive = true;
    return this.labModel
      .find(filter)
      .sort({ order: 1, createdAt: 1 })
      .lean()
      .exec();
  }

  async findOne(id: string) {
    const lab = await this.labModel.findById(id).lean().exec();
    if (!lab) throw new NotFoundException('ไม่พบ Lab นี้');
    return lab;
  }

  async create(dto: CreateLabDto) {
    const subjectExists = await this.subjectModel.exists({ _id: dto.subjectId });
    if (!subjectExists) throw new NotFoundException('ไม่พบวิชาที่อ้างถึง');

    const checkpoints = (dto.checkpoints ?? []).map((cp, i) => ({
      _id: new Types.ObjectId(),
      name: cp.name,
      order: cp.order ?? i,
    }));

    return this.labModel.create({
      subjectId: new Types.ObjectId(dto.subjectId),
      name: dto.name,
      order: dto.order ?? 0,
      checkpoints,
      isActive: dto.isActive ?? true,
    });
  }

  async update(id: string, dto: UpdateLabDto) {
    const patch: Record<string, unknown> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.order !== undefined) patch.order = dto.order;
    if (dto.isActive !== undefined) patch.isActive = dto.isActive;

    // Replace the whole checkpoint array, preserving _ids that were sent back
    // so existing queue references stay valid.
    if (dto.checkpoints !== undefined) {
      patch.checkpoints = dto.checkpoints.map((cp, i) => ({
        _id:
          cp._id && Types.ObjectId.isValid(cp._id)
            ? new Types.ObjectId(cp._id)
            : new Types.ObjectId(),
        name: cp.name,
        order: cp.order ?? i,
      }));
    }

    const updated = await this.labModel
      .findByIdAndUpdate(id, patch, { new: true })
      .lean()
      .exec();
    if (!updated) throw new NotFoundException('ไม่พบ Lab นี้');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.labModel.findByIdAndDelete(id).lean().exec();
    if (!deleted) throw new NotFoundException('ไม่พบ Lab นี้');
    await this.queueModel.deleteMany({ labId: id }).exec();
    return { deleted: true, id };
  }
}
