'use client';

import { useEffect, useState } from 'react';
import { StudentSearchInput } from '@/components/StudentSearchInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Field } from '@/components/ui';
import { queueApi } from '@/lib/api';
import type { QueueEntry, Student } from '@/lib/types';

interface Scope {
  subjectId: string;
  labId: string;
  checkpointId: string;
}

export function EnqueueForm({
  scope,
  needsCheckpoint,
  students,
  entries,
  onEnqueued,
}: {
  scope: Scope;
  needsCheckpoint: boolean;
  students: Student[];
  entries: QueueEntry[];
  onEnqueued: () => void;
}) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [section, setSection] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedStudent?.section) setSection(selectedStudent.section);
  }, [selectedStudent]);

  const alreadyIn = selectedStudent
    ? entries.some(
        (e) =>
          e.studentId === selectedStudent.studentId &&
          (!scope.checkpointId ||
            scope.checkpointId === '__all__' ||
            e.checkpointId === scope.checkpointId),
      )
    : false;

  const canAdd =
    !!selectedStudent &&
    !alreadyIn &&
    (!needsCheckpoint || (scope.checkpointId && scope.checkpointId !== '__all__'));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setError('');
    setBusy(true);
    try {
      await queueApi.enqueue({
        subjectId: scope.subjectId,
        labId: scope.labId,
        checkpointId:
          scope.checkpointId && scope.checkpointId !== '__all__'
            ? scope.checkpointId
            : null,
        studentId: selectedStudent.studentId,
        studentName: `${selectedStudent.firstName} ${selectedStudent.surname}`,
        section: section.trim() || undefined,
      });
      setSelectedStudent(null);
      setSection('');
      onEnqueued();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_8rem_auto]">
          <Field label="ค้นหานักศึกษา">
            <StudentSearchInput
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
            disabled={!canAdd || busy}
            className="self-end rounded-full bg-white text-black hover:bg-white/90 font-semibold"
          >
            {busy ? 'กำลังเพิ่ม…' : '+ เพิ่มเข้าคิว'}
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
  );
}
