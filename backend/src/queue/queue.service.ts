import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QueueEntry, QueueEntryDocument } from './queue-entry.schema';
import { EnqueueDto, ResolveDto } from './dto';
import { Subject, SubjectDocument } from '../subjects/subject.schema';
import { Lab, LabDocument } from '../labs/lab.schema';

const ACTIVE = ['waiting', 'checking'] as const;
const DONE = ['passed', 'failed'] as const;

interface QueueFilter {
  subjectId?: string;
  labId?: string;
  checkpointId?: string;
  studentId?: string;
}

@Injectable()
export class QueueService {
  constructor(
    @InjectModel(QueueEntry.name)
    private readonly queueModel: Model<QueueEntryDocument>,
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,
    @InjectModel(Lab.name) private readonly labModel: Model<LabDocument>,
  ) {}

  /**
   * Adds a student to the queue. Pass `selfJoin: true` for the student
   * self-service endpoint — this is the only path blocked by a lab's
   * `queuePaused` flag; TA manual add always goes through.
   */
  async enqueue(dto: EnqueueDto, opts: { selfJoin?: boolean } = {}) {
    const subject = await this.subjectModel.findById(dto.subjectId).lean();
    if (!subject) throw new NotFoundException('ไม่พบวิชา');

    const lab = await this.labModel.findById(dto.labId).lean();
    if (!lab) throw new NotFoundException('ไม่พบ Lab');
    if (String(lab.subjectId) !== String(dto.subjectId)) {
      throw new BadRequestException('Lab นี้ไม่ได้อยู่ในวิชาที่เลือก');
    }
    if (opts.selfJoin && lab.queuePaused) {
      throw new ServiceUnavailableException(
        lab.pausedMessage || 'TA ปิดรับเข้าคิวสำหรับ Lab นี้ชั่วคราว กรุณารอสักครู่',
      );
    }

    let checkpointId: Types.ObjectId | null = null;
    let checkpointName: string | null = null;
    if (dto.checkpointId) {
      const cp = lab.checkpoints?.find(
        (c) => String(c._id) === String(dto.checkpointId),
      );
      if (!cp) throw new BadRequestException('ไม่พบ Checkpoint ใน Lab นี้');
      checkpointId = new Types.ObjectId(dto.checkpointId);
      checkpointName = cp.name;
    } else if (lab.checkpoints && lab.checkpoints.length > 0) {
      throw new BadRequestException('Lab นี้ต้องระบุ Checkpoint');
    }

    // Duplicate prevention: reject if already in active queue
    const existing = await this.queueModel.findOne({
      studentId: dto.studentId.trim(),
      labId: new Types.ObjectId(dto.labId),
      checkpointId: checkpointId ?? null,
      status: { $in: ACTIVE },
    });
    if (existing) {
      throw new BadRequestException(
        'คุณอยู่ในคิวนี้แล้ว (' + (existing.status === 'checking' ? 'กำลังตรวจ' : 'รอตรวจ') + ')',
      );
    }

    const attempt = await this.nextAttempt(
      dto.studentId,
      dto.labId,
      checkpointId,
    );

    const created = await this.queueModel.create({
      subjectId: new Types.ObjectId(dto.subjectId),
      labId: new Types.ObjectId(dto.labId),
      checkpointId,
      studentId: dto.studentId.trim(),
      studentName: dto.studentName.trim(),
      section: dto.section?.trim() ?? '',
      subjectName: subject.name,
      labName: lab.name,
      checkpointName,
      attempt,
      status: 'waiting',
      enqueuedAt: new Date(),
    });
    return created.toObject();
  }

  private async nextAttempt(
    studentId: string,
    labId: string,
    checkpointId: Types.ObjectId | null,
  ) {
    const count = await this.queueModel.countDocuments({
      studentId: studentId.trim(),
      labId: new Types.ObjectId(labId),
      checkpointId,
    });
    return count + 1;
  }

  /** Active queue (waiting + checking). Checking entries float to the top. */
  async getActive(filter: QueueFilter) {
    const q: Record<string, unknown> = { status: { $in: ACTIVE } };
    if (filter.subjectId) q.subjectId = new Types.ObjectId(filter.subjectId);
    if (filter.labId) q.labId = new Types.ObjectId(filter.labId);
    if (filter.checkpointId)
      q.checkpointId = new Types.ObjectId(filter.checkpointId);

    const entries = await this.queueModel
      .find(q)
      .sort({ enqueuedAt: 1 })
      .lean()
      .exec();

    // checking first, then waiting — both by arrival time
    const rank = (s: string) => (s === 'checking' ? 0 : 1);
    return entries.sort(
      (a, b) =>
        rank(a.status) - rank(b.status) ||
        new Date(a.enqueuedAt).getTime() - new Date(b.enqueuedAt).getTime(),
    );
  }

