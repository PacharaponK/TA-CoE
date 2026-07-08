"use client";

import { useCallback, useEffect, useState } from "react";
import Loading from "@/app/loading";
import { ScopePicker } from "@/components/ScopePicker";
import { EmptyState, Spinner } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { queueApi, studentsApi } from "@/lib/api";
import { useScope } from "@/lib/useScope";
import { useRealtime } from "@/lib/useRealtime";
import { useAction } from "@/lib/useAction";
import type { QueueEntry, Student } from "@/lib/types";
import { Search, Sparkles, Activity, Layers } from "lucide-react";
import { QueueStats } from "./_components/QueueStats";
import { QueueRow } from "./_components/QueueRow";
import { EnqueueForm } from "./_components/EnqueueForm";
import { LabPauseCard } from "./_components/LabPauseCard";

function AdminQueue() {
  const {
    subjects,
    labs,
    scope,
    setScope,
    loading: scopeLoading,
    reloadLabs,
  } = useScope(true);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [queueSearch, setQueueSearch] = useState("");

  const selectedLab = labs.find((l) => l._id === scope.labId);
  const needsCheckpoint = (selectedLab?.checkpoints?.length ?? 0) > 0;
  const ready = scope.subjectId && scope.labId;

  useEffect(() => {
    if (!scope.subjectId) {
      setStudents([]);
      return;
    }
    studentsApi
      .list(true, scope.subjectId)
      .then(setStudents)
      .catch(() => {});
  }, [scope.subjectId]);

  const reload = useCallback(async () => {
    if (!scope.subjectId || !scope.labId) {
      setEntries([]);
      return;
    }
    setLoading(true);
    try {
      setEntries(
        await queueApi.active({
          subjectId: scope.subjectId,
          labId: scope.labId,
        }),
      );
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [scope.subjectId, scope.labId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleChange = useCallback(() => {
    reload();
    reloadLabs();
  }, [reload, reloadLabs]);

  useRealtime(handleChange);

  const run = useAction(reload, setError);

  // filter the live queue while keeping each entry's real position number
  const q = queueSearch.trim().toLowerCase();
  const shownEntries = entries
    .map((entry, i) => ({ entry, position: i + 1 }))
    .filter(({ entry }) =>
      !q ||
      entry.studentName.toLowerCase().includes(q) ||
      entry.studentId.includes(q) ||
      (entry.section ?? "").toLowerCase().includes(q),
    );

  return (
    <main className="container-page flex w-full flex-1 flex-col gap-8 py-8 relative z-10 animate-[fadeIn_0.5s_ease_both]">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900/40 to-zinc-950 p-6 sm:p-8 shadow-2xl animate-[fadeSlideDown_0.6s_ease_both]">
        <div className="absolute top-0 right-0 h-48 w-48 bg-zinc-500/10 rounded-full blur-[80px]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-300 shadow-lg backdrop-blur-md">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                จัดการคิว
              </h1>
              <p className="mt-1.5 text-sm text-zinc-400 font-medium">
                เรียกคิว ตรวจสอบ และบันทึกคะแนนสะสมปฏิบัติการแบบเรียลไทม์
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scope picker */}
      <div className="relative z-20 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 shadow-xl backdrop-blur-sm">
        <ScopePicker
          subjects={subjects}
          labs={labs}
          scope={scope}
          onChange={setScope}
        />
      </div>

      {scopeLoading ? (
        <Loading />
      ) : !ready ? (
        <EmptyState
          icon={<Search className="h-5 w-5 text-zinc-400" />}
          title="เลือกวิชาและปฏิบัติการก่อน"
          description="เพื่อเริ่มเพิ่มนักศึกษาเข้าคิว"
        />
      ) : (
        <>
          {/* Live queue */}
          <section className="flex flex-col gap-4 animate-[fadeIn_0.5s_ease_both]">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-805/60 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-zinc-500" />
                <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
                  คิวปัจจุบัน
                </h2>
              </div>
              <QueueStats entries={entries} />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            {entries.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="ค้นหาในคิว: ชื่อ / รหัสนักศึกษา / Section…"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  className="pl-9 border-zinc-800 bg-black/40 text-white placeholder-zinc-500 focus-visible:ring-zinc-500/20 focus-visible:border-zinc-700"
                />
              </div>
            )}

            {loading && entries.length === 0 ? (
              <Spinner />
            ) : entries.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="h-5 w-5 text-zinc-400" />}
                title="ยังไม่มีคิว"
              />
            ) : shownEntries.length === 0 ? (
              <EmptyState
                icon={<Search className="h-5 w-5 text-zinc-400" />}
                title="ไม่พบคิวที่ค้นหา"
                description="ลองเปลี่ยนคำค้นหา"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {shownEntries.map(({ entry, position }) => (
                  <QueueRow
                    key={entry._id}
                    entry={entry}
                    index={position}
                    onAction={run}
                  />
                ))}
              </div>
            )}
          </section>
          <EnqueueForm
            scope={scope}
            needsCheckpoint={needsCheckpoint}
            checkpoints={selectedLab?.checkpoints ?? []}
            students={students}
            entries={entries}
            onEnqueued={reload}
          />

          <LabPauseCard lab={selectedLab} onChanged={reloadLabs} />
        </>
      )}
    </main>
  );
}

export default function AdminPage() {
  return <AdminQueue />;
}
