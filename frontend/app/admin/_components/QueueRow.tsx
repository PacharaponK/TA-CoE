'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { queueApi } from '@/lib/api';
import { fmtTime, waitedMinutes } from '@/lib/format';
import type { QueueEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

export function QueueRow({
  entry: e,
  index,
  onAction,
}: {
  entry: QueueEntry;
  index: number;
  onAction: (fn: () => Promise<unknown>) => void;
}) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm hover:border-zinc-700',
        e.status === 'checking' &&
          'border-zinc-500/30 bg-gradient-to-b from-zinc-900/20 to-transparent shadow-lg shadow-white/5',
      )}
    >
      {e.status === 'checking' && (
        <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-white to-zinc-400" />
      )}
      <CardContent className="flex flex-col gap-3 py-4 pl-5 sm:flex-row sm:items-center">
        {/* Student info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className={cn(
              'grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold border',
              e.status === 'checking'
                ? 'bg-zinc-800 text-zinc-200 border-zinc-700 shadow-md'
                : 'bg-white/5 text-zinc-400 border-white/5',
            )}
          >
            {index}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {e.studentName}
              <span className="ml-1.5 font-normal text-zinc-400">· {e.studentId}</span>
              {e.attempt > 1 && (
                <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-xs font-bold text-amber-400">
                  ครั้งที่ {e.attempt}
                </span>
              )}
            </p>
            <p className="truncate text-xs text-zinc-400 mt-0.5">
              {e.section && `กลุ่ม ${e.section} · `}
              {e.checkpointName ?? e.labName}
              {' · '}
              {e.status === 'checking'
                ? `เรียกเมื่อ ${fmtTime(e.calledAt)}`
                : waitedMinutes(e.enqueuedAt)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <StatusBadge status={e.status} />

          {e.status === 'waiting' && (
            <Button
              size="sm"
              className="rounded-full bg-white hover:bg-zinc-200 text-black font-semibold"
              onClick={() => onAction(() => queueApi.call(e._id))}
            >
              เรียกตรวจ
            </Button>
          )}

          {e.status === 'checking' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-accent-green/40 text-accent-green hover:bg-accent-green/10"
                onClick={() => onAction(() => queueApi.resolve(e._id, 'passed'))}
              >
                ✓ ผ่าน
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => onAction(() => queueApi.resolve(e._id, 'failed'))}
              >
                ✗ ไม่ผ่าน
              </Button>
            </>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="text-zinc-500 hover:text-white"
            onClick={() => onAction(() => queueApi.skip(e._id))}
          >
            ข้าม
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-zinc-500 hover:text-red-400"
            onClick={() => {
              if (confirm(`ลบคิวของ ${e.studentName}?`))
                onAction(() => queueApi.remove(e._id));
            }}
          >
            ลบ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
