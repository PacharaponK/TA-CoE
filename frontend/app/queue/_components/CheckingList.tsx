'use client';

import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { fmtTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { QueueEntry } from '@/lib/types';
import { SectionHeader } from './SectionHeader';

export function CheckingList({
  entries,
  myStudentId,
}: {
  entries: QueueEntry[];
  myStudentId?: string | null;
}) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="กำลังตรวจ" count={entries.length} live={entries.length > 0} />

      {entries.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10 px-5 py-5 text-sm text-zinc-500 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-zinc-700 animate-pulse" />
          ยังไม่มีใครกำลังถูกตรวจ
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {entries.map((e) => (
            <Card
              key={e._id}
              className={cn(
                'relative overflow-hidden border border-zinc-500/30 bg-zinc-900/50 backdrop-blur-md shadow-lg shadow-white/5 hover:border-zinc-500/50 transition-all duration-300',
                e.studentId === myStudentId &&
                  'border-emerald-500/50 shadow-emerald-500/10 ring-1 ring-emerald-500/30',
              )}
            >
              <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-white to-zinc-400" />
              <CardContent className="pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <StatusBadge status={e.status} />
                  <span className="text-xs text-zinc-500">
                    เรียกเมื่อ {fmtTime(e.calledAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar name={e.studentName} />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-white">
                      {e.studentName}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {e.studentId}
                      {e.section && ` · กลุ่ม ${e.section}`}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-zinc-500">
                  {e.checkpointName ?? e.labName}
                  {e.attempt > 1 && ` · ครั้งที่ ${e.attempt}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0) || '?';
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-700 bg-zinc-800 text-base font-bold text-zinc-200 shadow-md">
      {initial}
    </span>
  );
}
