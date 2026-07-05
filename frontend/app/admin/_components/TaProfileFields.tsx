'use client';

import { CalendarClock, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Field } from '@/components/ui';
import type { ScheduleEntry } from '@/lib/types';

export interface TaProfileValues {
  email: string;
  facebookName: string;
  facebookUrl: string;
  igName: string;
  statusText: string;
  telegramChatId: string;
  available: boolean;
  showOnContactPage: boolean;
  schedule: ScheduleEntry[];
}

export const inputCn =
  'border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30';

/**
 * The "Contact page" profile fields + weekly schedule editor — shared between
 * admin-editing-any-TA (TaAccountsCard) and self-service editing (admin/profile).
 */
export function TaProfileFields({
  value,
  onChange,
}: {
  value: TaProfileValues;
  onChange: (next: TaProfileValues) => void;
}) {
  function set<K extends keyof TaProfileValues>(key: K, v: TaProfileValues[K]) {
    onChange({ ...value, [key]: v });
  }

  function updateScheduleRow(i: number, patch: Partial<ScheduleEntry>) {
    const next = [...value.schedule];
    next[i] = { ...next[i], ...patch };
    set('schedule', next);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">ข้อมูลติดต่อ</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="อีเมล">
            <Input type="email" value={value.email} onChange={(e) => set('email', e.target.value)} placeholder="ta@example.com" className={inputCn} />
          </Field>
          <Field label="ชื่อ Facebook">
            <Input value={value.facebookName} onChange={(e) => set('facebookName', e.target.value)} placeholder="Somchai Jaidee" className={inputCn} />
          </Field>
          <Field label="ลิงก์ Facebook">
            <Input value={value.facebookUrl} onChange={(e) => set('facebookUrl', e.target.value)} placeholder="https://facebook.com/..." className={inputCn} />
          </Field>
          <Field label="ชื่อ Instagram">
            <Input value={value.igName} onChange={(e) => set('igName', e.target.value)} placeholder="_username" className={inputCn} />
          </Field>
        </div>
      </section>

      <Separator className="bg-white/5" />

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">สถานะการให้คำปรึกษา</h3>
        <Field label="ข้อความสถานะ" hint="ข้อความสั้น ๆ ที่แสดงใต้ Active/Offline">
          <Input value={value.statusText} onChange={(e) => set('statusText', e.target.value)} placeholder="พร้อมให้คำปรึกษาในห้องแล็บ" className={inputCn} />
        </Field>

        <Field
          label="Telegram Chat ID"
          hint="ทัก @userinfobot ใน Telegram เพื่อดู Chat ID ของคุณ — ใส่แล้วจะได้รับแจ้งเตือนทาง Telegram เมื่อมีนักศึกษาเข้าคิว"
        >
          <Input
            value={value.telegramChatId}
            onChange={(e) => set('telegramChatId', e.target.value)}
            placeholder="123456789"
            className={inputCn}
          />
        </Field>

        <div className="flex flex-wrap gap-4 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200">
            <Checkbox
              checked={value.available}
              onCheckedChange={(v) => set('available', v)}
            />
            พร้อมให้คำปรึกษา (Active)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200">
            <Checkbox
              checked={value.showOnContactPage}
              onCheckedChange={(v) => set('showOnContactPage', v)}
            />
            แสดงในหน้าติดต่อ (Public)
          </label>
        </div>
      </section>

      <Separator className="bg-white/5" />

      {/* Schedule editor */}
      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <CalendarClock className="h-3.5 w-3.5" />
          ตารางปฏิบัติงาน
        </h3>

        {value.schedule.length === 0 && (
          <p className="rounded-lg border border-dashed border-zinc-800 px-3 py-3 text-center text-xs text-zinc-500">
            ยังไม่มีตารางปฏิบัติงาน
          </p>
        )}

        <div className="flex flex-col gap-2">
          {value.schedule.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_2fr_auto] items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 p-2.5 transition-colors hover:border-zinc-700"
            >
              <Input
                value={s.day}
                placeholder="วันจันทร์"
                onChange={(e) => updateScheduleRow(i, { day: e.target.value })}
                className={inputCn}
              />
              <Input
                value={s.time}
                placeholder="08:00 – 09:50"
                onChange={(e) => updateScheduleRow(i, { time: e.target.value })}
                className={inputCn}
              />
              <Input
                value={s.note}
                placeholder="วิชา / ห้อง (ไม่บังคับ)"
                onChange={(e) => updateScheduleRow(i, { note: e.target.value })}
                className={inputCn}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 text-zinc-500 hover:bg-destructive/10 hover:text-red-400"
                onClick={() => set('schedule', value.schedule.filter((_, j) => j !== i))}
                aria-label="ลบแถวตารางนี้"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start rounded-full border-white/15 text-zinc-300 hover:bg-white/5 hover:text-white"
          onClick={() => set('schedule', [...value.schedule, { day: '', time: '', note: '' }])}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          เพิ่มตาราง
        </Button>
      </section>
    </div>
  );
}

/** Strips blank rows and trims strings — call before submitting a TaProfileValues payload. */
export function normalizeProfileValues(v: TaProfileValues): TaProfileValues {
  return {
    email: v.email.trim(),
    facebookName: v.facebookName.trim(),
    facebookUrl: v.facebookUrl.trim(),
    igName: v.igName.trim(),
    statusText: v.statusText.trim(),
    telegramChatId: v.telegramChatId.trim(),
    available: v.available,
    showOnContactPage: v.showOnContactPage,
    schedule: v.schedule
      .filter((s) => s.day.trim() && s.time.trim())
      .map((s) => ({ day: s.day.trim(), time: s.time.trim(), note: s.note.trim() })),
  };
}
