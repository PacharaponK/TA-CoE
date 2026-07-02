'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Floating action button students use to self-join the queue; disabled while the lab is paused. */
export function JoinFab({
  paused,
  pausedMessage,
  onOpen,
}: {
  paused: boolean;
  pausedMessage?: string;
  onOpen: () => void;
}) {
  return (
    <>
      {paused && (
        <div className="fixed bottom-24 right-6 z-50 max-w-[220px] rounded-xl border border-orange-500/40 bg-orange-950/90 px-4 py-3 text-right text-xs text-orange-200 shadow-lg backdrop-blur-sm animate-[fadeSlideUp_0.3s_ease_both]">
          ⏸ TA ปิดรับเข้าคิว Lab นี้ชั่วคราว
          {pausedMessage && <p className="mt-1 text-orange-300/80">{pausedMessage}</p>}
        </div>
      )}

      <button
        type="button"
        onClick={onOpen}
        disabled={paused}
        aria-label="เข้าร่วมคิว"
        aria-disabled={paused}
        className={cn(
          'fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full shadow-elevated transition-transform duration-300 group',
          paused
            ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
            : 'bg-white text-black hover:scale-105 active:scale-95',
        )}
      >
        {!paused && (
          <span className="pointer-events-none absolute inset-0 rounded-full bg-white/40 animate-ping opacity-20" />
        )}
        <Plus className="h-6 w-6" />
      </button>
    </>
  );
}
