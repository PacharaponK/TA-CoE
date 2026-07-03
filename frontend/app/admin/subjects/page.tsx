'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState, Spinner } from '@/components/ui';
import { subjectsApi } from '@/lib/api';
import { useAction } from '@/lib/useAction';
import type { Subject } from '@/lib/types';
import { SubjectForm } from './_components/SubjectForm';
import { LabsPanel } from './_components/LabsPanel';
import { cn } from '@/lib/utils';
import { BookOpen, LayoutGrid } from 'lucide-react';

function getSubjectColor(code: string) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  const presets = [
    { bg: 'bg-emerald-950/20', border: 'border-emerald-800/30', text: 'text-emerald-400' },
    { bg: 'bg-indigo-950/25', border: 'border-indigo-800/30', text: 'text-indigo-400' },
    { bg: 'bg-amber-950/20', border: 'border-amber-800/30', text: 'text-amber-400' },
    { bg: 'bg-rose-950/20', border: 'border-rose-800/30', text: 'text-rose-400' },
    { bg: 'bg-cyan-950/20', border: 'border-cyan-800/30', text: 'text-cyan-400' },
    { bg: 'bg-violet-950/25', border: 'border-violet-800/30', text: 'text-violet-400' },
    { bg: 'bg-orange-950/20', border: 'border-orange-800/30', text: 'text-orange-400' },
  ];
  const index = Math.abs(hash) % presets.length;
  return presets[index];
}

function Manager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string>('');
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try { setSubjects(await subjectsApi.list(false)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const run = useAction(reload, setError);

  return (
    <main className="container-page flex w-full flex-1 flex-col gap-8 py-8 animate-[fadeIn_0.5s_ease_both]">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900/40 to-zinc-950 p-6 sm:p-8 shadow-2xl animate-[fadeSlideDown_0.6s_ease_both]">
        <div className="absolute top-0 right-0 h-48 w-48 bg-zinc-500/10 rounded-full blur-[80px]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
        </div>
      </div>

      {error && <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

      {/* Subject list */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-zinc-805/60 pb-2">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">รายวิชาทั้งหมด</h2>
          </div>
          <Button
            variant="outline"
            className="h-9 px-4 rounded-lg border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all font-semibold"
            onClick={() => { setEditSubject(null); setShowSubjectForm((s) => !s); }}
          >
            + เพิ่มวิชา
          </Button>
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
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {subjects.map((s) => {
              const colors = getSubjectColor(s.code);
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
                    'cursor-pointer transition-all duration-300 bg-zinc-950/20 border border-zinc-900 backdrop-blur-sm shadow-md',
                    'hover:border-zinc-800 hover:bg-zinc-900/30 hover:-translate-y-[1px]',
                    selected === s._id
                      ? 'border-emerald-500/50 bg-emerald-950/10 shadow-lg shadow-emerald-950/15'
                      : '',
                    !s.isActive && 'opacity-40',
                  )}
                  onClick={() => setSelected(s._id)}
                >
                  <CardContent className="flex items-center justify-between py-4 px-6">
                    <div className="min-w-0">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className={cn(
                          "font-mono font-bold text-xs border px-2 py-0.5 rounded",
                          colors.bg,
                          colors.border,
                          colors.text
                        )}>
                          {s.code}
                        </span>
                        <span className="text-sm font-semibold text-white truncate max-w-[180px] sm:max-w-[260px]">
                          {s.name}
                        </span>
                        {!s.isActive && (
                          <Badge variant="secondary" className="text-[10px] font-medium bg-red-950/30 text-red-400 border border-red-900/30 px-1.5 py-0">
                            ปิดใช้งาน
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mt-1.5">ภาคเรียน {s.semester}</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5 opacity-60 hover:opacity-100 transition-opacity duration-200">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg px-3 transition-colors"
                        onClick={(ev) => { ev.stopPropagation(); setShowSubjectForm(false); setEditSubject(s); }}
                      >
                        แก้ไข
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs font-semibold text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg px-3 transition-colors"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (confirm(`ลบวิชา ${s.code}? ปฏิบัติการและคิวทั้งหมดของวิชานี้จะถูกลบด้วย`))
                            run(() => subjectsApi.remove(s._id));
                        }}
                      >
                        ลบ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {selected && (
        <div className="animate-[fadeIn_0.5s_ease_both]">
          <LabsPanel
            subject={subjects.find((s) => s._id === selected)!}
            onError={setError}
          />
        </div>
      )}
    </main>
  );
}

export default function SubjectsPage() {
  return <Manager />;
}
