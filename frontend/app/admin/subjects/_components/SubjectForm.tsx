'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui';
import type { Subject } from '@/lib/types';

export function SubjectForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Subject;
  onSubmit: (data: Partial<Subject>) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initial?.code ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [semester, setSemester] = useState(initial?.semester ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [busy, setBusy] = useState(false);

  const inputCn = 'border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30';
  const canSubmit = code.trim() && name.trim() && semester.trim();

  return (
    <Card className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-xl relative overflow-hidden">
      <CardContent className="pt-5">
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try { await onSubmit({ code: code.trim(), name: name.trim(), semester: semester.trim(), isActive }); }
            finally { setBusy(false); }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="รหัสวิชา">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CS101" className={inputCn} />
            </Field>
            <Field label="ชื่อวิชา">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Programming Fundamentals" className={inputCn} />
            </Field>
            <Field label="ภาคเรียน">
              <Input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="2026/1" className={inputCn} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            เปิดใช้งานวิชานี้
          </label>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={busy || !canSubmit}
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
