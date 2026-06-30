'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { systemConfigApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ShieldOff, ShieldCheck } from 'lucide-react';

export function KillSwitchCard({
  queueDisabled,
  disabledMessage,
}: {
  queueDisabled: boolean;
  disabledMessage: string;
}) {
  const [msgInput, setMsgInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleToggle() {
    setBusy(true);
    setError('');
    try {
      const next = !queueDisabled;
      await systemConfigApi.set(next, next ? msgInput.trim() : '');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        'relative rounded-xl border p-5 shadow-lg transition-all duration-300',
        queueDisabled
          ? 'border-red-500/40 bg-red-950/30'
          : 'border-zinc-800 bg-zinc-900/30 backdrop-blur-md',
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Status icon + label */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
              queueDisabled
                ? 'bg-red-500/20 border-red-500/40'
                : 'bg-zinc-800 border-zinc-700',
            )}
          >
            {queueDisabled
              ? <ShieldOff className="h-5 w-5 text-red-400" />
              : <ShieldCheck className="h-5 w-5 text-zinc-400" />}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">
              {queueDisabled ? '⚠️ ระบบคิวถูกปิดชั่วคราว' : 'ระบบคิวทำงานปกติ'}
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {queueDisabled && disabledMessage
                ? disabledMessage
                : 'ปิดคิวฉุกเฉินเพื่อแจ้งนักศึกษาทันที'}
            </p>
          </div>
        </div>

        <Button
          id="kill-switch-toggle"
          onClick={handleToggle}
          disabled={busy}
          variant={queueDisabled ? 'default' : 'destructive'}
          size="sm"
          className={cn(
            'shrink-0 min-w-[120px] rounded-full text-sm font-semibold transition-all',
            queueDisabled
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-red-600 hover:bg-red-500 text-white',
          )}
        >
          {busy ? 'กำลังบันทึก…' : queueDisabled ? 'เปิดระบบคิว' : 'ปิดระบบคิว'}
        </Button>
      </div>

      {/* Pre-disable message field */}
      {!queueDisabled && (
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">
            ข้อความแจ้งนักศึกษา <span className="text-zinc-600">(ไม่บังคับ)</span>
          </label>
          <Input
            id="kill-switch-message"
            placeholder="เช่น ระบบจะกลับมาในอีก 30 นาที"
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            maxLength={300}
            className="h-9 border-zinc-700 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-red-500/30 text-sm"
          />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
