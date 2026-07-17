'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState, Spinner } from '@/components/ui';
import { subjectsApi } from '@/lib/api';
import { useAction } from '@/lib/useAction';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { Subject } from '@/lib/types';
import { SubjectForm } from './_components/SubjectForm';
import { LabsPanel } from './_components/LabsPanel';
import { ActiveToggle } from './_components/ActiveToggle';
import { cn } from '@/lib/utils';
import { BookOpen, LayoutGrid, Search, ChevronRight, X } from 'lucide-react';

function getSubjectColor(code: string) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  const presets = [
    { bg: 'bg-emerald-950/20', border: 'border-emerald-800/30', text: 'text-emerald-400', dot: 'bg-emerald-400', ring: 'border-emerald-500/50 shadow-emerald-950/15' },
    { bg: 'bg-indigo-950/25', border: 'border-indigo-800/30', text: 'text-indigo-400', dot: 'bg-indigo-400', ring: 'border-indigo-500/50 shadow-indigo-950/15' },
    { bg: 'bg-amber-950/20', border: 'border-amber-800/30', text: 'text-amber-400', dot: 'bg-amber-400', ring: 'border-amber-500/50 shadow-amber-950/15' },
    { bg: 'bg-rose-950/20', border: 'border-rose-800/30', text: 'text-rose-400', dot: 'bg-rose-400', ring: 'border-rose-500/50 shadow-rose-950/15' },
    { bg: 'bg-cyan-950/20', border: 'border-cyan-800/30', text: 'text-cyan-400', dot: 'bg-cyan-400', ring: 'border-cyan-500/50 shadow-cyan-950/15' },
    { bg: 'bg-violet-950/25', border: 'border-violet-800/30', text: 'text-violet-400', dot: 'bg-violet-400', ring: 'border-violet-500/50 shadow-violet-950/15' },
    { bg: 'bg-orange-950/20', border: 'border-orange-800/30', text: 'text-orange-400', dot: 'bg-orange-400', ring: 'border-orange-500/50 shadow-orange-950/15' },
  ];
  const index = Math.abs(hash) % presets.length;
  return presets[index];
}

function StatPill({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 backdrop-blur-md">
      <span className={cn('text-lg font-bold tabular-nums leading-none', accent ?? 'text-white')}>{value}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
    </div>
  );
}

