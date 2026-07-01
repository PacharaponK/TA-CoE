'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { labsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { PauseCircle, PlayCircle } from 'lucide-react';
import type { Lab } from '@/lib/types';

export function LabPauseCard({
  lab,
  onChanged,
}: {
  lab: Lab | null | undefined;
  onChanged: () => void;
}) {
  const [msgInput, setMsgInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!lab) return null;

  const paused = lab.queuePaused;

  async function handleToggle() {
    if (!lab) return;
    setBusy(true);
    setError('');
    try {
      await labsApi.setPaused(lab._id, !paused, !paused ? msgInput.trim() : '');
      setMsgInput('');
      onChanged();
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
        paused
          ? 'border-orange-500/40 bg-orange-950/20'
          : 'border-zinc-800 bg-zinc-900/30 backdrop-blur-md',
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
              paused
                ? 'bg-orange-500/20 border-orange-500/40'
                : 'bg-zinc-800 border-zinc-700',
            )}
          >
            {paused
              ? <PauseCircle className="h-5 w-5 text-orange-400" />
              : <PlayCircle className="h-5 w-5 text-zinc-400" />}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">
              {paused ? `⏸ หยุดรับคิว "${lab.name}" ชั่วคราว` : `เข้าคิว "${lab.name}" เปิดปกติ`}
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {paused && lab.pausedMessage
                ? lab.pausedMessage
                : 'นักศึกษาจะเข้าคิวเองไม่ได้ — TA ยังเพิ่มคิวมือได้ตามปกติ'}
            </p>
          </div>
        </div>

        <Button
          onClick={handleToggle}
          disabled={busy}
          size="sm"
          className={cn(
            'shrink-0 min-w-[140px] rounded-full text-sm font-semibold transition-all',
            paused
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-orange-600 hover:bg-orange-500 text-white',
          )}
        >
          {busy ? 'กำลังบันทึก…' : paused ? 'เปิดรับคิวนักศึกษา' : 'หยุดรับคิวนักศึกษา'}
        </Button>
      </div>

      {!paused && (
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">
            ข้อความแจ้งนักศึกษา <span className="text-zinc-600">(ไม่บังคับ)</span>
          </label>
          <Input
            placeholder="เช่น TA กำลังตรวจคิวสุดท้ายอยู่ กรุณารอสักครู่"
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            maxLength={300}
            className="h-9 border-zinc-700 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-orange-500/30 text-sm"
          />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
