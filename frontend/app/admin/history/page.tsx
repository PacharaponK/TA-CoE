'use client';

import { useCallback, useEffect, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { AdminGate, LogoutButton } from '@/components/AdminGate';
import Loading from '@/app/loading';
import { ScopePicker } from '@/components/ScopePicker';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { EmptyState, Field, Spinner } from '@/components/ui';
import { History as HistoryIcon } from 'lucide-react';
import { queueApi } from '@/lib/api';
import { useScope } from '@/lib/useScope';
import { fmtDateTime } from '@/lib/format';
import type { QueueEntry } from '@/lib/types';

function History() {
  const { subjects, labs, scope, setScope, loading: scopeLoading } = useScope(false);
  const [studentId, setStudentId] = useState('');
  const [rows, setRows] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [selectedRow, setSelectedRow] = useState<QueueEntry | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await queueApi.history({
        subjectId: scope.subjectId || undefined,
        labId: scope.labId || undefined,
        checkpointId: scope.checkpointId && scope.checkpointId !== '__all__'
          ? scope.checkpointId : undefined,
        studentId: studentId.trim() || undefined,
      }));
    } catch (e) {
      setError((e as Error).message);
    } finally { setLoading(false); }
  }, [scope, studentId]);

  useEffect(() => { reload(); }, [reload]);

  async function handleExport() {
    setExporting(true);
    setError('');
    try {
      await queueApi.downloadCsv({
        subjectId: scope.subjectId || undefined,
        labId: scope.labId || undefined,
        checkpointId: scope.checkpointId && scope.checkpointId !== '__all__'
          ? scope.checkpointId : undefined,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally { setExporting(false); }
  }

  return (
    <main className="container-page flex w-full flex-1 flex-col gap-6 py-8 relative z-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">TA Console</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">History</h1>
          <p className="text-sm text-zinc-400">ผลการตรวจ Checkpoint ทั้งหมด</p>
        </div>
        <LogoutButton />
      </div>

      <div className="relative z-20 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-xl p-6">

        <div className="flex flex-col gap-4">
          <ScopePicker subjects={subjects} labs={labs} scope={scope} onChange={setScope} />
          <Separator className="bg-white/5" />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Field label="ค้นหารหัสนักศึกษา" className="sm:w-64">
              <Input value={studentId} onChange={(e) => setStudentId(e.target.value)}
                placeholder="6500001" className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30" />
            </Field>
            <Button onClick={handleExport} disabled={exporting || rows.length === 0}
              className="rounded-full bg-white text-black hover:bg-white/90 font-semibold">
              {exporting ? 'กำลังสร้าง…' : '⬇ Export CSV'}
            </Button>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {scopeLoading ? (
        <Loading />
      ) : loading && rows.length === 0 ? (
        <Spinner />
      ) : rows.length === 0 ? (
          <EmptyState icon={<HistoryIcon className="h-5 w-5 text-zinc-400" />} title="ยังไม่มีประวัติ"
            description="ผลการตรวจที่บันทึกแล้วจะปรากฏที่นี่" />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Mobile Card Layout */}
            <div className="flex flex-col gap-3 md:hidden animate-[fadeSlideUp_0.8s_ease_0.2s_both]">
              {rows.map((r) => (
                <Card key={r._id} className="bg-zinc-900/30 border border-zinc-800 p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white text-sm truncate" title={r.studentName}>{r.studentName}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{r.studentId} · Sec {r.section || '–'}</div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-zinc-800/50 pt-3 text-xs">
                    <div className="min-w-0">
                      <span className="text-zinc-500 font-medium block">วิชา / Lab</span>
                      <span className="text-zinc-300 mt-0.5 block truncate" title={`${r.subjectName} · ${r.labName}`}>
                        {r.subjectName} · {r.labName}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-zinc-500 font-medium block">Checkpoint</span>
                      <span className="text-zinc-300 mt-0.5 block truncate" title={r.checkpointName ?? '–'}>
                        {r.checkpointName ?? '–'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-medium block">เวลาตรวจ</span>
                      <span className="text-zinc-400 mt-0.5 block">{fmtDateTime(r.resolvedAt)}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-zinc-500 font-medium block">ผู้ตรวจ / ครั้งที่</span>
                      <span className="text-zinc-300 mt-0.5 block truncate" title={r.resolvedBy || '–'}>
                        {r.resolvedBy || '–'} (ครั้งที่ {r.attempt})
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 justify-end border-t border-zinc-800/50 pt-3">
                    <Button size="sm" variant="ghost"
                      className="text-zinc-400 hover:text-white rounded-full"
                      onClick={() => setSelectedRow(r)}>
                      ดู
                    </Button>
                    {r.status === 'failed' && (
                      <Button size="sm" variant="outline"
                        className="whitespace-nowrap rounded-full border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
                        onClick={async () => {
                          try { await queueApi.requeue(r._id); await reload(); }
                          catch (e) { setError((e as Error).message); }
                        }}>
                        เข้าคิวใหม่
                      </Button>
                    )}
                    <Button size="sm" variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full"
                      onClick={async () => {
                        if (confirm('คุณต้องการลบประวัติรายการนี้ใช่หรือไม่?')) {
                          try {
                            await queueApi.remove(r._id);
                            await reload();
                          } catch (e) {
                            setError((e as Error).message);
                          }
                        }
                      }}>
                      ลบ
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-xl animate-[fadeSlideUp_0.8s_ease_0.2s_both]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 border-b border-white/5 hover:bg-white/5">
                    {['นักศึกษา', 'Sec', 'วิชา / Lab', 'Checkpoint', 'ครั้งที่', 'ผล', 'เวลาตรวจ', 'ผู้ตรวจ', ''].map((h) => (
                      <TableHead key={h} className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r._id} className="border-b border-white/5 hover:bg-white/5">
                      <TableCell className="max-w-[12rem]">
                        <div className="font-semibold text-white truncate" title={r.studentName}>{r.studentName}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{r.studentId}</div>
                      </TableCell>
                      <TableCell className="text-zinc-300">{r.section || '–'}</TableCell>
                      <TableCell className="max-w-[14rem]">
                        <div className="text-white font-medium truncate" title={r.subjectName}>{r.subjectName}</div>
                        <div className="text-xs text-zinc-400 mt-0.5 truncate" title={r.labName}>{r.labName}</div>
                      </TableCell>
                      <TableCell className="text-zinc-300 max-w-[10rem] truncate" title={r.checkpointName ?? '–'}>
                        {r.checkpointName ?? '–'}
                      </TableCell>
                      <TableCell className="text-zinc-300">{r.attempt}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="whitespace-nowrap text-zinc-400">{fmtDateTime(r.resolvedAt)}</TableCell>
                      <TableCell className="text-zinc-300 max-w-[10rem] truncate" title={r.resolvedBy || '–'}>
                        {r.resolvedBy || '–'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <Button size="sm" variant="ghost"
                            className="text-zinc-400 hover:text-white rounded-full"
                            onClick={() => setSelectedRow(r)}>
                            ดู
                          </Button>
                          {r.status === 'failed' && (
                            <Button size="sm" variant="outline"
                              className="whitespace-nowrap rounded-full border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
                              onClick={async () => {
                                try { await queueApi.requeue(r._id); await reload(); }
                                catch (e) { setError((e as Error).message); }
                              }}>
                              เข้าคิวใหม่
                            </Button>
                          )}
                          <Button size="sm" variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full"
                            onClick={async () => {
                              if (confirm('คุณต้องการลบประวัติรายการนี้ใช่หรือไม่?')) {
                                try {
                                  await queueApi.remove(r._id);
                                  await reload();
                                } catch (e) {
                                  setError((e as Error).message);
                                }
                              }
                            }}>
                            ลบ
                          </Button>
                        </div>
                      </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Details Dialog Modal */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease_both]">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-[scaleUp_0.2s_ease_both]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">รายละเอียดประวัติ</h2>
                <p className="text-xs text-zinc-400 mt-1">คิวตรวจของนักศึกษา</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-zinc-400 hover:text-white rounded-full h-8 w-8 p-0"
                onClick={() => setSelectedRow(null)}
              >
                ✕
              </Button>
            </div>

            <div className="mt-6 flex flex-col gap-4 text-sm">
              <div className="grid grid-cols-3 gap-2 border-b border-zinc-900 pb-3">
                <span className="text-zinc-500 font-medium">ชื่อนักศึกษา</span>
                <span className="col-span-2 text-white font-semibold">{selectedRow.studentName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-zinc-900 pb-3">
                <span className="text-zinc-500 font-medium">รหัสนักศึกษา</span>
                <span className="col-span-2 text-zinc-300 font-mono">{selectedRow.studentId}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-zinc-900 pb-3">
                <span className="text-zinc-500 font-medium">Section</span>
                <span className="col-span-2 text-zinc-300">{selectedRow.section || '–'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-zinc-900 pb-3">
                <span className="text-zinc-500 font-medium">วิชา</span>
                <span className="col-span-2 text-zinc-300">{selectedRow.subjectName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-zinc-900 pb-3">
                <span className="text-zinc-500 font-medium">Lab</span>
                <span className="col-span-2 text-zinc-300">{selectedRow.labName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-zinc-900 pb-3">
                <span className="text-zinc-500 font-medium">Checkpoint</span>
                <span className="col-span-2 text-zinc-300">{selectedRow.checkpointName ?? '–'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-zinc-900 pb-3">
                <span className="text-zinc-500 font-medium">ตรวจครั้งที่</span>
                <span className="col-span-2 text-zinc-300">{selectedRow.attempt}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-zinc-900 pb-3">
                <span className="text-zinc-500 font-medium">ผลการตรวจ</span>
                <span className="col-span-2"><StatusBadge status={selectedRow.status} /></span>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-zinc-900 pb-3">
                <span className="text-zinc-500 font-medium">เวลาที่บันทึก</span>
                <span className="col-span-2 text-zinc-400">{fmtDateTime(selectedRow.resolvedAt)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pb-1">
                <span className="text-zinc-500 font-medium">ผู้ตรวจ (TA)</span>
                <span className="col-span-2 text-zinc-300">{selectedRow.resolvedBy || '–'}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                className="rounded-full bg-white text-black hover:bg-white/90 font-semibold px-6"
                onClick={() => setSelectedRow(null)}
              >
                ปิด
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <AdminGate redirectTo="/admin">
        <History />
        <Footer />
      </AdminGate>
    </div>
  );
}
