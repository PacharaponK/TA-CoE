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
    <main className="container-page flex w-full flex-1 flex-col gap-8 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">วิชา &amp; Lab</h1>
        <p className="mt-1 text-sm text-zinc-400">จัดการวิชา, Lab และ Checkpoint</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Subject list */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">วิชา</h2>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/15 text-zinc-300 hover:bg-white/5 hover:text-white"
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
          <div className="grid gap-2 sm:grid-cols-2">
            {subjects.map((s) =>
              editSubject?._id === s._id ? (
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
                    'cursor-pointer transition-all duration-300 bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm hover:border-zinc-700',
                    selected === s._id && 'border-zinc-500/40 ring-1 ring-zinc-500/20 bg-zinc-900/50 shadow-md',
                  )}
                  onClick={() => setSelected(s._id)}
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        <span className="font-bold">{s.code}</span> · {s.name}
                        {!s.isActive && (
                          <Badge variant="secondary" className="ml-2 text-xs bg-zinc-800 text-zinc-300 border-none">ปิด</Badge>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">ภาคเรียน {s.semester}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-zinc-400 hover:text-white"
                        onClick={(ev) => { ev.stopPropagation(); setShowSubjectForm(false); setEditSubject(s); }}
                      >
                        แก้ไข
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-zinc-500 hover:text-red-400 hover:bg-destructive/10"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (confirm(`ลบวิชา ${s.code}? Lab และคิวทั้งหมดของวิชานี้จะถูกลบด้วย`))
                            run(() => subjectsApi.remove(s._id));
                        }}
                      >
                        ลบ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        )}
      </section>

      {selected && (
        <LabsPanel
          subject={subjects.find((s) => s._id === selected)!}
          onError={setError}
        />
      )}
    </main>
  );
}

export default function SubjectsPage() {
  return <Manager />;
}
