'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { confirmToast } from '@/lib/confirm-toast';
import type { Subject } from '@/lib/types';

function InlineSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Subject[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'appearance-none flex h-8 rounded-md border border-zinc-700 bg-zinc-950 pl-2.5 pr-7 py-1',
          'text-xs text-white shadow-sm transition-all duration-200 outline-none cursor-pointer',
          'focus:border-zinc-600 focus:ring-1 focus:ring-zinc-500/20 hover:border-zinc-600',
        )}
      >
        <option value="" className="bg-zinc-950 text-white">{placeholder}</option>
        {options.map((s) => (
          <option key={s._id} value={s._id} className="bg-zinc-950 text-white">{s.code}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1.5 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
    </div>
  );
}

export function BulkActionsBar({
  count,
  subjects,
  onActivate,
  onDeactivate,
  onAddToSubject,
  onRemoveFromSubject,
  onDelete,
  onClear,
}: {
  count: number;
  subjects: Subject[];
  onActivate: () => Promise<unknown>;
  onDeactivate: () => Promise<unknown>;
  onAddToSubject: (subjectId: string) => Promise<unknown>;
  onRemoveFromSubject: (subjectId: string) => Promise<unknown>;
  onDelete: () => void;
  onClear: () => void;
}) {
  const [addSubject, setAddSubject] = useState('');
  const [removeSubject, setRemoveSubject] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sticky top-2 z-20 flex flex-wrap items-center gap-2.5 rounded-xl border border-zinc-700 bg-zinc-900/90 backdrop-blur-md px-4 py-3 shadow-xl animate-[fadeSlideDown_0.25s_ease_both]">
      <span className="text-sm font-semibold text-white whitespace-nowrap">
        เลือกแล้ว {count} คน
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          className="h-8 rounded-lg border-zinc-700 bg-zinc-950/40 text-zinc-200 hover:bg-white hover:text-black"
          onClick={() => run(onActivate)}
        >
          เปิดใช้งาน
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          className="h-8 rounded-lg border-zinc-700 bg-zinc-950/40 text-zinc-200 hover:bg-white hover:text-black"
          onClick={() => run(onDeactivate)}
        >
          ปิดใช้งาน
        </Button>

        {subjects.length > 0 && (
          <>
            <div className="flex items-center gap-1.5">
              <InlineSelect value={addSubject} onChange={setAddSubject} options={subjects} placeholder="เพิ่มเข้าวิชา…" />
              <Button
                size="sm"
                variant="outline"
                disabled={busy || !addSubject}
                className="h-8 rounded-lg border-zinc-700 bg-zinc-950/40 text-zinc-200 hover:bg-white hover:text-black disabled:opacity-40"
                onClick={() => run(() => onAddToSubject(addSubject)).then(() => setAddSubject(''))}
              >
                เพิ่ม
              </Button>
            </div>
            <div className="flex items-center gap-1.5">
              <InlineSelect value={removeSubject} onChange={setRemoveSubject} options={subjects} placeholder="นำออกจากวิชา…" />
              <Button
                size="sm"
                variant="outline"
                disabled={busy || !removeSubject}
                className="h-8 rounded-lg border-zinc-700 bg-zinc-950/40 text-zinc-200 hover:bg-white hover:text-black disabled:opacity-40"
                onClick={() => run(() => onRemoveFromSubject(removeSubject)).then(() => setRemoveSubject(''))}
              >
                นำออก
              </Button>
            </div>
          </>
        )}

        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          className="h-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() =>
            confirmToast(`ลบนักศึกษาที่เลือกไว้ ${count} คน ออกจากระบบ?`, onDelete)
          }
        >
          ลบ ({count})
        </Button>
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="ml-auto h-8 rounded-lg text-zinc-500 hover:text-white"
        onClick={onClear}
      >
        <X className="h-3.5 w-3.5 mr-1" />
        ยกเลิกการเลือก
      </Button>
    </div>
  );
}
