'use client';

import type { QueueEntry } from '@/lib/types';

export function QueueStats({ entries }: { entries: QueueEntry[] }) {
  const waiting  = entries.filter((e) => e.status === 'waiting').length;
  const checking = entries.filter((e) => e.status === 'checking').length;
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {checking > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          กำลังตรวจ {checking} คน
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/5 px-3 py-1 text-xs font-semibold text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
        รอ {waiting} คน
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/5 px-3 py-1 text-xs font-semibold text-zinc-400">
        ทั้งหมด {entries.length} คิว
      </span>
    </div>
  );
}
