'use client';

import { useCallback, useEffect, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { AdminGate, LogoutButton } from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { EmptyState, Field, Spinner } from '@/components/ui';
import { labsApi, subjectsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Checkpoint, Lab, Subject } from '@/lib/types';

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

  async function run(fn: () => Promise<unknown>): Promise<boolean> {
    setError('');
    try { await fn(); await reload(); return true; }
    catch (e) { setError((e as Error).message); return false; }
  }

  return (
    <main className="container-page flex w-full flex-1 flex-col gap-8 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">TA Console</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">วิชา &amp; Lab</h1>
          <p className="text-sm text-muted-foreground">จัดการวิชา, Lab และ Checkpoint</p>
        </div>
        <LogoutButton />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Subjects */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">วิชา</h2>
          <Button variant="outline" size="sm"
            onClick={() => { setEditSubject(null); setShowSubjectForm(s => !s); }}>
            + เพิ่มวิชา
          </Button>
        </div>

        {showSubjectForm && !editSubject && (
          <SubjectForm
            onCancel={() => setShowSubjectForm(false)}
            onSubmit={async (data) => { if (await run(() => subjectsApi.create(data))) setShowSubjectForm(false); }}
          />
        )}

        {loading ? <Spinner /> : subjects.length === 0 ? (
          <EmptyState title="ยังไม่มีวิชา" description='กด "เพิ่มวิชา" เพื่อเริ่มต้น' />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {subjects.map((s) =>
              editSubject?._id === s._id ? (
                <SubjectForm key={s._id} initial={s}
                  onCancel={() => setEditSubject(null)}
                  onSubmit={async (data) => { if (await run(() => subjectsApi.update(s._id, data))) setEditSubject(null); }}
                />
              ) : (
                <Card key={s._id}
                  className={cn('cursor-pointer transition-shadow hover:shadow-soft',
                    selected === s._id && 'ring-2 ring-primary/30 shadow-soft')}
                  onClick={() => setSelected(s._id)}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        <span className="font-bold">{s.code}</span> · {s.name}
                        {!s.isActive && (
                          <Badge variant="secondary" className="ml-2 text-xs">ปิด</Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">ภาคเรียน {s.semester}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button size="sm" variant="ghost"
                        onClick={(ev) => { ev.stopPropagation(); setShowSubjectForm(false); setEditSubject(s); }}>
                        แก้ไข
                      </Button>
                      <Button size="sm" variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (confirm(`ลบวิชา ${s.code}? Lab และคิวทั้งหมดของวิชานี้จะถูกลบด้วย`))
                            run(() => subjectsApi.remove(s._id));
                        }}>
                        ลบ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
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

// ── Subject form ──────────────────────────────────────────────────
function SubjectForm({ initial, onSubmit, onCancel }: {
  initial?: Subject;
  onSubmit: (data: Partial<Subject>) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState(initial?.code ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [semester, setSemester] = useState(initial?.semester ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [busy, setBusy] = useState(false);

  return (
    <Card className="border-primary/30 shadow-soft">
      <CardContent className="pt-5">
        <form className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault(); setBusy(true);
            try { await onSubmit({ code: code.trim(), name: name.trim(), semester: semester.trim(), isActive }); }
            finally { setBusy(false); }
          }}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="รหัสวิชา">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CS101" />
            </Field>
            <Field label="ชื่อวิชา">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Programming Fundamentals" />
            </Field>
            <Field label="ภาคเรียน">
              <Input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="2026/1" />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            เปิดใช้งานวิชานี้
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy || !code.trim() || !name.trim() || !semester.trim()}
              className="rounded-full">
              {busy ? 'กำลังบันทึก…' : 'บันทึก'}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>ยกเลิก</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Labs panel ────────────────────────────────────────────────────
function LabsPanel({ subject, onError }: { subject: Subject; onError: (m: string) => void }) {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLab, setEditLab] = useState<Lab | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try { setLabs(await labsApi.list(subject._id, false)); }
    finally { setLoading(false); }
  }, [subject._id]);

  useEffect(() => { reload(); }, [reload]);

  async function run(fn: () => Promise<unknown>): Promise<boolean> {
    try { await fn(); await reload(); return true; }
    catch (e) { onError((e as Error).message); return false; }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Lab ใน {subject.code}</h2>
        <Button variant="outline" size="sm"
          onClick={() => { setEditLab(null); setShowForm(s => !s); }}>
          + เพิ่ม Lab
        </Button>
      </div>

      {showForm && !editLab && (
        <LabForm
          onCancel={() => setShowForm(false)}
          onSubmit={async (data) => {
            if (await run(() => labsApi.create({ ...data, subjectId: subject._id }))) setShowForm(false);
          }}
        />
      )}

      {loading ? <Spinner /> : labs.length === 0 ? (
        <EmptyState title="ยังไม่มี Lab" />
      ) : (
        <div className="flex flex-col gap-2">
          {labs.map((l) =>
            editLab?._id === l._id ? (
              <LabForm key={l._id} initial={l}
                onCancel={() => setEditLab(null)}
                onSubmit={async (data) => { if (await run(() => labsApi.update(l._id, data))) setEditLab(null); }}
              />
            ) : (
              <Card key={l._id}>
                <CardContent className="flex items-start justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {l.name}
                      {!l.isActive && <Badge variant="secondary" className="ml-2 text-xs">ปิด</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ลำดับ {l.order} · {l.checkpoints.length ? `${l.checkpoints.length} checkpoint` : 'ไม่มี checkpoint'}
                    </p>
                    {l.checkpoints.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {l.checkpoints.map((c) => (
                          <Badge key={c._id} variant="secondary" className="text-xs font-normal">
                            {c.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="ghost"
                      onClick={() => { setShowForm(false); setEditLab(l); }}>
                      แก้ไข
                    </Button>
                    <Button size="sm" variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm(`ลบ ${l.name}? คิวของ Lab นี้จะถูกลบด้วย`))
                          run(() => labsApi.remove(l._id));
                      }}>
                      ลบ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </section>
  );
}

// ── Lab form ──────────────────────────────────────────────────────
function LabForm({ initial, onSubmit, onCancel }: {
  initial?: Lab;
  onSubmit: (data: Partial<Lab>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [order, setOrder] = useState(String(initial?.order ?? 0));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [checkpoints, setCheckpoints] = useState<Array<{ _id?: string; name: string }>>(
    initial?.checkpoints.map((c) => ({ _id: c._id, name: c.name })) ?? []
  );
  const [busy, setBusy] = useState(false);

  return (
    <Card className="border-primary/30 shadow-soft">
      <CardContent className="pt-5">
        <form className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault(); setBusy(true);
            try {
              await onSubmit({
                name: name.trim(),
                order: Number(order) || 0,
                isActive,
                checkpoints: checkpoints
                  .filter(c => c.name.trim())
                  .map((c, i) => ({ _id: c._id, name: c.name.trim(), order: i })) as Checkpoint[],
              });
            } finally { setBusy(false); }
          }}>
          <div className="grid gap-3 sm:grid-cols-[2fr_0.5fr]">
            <Field label="ชื่อ Lab">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lab 3 — Linked List" />
            </Field>
            <Field label="ลำดับ">
              <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
            </Field>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-ink-secondary">Checkpoints</p>
            {checkpoints.length === 0 && (
              <p className="text-xs text-muted-foreground">ไม่มี checkpoint — คิวจะผูกกับ Lab โดยตรง</p>
            )}
            {checkpoints.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={c.name} placeholder={`CP${i + 1} — …`}
                  onChange={(e) => {
                    const next = [...checkpoints];
                    next[i] = { ...next[i], name: e.target.value };
                    setCheckpoints(next);
                  }} />
                <Button type="button" variant="ghost" size="sm"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => setCheckpoints(checkpoints.filter((_, j) => j !== i))}>
                  ลบ
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="self-start"
              onClick={() => setCheckpoints([...checkpoints, { name: '' }])}>
              + เพิ่ม Checkpoint
            </Button>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            เปิดใช้งาน Lab นี้
          </label>

          <div className="flex gap-2">
            <Button type="submit" disabled={busy || !name.trim()} className="rounded-full">
              {busy ? 'กำลังบันทึก…' : 'บันทึก'}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>ยกเลิก</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SubjectsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <AdminGate>
        <Manager />
        <Footer />
      </AdminGate>
    </div>
  );
}
