'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Clean on/off switch for quickly toggling an entity's `isActive` flag
 * straight from a card, without opening the edit form.
 * `onToggle` receives the desired next state; the parent's reload reconciles.
 */
export function ActiveToggle({
  active,
  onToggle,
  title,
}: {
  active: boolean;
  onToggle: (next: boolean) => Promise<unknown>;
  title?: string;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={title ?? (active ? 'ปิดใช้งาน' : 'เปิดใช้งาน')}
      title={title ?? (active ? 'ปิดใช้งาน' : 'เปิดใช้งาน')}
      disabled={busy}
      onClick={async (e) => {
        e.stopPropagation();
        if (busy) return;
        setBusy(true);
        try { await onToggle(!active); }
        finally { setBusy(false); }
      }}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
        active
          ? 'bg-emerald-500 focus-visible:ring-emerald-500/40'
          : 'bg-zinc-700 focus-visible:ring-zinc-500/40',
        busy ? 'cursor-wait opacity-70' : 'cursor-pointer',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200',
          active ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