  /** Resolved entries (passed + failed) — History, admin only. */
  async getHistory(filter: QueueFilter) {
    const q: Record<string, unknown> = { status: { $in: DONE } };
    if (filter.subjectId) q.subjectId = new Types.ObjectId(filter.subjectId);
    if (filter.labId) q.labId = new Types.ObjectId(filter.labId);
    if (filter.checkpointId)
      q.checkpointId = new Types.ObjectId(filter.checkpointId);
    if (filter.studentId) q.studentId = filter.studentId.trim();

    return this.queueModel.find(q).sort({ resolvedAt: -1 }).lean().exec();
  }

  private async byId(id: string) {
    const entry = await this.queueModel.findById(id);
    if (!entry) throw new NotFoundException('ไม่พบคิวนี้');
    return entry;
  }

  /** TA calls a waiting student → status becomes "checking". */
  async call(id: string) {
    const entry = await this.byId(id);
    if (entry.status !== 'waiting') {
      throw new BadRequestException('เรียกได้เฉพาะคิวที่กำลังรอ');
    }
    entry.status = 'checking';
    entry.calledAt = new Date();
    await entry.save();
    return entry.toObject();
  }

  /** Skip → send back to the end of the waiting line. */
  async skip(id: string) {
    const entry = await this.byId(id);
    if (!ACTIVE.includes(entry.status as any)) {
      throw new BadRequestException('ข้ามได้เฉพาะคิวที่ยัง active');
    }
    entry.status = 'waiting';
    entry.calledAt = null;
    entry.enqueuedAt = new Date(); // move to the back
    await entry.save();
    return entry.toObject();
  }

  /** Record the result (passed / failed). `resolvedBy` comes from the authenticated TA. */
  async resolve(id: string, dto: ResolveDto, resolvedBy: string) {
    const entry = await this.byId(id);
    if (entry.status === 'passed' || entry.status === 'failed') {
      throw new BadRequestException('คิวนี้บันทึกผลไปแล้ว');
    }
    entry.status = dto.result;
    entry.resolvedAt = new Date();
    entry.resolvedBy = resolvedBy;
    if (!entry.calledAt) entry.calledAt = new Date();
    await entry.save();
    return entry.toObject();
  }

  /**
   * Re-add a (typically failed) student to the queue as a fresh attempt.
   * Copies the snapshot and bumps the attempt counter.
   */
  async requeue(id: string) {
    const prev = await this.byId(id);

    // Prevent duplicate if the student already re-joined on their own
    const existing = await this.queueModel.findOne({
      studentId: prev.studentId,
      labId: prev.labId,
      checkpointId: prev.checkpointId ?? null,
      status: { $in: ACTIVE },
    });
    if (existing) {
      throw new BadRequestException(
        'นักศึกษานี้อยู่ในคิวนี้แล้ว (' +
          (existing.status === 'checking' ? 'กำลังตรวจ' : 'รอตรวจ') +
          ')',
      );
    }

    const attempt = await this.nextAttempt(
      prev.studentId,
      String(prev.labId),
      prev.checkpointId,
    );
    const created = await this.queueModel.create({
      subjectId: prev.subjectId,
      labId: prev.labId,
      checkpointId: prev.checkpointId,
      studentId: prev.studentId,
      studentName: prev.studentName,
      section: prev.section,
      subjectName: prev.subjectName,
      labName: prev.labName,
      checkpointName: prev.checkpointName,
      attempt,
      status: 'waiting',
      enqueuedAt: new Date(),
    });
    return created.toObject();
  }

  async remove(id: string) {
    const deleted = await this.queueModel.findByIdAndDelete(id).lean().exec();
    if (!deleted) throw new NotFoundException('ไม่พบคิวนี้');
    return { deleted: true, id };
  }

  /** Build a CSV summary of resolved entries. */
  async exportCsv(filter: QueueFilter): Promise<string> {
    const rows = await this.getHistory(filter);
    const headers = [
      'รหัสนักศึกษา',
      'ชื่อ-นามสกุล',
      'Section',
      'วิชา',
      'Lab',
      'Checkpoint',
      'ครั้งที่',
      'สถานะ',
      'เวลาเข้าคิว',
      'เวลาตรวจ',
      'ผู้ตรวจ',
    ];
    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const fmt = (d?: Date | null) =>
      d ? new Date(d).toLocaleString('th-TH') : '';
    const statusLabel: Record<string, string> = {
      passed: 'ผ่าน',
      failed: 'ไม่ผ่าน',
    };

    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push(
        [
          r.studentId,
          r.studentName,
          r.section,
          r.subjectName,
          r.labName,
          r.checkpointName ?? '-',
          r.attempt,
          statusLabel[r.status] ?? r.status,
          fmt(r.enqueuedAt),
          fmt(r.resolvedAt),
          r.resolvedBy ?? '',
        ]
          .map(esc)
          .join(','),
      );
    }
    // BOM so Excel reads Thai UTF-8 correctly
    return '﻿' + lines.join('\n');
  }
}
