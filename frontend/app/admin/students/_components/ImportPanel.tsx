'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { studentsApi } from '@/lib/api';
import type { Subject } from '@/lib/types';
import { parseStudentsCsv, type ParsedStudentRow } from './csv';

export function ImportPanel({
  subjects,
  onCancel,
  onDone,
}: {
  subjects: Subject[];
  onCancel: () => void;
  onDone: () => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedStudentRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ created: number; updated: number; errors: number } | null>(null);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);

  async function handleFile(file: File) {
    setError('');
    setResult(null);
    setFileName(file.name);
    const text = await file.text();
    try {
      setRows(parseStudentsCsv(text, subjects));
    } catch {
      setError('ไม่สามารถอ่านไฟล์นี้ได้ ตรวจสอบว่าเป็นไฟล์ CSV ที่ถูกต้อง');
      setRows([]);
    }
  }

  async function handleImport() {
    if (validRows.length === 0) return;
    setBusy(true);
    setError('');
    try {
      const res = await studentsApi.importMany(
        validRows.map((r) => ({
          studentId: r.studentId,
          firstName: r.firstName,
          surname: r.surname,
          nickname: r.nickname,
          year: r.year,
          section: r.section,
          email: r.email,
          phone: r.phone,
          isActive: r.isActive,
          subjectIds: r.subjectIds,
        })),
      );
      setResult({ created: res.created, updated: res.updated, errors: res.errors.length });
      await onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-xl">
      <CardContent className="pt-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">นำเข้านักศึกษาจาก CSV</p>
            <p className="mt-1 text-xs text-zinc-400">
              คอลัมน์ที่รองรับ: รหัสนักศึกษา, ชื่อ, นามสกุล, ชื่อเล่น, ชั้นปี, Section, อีเมล, เบอร์โทร, วิชา (คั่นด้วย ; ใช้รหัสวิชา), สถานะ.
              รหัสนักศึกษาที่มีอยู่แล้วจะถูกอัปเดตทับด้วยข้อมูลในไฟล์
            </p>
          </div>
          <Button type="button" variant="ghost" className="text-zinc-500 hover:text-white shrink-0" onClick={onCancel}>
            ปิด
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-lg border-zinc-700 bg-zinc-950/40 text-zinc-200 hover:bg-white hover:text-black"
            onClick={() => fileRef.current?.click()}
          >
            เลือกไฟล์ CSV…
          </Button>
          {fileName && <span className="text-xs text-zinc-400 truncate">{fileName}</span>}
        </div>

        {error && <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

        {rows.length > 0 && !result && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-emerald-400 border-emerald-900/40">
                พร้อมนำเข้า {validRows.length} แถว
              </Badge>
              {invalidRows.length > 0 && (
                <Badge variant="outline" className="text-destructive border-destructive/30">
                  มีปัญหา {invalidRows.length} แถว (จะถูกข้าม)
                </Badge>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto rounded-lg border border-zinc-800">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-zinc-950">
                  <tr className="text-left text-zinc-500">
                    <th className="px-3 py-2 font-medium">แถว</th>
                    <th className="px-3 py-2 font-medium">รหัสนักศึกษา</th>
                    <th className="px-3 py-2 font-medium">ชื่อ-นามสกุล</th>
                    <th className="px-3 py-2 font-medium">ปี</th>
                    <th className="px-3 py-2 font-medium">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.rowNumber}
                      className={cn('border-t border-zinc-800/60', r.errors.length > 0 && 'bg-destructive/5')}
                    >
                      <td className="px-3 py-1.5 text-zinc-500">{r.rowNumber}</td>
                      <td className="px-3 py-1.5 font-mono text-white">{r.studentId || '–'}</td>
                      <td className="px-3 py-1.5 text-zinc-300">{r.firstName} {r.surname}</td>
                      <td className="px-3 py-1.5 text-zinc-400">{r.year || '–'}</td>
                      <td className="px-3 py-1.5">
                        {r.errors.length > 0 ? (
                          <span className="text-destructive">{r.errors.join(', ')}</span>
                        ) : (
                          <span className="text-emerald-400">พร้อมนำเข้า</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                disabled={busy || validRows.length === 0}
                className="rounded-full bg-white text-black hover:bg-white/90 font-semibold"
                onClick={handleImport}
              >
                {busy ? 'กำลังนำเข้า…' : `นำเข้า ${validRows.length} รายการ`}
              </Button>
            </div>
          </>
        )}

        {result && (
          <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-300">
            นำเข้าสำเร็จ — เพิ่มใหม่ {result.created} คน, อัปเดต {result.updated} คน
            {result.errors > 0 && ` (ล้มเหลว ${result.errors} รายการ)`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
