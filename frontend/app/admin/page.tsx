'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { AdminGate, LogoutButton } from '@/components/AdminGate';
import Loading from '@/app/loading';
import { ScopePicker } from '@/components/ScopePicker';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { EmptyState, Field, Spinner } from '@/components/ui';
import { queueApi, studentsApi, systemConfigApi } from '@/lib/api';
import { useScope } from '@/lib/useScope';
import { useRealtime } from '@/lib/useRealtime';
import { fmtTime, waitedMinutes } from '@/lib/format';
import type { QueueEntry, Student } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Search, Sparkles, ShieldOff, ShieldCheck } from 'lucide-react';

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
      <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/40 px-3 py-2">
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
    <div ref={containerRef} className={cn("relative", open && "z-30")}>
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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          กำลังตรวจ {checking} คน
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/5 px-3 py-1 text-xs font-semibold text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
        รอ {waiting} คน
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/5 px-3 py-1 text-xs font-semibold text-zinc-400">
        ทั้งหมด {entries.length} คิว
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
function AdminQueue() {
  const { subjects, labs, scope, setScope, loading: scopeLoading } = useScope(true);
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

  // ── Kill-switch ──────────────────────────────────────────────────
  const [queueDisabled, setQueueDisabled] = useState(false);
  const [disabledMessage, setDisabledMessage] = useState('');
  const [killBusy, setKillBusy] = useState(false);
  const [msgInput, setMsgInput] = useState('');

  useEffect(() => {
    systemConfigApi.get().then((cfg) => {
      setQueueDisabled(cfg.queueDisabled);
      setDisabledMessage(cfg.disabledMessage);
      setMsgInput(cfg.disabledMessage);
    }).catch(() => {});
  }, []);

  const handleSystem = useCallback(
    (cfg: { queueDisabled: boolean; disabledMessage: string }) => {
      setQueueDisabled(cfg.queueDisabled);
      setDisabledMessage(cfg.disabledMessage);
    },
    [],
  );

  useRealtime(reload, handleSystem);

  async function toggleKillSwitch() {
    setKillBusy(true);
    setError('');
    try {
      const next = !queueDisabled;
      await systemConfigApi.set(next, next ? msgInput.trim() : '');
      // state updates via WebSocket broadcast automatically
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setKillBusy(false);
    }
  }

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
    <main className="container-page flex w-full flex-1 flex-col gap-6 py-8 relative z-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">TA Console</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">จัดการคิว</h1>
          <p className="text-sm text-zinc-400">เพิ่มนักศึกษาเข้าคิว เรียกตรวจ และบันทึกผล</p>
        </div>
        <LogoutButton />
      </div>

      {/* ── Kill-switch card ───────────────────────────────── */}
      <div className={cn(
        'relative rounded-xl border p-5 shadow-lg transition-all duration-300',
        queueDisabled
          ? 'border-red-500/40 bg-red-950/30'
          : 'border-zinc-800 bg-zinc-900/30 backdrop-blur-md',
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Icon + labels */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
              queueDisabled
                ? 'bg-red-500/20 border-red-500/40'
                : 'bg-zinc-800 border-zinc-700',
            )}>
              {queueDisabled
                ? <ShieldOff className="h-5 w-5 text-red-400" />
                : <ShieldCheck className="h-5 w-5 text-zinc-400" />}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                {queueDisabled ? '⚠️ ระบบคิวถูกปิดชั่วคราว' : 'ระบบคิวทำงานปกติ'}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {queueDisabled && disabledMessage ? disabledMessage : 'ปิดคิวฉุกเฉินเพื่อแจ้งนักศึกษาทันที'}
              </p>
            </div>
          </div>

          {/* Toggle button */}
          <Button
            id="kill-switch-toggle"
            onClick={toggleKillSwitch}
            disabled={killBusy}
            variant={queueDisabled ? 'default' : 'destructive'}
            size="sm"
            className={cn(
              'shrink-0 min-w-[120px] rounded-full text-sm font-semibold transition-all',
              queueDisabled
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white',
            )}
          >
            {killBusy ? 'กำลังบันทึก…' : queueDisabled ? 'เปิดระบบคิว' : 'ปิดระบบคิว'}
          </Button>
        </div>

        {/* Optional message input — only shown when enabling or when already disabled */}
        {(!queueDisabled) && (
          <div className="mt-4 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">
              ข้อความแจ้งนักศึกษา <span className="text-zinc-600">(ไม่บังคับ)</span>
            </label>
            <Input
              id="kill-switch-message"
              placeholder="เช่น ระบบจะกลับมาในอีก 30 นาที"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              maxLength={300}
              className="h-9 border-zinc-700 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-red-500/30 text-sm"
            />
          </div>
        )}
      </div>

      {/* Scope picker */}
      <div className="relative z-20 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-xl backdrop-blur-md">
        <ScopePicker subjects={subjects} labs={labs} scope={scope} onChange={setScope} />
      </div>

      {scopeLoading ? (
        <Loading />
      ) : !ready ? (
        <EmptyState icon={<Search className="h-5 w-5 text-zinc-400" />} title="เลือกวิชาและ Lab ก่อน"
          description="เพื่อเริ่มเพิ่มนักศึกษาเข้าคิว" />
      ) : (
        <>
          {/* Add to queue */}
          <div className="relative z-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col gap-4 shadow-xl backdrop-blur-md">
            
            <div className="pb-1">
              <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">เพิ่มเข้าคิว</h2>
              {needsCheckpoint && (!scope.checkpointId || scope.checkpointId === '__all__') && (
                <p className="text-xs text-orange-400 mt-1 animate-pulse">
                  ⚠ Lab นี้มี Checkpoint — กรุณาเลือก Checkpoint ด้านบนก่อน
                </p>
              )}
            </div>
            
            <Separator className="bg-white/5" />
            
            <div className="pt-2">
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
                      className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                    />
                  </Field>
                  <Button
                    type="submit"
                    disabled={!canAdd || adding}
                    className="self-end rounded-full bg-white text-black hover:bg-white/90 font-semibold"
                  >
                    {adding ? 'กำลังเพิ่ม…' : '+ เพิ่มเข้าคิว'}
                  </Button>
                </div>

                {alreadyIn && selectedStudent && (
                  <p className="flex items-center gap-1.5 text-sm text-amber-500">
                    <span>⚠</span>
                    {selectedStudent.firstName} {selectedStudent.surname} อยู่ในคิวแล้ว
                  </p>
                )}
                {error && <p className="text-sm text-red-400">{error}</p>}
              </form>
            </div>
          </div>

          {/* Live queue */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
              <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">คิวปัจจุบัน</h2>
              <QueueStats entries={entries} />
            </div>

            {loading && entries.length === 0 ? <Spinner /> :
              entries.length === 0 ? <EmptyState icon={<Sparkles className="h-5 w-5 text-zinc-400" />} title="ยังไม่มีคิว" /> : (
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
      'relative overflow-hidden transition-all duration-300 bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm hover:border-zinc-700',
      e.status === 'checking' && 'border-zinc-500/30 bg-gradient-to-b from-zinc-900/20 to-transparent shadow-lg shadow-white/5',
    )}>
      {e.status === 'checking' && (
        <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-white to-zinc-400" />
      )}
      <CardContent className="flex flex-col gap-3 py-4 pl-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className={cn(
            'grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold border',
            e.status === 'checking' 
              ? 'bg-zinc-800 text-zinc-200 border-zinc-700 shadow-md' 
              : 'bg-white/5 text-zinc-400 border-white/5',
          )}>
            {index}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {e.studentName}
              <span className="ml-1.5 font-normal text-zinc-400">· {e.studentId}</span>
              {e.attempt > 1 && (
                <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-xs font-bold text-amber-400">
                  ครั้งที่ {e.attempt}
                </span>
              )}
            </p>
            <p className="truncate text-xs text-zinc-400 mt-0.5">
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
            <Button size="sm" className="rounded-full bg-white hover:bg-zinc-200 text-black font-semibold"
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

          <Button size="sm" variant="ghost" className="text-zinc-500 hover:text-white"
            onClick={() => onAction(() => queueApi.skip(e._id))}>
            ข้าม
          </Button>
          <Button size="sm" variant="ghost"
            className="text-zinc-500 hover:text-red-400"
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
