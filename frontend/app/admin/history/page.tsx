"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Loading from "@/app/loading";
import { ScopePicker } from "@/components/ScopePicker";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, Field, Spinner } from "@/components/ui";
import { History as HistoryIcon } from "lucide-react";
import { queueApi } from "@/lib/api";
import { useScope } from "@/lib/useScope";
import { fmtDateTime } from "@/lib/format";
import type { QueueEntry } from "@/lib/types";
import { DetailModal } from "./_components/DetailModal";

type Group = {
  studentId: string;
  studentName: string;
  section: string;
  rows: QueueEntry[];
};

function History() {
  const {
    subjects,
    labs,
    scope,
    setScope,
    loading: scopeLoading,
  } = useScope(false);
  const [studentId, setStudentId] = useState("");
  const [rows, setRows] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [selectedRow, setSelectedRow] = useState<QueueEntry | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(
        await queueApi.history({
          subjectId: scope.subjectId || undefined,
          labId: scope.labId || undefined,
          checkpointId:
            scope.checkpointId && scope.checkpointId !== "__all__"
              ? scope.checkpointId
              : undefined,
          studentId: studentId.trim() || undefined,
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [scope, studentId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Group entries by student, sorted by studentId
  const grouped = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    for (const r of rows) {
      const g = map.get(r.studentId);
      if (g) {
        g.rows.push(r);
      } else {
        map.set(r.studentId, {
          studentId: r.studentId,
          studentName: r.studentName,
          section: r.section || "",
          rows: [r],
        });
      }
    }
    return [...map.values()].sort((a, b) =>
      a.studentId.localeCompare(b.studentId),
    );
  }, [rows]);

  async function handleRequeue(id: string) {
    setError("");
    try {
      await queueApi.requeue(id);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("คุณต้องการลบประวัติรายการนี้ใช่หรือไม่?")) return;
    setError("");
    try {
      await queueApi.remove(id);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleExport() {
    setExporting(true);
    setError("");
    try {
      await queueApi.downloadCsv({
        subjectId: scope.subjectId || undefined,
        labId: scope.labId || undefined,
        checkpointId:
          scope.checkpointId && scope.checkpointId !== "__all__"
            ? scope.checkpointId
            : undefined,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="container-page flex w-full flex-1 flex-col gap-6 py-8 relative z-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          History
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          ผลการตรวจ Checkpoint ทั้งหมด
        </p>
      </div>

      {/* Scope picker */}
      <div className="relative z-20 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-xl p-6">
        <ScopePicker
          subjects={subjects}
          labs={labs}
          scope={scope}
          onChange={setScope}
        />
      </div>

      {/* Search + export */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Field label="ค้นหารหัสนักศึกษา" className="sm:w-64">
            <Input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="6610110190"
              className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
            />
          </Field>
          <Button
            onClick={handleExport}
            disabled={exporting || rows.length === 0}
            className="rounded-full bg-white text-black hover:bg-white/90 font-semibold"
          >
            {exporting ? "กำลังสร้าง…" : "⬇ Export CSV"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {scopeLoading ? (
        <Loading />
      ) : loading && rows.length === 0 ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon className="h-5 w-5 text-zinc-400" />}
          title="ยังไม่มีประวัติ"
          description="ผลการตรวจที่บันทึกแล้วจะปรากฏที่นี่"
        />
      ) : (
        <div className="flex flex-col gap-4 animate-[fadeSlideUp_0.8s_ease_0.2s_both]">
          {/* ── Mobile: grouped cards ── */}
          <div className="flex flex-col gap-4 md:hidden">
            {grouped.map((group) => (
              <div
                key={group.studentId}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30"
              >
                {/* Student header */}
                <div className="flex items-center gap-3 border-b border-zinc-800/70 bg-white/[0.03] px-4 py-3">
                  <span className="font-mono text-sm font-bold text-white">
                    {group.studentId}
                  </span>
                  <span className="text-sm text-zinc-300">
                    {group.studentName}
                  </span>
                  {group.section && (
                    <span className="text-xs text-zinc-500">
                      · Sec {group.section}
                    </span>
                  )}
                  <span className="ml-auto shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-zinc-400">
                    {group.rows.length} รายการ
                  </span>
                </div>

                {/* Attempt rows */}
                <div className="divide-y divide-zinc-800/50">
                  {group.rows.map((r) => (
                    <div key={r._id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 flex flex-col gap-1">
                          <p className="text-sm font-medium text-white truncate">
                            {r.subjectName} · {r.labName}
                          </p>
                          {r.checkpointName && (
                            <p className="text-xs text-zinc-400">
                              {r.checkpointName}
                            </p>
                          )}
                          <p className="text-xs text-zinc-500">
                            {fmtDateTime(r.resolvedAt)}
                            {r.resolvedBy && ` · ผู้ตรวจ ${r.resolvedBy}`}
                            {` · ครั้งที่ ${r.attempt}`}
                          </p>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-2 border-t border-zinc-800/50 pt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-zinc-400 hover:text-white rounded-full"
                          onClick={() => setSelectedRow(r)}
                        >
                          ดู
                        </Button>
                        {r.status === "failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="whitespace-nowrap rounded-full border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
                            onClick={() => handleRequeue(r._id)}
                          >
                            เข้าคิวใหม่
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full"
                          onClick={() => handleDelete(r._id)}
                        >
                          ลบ
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop: grouped table ── */}
          <div className="hidden md:block relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-xl">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/5 border-b border-white/5 hover:bg-white/5">
                  {[
                    "",
                    "วิชา / Lab",
                    "Checkpoint",
                    "ครั้งที่",
                    "ผล",
                    "เวลาตรวจ",
                    "ผู้ตรวจ",
                    "",
                  ].map((h, i) => (
                    <TableHead
                      key={i}
                      className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-zinc-400"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {grouped.map((group) => (
                  <Fragment key={group.studentId}>
                    {/* Group header row */}
                    <TableRow className="border-t-2 border-zinc-700/40 bg-white/[0.03] hover:bg-white/[0.03]">
                      <TableCell colSpan={8} className="py-2.5 pl-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold text-white">
                            {group.studentId}
                          </span>
                          <span className="text-sm text-zinc-300">
                            {group.studentName}
                          </span>
                          {group.section && (
                            <span className="text-xs text-zinc-500">
                              · Sec {group.section}
                            </span>
                          )}
                          <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-400">
                            {group.rows.length} รายการ
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Attempt rows */}
                    {group.rows.map((r) => (
                      <TableRow
                        key={r._id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <TableCell className="w-8 pl-5 text-zinc-600 text-xs">
                          ↳
                        </TableCell>
                        <TableCell className="max-w-[14rem]">
                          <div
                            className="font-medium text-white truncate"
                            title={r.subjectName}
                          >
                            {r.subjectName}
                          </div>
                          <div
                            className="text-xs text-zinc-400 mt-0.5 truncate"
                            title={r.labName}
                          >
                            {r.labName}
                          </div>
                        </TableCell>
                        <TableCell
                          className="text-zinc-300 max-w-[10rem] truncate"
                          title={r.checkpointName ?? "–"}
                        >
                          {r.checkpointName ?? "–"}
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {r.attempt}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={r.status} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-zinc-400">
                          {fmtDateTime(r.resolvedAt)}
                        </TableCell>
                        <TableCell
                          className="text-zinc-300 max-w-[10rem] truncate"
                          title={r.resolvedBy || "–"}
                        >
                          {r.resolvedBy || "–"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-zinc-400 hover:text-white rounded-full"
                              onClick={() => setSelectedRow(r)}
                            >
                              ดู
                            </Button>
                            {r.status === "failed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="whitespace-nowrap rounded-full border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
                                onClick={() => handleRequeue(r._id)}
                              >
                                เข้าคิวใหม่
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full"
                              onClick={() => handleDelete(r._id)}
                            >
                              ลบ
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {selectedRow && (
        <DetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </main>
  );
}

export default function HistoryPage() {
  return <History />;
}
