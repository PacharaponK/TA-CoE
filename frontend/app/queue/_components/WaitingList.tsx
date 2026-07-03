'use client';

import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui';
import { waitedMinutes } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { QueueEntry } from '@/lib/types';
import { SectionHeader } from './SectionHeader';

export function WaitingList({
  entries,
  myStudentId,
}: {
  entries: QueueEntry[];
  myStudentId?: string | null;
}) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="รอตรวจ" count={entries.length} />

      {entries.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-5 w-5 text-zinc-400" />}
          title="ไม่มีคิวรอ"
          description="คิวตรวจ Checkpoint ว่างอยู่ขณะนี้"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((e, i) => (
            <Card
              key={e._id}
              className={cn(
                'transition-all duration-300 bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm hover:border-zinc-700',
                i === 0 && 'border-zinc-500/30 bg-gradient-to-b from-zinc-900/20 to-transparent shadow-lg shadow-white/5',
                e.studentId === myStudentId &&
                  'border-emerald-500/50 ring-1 ring-emerald-500/30',
              )}
            >
              <CardContent className="flex items-center gap-4 py-3.5">
                <PositionChip n={i + 1} highlight={i === 0} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white flex items-center gap-2">
                    {e.studentName}
                    {i === 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 border border-zinc-700 animate-pulse">
                        คิวถัดไป
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-zinc-400 mt-0.5">
                    {e.studentId}
                    {e.section && ` · กลุ่ม ${e.section}`}
                    {e.checkpointName && ` · ${e.checkpointName}`}
                    {e.attempt > 1 && ` · ครั้งที่ ${e.attempt}`}
                  </p>
                </div>
                <span className="hidden shrink-0 text-xs text-zinc-500 sm:block">
                  {waitedMinutes(e.enqueuedAt)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function PositionChip({ n, highlight }: { n: number; highlight?: boolean }) {
  return (
    <span
      className={cn(
        'grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold border',
        highlight
          ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
          : 'bg-white/5 text-zinc-400 border-white/5',
      )}
    >
      {n}
    </span>
  );
}