function Manager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string>('');
  const [query, setQuery] = useState('');
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try { setSubjects(await subjectsApi.list(false)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const run = useAction(reload, setError);

  const toggleActive = useCallback(async (subject: Subject, next: boolean) => {
    setError('');
    setSelected(subject._id); // reveal this subject's labs when its switch is used
    // Optimistic: flip locally now, no spinner/refetch.
    setSubjects((prev) => prev.map((x) => (x._id === subject._id ? { ...x, isActive: next } : x)));
    try {
      await subjectsApi.update(subject._id, { isActive: next });
    } catch (e) {
      // Revert on failure.
      setSubjects((prev) => prev.map((x) => (x._id === subject._id ? { ...x, isActive: !next } : x)));
      setError((e as Error).message);
    }
  }, []);

  const activeCount = useMemo(() => subjects.filter((s) => s.isActive).length, [subjects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.semester.toLowerCase().includes(q),
    );
  }, [subjects, query]);

  return (
    <main className="container-page flex w-full flex-1 flex-col gap-8 py-8 animate-[fadeIn_0.5s_ease_both]">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900/40 to-zinc-950 p-6 sm:p-8 shadow-2xl animate-[fadeSlideDown_0.6s_ease_both]">
        <div className="absolute top-0 right-0 h-48 w-48 bg-zinc-500/10 rounded-full blur-[80px]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-300 shadow-lg backdrop-blur-md">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                วิชา &amp; ปฏิบัติการ
              </h1>
              <p className="mt-1.5 text-sm text-zinc-400 font-medium">
                จัดการและตรวจสอบข้อมูลรายวิชา, ปฏิบัติการ และ Checkpoint ในระบบคิวปฏิบัติการ
              </p>
            </div>
          </div>
          {!loading && subjects.length > 0 && (
            <div className="flex shrink-0 gap-2.5">
              <StatPill label="ทั้งหมด" value={subjects.length} />
              <StatPill label="เปิดใช้งาน" value={activeCount} accent="text-emerald-400" />
              {subjects.length - activeCount > 0 && (
                <StatPill label="ปิดใช้งาน" value={subjects.length - activeCount} accent="text-zinc-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {error && <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

      {/* Subject list */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 border-b border-zinc-800/60 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">รายวิชาทั้งหมด</h2>
            {!loading && subjects.length > 0 && (
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-bold tabular-nums text-zinc-400">
                {query.trim() ? `${filtered.length}/${subjects.length}` : subjects.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {subjects.length > 0 && (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ค้นหาวิชา…"
                  className="h-9 w-full border-zinc-800 bg-zinc-900/40 pl-9 pr-8 text-sm text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30 sm:w-56"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors hover:text-zinc-300"
                    aria-label="ล้างการค้นหา"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
            <Button
              variant="outline"
              className="h-9 shrink-0 rounded-lg border-zinc-800 bg-zinc-900/30 px-4 font-semibold text-zinc-300 transition-all hover:border-white hover:bg-white hover:text-black"
              onClick={() => { setEditSubject(null); setShowSubjectForm((s) => !s); }}
            >
              + เพิ่มวิชา
            </Button>
          </div>
        </div>

        {showSubjectForm && !editSubject && (
          <SubjectForm
            onCancel={() => setShowSubjectForm(false)}
            onSubmit={async (data) => {
              if (await run(() => subjectsApi.create(data))) setShowSubjectForm(false);
            }}
          />
        )}

        {loading ? (
          <Spinner />
        ) : subjects.length === 0 ? (
          <EmptyState title="ยังไม่มีวิชา" description='กด "เพิ่มวิชา" เพื่อเริ่มต้น' />
        ) : filtered.length === 0 ? (
          <EmptyState title="ไม่พบวิชาที่ค้นหา" description={`ไม่มีวิชาที่ตรงกับ "${query}"`} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((s) => {
              const colors = getSubjectColor(s.code);
              const isSelected = selected === s._id;
              return editSubject?._id === s._id ? (
                <SubjectForm
                  key={s._id}
                  initial={s}
                  onCancel={() => setEditSubject(null)}
                  onSubmit={async (data) => {
                    if (await run(() => subjectsApi.update(s._id, data))) setEditSubject(null);
                  }}
                />
              ) : (
                <Card
                  key={s._id}
                  className={cn(
                    'group relative cursor-pointer overflow-hidden border border-zinc-900 bg-zinc-950/20 shadow-md backdrop-blur-sm transition-all duration-300',
                    'hover:-translate-y-[1px] hover:border-zinc-800 hover:bg-zinc-900/30',
                    isSelected ? cn('bg-zinc-900/20 shadow-lg', colors.ring) : '',
                    !s.isActive && 'opacity-40',
                  )}
                  onClick={() => setSelected((cur) => (cur === s._id ? '' : s._id))}
                >
                  {/* Accent rail */}
                  <span
                    className={cn(
                      'absolute inset-y-0 left-0 w-1 transition-opacity duration-300',
                      colors.dot,
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
                    )}
                  />
                  <CardContent className="flex items-center justify-between py-4 pl-7 pr-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn(
                          'rounded border px-2 py-0.5 font-mono text-xs font-bold',
                          colors.bg,
                          colors.border,
                          colors.text,
                        )}>
                          {s.code}
                        </span>
                        <span className="max-w-[180px] truncate text-sm font-semibold text-white sm:max-w-[240px]">
                          {s.name}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">ภาคเรียน {s.semester}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-lg px-3 text-xs font-semibold text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-white"
                          onClick={(ev) => { ev.stopPropagation(); setShowSubjectForm(false); setEditSubject(s); }}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-lg px-3 text-xs font-semibold text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setDeleteTarget(s);
                          }}
                        >
                          ลบ
                        </Button>
                      </div>
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 shrink-0 text-zinc-600 transition-all duration-300',
                          isSelected ? 'rotate-90 text-zinc-300' : 'group-hover:translate-x-0.5 group-hover:text-zinc-400',
                        )}
                      />
                      <ActiveToggle
                        active={s.isActive}
                        onToggle={(next) => toggleActive(s, next)}
                        title={s.isActive ? 'ปิดใช้งานวิชานี้' : 'เปิดใช้งานวิชานี้'}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {selected && subjects.some((s) => s._id === selected) && (
        <div className="animate-[fadeIn_0.5s_ease_both]">
          <LabsPanel
            subject={subjects.find((s) => s._id === selected)!}
            onError={setError}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`ลบวิชา ${deleteTarget?.code}?`}
        description="ปฏิบัติการและคิวทั้งหมดของวิชานี้จะถูกลบไปด้วย การกระทำนี้ไม่สามารถย้อนกลับได้"
        confirmLabel="ลบวิชา"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          const target = deleteTarget!;
          setDeleteTarget(null);
          run(() => subjectsApi.remove(target._id));
        }}
      />
    </main>
  );
}

export default function SubjectsPage() {
  return <Manager />;
}
