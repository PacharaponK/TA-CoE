'use client';

import { useCallback, useEffect, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { AdminGate, LogoutButton } from '@/components/AdminGate';
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
import { queueApi } from '@/lib/api';
import { useScope } from '@/lib/useScope';
import { fmtDateTime } from '@/lib/format';
import type { QueueEntry } from '@/lib/types';

function History() {
  const { subjects, labs, scope, setScope } = useScope(false);
  const [studentId, setStudentId] = useState('');
  const [rows, setRows] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

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
    <main className="container-page flex w-full flex-1 flex-col gap-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">TA Console</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">History</h1>
          <p className="text-sm text-muted-foreground">ผลการตรวจ Checkpoint ทั้งหมด</p>
        </div>
        <LogoutButton />
      </div>

      <Card className="shadow-soft">
        <CardContent className="flex flex-col gap-4 pt-6">
          <ScopePicker subjects={subjects} labs={labs} scope={scope} onChange={setScope} />
          <Separator />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Field label="ค้นหารหัสนักศึกษา" className="sm:w-64">
              <Input value={studentId} onChange={(e) => setStudentId(e.target.value)}
                placeholder="6500001" />
            </Field>
            <Button onClick={handleExport} disabled={exporting || rows.length === 0}
              className="rounded-full">
              {exporting ? 'กำลังสร้าง…' : '⬇ Export CSV'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && rows.length === 0 ? <Spinner /> :
        rows.length === 0 ? (
          <EmptyState icon="📊" title="ยังไม่มีประวัติ"
            description="ผลการตรวจที่บันทึกแล้วจะปรากฏที่นี่" />
        ) : (
          <Card className="overflow-hidden shadow-soft">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {['นักศึกษา', 'Sec', 'วิชา / Lab', 'Checkpoint', 'ครั้งที่', 'ผล', 'เวลาตรวจ', 'ผู้ตรวจ', ''].map((h) => (
                    <TableHead key={h} className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{r.studentName}</div>
                      <div className="text-xs text-muted-foreground">{r.studentId}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.section || '–'}</TableCell>
                    <TableCell>
                      <div className="text-foreground">{r.subjectName}</div>
                      <div className="text-xs text-muted-foreground">{r.labName}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.checkpointName ?? '–'}</TableCell>
                    <TableCell className="text-muted-foreground">{r.attempt}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{fmtDateTime(r.resolvedAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{r.resolvedBy || '–'}</TableCell>
                    <TableCell>
                      {r.status === 'failed' && (
                        <Button size="sm" variant="outline"
                          className="whitespace-nowrap"
                          onClick={async () => {
                            try { await queueApi.requeue(r._id); await reload(); }
                            catch (e) { setError((e as Error).message); }
                          }}>
                          เข้าคิวใหม่
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
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
