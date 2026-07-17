'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState, Spinner } from '@/components/ui';
import { labsApi } from '@/lib/api';
import { useAction } from '@/lib/useAction';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { cn } from '@/lib/utils';
import type { Lab, Subject } from '@/lib/types';
import { LabForm } from './LabForm';
import { ActiveToggle } from './ActiveToggle';

export function LabsPanel({
  subject,
  onError,
}: {
  subject: Subject;
  onError: (msg: string) => void;
}) {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLab, setEditLab] = useState<Lab | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lab | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try { setLabs(await labsApi.list(subject._id, false)); }
    finally { setLoading(false); }
  }, [subject._id]);

  useEffect(() => { reload(); }, [reload]);

  const run = useAction(reload, onError);

  const toggleActive = useCallback(async (lab: Lab, next: boolean) => {
    onError('');
    // Optimistic: flip locally now, no spinner/refetch.
    setLabs((prev) => prev.map((x) => (x._id === lab._id ? { ...x, isActive: next } : x)));
    try {
      await labsApi.update(lab._id, { isActive: next });
    } catch (e) {
      // Revert on failure.
      setLabs((prev) => prev.map((x) => (x._id === lab._id ? { ...x, isActive: !next } : x)));
      onError((e as Error).message);
    }
  }, [onError]);

  const nextOrder = labs.length > 0 ? Math.max(...labs.map((l) => l.order)) + 1 : 1;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
          Lab ใน {subject.code}
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-white/15 text-zinc-300 hover:bg-white/5 hover:text-white"
          onClick={() => { setEditLab(null); setShowForm((s) => !s); }}
        >
          + เพิ่ม Lab
        </Button>
      </div>

      {showForm && !editLab && (
        <LabForm
          defaultOrder={nextOrder}
          onCancel={() => setShowForm(false)}
          onSubmit={async (data) => {
            if (await run(() => labsApi.create({ ...data, subjectId: subject._id })))
              setShowForm(false);
          }}
        />
      )}

      {loading ? (
        <Spinner />
      ) : labs.length === 0 ? (
        <EmptyState title="ยังไม่มี Lab" />
      ) : (
        <div className="flex flex-col gap-2">
          {labs.map((l) =>
            editLab?._id === l._id ? (
              <LabForm
                key={l._id}
                initial={l}
                onCancel={() => setEditLab(null)}
                onSubmit={async (data) => {
                  if (await run(() => labsApi.update(l._id, data))) setEditLab(null);
                }}
              />
            ) : (
              <Card
                key={l._id}
                className={cn(
                  'transition-all duration-300 bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm hover:border-zinc-700',
                  !l.isActive && 'opacity-50',
                )}
              >
                <CardContent className="flex items-start justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {l.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      ลำดับ {l.order} · {l.checkpoints.length ? `${l.checkpoints.length} checkpoint` : 'ไม่มี checkpoint'}
                    </p>
                    {l.checkpoints.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {l.checkpoints.map((c) => (
                          <Badge
                            key={c._id}
                            variant="secondary"
                            className="text-[11px] font-normal bg-zinc-900 border border-white/5 text-zinc-300"
                          >
                            {c.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-zinc-400 hover:text-white"
                      onClick={() => { setShowForm(false); setEditLab(l); }}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-zinc-500 hover:text-red-400 hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(l)}
                    >
                      ลบ
                    </Button>
                    <ActiveToggle
                      active={l.isActive}
                      onToggle={(next) => toggleActive(l, next)}
                      title={l.isActive ? 'ปิดใช้งาน Lab นี้' : 'เปิดใช้งาน Lab นี้'}
                    />
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`ลบ ${deleteTarget?.name}?`}
        description="คิวทั้งหมดของ Lab นี้จะถูกลบไปด้วย การกระทำนี้ไม่สามารถย้อนกลับได้"
        confirmLabel="ลบ Lab"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          const target = deleteTarget!;
          setDeleteTarget(null);
          run(() => labsApi.remove(target._id));
        }}
      />
    </section>
  );
}
