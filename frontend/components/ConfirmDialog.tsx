'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Blocking confirmation modal — reserved for cascading/irreversible deletes
 * (e.g. deleting a subject or lab also wipes related queue entries) where a
 * dismissible toast is too easy to miss or let time out by accident.
 * For single-record, non-cascading deletes use `confirmToast` instead.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 shadow-elevated backdrop-blur-xl animate-[fadeSlideUp_0.3s_ease_both]">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {description && <p className="mt-2 text-sm text-zinc-400">{description}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            className="rounded-lg border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:bg-white/5 hover:text-white"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            className={cn('rounded-lg bg-red-500/90 font-semibold text-white hover:bg-red-500')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
