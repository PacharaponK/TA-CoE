'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Field } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { queueApi, studentsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Lab, Student } from '@/lib/types';

export interface EnqueueScope {
  subjectId: string;
  labId: string;
  /** '', '__all__', or a checkpoint id */
  checkpointId: string;
}

type Mode = 'search' | 'manual';

export function EnqueueModal({
  open,
  scope,
  labs,
  onClose,
}: {
  open: boolean;
  scope: EnqueueScope;
  labs: Lab[];
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>('search');

  // search mode
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Student | null>(null);
  const [openDd, setOpenDd] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const ddRef = useRef<HTMLDivElement>(null);

  // manual mode
  const [mStudentId, setMStudentId] = useState('');
  const [mName, setMName] = useState('');
  const [mSection, setMSection] = useState('');

  // shared section override (search mode) + checkpoint
  const [section, setSection] = useState('');
  const [checkpointId, setCheckpointId] = useState<string>(scope.checkpointId);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedLab = labs.find((l) => l._id === scope.labId);
  const checkpoints = selectedLab?.checkpoints ?? [];
  const needsCheckpoint = checkpoints.length > 0;

  // load students on open
  useEffect(() => {
    if (open) studentsApi.list(true).then(setStudents).catch(() => {});
  }, [open]);

  // sync checkpoint from parent scope
  useEffect(() => {
    setCheckpointId(scope.checkpointId);
  }, [scope.checkpointId]);

  // auto-fill section from selected student
  useEffect(() => {
    if (selected?.section) setSection(selected.section);
  }, [selected]);

  // close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ddRef.current?.contains(e.target as Node)) setOpenDd(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // close on ESC
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return students
      .filter(
        (s) =>
          s.studentId.includes(q) ||
          s.firstName.toLowerCase().includes(q) ||
          s.surname.toLowerCase().includes(q) ||
          s.nickname.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query, students]);

  function reset() {
    setMode('search');
    setQuery('');
    setSelected(null);
    setOpenDd(false);
    setCursor(-1);
    setMStudentId('');
    setMName('');
    setMSection('');
    setSection('');
    setError('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSearchKey(e: React.KeyboardEvent) {
    if (!openDd || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    }
    if (e.key === 'Enter' && cursor >= 0) {
      e.preventDefault();
      pick(results[cursor]);
    }
    if (e.key === 'Escape') setOpenDd(false);
  }

  function pick(s: Student) {
    setSelected(s);
    setQuery('');
    setOpenDd(false);
    setCursor(-1);
  }

  // effective checkpoint to send (null when "all" or not required)
  const effectiveCheckpoint =
    needsCheckpoint && checkpointId && checkpointId !== '__all__'
      ? checkpointId
      : null;

  // current values for submission depending on mode
  const data = mode === 'search'
    ? selected && {
        studentId: selected.studentId,
        studentName: `${selected.firstName} ${selected.surname}`.trim(),
        section: section.trim() || undefined,
      }
    : mStudentId.trim() && mName.trim()
      ? {
          studentId: mStudentId.trim(),
          studentName: mName.trim(),
          section: mSection.trim() || undefined,
        }
      : null;

  const canSubmit =
    !!data &&
    !submitting &&
    (!needsCheckpoint || (checkpointId && checkpointId !== '__all__'));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setError('');
    setSubmitting(true);
    try {
      await queueApi.join({
        subjectId: scope.subjectId,
        labId: scope.labId,
        checkpointId: effectiveCheckpoint,
        studentId: data.studentId,
        studentName: data.studentName,
        section: data.section,
      });
      reset();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* dialog */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-elevated backdrop-blur-xl animate-[fadeSlideUp_0.3s_ease_both]">
        {/* header */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">เข้าร่วมคิว</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {selectedLab?.name ?? '—'}
              {effectiveCheckpoint &&
                ` · ${checkpoints.find((c) => c._id === effectiveCheckpoint)?.name}`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="ปิด"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-5 py-4"
        >
          {/* mode toggle */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-900/60 p-1">
            {(['search', 'manual'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError('');
                }}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  mode === m
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white',
                )}
              >
                {m === 'search' ? 'ค้นหาจากรายชื่อ' : 'กรอกเอง'}
              </button>
            ))}
          </div>

          {mode === 'search' ? (
            <>
              <Field label="ค้นหานักศึกษา">
                {selected ? (
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/40 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {selected.firstName} {selected.surname}
                        {selected.nickname && (
                          <span className="ml-1.5 font-normal text-zinc-400">
                            ({selected.nickname})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">{selected.studentId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="shrink-0 rounded-full p-0.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="ล้าง"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div ref={ddRef} className="relative">
                    <Input
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setOpenDd(true);
                        setCursor(-1);
                      }}
                      onFocus={() => setOpenDd(true)}
                      onKeyDown={handleSearchKey}
                      placeholder="ค้นหาชื่อ, รหัส, หรือชื่อเล่น…"
                      autoComplete="off"
                      className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                    />
                    {openDd && results.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-elevated backdrop-blur-xl">
                        {results.map((s, i) => (
                          <button
                            key={s._id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              pick(s);
                            }}
                            onMouseEnter={() => setCursor(i)}
                            className={cn(
                              'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                              cursor === i
                                ? 'bg-white/5'
                                : 'hover:bg-white/5',
                              i > 0 && 'border-t border-white/5',
                            )}
                          >
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold text-white">
                              {s.firstName.charAt(0)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-white">
                                {s.firstName} {s.surname}
                                {s.nickname && (
                                  <span className="ml-1.5 text-zinc-500">
                                    ({s.nickname})
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {s.studentId}
                                {s.section && ` · Sec ${s.section}`}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Field>

              {selected && (
                <Field label="Section">
                  <Input
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="01"
                    className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                  />
                </Field>
              )}
            </>
          ) : (
            <>
              <Field label="รหัสนักศึกษา">
                <Input
                  value={mStudentId}
                  onChange={(e) => setMStudentId(e.target.value)}
                  placeholder="6301xxxxx"
                  className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                />
              </Field>
              <Field label="ชื่อ-นามสกุล">
                <Input
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  placeholder="ชื่อ นามสกุล"
                  className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                />
              </Field>
              <Field label="กลุ่มเรียน (Section)">
                <Input
                  value={mSection}
                  onChange={(e) => setMSection(e.target.value)}
                  placeholder="01 (ถ้ามี)"
                  className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                />
              </Field>
            </>
          )}

          {/* checkpoint picker when needed */}
          {needsCheckpoint && (
            <Field label="Checkpoint">
              <Select
                value={checkpointId || undefined}
                onValueChange={(v) => setCheckpointId(v ?? '')}
              >
                <SelectTrigger className="w-full border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:bg-zinc-900/80 hover:text-white focus:border-zinc-500/50 transition-all duration-300">
                  <SelectValue placeholder="เลือก Checkpoint" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
                  {checkpoints.map((c) => (
                    <SelectItem
                      key={c._id}
                      value={c._id}
                      className="text-zinc-300 hover:bg-white/5 hover:text-white"
                    >
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          {needsCheckpoint &&
            (!checkpointId || checkpointId === '__all__') && (
              <p className="text-xs text-orange-400">
                ⚠ Lab นี้ต้องระบุ Checkpoint
              </p>
            )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="mt-1 w-full rounded-full bg-white font-semibold text-black hover:bg-white/90"
          >
            {submitting ? 'กำลังเข้าร่วม…' : '+ เข้าร่วมคิว'}
          </Button>
        </form>
      </div>
    </div>
  );
}
