'use client';

import { toast } from 'sonner';

/** Non-blocking replacement for `window.confirm()` — shows a sonner toast with confirm/cancel actions. */
export function confirmToast(
  message: string,
  onConfirm: () => void,
  opts?: { confirmLabel?: string },
) {
  toast(message, {
    duration: 8000,
    action: {
      label: opts?.confirmLabel ?? 'ยืนยัน',
      onClick: onConfirm,
    },
    cancel: {
      label: 'ยกเลิก',
      onClick: () => {},
    },
  });
}
