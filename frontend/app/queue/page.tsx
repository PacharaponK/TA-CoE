'use client';

import { useCallback, useEffect, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { ScopePicker } from '@/components/ScopePicker';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState, Spinner } from '@/components/ui';
import { queueApi } from '@/lib/api';
import { useScope } from '@/lib/useScope';
import { useRealtime } from '@/lib/useRealtime';
import { fmtTime, waitedMinutes } from '@/lib/format';
import type { QueueEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function QueuePage() {
  const { subjects, labs, scope, setScope } = useScope(true);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!scope.subjectId || !scope.labId) { setEntries([]); return; }
    setLoading(true);
    try {
      setEntries(
        await queueApi.active({
          subjectId: scope.subjectId,
          labId: scope.labId,
          checkpointId:
            scope.checkpointId && scope.checkpointId !== '__all__'
              ? scope.checkpointId
              : undefined,
        }),
      );
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => { reload(); }, [reload]);
  useRealtime(reload);

  const checking = entries.filter((e) => e.status === 'checking');
  const waiting  = entries.filter((e) => e.status === 'waiting');
  const ready    = scope.subjectId && scope.labId;

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="container-page flex w-full flex-col gap-8 py-8">

        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <ScopePicker subjects={subjects} labs={labs} scope={scope} onChange={setScope} />
          </CardContent>
        </Card>

        {!ready ? (
          <EmptyState
            icon="👋"
            title="เลือกวิชาและ Lab"
            description="ระบบจะแสดงคิวปัจจุบันทันทีที่คุณเลือก"
          />
        ) : loading && entries.length === 0 ? (
          <Spinner />
        ) : (
          <>
            {/* Now checking */}
            <section className="flex flex-col gap-3">
              <SectionHeader
                title="กำลังตรวจ"
                count={checking.length}
                live={checking.length > 0}
              />
              {checking.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex items-center gap-3 py-5 text-sm text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    ยังไม่มีใครกำลังถูกตรวจ
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {checking.map((e) => (
                    <Card
                      key={e._id}
                      className="relative overflow-hidden border-primary/30 shadow-soft"
                    >
                      <span className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-primary" />
                      <CardContent className="pt-5">
                        <div className="mb-3 flex items-center justify-between">
                          <StatusBadge status={e.status} />
                          <span className="text-xs text-muted-foreground">
                            เรียกเมื่อ {fmtTime(e.calledAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Avatar name={e.studentName} accent />
                          <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-foreground">
                              {e.studentName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {e.studentId}
                              {e.section && ` · กลุ่ม ${e.section}`}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          {e.checkpointName ?? e.labName}
                          {e.attempt > 1 && ` · ครั้งที่ ${e.attempt}`}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Waiting */}
            <section className="flex flex-col gap-3">
              <SectionHeader title="รอตรวจ" count={waiting.length} />
              {waiting.length === 0 ? (
                <EmptyState icon="✅" title="ไม่มีคิวรอ" />
              ) : (
                <div className="flex flex-col gap-2">
                  {waiting.map((e, i) => (
                    <Card
                      key={e._id}
                      className={cn(
                        'transition-shadow',
                        i === 0 && 'ring-1 ring-primary/30 shadow-soft',
                      )}
                    >
                      <CardContent className="flex items-center gap-4 py-3.5">
                        <PositionChip n={i + 1} highlight={i === 0} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {e.studentName}
                            {i === 0 && (
                              <span className="ml-2 align-middle text-xs font-semibold uppercase tracking-wider text-primary">
                                คิวถัดไป
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {e.studentId}
                            {e.section && ` · กลุ่ม ${e.section}`}
                            {e.checkpointName && ` · ${e.checkpointName}`}
                            {e.attempt > 1 && ` · ครั้งที่ ${e.attempt}`}
                          </p>
                        </div>
                        <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                          {waitedMinutes(e.enqueuedAt)}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────

function SectionHeader({
  title,
  count,
  live,
}: {
  title: string;
  count: number;
  live?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {live && <LiveDot />}
      </div>
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
        {count} คิว
      </span>
    </div>
  );
}

function PositionChip({ n, highlight }: { n: number; highlight?: boolean }) {
  return (
    <span
      className={cn(
        'grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold',
        highlight
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground',
      )}
    >
      {n}
    </span>
  );
}

function Avatar({ name, accent }: { name: string; accent?: boolean }) {
  const initial = name.trim().charAt(0) || '?';
  return (
    <span
      className={cn(
        'grid h-10 w-10 shrink-0 place-items-center rounded-full text-base font-semibold',
        accent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
      )}
    >
      {initial}
    </span>
  );
}

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-green" />
    </span>
  );
}
