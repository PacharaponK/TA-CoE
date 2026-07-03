'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState, Spinner } from '@/components/ui';
import { MessageSquare, Mail, MailOpen, Trash2 } from 'lucide-react';
import { feedbackApi } from '@/lib/api';
import { useAction } from '@/lib/useAction';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useRealtime } from '@/lib/useRealtime';
import { fmtDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Feedback, FeedbackStatus } from '@/lib/types';

const FILTERS: { value: FeedbackStatus | ''; label: string }[] = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'new', label: 'ยังไม่อ่าน' },
  { value: 'read', label: 'อ่านแล้ว' },
];

function Manager() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState<FeedbackStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Feedback | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await feedbackApi.list(filter || undefined));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { reload(); }, [reload]);
  useRealtime(reload);

  const run = useAction(reload, setError);

  const newCount = useMemo(
    () => items.filter((f) => f.status === 'new').length,
    [items],
  );

  return (
    <main className="container-page flex w-full flex-1 flex-col gap-8 py-8 relative z-10 animate-[fadeIn_0.5s_ease_both]">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900/40 to-zinc-950 p-6 sm:p-8 shadow-2xl animate-[fadeSlideDown_0.6s_ease_both]">
        <div className="absolute top-0 right-0 h-48 w-48 bg-zinc-500/10 rounded-full blur-[80px]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-300 shadow-lg backdrop-blur-md">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                ข้อเสนอแนะ
              </h1>
              <p className="mt-1.5 text-sm text-zinc-400 font-medium">
                ข้อเสนอแนะและคำติชมจากนักศึกษา
                {newCount > 0 && ` · ยังไม่อ่าน ${newCount} รายการ`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm p-4 flex flex-wrap gap-2 animate-[fadeSlideUp_0.8s_ease_0.2s_both]">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
              filter === f.value
                ? 'bg-white text-black'
                : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-5 w-5 text-zinc-400" />}
          title="ยังไม่มีข้อเสนอแนะ"
          description="ข้อเสนอแนะที่นักศึกษาส่งเข้ามาจะปรากฏที่นี่"
        />
      ) : (
        <div className="flex flex-col gap-3 animate-[fadeSlideUp_0.8s_ease_0.2s_both]">
          {items.map((f) => (
            <Card
              key={f._id}
              className={cn(
                'bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm transition-all',
                f.status === 'new' && 'border-white/20',
              )}
            >
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {f.status === 'new' && (
                      <Badge className="bg-white text-black">ใหม่</Badge>
                    )}
                    <span className="text-sm font-semibold text-white">
                      {f.studentName || 'ไม่ระบุชื่อ'}
                    </span>
                    {f.studentId && (
                      <span className="font-mono text-xs text-zinc-500">{f.studentId}</span>
                    )}
                    {f.subjectName && (
                      <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-700">
                        {f.subjectName}
                      </Badge>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-zinc-500">{fmtDateTime(f.createdAt)}</span>
                </div>

                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{f.message}</p>

                <div className="flex items-center justify-end gap-2 border-t border-zinc-800/50 pt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-zinc-400 hover:text-white rounded-full"
                    onClick={() =>
                      run(() => feedbackApi.updateStatus(f._id, f.status === 'new' ? 'read' : 'new'))
                    }
                  >
                    {f.status === 'new' ? (
                      <>
                        <MailOpen className="h-4 w-4" /> ทำเครื่องหมายว่าอ่านแล้ว
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" /> ทำเครื่องหมายว่ายังไม่อ่าน
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full"
                    onClick={() => setDeleteTarget(f)}
                  >
                    <Trash2 className="h-4 w-4" /> ลบ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="ลบข้อเสนอแนะนี้ใช่หรือไม่?"
        description="ข้อความนี้จะถูกลบออกอย่างถาวรและไม่สามารถกู้คืนได้"
        confirmLabel="ลบ"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          const target = deleteTarget!;
          setDeleteTarget(null);
          run(() => feedbackApi.remove(target._id));
        }}
      />
    </main>
  );
}

export default function FeedbackPage() {
  return <Manager />;
}
