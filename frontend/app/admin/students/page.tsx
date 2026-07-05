'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState, Field, Spinner } from '@/components/ui';
import { studentsApi, subjectsApi } from '@/lib/api';
import { useAction } from '@/lib/useAction';
import { confirmToast } from '@/lib/confirm-toast';
import { cn } from '@/lib/utils';
import {
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Upload,
  Download,
} from 'lucide-react';
import type { Student, Subject } from '@/lib/types';
import { StudentForm } from './_components/StudentForm';
import { BulkActionsBar } from './_components/BulkActionsBar';
import { ImportPanel } from './_components/ImportPanel';
import { downloadCsv, studentsToCsv } from './_components/csv';

// ── Stats chip ────────────────────────────────────────────────────
function StatChip({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "group flex flex-col items-center justify-center flex-1 min-w-[140px] rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md px-6 py-4 shadow-md transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
      className
    )}>
      {icon && (
        <div className="mb-2 text-zinc-400 group-hover:text-zinc-200 transition-colors">
          {icon}
        </div>
      )}
      <span className="text-3xl font-extrabold text-white tracking-tight leading-none">
        {value}
      </span>
      <span className="mt-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-center">
        {label}
      </span>
    </div>
  );
}

// ── Main manager ──────────────────────────────────────────────────
function Manager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // filter state
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [showImport, setShowImport] = useState(false);

  // bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const reload = useCallback(async () => {
    setLoading(true);
    try { setStudents(await studentsApi.list(false)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { subjectsApi.list().then(setSubjects).catch(() => {}); }, []);

  // reset to page 1 and clear selection on filter/itemsPerPage change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [search, filterYear, filterSection, filterSubject, itemsPerPage]);

  // drop selections that no longer exist after a reload (e.g. deleted elsewhere)
  useEffect(() => {
    setSelectedIds((prev) => {
      const ids = new Set(students.map((s) => s._id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [students]);

  const subjectById = useMemo(
    () => new Map(subjects.map((s) => [s._id, s])),
    [subjects],
  );

  const run = useAction(reload, setError);

  // derived
  const years = useMemo(() => [...new Set(students.map(s => s.year))].sort(), [students]);
  const sections = useMemo(() => [...new Set(students.map(s => s.section).filter(Boolean))].sort(), [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter(s => {
      if (filterYear && String(s.year) !== filterYear) return false;
      if (filterSection && s.section !== filterSection) return false;
      if (filterSubject && !s.subjectIds.includes(filterSubject)) return false;
      if (!q) return true;
      return (
        s.studentId.includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.surname.toLowerCase().includes(q) ||
        s.nickname.toLowerCase().includes(q)
      );
    });
  }, [students, search, filterYear, filterSection, filterSubject]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const pageNumbers = useMemo(() => {
    const range: (number | string)[] = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  }, [currentPage, totalPages]);

  const byYear = useMemo(() =>
    years.map(y => ({ year: y, count: students.filter(s => s.year === y).length })),
    [students, years]);

  function openAdd() { setEditStudent(null); setShowForm(true); setShowImport(false); }
  function openEdit(s: Student) { setShowForm(false); setEditStudent(s); }
  function closeForm() { setShowForm(false); setEditStudent(null); }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const pageIds = useMemo(() => paginatedStudents.map((s) => s._id), [paginatedStudents]);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected = pageIds.some((id) => selectedIds.has(id));

  function toggleSelectPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function handleExportCsv() {
    const csv = studentsToCsv(filtered, subjectById);
    downloadCsv(`students-export-${Date.now()}.csv`, csv);
  }

  async function handleBulkActivate() {
    await run(() => studentsApi.bulkUpdate({ ids: [...selectedIds], isActive: true }));
    setSelectedIds(new Set());
  }
  async function handleBulkDeactivate() {
    await run(() => studentsApi.bulkUpdate({ ids: [...selectedIds], isActive: false }));
    setSelectedIds(new Set());
  }
  async function handleBulkAddSubject(subjectId: string) {
    await run(() => studentsApi.bulkUpdate({ ids: [...selectedIds], addSubjectId: subjectId }));
    setSelectedIds(new Set());
  }
  async function handleBulkRemoveSubject(subjectId: string) {
    await run(() => studentsApi.bulkUpdate({ ids: [...selectedIds], removeSubjectId: subjectId }));
    setSelectedIds(new Set());
  }
  async function handleBulkDelete() {
    await run(() => studentsApi.removeMany([...selectedIds]));
    setSelectedIds(new Set());
  }

  return (
    <main className="container-page flex w-full flex-1 flex-col gap-8 py-8 animate-[fadeIn_0.5s_ease_both]">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900/40 to-zinc-950 p-6 sm:p-8 shadow-2xl animate-[fadeSlideDown_0.6s_ease_both]">
        <div className="absolute top-0 right-0 h-48 w-48 bg-zinc-500/10 rounded-full blur-[80px]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-300 shadow-lg backdrop-blur-md">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                นักศึกษา
              </h1>
              <p className="mt-1.5 text-sm text-zinc-400">
                จัดการข้อมูลและรายวิชาของนักศึกษาในระบบคิวปฏิบัติการ
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

      {/* Stats */}
      {!loading && students.length > 0 && (
        <div className="flex flex-wrap gap-3 w-full animate-[fadeSlideUp_0.8s_ease_0.15s_both]">
          <StatChip
            label="ทั้งหมด"
            value={students.length}
            icon={<Users className="h-5 w-5 text-emerald-400" />}
            className="sm:flex-[2] md:flex-[3] sm:min-w-[200px] border-emerald-900/30 bg-emerald-950/15 hover:border-emerald-500/40 hover:bg-emerald-950/30 hover:shadow-emerald-950/30"
          />
          {byYear.map(({ year, count }) => (
            <StatChip key={year} label={`ชั้นปีที่ ${year}`} value={count} icon={<GraduationCap className="h-5 w-5 text-zinc-400" />} />
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm p-4 sm:p-6 flex flex-col gap-4 animate-[fadeSlideUp_0.8s_ease_0.2s_both]">
        <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
          <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">ตัวกรองและค้นหา</span>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="ค้นหานักศึกษา" className="min-w-[200px] flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="ชื่อ / รหัสนักศึกษา / ชื่อเล่น…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 border-zinc-800 bg-black/40 text-white placeholder-zinc-500 focus-visible:ring-zinc-500/20 focus-visible:border-zinc-700 hover:border-zinc-800 transition-colors"
              />
            </div>
          </Field>

          <Field label="ชั้นปี" className="w-32">
            <div className="relative">
              <select
                value={filterYear}
                onChange={e => setFilterYear(e.target.value)}
                className={cn(
                  'appearance-none flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 pr-8 py-1',
                  'text-sm text-white shadow-sm transition-all duration-200 outline-none cursor-pointer',
                  'focus:border-zinc-700 focus:ring-1 focus:ring-zinc-500/10 hover:border-zinc-700 hover:bg-zinc-900/40',
                )}
              >
                <option value="" className="bg-zinc-950 text-white">ทั้งหมด</option>
                {years.map(y => <option key={y} value={y} className="bg-zinc-950 text-white">ปีที่ {y}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
            </div>
          </Field>

          {sections.length > 0 && (
            <Field label="Section" className="w-32">
              <div className="relative">
                <select
                  value={filterSection}
                  onChange={e => setFilterSection(e.target.value)}
                  className={cn(
                    'appearance-none flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 pr-8 py-1',
                    'text-sm text-white shadow-sm transition-all duration-200 outline-none cursor-pointer',
                    'focus:border-zinc-700 focus:ring-1 focus:ring-zinc-500/10 hover:border-zinc-700 hover:bg-zinc-900/40',
                  )}
                >
                  <option value="" className="bg-zinc-950 text-white">ทั้งหมด</option>
                  {sections.map(sec => <option key={sec} value={sec} className="bg-zinc-950 text-white">{sec}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
              </div>
            </Field>
          )}

          {subjects.length > 0 && (
            <Field label="วิชา" className="w-40">
              <div className="relative">
                <select
                  value={filterSubject}
                  onChange={e => setFilterSubject(e.target.value)}
                  className={cn(
                    'appearance-none flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 pr-8 py-1',
                    'text-sm text-white shadow-sm transition-all duration-200 outline-none cursor-pointer',
                    'focus:border-zinc-700 focus:ring-1 focus:ring-zinc-500/10 hover:border-zinc-700 hover:bg-zinc-900/40',
                  )}
                >
                  <option value="" className="bg-zinc-950 text-white">ทั้งหมด</option>
                  {subjects.map(subj => <option key={subj._id} value={subj._id} className="bg-zinc-950 text-white">{subj.code}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
              </div>
            </Field>
          )}

          <Button
            variant="outline"
            className="self-end rounded-lg border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all font-semibold"
            disabled={students.length === 0}
            onClick={handleExportCsv}
          >
            <Download className="h-4 w-4 mr-1.5" />
            ส่งออก CSV
          </Button>

          <Button
            variant="outline"
            className="self-end rounded-lg border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all font-semibold"
            onClick={() => {
              if (showImport) { setShowImport(false); return; }
              setShowImport(true);
              closeForm();
            }}
          >
            <Upload className="h-4 w-4 mr-1.5" />
            {showImport ? 'ยกเลิก' : 'นำเข้า CSV'}
          </Button>

          <Button
            variant="outline"
            className="self-end rounded-lg border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all font-semibold"
            onClick={showForm && !editStudent ? closeForm : openAdd}
          >
            {showForm && !editStudent ? 'ยกเลิก' : '+ เพิ่มนักศึกษา'}
          </Button>
        </div>
      </div>

      {/* Add form */}
      {showForm && !editStudent && (
        <StudentForm
          subjects={subjects}
          onCancel={closeForm}
          onSubmit={async data => {
            await run(() => studentsApi.create(data));
            closeForm();
          }}
        />
      )}

      {/* Import panel */}
      {showImport && (
        <ImportPanel
          subjects={subjects}
          onCancel={() => setShowImport(false)}
          onDone={reload}
        />
      )}

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <BulkActionsBar
          count={selectedIds.size}
          subjects={subjects}
          onActivate={handleBulkActivate}
          onDeactivate={handleBulkDeactivate}
          onAddToSubject={handleBulkAddSubject}
          onRemoveFromSubject={handleBulkRemoveSubject}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedIds(new Set())}
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
          <div className="hidden grid-cols-[1.5rem_3rem_10rem_1fr_6rem_4rem_4rem_6rem] items-center gap-3 px-4 sm:grid">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 cursor-pointer accent-white"
              checked={allPageSelected}
              ref={(el) => { if (el) el.indeterminate = !allPageSelected && somePageSelected; }}
              onChange={toggleSelectPage}
              aria-label="เลือกทั้งหมดในหน้านี้"
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">รหัสนักศึกษา</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ชื่อ – นามสกุล</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ชื่อเล่น</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ปี</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sec</span>
            <span />
          </div>

          {paginatedStudents.map((s, idx) =>
            editStudent?._id === s._id ? (
              <StudentForm
                key={s._id}
                initial={s}
                subjects={subjects}
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
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        className="mt-1 h-3.5 w-3.5 cursor-pointer accent-white shrink-0"
                        checked={selectedIds.has(s._id)}
                        onChange={() => toggleSelectOne(s._id)}
                        aria-label={`เลือก ${s.firstName} ${s.surname}`}
                      />
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
                    </div>
                    <RowActions s={s} onEdit={() => openEdit(s)} onDelete={() => run(() => studentsApi.remove(s._id))} />
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden grid-cols-[1.5rem_3rem_10rem_1fr_6rem_4rem_4rem_6rem] items-center gap-3 sm:grid">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 cursor-pointer accent-white"
                      checked={selectedIds.has(s._id)}
                      onChange={() => toggleSelectOne(s._id)}
                      aria-label={`เลือก ${s.firstName} ${s.surname}`}
                    />
                    <span className="text-xs text-zinc-500">{(currentPage - 1) * itemsPerPage + idx + 1}</span>
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

                  {s.subjectIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 sm:pl-[calc(1.5rem+3rem+10rem+0.75rem*3)]">
                      {s.subjectIds.map((id) => (
                        <Badge key={id} variant="outline" className="text-[10px] text-zinc-400 border-zinc-700">
                          {subjectById.get(id)?.code ?? '—'}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )}

          {/* Pagination controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-zinc-800/60">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-zinc-400">
              <span>
                แสดง {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, filtered.length)} จากทั้งหมด {filtered.length} คน
                {filtered.length !== students.length && ` (กรองจาก ${students.length} คน)`}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">แสดงผล:</span>
                <select
                  value={itemsPerPage}
                  onChange={e => setItemsPerPage(Number(e.target.value))}
                  className={cn(
                    'rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1',
                    'text-xs text-white shadow-sm transition-colors outline-none cursor-pointer',
                    'focus:ring-1 focus:ring-zinc-500/30 hover:border-zinc-700',
                  )}
                >
                  <option value={20} className="bg-zinc-950">20 คน / หน้า</option>
                  <option value={50} className="bg-zinc-950">50 คน / หน้า</option>
                  <option value={100} className="bg-zinc-950">100 คน / หน้า</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white disabled:opacity-30 transition-all hover:bg-zinc-900"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white disabled:opacity-30 transition-all hover:bg-zinc-900"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 px-1">
                  {pageNumbers.map((page, i) => (
                    typeof page === 'number' ? (
                      <Button
                        key={i}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          "h-8 min-w-[2rem] px-2 rounded-lg text-xs font-semibold transition-all duration-200",
                          currentPage === page
                            ? "bg-white text-zinc-950 font-bold hover:bg-white/90 shadow-md shadow-white/5"
                            : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white hover:bg-zinc-900"
                        )}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={i} className="px-1.5 text-zinc-600 text-xs font-bold select-none">
                        {page}
                      </span>
                    )
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white disabled:opacity-30 transition-all hover:bg-zinc-900"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white disabled:opacity-30 transition-all hover:bg-zinc-900"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
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
        onClick={() =>
          confirmToast(`ลบ ${s.firstName} ${s.surname} (${s.studentId}) ออกจากระบบ?`, onDelete)
        }
      >
        ลบ
      </Button>
    </div>
  );
}

export default function StudentsPage() {
  return <Manager />;
}
