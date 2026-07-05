'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui';
import type { ScheduleEntry } from '@/lib/types';

export interface TaProfileValues {
  email: string;
  facebookName: string;
  facebookUrl: string;
  igName: string;
  statusText: string;
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
    <div className="flex flex-col gap-3">
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

      <Field label="ข้อความสถานะ" hint="ข้อความสั้น ๆ ที่แสดงใต้ Active/Offline">
        <Input value={value.statusText} onChange={(e) => set('statusText', e.target.value)} placeholder="พร้อมให้คำปรึกษาในห้องแล็บ" className={inputCn} />
      </Field>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <input type="checkbox" checked={value.available} onChange={(e) => set('available', e.target.checked)} />
          พร้อมให้คำปรึกษา (Active)
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <input type="checkbox" checked={value.showOnContactPage} onChange={(e) => set('showOnContactPage', e.target.checked)} />
          แสดงในหน้าติดต่อ (Public)
        </label>
      </div>

      {/* Schedule editor */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-zinc-300">ตารางปฏิบัติงาน</p>
        {value.schedule.length === 0 && (
          <p className="text-xs text-zinc-500">ยังไม่มีตารางปฏิบัติงาน</p>
        )}
        {value.schedule.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_2fr_auto] items-center gap-2">
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
              className="text-zinc-500 hover:text-red-400 hover:bg-destructive/10 shrink-0"
              onClick={() => set('schedule', value.schedule.filter((_, j) => j !== i))}
            >
              ลบ
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start rounded-full border-white/15 text-zinc-300 hover:bg-white/5 hover:text-white"
          onClick={() => set('schedule', [...value.schedule, { day: '', time: '', note: '' }])}
        >
          + เพิ่มตาราง
        </Button>
      </div>
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
    available: v.available,
    showOnContactPage: v.showOnContactPage,
    schedule: v.schedule
      .filter((s) => s.day.trim() && s.time.trim())
      .map((s) => ({ day: s.day.trim(), time: s.time.trim(), note: s.note.trim() })),
  };
}
