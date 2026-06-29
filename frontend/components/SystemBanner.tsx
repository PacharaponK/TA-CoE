'use client';

import { useCallback, useEffect, useState } from 'react';
import { systemConfigApi } from '@/lib/api';
import { useRealtime } from '@/lib/useRealtime';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Global banner that appears on ALL pages whenever an admin enables the
 * queue kill-switch. Hydrates from the API on mount and updates in
 * real-time via WebSocket — no page refresh required.
 */
export function SystemBanner() {
  const [disabled, setDisabled] = useState(false);
  const [message, setMessage] = useState('');
  const [dismissed, setDismissed] = useState(false);

  // Hydrate initial state from the server
  useEffect(() => {
    systemConfigApi.get().then((cfg) => {
      setDisabled(cfg.queueDisabled);
      setMessage(cfg.disabledMessage);
    }).catch(() => { /* silent — non-critical */ });
  }, []);

  // Re-show banner if it comes back on after being dismissed
  const handleSystem = useCallback(
    (cfg: { queueDisabled: boolean; disabledMessage: string }) => {
      setDisabled(cfg.queueDisabled);
      setMessage(cfg.disabledMessage);
      if (cfg.queueDisabled) setDismissed(false); // always re-show when toggled on
    },
    [],
  );

  // Noop queue reload — banner doesn't need to reload queue entries
  const noop = useCallback(() => {}, []);
  useRealtime(noop, handleSystem);

  if (!disabled || dismissed) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'fixed top-0 inset-x-0 z-[9999] flex items-start gap-3 px-4 py-3',
        'bg-red-600/95 backdrop-blur-sm shadow-lg border-b border-red-500/60',
        'animate-[fadeSlideDown_0.4s_ease_both]',
      )}
    >
      {/* Icon */}
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-white" aria-hidden />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white leading-snug">
          ⚠️ ระบบคิวปิดชั่วคราว
        </p>
        {message && (
          <p className="mt-0.5 text-xs text-red-100 leading-relaxed">{message}</p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="ปิดการแจ้งเตือน"
        className="shrink-0 rounded-full p-1 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
