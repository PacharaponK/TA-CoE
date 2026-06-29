'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { AdminGate, LogoutButton } from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState, Field, Spinner } from '@/components/ui';
import { studentsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Student } from '@/lib/types';

// ── Stats chip ────────────────────────────────────────────────────
function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card px-5 py-3 shadow-soft">
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="mt-0.5 text-xs text-muted-foreground">{label}</span>
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

  async function run(fn: () => Promise<unknown>) {
    setError('');
    try { await fn(); await reload(); }
    catch (e) { setError((e as Error).message); }
  }

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">TA Console</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">นักศึกษา</h1>
          <p className="text-sm text-muted-foreground">จัดการข้อมูลนักศึกษาในระบบ</p>
        </div>
        <LogoutButton />
      </div>

      {error && <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

      {/* Stats */}
      {!loading && students.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <StatChip label="ทั้งหมด" value={students.length} />
          {byYear.map(({ year, count }) => (
            <StatChip key={year} label={`ชั้นปีที่ ${year}`} value={count} />
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-3">
        <Field label="ค้นหา" className="min-w-[200px] flex-1">
          <Input
            placeholder="ชื่อ / รหัสนักศึกษา / ชื่อเล่น…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Field>

        <Field label="ชั้นปี" className="w-32">
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className={cn(
              'flex h-9 w-full rounded-xs border border-input bg-transparent px-3 py-1',
              'text-sm text-foreground shadow-sm transition-colors',
              'focus:outline-none focus:ring-1 focus:ring-ring',
            )}
          >
            <option value="">ทั้งหมด</option>
            {years.map(y => <option key={y} value={y}>ปีที่ {y}</option>)}
          </select>
        </Field>

        {sections.length > 0 && (
          <Field label="Section" className="w-32">
            <select
              value={filterSection}
              onChange={e => setFilterSection(e.target.value)}
              className={cn(
                'flex h-9 w-full rounded-xs border border-input bg-transparent px-3 py-1',
                'text-sm text-foreground shadow-sm transition-colors',
                'focus:outline-none focus:ring-1 focus:ring-ring',
              )}
            >
              <option value="">ทั้งหมด</option>
              {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </Field>
        )}

        <Button
          variant="outline"
          className="self-end"
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
          icon="👤"
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
                  'transition-shadow hover:shadow-soft',
                  !s.isActive && 'opacity-60',
                )}
              >
                <CardContent className="py-3">
                  {/* Mobile layout */}
                  <div className="flex items-start justify-between gap-3 sm:hidden">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {s.firstName} {s.surname}
                        {s.nickname && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">({s.nickname})</span>
                        )}
                        {!s.isActive && <Badge variant="secondary" className="ml-2 text-xs">ปิด</Badge>}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {s.studentId} · ปีที่ {s.year}{s.section ? ` · Sec ${s.section}` : ''}
                      </p>
                    </div>
                    <RowActions s={s} onEdit={() => openEdit(s)} onDelete={() => run(() => studentsApi.remove(s._id))} />
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden grid-cols-[3rem_10rem_1fr_6rem_4rem_4rem_6rem] items-center gap-3 sm:grid">
                    <span className="text-xs text-muted-foreground">{idx + 1}</span>
                    <span className="font-mono text-sm text-foreground">{s.studentId}</span>
                    <span className="min-w-0 truncate text-sm font-medium text-foreground">
                      {s.firstName} {s.surname}
                      {!s.isActive && <Badge variant="secondary" className="ml-2 text-xs">ปิด</Badge>}
                    </span>
                    <span className="text-sm text-muted-foreground">{s.nickname || '–'}</span>
                    <span className="text-sm text-muted-foreground">{s.year}</span>
                    <span className="text-sm text-muted-foreground">{s.section || '–'}</span>
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

// ── Student form (add / edit) ─────────────────────────────────────
function StudentForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Student;
  onSubmit: (data: Partial<Student>) => Promise<void>;
  onCancel: () => void;
}) {
  const [studentId, setStudentId] = useState(initial?.studentId ?? '');
  const [firstName, setFirstName] = useState(initial?.firstName ?? '');
  const [surname, setSurname] = useState(initial?.surname ?? '');
  const [nickname, setNickname] = useState(initial?.nickname ?? '');
  const [year, setYear] = useState(String(initial?.year ?? ''));
  const [section, setSection] = useState(initial?.section ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [busy, setBusy] = useState(false);

  const isEdit = !!initial;
  const canSubmit = studentId.trim() && firstName.trim() && surname.trim() && year;

  return (
    <Card className="border-primary/30 shadow-soft">
      <CardContent className="pt-5">
        <p className="mb-4 text-sm font-semibold text-foreground">
          {isEdit ? 'แก้ไขข้อมูลนักศึกษา' : 'เพิ่มนักศึกษาใหม่'}
        </p>
        <form
          className="grid gap-4"
          onSubmit={async e => {
            e.preventDefault();
            setBusy(true);
            try {
              await onSubmit({
                studentId: studentId.trim(),
                firstName: firstName.trim(),
                surname: surname.trim(),
                nickname: nickname.trim(),
                year: Number(year),
                section: section.trim(),
                email: email.trim(),
                phone: phone.trim(),
                isActive,
              });
            } finally {
              setBusy(false);
            }
          }}
        >
          {/* Row 1 */}
          <div className="grid gap-3 sm:grid-cols-[10rem_1fr_1fr_5rem]">
            <Field label="รหัสนักศึกษา *">
              <Input
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                placeholder="6710110005"
                disabled={isEdit}
              />
            </Field>
            <Field label="ชื่อ *">
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="กรธัช" />
            </Field>
            <Field label="นามสกุล *">
              <Input value={surname} onChange={e => setSurname(e.target.value)} placeholder="สุขสวัสดิ์" />
            </Field>
            <Field label="ชั้นปี *">
              <Input
                type="number"
                min={1}
                max={6}
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="3"
              />
            </Field>
          </div>

          {/* Row 2 */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="ชื่อเล่น">
              <Input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="โบ" />
            </Field>
            <Field label="Section">
              <Input value={section} onChange={e => setSection(e.target.value)} placeholder="01" />
            </Field>
            <Field label="อีเมล">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="student@example.com" />
            </Field>
          </div>

          {/* Row 3 */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="เบอร์โทร">
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
            นักศึกษายังใช้งานระบบอยู่
          </label>

          <div className="flex gap-2">
            <Button type="submit" disabled={busy || !canSubmit} className="rounded-full">
              {busy ? 'กำลังบันทึก…' : 'บันทึก'}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
              ยกเลิก
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Page shell ────────────────────────────────────────────────────
export default function StudentsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <AdminGate redirectTo="/admin">
        <Manager />
        <Footer />
      </AdminGate>
    </div>
  );
}
