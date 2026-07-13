'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button, Input, Field } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StudentSearchInput } from '@/components/StudentSearchInput';
import { queueApi, studentsApi } from '@/lib/api';
import { setMyStudentId } from '@/lib/myQueue';
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
  const [selected, setSelected] = useState<Student | null>(null);

  // manual mode
  const [mStudentId, setMStudentId] = useState('');
  const [mName, setMName] = useState('');
  const [mSection, setMSection] = useState('');

  // checkpoints (in search mode the section comes from the student's enrollment)
  // a student can join multiple checkpoints of the same lab at once
  const [checkpointIds, setCheckpointIds] = useState<string[]>(
    scope.checkpointId && scope.checkpointId !== '__all__'
      ? [scope.checkpointId]
      : [],
  );

  // when off, the checkpoint picker is a plain single-select dropdown
  const [multiCheckpoint, setMultiCheckpoint] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedLab = labs.find((l) => l._id === scope.labId);
  const checkpoints = selectedLab?.checkpoints ?? [];
  const needsCheckpoint = checkpoints.length > 0;

  // load students enrolled in this subject on open
  useEffect(() => {
    if (open && scope.subjectId) {
      studentsApi.list(true, scope.subjectId).then(setStudents).catch(() => { });
    }
  }, [open, scope.subjectId]);

  // sync checkpoint from parent scope; treat '__all__' as unset
  useEffect(() => {
    setCheckpointIds(
      scope.checkpointId && scope.checkpointId !== '__all__'
        ? [scope.checkpointId]
        : [],
    );
  }, [scope.checkpointId]);

  function toggleCheckpoint(id: string) {
    setCheckpointIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function toggleMultiCheckpoint(on: boolean) {
    setMultiCheckpoint(on);
    // dropping back to single-select keeps only the first pick
    if (!on) setCheckpointIds((prev) => prev.slice(0, 1));
  }

  // the section a student is in *for this subject* (empty if not enrolled)
  const sectionFor = (s: Student) =>
    s.enrollments.find((e) => e.subjectId === scope.subjectId)?.section ?? '';

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

  function reset() {
    setMode('search');
    setSelected(null);
    setMStudentId('');
    setMName('');
    setMSection('');
    setError('');
    setCheckpointIds(
      scope.checkpointId && scope.checkpointId !== '__all__'
        ? [scope.checkpointId]
        : [],
    );
    setMultiCheckpoint(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  // effective checkpoints to send (a single `[null]` entry when not required)
  const effectiveCheckpoints = needsCheckpoint ? checkpointIds : [null];

  const mStudentIdValid = /^\d{10}$/.test(mStudentId.trim());

  // if the manually-typed id matches a known student, treat it as a search match
  const matchedStudent = mStudentIdValid
    ? students.find((s) => s.studentId === mStudentId.trim())
    : undefined;

  // current values for submission depending on mode
  const data = mode === 'search'
    ? selected && {
      studentId: selected.studentId,
      studentName: `${selected.firstName} ${selected.surname}`.trim(),
      section: sectionFor(selected) || undefined,
    }
    : matchedStudent
      ? {
        studentId: matchedStudent.studentId,
        studentName: `${matchedStudent.firstName} ${matchedStudent.surname}`.trim(),
        section: sectionFor(matchedStudent) || undefined,
      }
      : mStudentIdValid && mName.trim()
        ? {
          studentId: mStudentId.trim(),
          studentName: mName.trim(),
          section: mSection.trim() || undefined,
        }
        : null;

  const canSubmit =
    !!data &&
    !submitting &&
    (!needsCheckpoint || checkpointIds.length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setError('');
    setSubmitting(true);
    try {
      const results = await Promise.allSettled(
        effectiveCheckpoints.map((checkpointId) =>
          queueApi.join({
            subjectId: scope.subjectId,
            labId: scope.labId,
            checkpointId,
            studentId: data.studentId,
            studentName: data.studentName,
            section: data.section,
          }),
        ),
      );

      const failed = results
        .map((r, i) => ({ r, checkpointId: effectiveCheckpoints[i] }))
        .filter((x): x is { r: PromiseRejectedResult; checkpointId: string | null } =>
          x.r.status === 'rejected',
        );

      setMyStudentId(data.studentId);

      if (failed.length === 0) {
        reset();
        onClose();
        return;
      }

      // keep only the checkpoints that failed so a retry doesn't re-join the rest
      if (needsCheckpoint) {
        setCheckpointIds(failed.map((f) => f.checkpointId as string));
      }
      const names = failed
        .map(
          (f) =>
            checkpoints.find((c) => c._id === f.checkpointId)?.name ??
            f.checkpointId,
        )
        .join(', ');
      setError(
        failed.length === effectiveCheckpoints.length
          ? (failed[0].r.reason as Error).message
          : `เข้าร่วมคิวไม่สำเร็จบางส่วน: ${names}`,
      );
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
              {checkpointIds.length > 0 &&
                ` · ${checkpointIds
                  .map((id) => checkpoints.find((c) => c._id === id)?.name)
                  .filter(Boolean)
                  .join(', ')}`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="ปิด"
          >
            <X className="h-5 w-5" />
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

          {/* checkpoint picker first, so its dropdown overlays the fields
              below instead of being clipped at the scroll container's edge */}
          {needsCheckpoint && (
            <>
              <Field label="Checkpoint">
                {multiCheckpoint ? (
                  <div className="flex flex-col gap-1.5">
                    {checkpoints.map((c) => {
                      const checked = checkpointIds.includes(c._id);
                      return (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => toggleCheckpoint(c._id)}
                          className={cn(
                            'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                            checked
                              ? 'border-white/20 bg-white/10 text-white'
                              : 'border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:bg-zinc-900/80 hover:text-white',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                              checked
                                ? 'border-white bg-white text-black'
                                : 'border-zinc-600',
                            )}
                          >
                            {checked && <Check className="h-3 w-3" />}
                          </span>
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <Select
                    value={checkpointIds[0] || undefined}
                    onValueChange={(v) => setCheckpointIds(v ? [v] : [])}
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
                )}
              </Field>

              <label className="-mt-2 flex items-center gap-2 text-xs text-zinc-400">
                <span
                  onClick={() => toggleMultiCheckpoint(!multiCheckpoint)}
                  className={cn(
                    'flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border',
                    multiCheckpoint
                      ? 'border-white bg-white text-black'
                      : 'border-zinc-600',
                  )}
                >
                  {multiCheckpoint && <Check className="h-3 w-3" />}
                </span>
                <span
                  onClick={() => toggleMultiCheckpoint(!multiCheckpoint)}
                  className="cursor-pointer select-none"
                >
                  เข้าร่วมหลาย Checkpoint พร้อมกัน
                </span>
              </label>
            </>
          )}

          {needsCheckpoint && checkpointIds.length === 0 && (
            <p className="text-xs text-orange-400">
              ⚠ Lab นี้ต้องระบุ Checkpoint อย่างน้อย 1 รายการ
            </p>
          )}

          {mode === 'search' ? (
            <>
              <Field label="ค้นหานักศึกษา">
                <StudentSearchInput
                  students={students}
                  selected={selected}
                  onSelect={setSelected}
                  subjectId={scope.subjectId}
                  placeholder="ค้นหาด้วยชื่อ, รหัสนักศึกษา"
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="รหัสนักศึกษา">
                <Input
                  value={mStudentId}
                  onChange={(e) =>
                    setMStudentId(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="6301xxxxx"
                  className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                />
                {mStudentId.length > 0 && !mStudentIdValid && (
                  <p className="mt-1 text-xs text-orange-400">
                    รหัสนักศึกษาต้องเป็นตัวเลข 10 หลัก
                  </p>
                )}
                {matchedStudent && (
                  <p className="mt-1 text-xs text-emerald-400">
                    ✓ พบในรายชื่อ: {matchedStudent.firstName} {matchedStudent.surname}
                    {sectionFor(matchedStudent) && ` · Sec ${sectionFor(matchedStudent)}`}
                  </p>
                )}
              </Field>
              {!matchedStudent && (
                <>
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
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="mt-1 w-full rounded-full bg-white font-semibold text-black hover:bg-white/90"
          >
            {submitting
              ? 'กำลังเข้าร่วม…'
              : checkpointIds.length > 1
                ? `+ เข้าร่วมคิว (${checkpointIds.length} Checkpoint)`
                : '+ เข้าร่วมคิว'}
          </Button>
        </form>
      </div>
    </div>
  );
}
