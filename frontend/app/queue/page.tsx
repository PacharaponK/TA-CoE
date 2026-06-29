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
import RotatingEarth from '@/components/ui/wireframe-dotted-globe';
import { MousePointerClick, CheckCircle2 } from 'lucide-react';

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
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* ── Globe Background ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-[0.16] select-none">
        <RotatingEarth width={2560} height={1440} rounded={false} fullscreen xPosition={0.82} />
      </div>

      {/* Subtle neutral radial glow behind the globe */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[radial-gradient(circle_at_80%_40%,rgba(255,255,255,0.02),transparent_50%)]" />

      {/* Neutral radial glow behind the globe */}
      <div
        className="pointer-events-none fixed animate-[globe-glow-pulse_5s_ease-in-out_infinite] z-0"
        style={{
          left: '82%',
          top: '50%',
          width: '60vmin',
          height: '60vmin',
          marginLeft: '-30vmin',
          marginTop: '-30vmin',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 45%, transparent 70%)',
        }}
      />

      {/* Radar rings */}
      {[0, 1].map((i) => (
        <div
          key={i}
          className="pointer-events-none fixed rounded-full border animate-[sonar_5s_ease-out_infinite] z-0"
          style={{
            left: '82%',
            top: '50%',
            width: '40vmin',
            height: '40vmin',
            marginLeft: '-20vmin',
            marginTop: '-20vmin',
            borderColor: 'rgba(255,255,255,0.05)',
            animationDelay: `${i * 2.5}s`,
          }}
        />
      ))}

      <NavBar />
      
      <main className="container-page relative z-10 flex w-full flex-1 flex-col gap-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 animate-[fadeSlideUp_0.8s_ease_0.1s_both]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur-sm">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80">Live</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">CoE Queue Status</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            คิวตรวจ{' '}
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Checkpoint
            </span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-md">
            เลือกวิชาและ Lab เพื่อแสดงลำดับคิวและสถานะปัจจุบันแบบเรียลไทม์
          </p>
        </div>

        {/* Scope Picker Card */}
        <div className="relative z-20 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-xl backdrop-blur-md">
          <ScopePicker subjects={subjects} labs={labs} scope={scope} onChange={setScope} />
        </div>

        {!ready ? (
          <EmptyState
            icon={<MousePointerClick className="h-5 w-5 text-zinc-400" />}
            title="เลือกวิชาและ Lab"
            description="ระบบจะแสดงคิวปัจจุบันทันทีที่คุณเลือก"
          />
        ) : loading && entries.length === 0 ? (
          <Spinner />
        ) : (
          <div className="flex flex-col gap-8">
            {/* Now checking */}
            <section className="flex flex-col gap-4">
              <SectionHeader
                title="กำลังตรวจ"
                count={checking.length}
                live={checking.length > 0}
              />
              {checking.length === 0 ? (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10 px-5 py-5 text-sm text-zinc-500 backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-zinc-700 animate-pulse" />
                  ยังไม่มีใครกำลังถูกตรวจ
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {checking.map((e) => (
                    <Card
                      key={e._id}
                      className="relative overflow-hidden border border-zinc-500/30 bg-zinc-900/50 backdrop-blur-md shadow-lg shadow-white/5 hover:border-zinc-500/50 transition-all duration-300"
                    >
                      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-white to-zinc-400" />
                      <CardContent className="pt-5">
                        <div className="mb-3 flex items-center justify-between">
                          <StatusBadge status={e.status} />
                          <span className="text-xs text-zinc-500">
                            เรียกเมื่อ {fmtTime(e.calledAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Avatar name={e.studentName} accent />
                          <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-white">
                              {e.studentName}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {e.studentId}
                              {e.section && ` · กลุ่ม ${e.section}`}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-zinc-500">
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
            <section className="flex flex-col gap-4">
              <SectionHeader title="รอตรวจ" count={waiting.length} />
              {waiting.length === 0 ? (
                <EmptyState icon={<CheckCircle2 className="h-5 w-5 text-zinc-400" />} title="ไม่มีคิวรอ" description="คิวตรวจ Checkpoint ว่างอยู่ขณะนี้" />
              ) : (
                <div className="flex flex-col gap-2">
                  {waiting.map((e, i) => (
                    <Card
                      key={e._id}
                      className={cn(
                        'transition-all duration-300 bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm hover:border-zinc-700',
                        i === 0 && 'border-zinc-500/30 bg-gradient-to-b from-zinc-900/20 to-transparent shadow-lg shadow-white/5',
                      )}
                    >
                      <CardContent className="flex items-center gap-4 py-3.5">
                        <PositionChip n={i + 1} highlight={i === 0} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white flex items-center gap-2">
                            {e.studentName}
                            {i === 0 && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 border border-zinc-700 animate-pulse">
                                คิวถัดไป
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-zinc-400 mt-0.5">
                            {e.studentId}
                            {e.section && ` · กลุ่ม ${e.section}`}
                            {e.checkpointName && ` · ${e.checkpointName}`}
                            {e.attempt > 1 && ` · ครั้งที่ ${e.attempt}`}
                          </p>
                        </div>
                        <span className="hidden shrink-0 text-xs text-zinc-500 sm:block">
                          {waitedMinutes(e.enqueuedAt)}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
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
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">{title}</h2>
        {live && <LiveDot />}
      </div>
      <span className="rounded-full bg-white/5 border border-white/5 px-2.5 py-0.5 text-xs text-zinc-400">
        {count} คิว
      </span>
    </div>
  );
}

function PositionChip({ n, highlight }: { n: number; highlight?: boolean }) {
  return (
    <span
      className={cn(
        'grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold border',
        highlight
          ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
          : 'bg-white/5 text-zinc-400 border-white/5',
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
        'grid h-10 w-10 shrink-0 place-items-center rounded-full text-base font-bold border',
        accent 
          ? 'bg-zinc-800 text-zinc-200 border-zinc-700 shadow-md' 
          : 'bg-white/5 text-zinc-400 border-white/5',
      )}
    >
      {initial}
    </span>
  );
}

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  );
}
