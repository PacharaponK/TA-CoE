'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { AdminGate, LogoutButton } from '@/components/AdminGate';
import { ScopePicker } from '@/components/ScopePicker';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { EmptyState, Field, Spinner } from '@/components/ui';
import { queueApi, studentsApi } from '@/lib/api';
import { useScope } from '@/lib/useScope';
import { useRealtime } from '@/lib/useRealtime';
import { fmtTime, waitedMinutes } from '@/lib/format';
import type { QueueEntry, Student } from '@/lib/types';
import { cn } from '@/lib/utils';

// ── Student search picker ─────────────────────────────────────────
function StudentPicker({
  students,
  selected,
  onSelect,
}: {
  students: Student[];
  selected: Student | null;
  onSelect: (s: Student | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return students
      .filter(
        (s) =>
          s.isActive &&
          (s.studentId.includes(q) ||
            s.firstName.toLowerCase().includes(q) ||
            s.surname.toLowerCase().includes(q) ||
            s.nickname.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [query, students]);

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleKey(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && cursor >= 0) { e.preventDefault(); pick(results[cursor]); }
    if (e.key === 'Escape') setOpen(false);
  }

  function pick(s: Student) {
    onSelect(s);
    setQuery('');
    setOpen(false);
    setCursor(-1);
  }

  // ── selected state ──
  if (selected) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-[#e7f1fc] px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {selected.firstName} {selected.surname}
            {selected.nickname && (
              <span className="ml-1.5 font-normal text-muted-foreground">({selected.nickname})</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {selected.studentId}
            {selected.section && ` · Sec ${selected.section}`}
            {` · ปีที่ ${selected.year}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground"
          aria-label="ล้าง"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  // ── search state ──
  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setCursor(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        placeholder="ค้นหาชื่อ, รหัส, หรือชื่อเล่น…"
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
          {results.map((s, i) => (
            <button
              key={s._id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
              onMouseEnter={() => setCursor(i)}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                cursor === i ? 'bg-muted' : 'hover:bg-muted/60',
                i > 0 && 'border-t border-border/60',
              )}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {s.firstName.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {s.firstName} {s.surname}
                  {s.nickname && (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">({s.nickname})</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {s.studentId} · ปีที่ {s.year}{s.section ? ` · Sec ${s.section}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && query.trim() && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border border-border bg-card px-4 py-3 shadow-elevated">
          <p className="text-sm text-muted-foreground">ไม่พบนักศึกษาที่ตรงกัน</p>
        </div>
      )}
    </div>
  );
}

// ── Stats chips ───────────────────────────────────────────────────
function QueueStats({ entries }: { entries: QueueEntry[] }) {
  const waiting  = entries.filter((e) => e.status === 'waiting').length;
  const checking = entries.filter((e) => e.status === 'checking').length;
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {checking > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f1fc] px-3 py-1 text-xs font-semibold text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          กำลังตรวจ {checking} คน
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
        รอ {waiting} คน
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        ทั้งหมด {entries.length} คิว
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
function AdminQueue() {
  const { subjects, labs, scope, setScope } = useScope(true);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [section, setSection] = useState('');
  const [adding, setAdding] = useState(false);

  const selectedLab   = labs.find((l) => l._id === scope.labId);
  const needsCheckpoint = (selectedLab?.checkpoints?.length ?? 0) > 0;

  // load students once
  useEffect(() => {
    studentsApi.list(true).then(setStudents).catch(() => {});
  }, []);

  // auto-fill section from student profile
  useEffect(() => {
    if (selectedStudent?.section) setSection(selectedStudent.section);
  }, [selectedStudent]);

  const reload = useCallback(async () => {
    if (!scope.subjectId || !scope.labId) { setEntries([]); return; }
    setLoading(true);
    try {
      setEntries(await queueApi.active({ subjectId: scope.subjectId, labId: scope.labId }));
    } catch {
      setEntries([]);
    } finally { setLoading(false); }
  }, [scope.subjectId, scope.labId]);

  useEffect(() => { reload(); }, [reload]);
  useRealtime(reload);

  async function run(fn: () => Promise<unknown>) {
    setError('');
    try { await fn(); await reload(); }
    catch (e) { setError((e as Error).message); }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setError('');
    setAdding(true);
    try {
      await queueApi.enqueue({
        subjectId: scope.subjectId,
        labId: scope.labId,
        checkpointId: scope.checkpointId && scope.checkpointId !== '__all__'
          ? scope.checkpointId : null,
        studentId: selectedStudent.studentId,
        studentName: `${selectedStudent.firstName} ${selectedStudent.surname}`,
        section: section.trim() || undefined,
      });
      setSelectedStudent(null);
      setSection('');
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally { setAdding(false); }
  }

  const ready    = scope.subjectId && scope.labId;
  const alreadyIn = selectedStudent
    ? entries.some((e) => e.studentId === selectedStudent.studentId)
    : false;
  const canAdd   = ready && selectedStudent && !alreadyIn &&
    (!needsCheckpoint || (scope.checkpointId && scope.checkpointId !== '__all__'));

  return (
    <main className="container-page flex w-full flex-1 flex-col gap-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">TA Console</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">จัดการคิว</h1>
          <p className="text-sm text-muted-foreground">เพิ่มนักศึกษาเข้าคิว เรียกตรวจ และบันทึกผล</p>
        </div>
        <LogoutButton />
      </div>

      {/* Scope picker */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <ScopePicker subjects={subjects} labs={labs} scope={scope} onChange={setScope} />
        </CardContent>
      </Card>

      {!ready ? (
        <EmptyState icon="🔍" title="เลือกวิชาและ Lab ก่อน"
          description="เพื่อเริ่มเพิ่มนักศึกษาเข้าคิว" />
      ) : (
        <>
          {/* Add to queue */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">เพิ่มเข้าคิว</CardTitle>
              {needsCheckpoint && (!scope.checkpointId || scope.checkpointId === '__all__') && (
                <p className="text-sm text-destructive">
                  Lab นี้มี Checkpoint — กรุณาเลือก Checkpoint ด้านบนก่อน
                </p>
              )}
            </CardHeader>
            <Separator />
            <CardContent className="pt-5">
              <form onSubmit={handleAdd} className="flex flex-col gap-3">
                <div className="grid items-end gap-3 sm:grid-cols-[1fr_8rem_auto]">
                  <Field label="ค้นหานักศึกษา">
                    <StudentPicker
                      students={students}
                      selected={selectedStudent}
                      onSelect={setSelectedStudent}
                    />
                  </Field>
                  <Field label="Section">
                    <Input
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="01"
                    />
                  </Field>
                  <Button
                    type="submit"
                    disabled={!canAdd || adding}
                    className="self-end rounded-full"
                  >
                    {adding ? 'กำลังเพิ่ม…' : '+ เพิ่มเข้าคิว'}
                  </Button>
                </div>

                {alreadyIn && selectedStudent && (
                  <p className="flex items-center gap-1.5 text-sm text-amber-600">
                    <span>⚠</span>
                    {selectedStudent.firstName} {selectedStudent.surname} อยู่ในคิวแล้ว
                  </p>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
              </form>
            </CardContent>
          </Card>

          {/* Live queue */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">คิวปัจจุบัน</h2>
              <QueueStats entries={entries} />
            </div>

            {loading && entries.length === 0 ? <Spinner /> :
              entries.length === 0 ? <EmptyState icon="🎉" title="ยังไม่มีคิว" /> : (
                <div className="flex flex-col gap-2">
                  {entries.map((e, i) => (
                    <QueueRow key={e._id} entry={e} index={i + 1} onAction={run} />
                  ))}
                </div>
              )}
          </section>
        </>
      )}
    </main>
  );
}

// ── Queue row ─────────────────────────────────────────────────────
function QueueRow({ entry: e, index, onAction }: {
  entry: QueueEntry; index: number; onAction: (fn: () => Promise<unknown>) => void;
}) {
  return (
    <Card className={cn(
      'relative overflow-hidden transition-shadow',
      e.status === 'checking' && 'border-primary/30 shadow-soft',
    )}>
      {e.status === 'checking' && (
        <span className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-primary" />
      )}
      <CardContent className="flex flex-col gap-3 py-4 pl-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className={cn(
            'grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold',
            e.status === 'checking' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
          )}>
            {index}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {e.studentName}
              <span className="ml-1.5 font-normal text-muted-foreground">· {e.studentId}</span>
              {e.attempt > 1 && (
                <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                  ครั้งที่ {e.attempt}
                </span>
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {e.section && `กลุ่ม ${e.section} · `}
              {e.checkpointName ?? e.labName}
              {' · '}
              {e.status === 'checking'
                ? `เรียกเมื่อ ${fmtTime(e.calledAt)}`
                : waitedMinutes(e.enqueuedAt)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <StatusBadge status={e.status} />

          {e.status === 'waiting' && (
            <Button size="sm" className="rounded-full"
              onClick={() => onAction(() => queueApi.call(e._id))}>
              เรียกตรวจ
            </Button>
          )}

          {e.status === 'checking' && (
            <>
              <Button size="sm" variant="outline"
                className="rounded-full border-accent-green/40 text-accent-green hover:bg-accent-green/10"
                onClick={() => onAction(() => queueApi.resolve(e._id, 'passed'))}>
                ✓ ผ่าน
              </Button>
              <Button size="sm" variant="outline"
                className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => onAction(() => queueApi.resolve(e._id, 'failed'))}>
                ✗ ไม่ผ่าน
              </Button>
            </>
          )}

          <Button size="sm" variant="ghost"
            onClick={() => onAction(() => queueApi.skip(e._id))}>
            ข้าม
          </Button>
          <Button size="sm" variant="ghost"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => {
              if (confirm(`ลบคิวของ ${e.studentName}?`))
                onAction(() => queueApi.remove(e._id));
            }}>
            ลบ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page shell ────────────────────────────────────────────────────
export default function AdminPage() {
  return (
    <AdminGate>
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <AdminQueue />
        <Footer />
      </div>
    </AdminGate>
  );
}
