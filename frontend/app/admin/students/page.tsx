'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState, Field, Spinner } from '@/components/ui';
import { studentsApi } from '@/lib/api';
import { useAction } from '@/lib/useAction';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
import type { Student } from '@/lib/types';
import { StudentForm } from './_components/StudentForm';

// ── Stats chip ────────────────────────────────────────────────────
function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md px-5 py-3 shadow-md">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="mt-0.5 text-xs text-zinc-400">{label}</span>
    </div>
  );
}

// ── Main manager ──────────────────────────────────────────────────
function Manager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // filter state
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSection, setFilterSection] = useState('');

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try { setStudents(await studentsApi.list(false)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const run = useAction(reload, setError);

  // derived
  const years = useMemo(() => [...new Set(students.map(s => s.year))].sort(), [students]);
  const sections = useMemo(() => [...new Set(students.map(s => s.section).filter(Boolean))].sort(), [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter(s => {
      if (filterYear && String(s.year) !== filterYear) return false;
      if (filterSection && s.section !== filterSection) return false;
      if (!q) return true;
      return (
        s.studentId.includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.surname.toLowerCase().includes(q) ||
        s.nickname.toLowerCase().includes(q)
      );
    });
  }, [students, search, filterYear, filterSection]);

  const byYear = useMemo(() =>
    years.map(y => ({ year: y, count: students.filter(s => s.year === y).length })),
    [students, years]);

  function openAdd() { setEditStudent(null); setShowForm(true); }
  function openEdit(s: Student) { setShowForm(false); setEditStudent(s); }
  function closeForm() { setShowForm(false); setEditStudent(null); }

  return (
    <main className="container-page flex w-full flex-1 flex-col gap-8 py-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">นักศึกษา</h1>
        <p className="mt-1 text-sm text-zinc-400">จัดการข้อมูลนักศึกษาในระบบ</p>
      </div>

      {error && <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

      {/* Stats */}
      {!loading && students.length > 0 && (
        <div className="flex flex-wrap gap-3 animate-[fadeSlideUp_0.8s_ease_0.15s_both]">
          <StatChip label="ทั้งหมด" value={students.length} />
          {byYear.map(({ year, count }) => (
            <StatChip key={year} label={`ชั้นปีที่ ${year}`} value={count} />
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-3 animate-[fadeSlideUp_0.8s_ease_0.2s_both]">
        <Field label="ค้นหา" className="min-w-[200px] flex-1">
          <Input
            placeholder="ชื่อ / รหัสนักศึกษา / ชื่อเล่น…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
          />
        </Field>

        <Field label="ชั้นปี" className="w-32">
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className={cn(
              'flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-1',
              'text-sm text-white shadow-sm transition-colors outline-none',
              'focus:ring-1 focus:ring-zinc-500/30',
            )}
          >
            <option value="" className="bg-zinc-900 text-white">ทั้งหมด</option>
            {years.map(y => <option key={y} value={y} className="bg-zinc-900 text-white">ปีที่ {y}</option>)}
          </select>
        </Field>

        {sections.length > 0 && (
          <Field label="Section" className="w-32">
            <select
              value={filterSection}
              onChange={e => setFilterSection(e.target.value)}
              className={cn(
                'flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-1',
                'text-sm text-white shadow-sm transition-colors outline-none',
                'focus:ring-1 focus:ring-zinc-500/30',
              )}
            >
              <option value="" className="bg-zinc-900 text-white">ทั้งหมด</option>
              {sections.map(sec => <option key={sec} value={sec} className="bg-zinc-900 text-white">{sec}</option>)}
            </select>
          </Field>
        )}

        <Button
          variant="outline"
          className="self-end rounded-full border-white/15 text-zinc-300 hover:bg-white/5 hover:text-white"
          onClick={showForm && !editStudent ? closeForm : openAdd}
        >
          {showForm && !editStudent ? 'ยกเลิก' : '+ เพิ่มนักศึกษา'}
        </Button>
      </div>

      {/* Add form */}
      {showForm && !editStudent && (
        <StudentForm
          onCancel={closeForm}
          onSubmit={async data => {
            await run(() => studentsApi.create(data));
            closeForm();
          }}
        />
      )}

      {/* List */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={students.length === 0 ? 'ยังไม่มีนักศึกษา' : 'ไม่พบนักศึกษาที่ค้นหา'}
          description={students.length === 0 ? 'กด "+ เพิ่มนักศึกษา" เพื่อเริ่มต้น' : 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง'}
          icon={<Users className="h-5 w-5 text-zinc-400" />}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {/* Table header */}
          <div className="hidden grid-cols-[3rem_10rem_1fr_6rem_4rem_4rem_6rem] items-center gap-3 px-4 sm:grid">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">รหัสนักศึกษา</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ชื่อ – นามสกุล</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ชื่อเล่น</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ปี</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sec</span>
            <span />
          </div>

          {filtered.map((s, idx) =>
            editStudent?._id === s._id ? (
              <StudentForm
                key={s._id}
                initial={s}
                onCancel={closeForm}
                onSubmit={async data => {
                  await run(() => studentsApi.update(s._id, data));
                  closeForm();
                }}
              />
            ) : (
              <Card
                key={s._id}
                className={cn(
                  'transition-all duration-300 bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm hover:border-zinc-700',
                  !s.isActive && 'opacity-40',
                )}
              >
                <CardContent className="py-3">
                  {/* Mobile layout */}
                  <div className="flex items-start justify-between gap-3 sm:hidden">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {s.firstName} {s.surname}
                        {s.nickname && (
                          <span className="ml-1.5 text-xs font-normal text-zinc-400">({s.nickname})</span>
                        )}
                        {!s.isActive && <Badge variant="secondary" className="ml-2 text-xs">ปิด</Badge>}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {s.studentId} · ปีที่ {s.year}{s.section ? ` · Sec ${s.section}` : ''}
                      </p>
                    </div>
                    <RowActions s={s} onEdit={() => openEdit(s)} onDelete={() => run(() => studentsApi.remove(s._id))} />
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden grid-cols-[3rem_10rem_1fr_6rem_4rem_4rem_6rem] items-center gap-3 sm:grid">
                    <span className="text-xs text-zinc-500">{idx + 1}</span>
                    <span className="font-mono text-sm text-white">{s.studentId}</span>
                    <span className="min-w-0 truncate text-sm font-medium text-white">
                      {s.firstName} {s.surname}
                      {!s.isActive && <Badge variant="secondary" className="ml-2 text-xs bg-zinc-800 text-zinc-300">ปิด</Badge>}
                    </span>
                    <span className="text-sm text-zinc-400">{s.nickname || '–'}</span>
                    <span className="text-sm text-zinc-400">{s.year}</span>
                    <span className="text-sm text-zinc-400">{s.section || '–'}</span>
                    <RowActions s={s} onEdit={() => openEdit(s)} onDelete={() => run(() => studentsApi.remove(s._id))} />
                  </div>
                </CardContent>
              </Card>
            )
          )}

          <p className="text-right text-xs text-muted-foreground">
            แสดง {filtered.length} จาก {students.length} คน
          </p>
        </div>
      )}
    </main>
  );
}

// ── Row action buttons ────────────────────────────────────────────
function RowActions({
  s,
  onEdit,
  onDelete,
}: {
  s: Student;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <Button size="sm" variant="ghost" onClick={onEdit}>
        แก้ไข
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => {
          if (confirm(`ลบ ${s.firstName} ${s.surname} (${s.studentId}) ออกจากระบบ?`))
            onDelete();
        }}
      >
        ลบ
      </Button>
    </div>
  );
}

export default function StudentsPage() {
  return <Manager />;
}
