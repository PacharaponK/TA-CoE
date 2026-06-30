'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui';
import type { Student } from '@/lib/types';

export function StudentForm({
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

  const inputCn = 'border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30';

  async function handleSubmit(e: React.FormEvent) {
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
  }

  return (
    <Card className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-xl relative overflow-hidden">
      <CardContent className="pt-5">
        <p className="mb-4 text-sm font-semibold text-white">
          {isEdit ? 'แก้ไขข้อมูลนักศึกษา' : 'เพิ่มนักศึกษาใหม่'}
        </p>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-[10rem_1fr_1fr_5rem]">
            <Field label="รหัสนักศึกษา *">
              <Input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="6710110005"
                disabled={isEdit}
                className={inputCn}
              />
            </Field>
            <Field label="ชื่อ *">
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="กรธัช" className={inputCn} />
            </Field>
            <Field label="นามสกุล *">
              <Input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="สุขสวัสดิ์" className={inputCn} />
            </Field>
            <Field label="ชั้นปี *">
              <Input
                type="number"
                min={1}
                max={6}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="3"
                className={inputCn}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="ชื่อเล่น">
              <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="โบ" className={inputCn} />
            </Field>
            <Field label="Section">
              <Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="01" className={inputCn} />
            </Field>
            <Field label="อีเมล">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" className={inputCn} />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="เบอร์โทร">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" className={inputCn} />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            นักศึกษายังใช้งานระบบอยู่
          </label>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={busy || !canSubmit}
              className="rounded-full bg-white text-black hover:bg-white/90 font-semibold"
            >
              {busy ? 'กำลังบันทึก…' : 'บันทึก'}
            </Button>
            <Button type="button" variant="ghost" className="text-zinc-500 hover:text-white" onClick={onCancel}>
              ยกเลิก
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
