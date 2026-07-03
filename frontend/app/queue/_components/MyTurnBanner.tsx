'use client';

import { Bell } from 'lucide-react';
import type { QueueEntry } from '@/lib/types';

export function MyTurnBanner({ entry }: { entry: QueueEntry }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-5 py-4 shadow-lg shadow-emerald-500/10 backdrop-blur-md animate-[fadeSlideDown_0.4s_ease_both]">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
          <Bell className="h-5 w-5 text-emerald-400 animate-pulse" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-emerald-300">
            ถึงคิวของคุณแล้ว — {entry.studentName}
          </p>
          <p className="mt-0.5 truncate text-xs text-emerald-400/80">
            {entry.checkpointName ?? entry.labName} · กรุณาไปที่โต๊ะ TA
          </p>
        </div>
      </div>
    </div>
  );
}
