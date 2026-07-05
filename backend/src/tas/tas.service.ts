import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Ta, TaDocument } from './ta.schema';
import { CreateTaDto, UpdateOwnProfileDto, UpdateTaDto } from './dto';

const SALT_ROUNDS = 10;

@Injectable()
export class TasService implements OnModuleInit {
  private readonly logger = new Logger(TasService.name);

  constructor(@InjectModel(Ta.name) private readonly taModel: Model<TaDocument>) {}

  /** First boot: seed one admin TA from ADMIN_SECRET so there's always a way in. */
  async onModuleInit() {
    const count = await this.taModel.countDocuments();
    if (count > 0) return;

    const secret = process.env.ADMIN_SECRET;
    if (!secret) {
      this.logger.warn(
        'No TA accounts exist and ADMIN_SECRET is not set — cannot bootstrap an admin account.',
      );
      return;
    }
    const passwordHash = await bcrypt.hash(secret, SALT_ROUNDS);
    await this.taModel.create({
      username: 'admin',
      passwordHash,
      displayName: 'Admin',
      role: 'admin',
      isActive: true,
    });
    this.logger.log(
      'Bootstrapped initial TA account — username: "admin", password: ADMIN_SECRET (.env)',
    );
  }

  async validateCredentials(username: string, password: string) {
    const ta = await this.taModel.findOne({
      username: username.trim(),
      isActive: true,
    });
    if (!ta) return null;
    const ok = await bcrypt.compare(password, ta.passwordHash);
    return ok ? ta : null;
  }

  async findAll() {
    const tas = await this.taModel.find().sort({ createdAt: 1 }).lean().exec();
    return tas.map((t) => this.sanitize(t));
  }

  /** Public Contact-page listing — only opted-in, active TAs; no auth fields. */
  async findPublic() {
    const tas = await this.taModel
      .find({ showOnContactPage: true, isActive: true })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
    return tas.map((t) => ({
      id: String(t._id),
      displayName: t.displayName,
      email: t.email,
      facebookName: t.facebookName,
      facebookUrl: t.facebookUrl,
      igName: t.igName,
      statusText: t.statusText,
      available: t.available,
      schedule: t.schedule,
    }));
  }

  async create(dto: CreateTaDto) {
    const existing = await this.taModel.findOne({ username: dto.username.trim() });
    if (existing) throw new BadRequestException('มีชื่อผู้ใช้นี้อยู่แล้ว');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const created = await this.taModel.create({
      username: dto.username.trim(),
      passwordHash,
      displayName: dto.displayName.trim(),
      role: dto.role,
      isActive: true,
      email: dto.email?.trim() ?? '',
      facebookName: dto.facebookName?.trim() ?? '',
      facebookUrl: dto.facebookUrl?.trim() ?? '',
      igName: dto.igName?.trim() ?? '',
      statusText: dto.statusText?.trim() ?? '',
      telegramChatId: dto.telegramChatId?.trim() ?? '',
      available: dto.available ?? true,
      showOnContactPage: dto.showOnContactPage ?? false,
      schedule: dto.schedule ?? [],
    });
    return this.sanitize(created.toObject());
  }

  async update(id: string, dto: UpdateTaDto) {
    const ta = await this.taModel.findById(id);
    if (!ta) throw new NotFoundException('ไม่พบผู้ใช้นี้');

    const demoting = dto.role === 'ta' && ta.role === 'admin';
    const deactivating = dto.isActive === false && ta.isActive;
    if (demoting || deactivating) await this.assertNotLastAdmin(ta._id);

    if (dto.role !== undefined) ta.role = dto.role;
    if (dto.isActive !== undefined) ta.isActive = dto.isActive;
    if (dto.password) ta.passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    this.applyProfileFields(ta, dto);

    await ta.save();
    return this.sanitize(ta.toObject());
  }

  /** A TA editing their own contact profile — no username/password/role/isActive access. */
  async findOwn(id: string) {
    const ta = await this.taModel.findById(id).lean();
    if (!ta) throw new NotFoundException('ไม่พบผู้ใช้นี้');
    return this.sanitize(ta);
  }

  async updateOwnProfile(id: string, dto: UpdateOwnProfileDto) {
    const ta = await this.taModel.findById(id);
    if (!ta) throw new NotFoundException('ไม่พบผู้ใช้นี้');

    this.applyProfileFields(ta, dto);

    await ta.save();
    return this.sanitize(ta.toObject());
  }

  /** Shared field-copy logic for the contact-profile fields, used by both admin and self edits. */
  private applyProfileFields(
    ta: TaDocument,
    dto: UpdateOwnProfileDto,
  ) {
    if (dto.displayName !== undefined) ta.displayName = dto.displayName.trim();
    if (dto.email !== undefined) ta.email = dto.email.trim();
    if (dto.facebookName !== undefined) ta.facebookName = dto.facebookName.trim();
    if (dto.facebookUrl !== undefined) ta.facebookUrl = dto.facebookUrl.trim();
    if (dto.igName !== undefined) ta.igName = dto.igName.trim();
    if (dto.statusText !== undefined) ta.statusText = dto.statusText.trim();
    if (dto.telegramChatId !== undefined) ta.telegramChatId = dto.telegramChatId.trim();
    if (dto.available !== undefined) ta.available = dto.available;
    if (dto.showOnContactPage !== undefined) ta.showOnContactPage = dto.showOnContactPage;
    if (dto.schedule !== undefined)
      ta.schedule = dto.schedule.map((s) => ({
        day: s.day.trim(),
        time: s.time.trim(),
        note: s.note?.trim() ?? '',
      }));
  }

  async remove(id: string) {
    const ta = await this.taModel.findById(id);
    if (!ta) throw new NotFoundException('ไม่พบผู้ใช้นี้');
    if (ta.role === 'admin') await this.assertNotLastAdmin(ta._id);

    await this.taModel.findByIdAndDelete(id);
    return { deleted: true, id };
  }

  /** Chat ids of active TAs who've opted in to Telegram notifications. */
  async getNotifiableTelegramChatIds(): Promise<string[]> {
    const tas = await this.taModel
      .find({ isActive: true, telegramChatId: { $nin: ['', null] } })
      .select('telegramChatId')
      .lean()
      .exec();
    return tas.map((t) => t.telegramChatId).filter((id): id is string => !!id);
  }

  /** Guards against locking everyone out by demoting/deactivating/deleting the only admin. */
  private async assertNotLastAdmin(excludeId: unknown) {
    const otherActiveAdmins = await this.taModel.countDocuments({
      _id: { $ne: excludeId },
      role: 'admin',
      isActive: true,
    });
    if (otherActiveAdmins === 0) {
      throw new BadRequestException('ต้องมี Admin ที่ active อย่างน้อย 1 คนเสมอ');
    }
  }

  private sanitize<T extends { passwordHash: string }>(ta: T): Omit<T, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...rest } = ta;
    return rest;
  }
}
