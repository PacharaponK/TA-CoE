'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui';
import type { Checkpoint, Lab } from '@/lib/types';

export function LabForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Lab;
  onSubmit: (data: Partial<Lab>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [order, setOrder] = useState(String(initial?.order ?? 0));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [checkpoints, setCheckpoints] = useState<Array<{ _id?: string; name: string }>>(
    initial?.checkpoints.map((c) => ({ _id: c._id, name: c.name })) ?? [],
  );
  const [busy, setBusy] = useState(false);

  const inputCn = 'border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30';

  function updateCheckpoint(i: number, value: string) {
    const next = [...checkpoints];
    next[i] = { ...next[i], name: value };
    setCheckpoints(next);
  }

  return (
    <Card className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-xl relative overflow-hidden">
      <CardContent className="pt-5">
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await onSubmit({
                name: name.trim(),
                order: Number(order) || 0,
                isActive,
                checkpoints: checkpoints
                  .filter((c) => c.name.trim())
                  .map((c, i) => ({ _id: c._id, name: c.name.trim(), order: i })) as Checkpoint[],
              });
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-[2fr_0.5fr]">
            <Field label="ชื่อ Lab">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lab 3 — Linked List" className={inputCn} />
            </Field>
            <Field label="ลำดับ">
              <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className={inputCn} />
            </Field>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-zinc-300">Checkpoints</p>
            {checkpoints.length === 0 && (
              <p className="text-xs text-zinc-500">ไม่มี checkpoint — คิวจะผูกกับ Lab โดยตรง</p>
            )}
            {checkpoints.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={c.name}
                  placeholder={`CP${i + 1} — …`}
                  onChange={(e) => updateCheckpoint(i, e.target.value)}
                  className={inputCn}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-zinc-500 hover:text-red-400 hover:bg-destructive/10 shrink-0"
                  onClick={() => setCheckpoints(checkpoints.filter((_, j) => j !== i))}
                >
                  ลบ
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start rounded-full border-white/15 text-zinc-300 hover:bg-white/5 hover:text-white"
              onClick={() => setCheckpoints([...checkpoints, { name: '' }])}
            >
              + เพิ่ม Checkpoint
            </Button>
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            เปิดใช้งาน Lab นี้
          </label>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={busy || !name.trim()}
              className="rounded-full bg-white text-black hover:bg-white/90 font-semibold"
            >
              {busy ? 'กำลังบันทึก…' : 'บันทึก'}
            </Button>
            <Button type="button" variant="ghost" className="text-zinc-500 hover:text-white" onClick={onCancel}>
              ยกเลิก
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
