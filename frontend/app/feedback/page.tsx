'use client';

import { useEffect, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { GlobeBackground } from '@/components/GlobeBackground';
import { Button, Field, Input, Textarea } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import { feedbackApi, subjectsApi } from '@/lib/api';
import type { Subject } from '@/lib/types';

const MESSAGE_MAX = 2000;

export default function FeedbackPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    subjectsApi
      .list(true)
      .then(setSubjects)
      .catch(() => {})
      .finally(() => setSubjectsLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await feedbackApi.submit({
        studentId: studentId.trim() || undefined,
        studentName: studentName.trim() || undefined,
        subjectId: subjectId || undefined,
        message: message.trim(),
      });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStudentId('');
    setStudentName('');
    setSubjectId('');
    setMessage('');
    setSent(false);
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black font-geist">
      <GlobeBackground opacity={0.12} ringCount={0} />

      <NavBar />

      <main className="container-page relative z-10 flex w-full flex-1 flex-col gap-8 py-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/40 px-2.5 py-1 backdrop-blur-sm text-[10px] uppercase tracking-widest text-zinc-400">
              Feedback
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            ข้อเสนอแนะ{' '}
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              จากนักศึกษา
            </span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-md">
            มีข้อเสนอแนะ ปัญหาการใช้งาน หรือคำติชมเกี่ยวกับระบบคิว/วิชาเรียน? แจ้งให้ TA ทราบได้ที่นี่ ไม่ระบุชื่อก็ได้
          </p>
        </div>

        <div className="w-full">
          {sent ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm p-10 text-center shadow-xl animate-[fadeSlideUp_0.5s_ease_both]">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </span>
              <div>
                <p className="text-base font-semibold text-white">ส่งข้อเสนอแนะเรียบร้อยแล้ว</p>
                <p className="mt-1 text-sm text-zinc-400">ขอบคุณสำหรับความคิดเห็น ทีม TA จะนำไปพิจารณาต่อไป</p>
              </div>
              <Button
                variant="outline"
                onClick={reset}
                className="rounded-lg border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all font-semibold"
              >
                ส่งอีกฉบับ
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm p-6 sm:p-8 shadow-xl animate-[fadeSlideUp_0.5s_ease_both]"
            >
              <div className="flex items-center gap-3 border-b border-zinc-800/70 pb-4 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-300">
                  <MessageSquarePlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">แบบฟอร์มข้อเสนอแนะ</p>
                  <p className="text-xs text-zinc-500">ระบุชื่อ/รหัสนักศึกษาเป็นทางเลือก — ไม่ระบุก็ส่งได้</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="รหัสนักศึกษา (ถ้ามี)">
                  <Input
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="6301xxxxx"
                    className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                  />
                </Field>
                <Field label="ชื่อ-นามสกุล (ถ้ามี)">
                  <Input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="ชื่อ นามสกุล"
                    className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                  />
                </Field>
              </div>

              <Field label="วิชาที่เกี่ยวข้อง (ถ้ามี)">
                {subjectsLoading ? (
                  <div className="h-9 w-full animate-pulse rounded-md border border-zinc-800 bg-zinc-900/40" />
                ) : (
                  <Select value={subjectId || undefined} onValueChange={(v) => setSubjectId(v ?? '')}>
                    <SelectTrigger className="w-full border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:bg-zinc-900/80 hover:text-white focus:border-zinc-500/50 transition-all duration-300">
                      <SelectValue placeholder="ทั่วไป / ไม่ระบุวิชา" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
                      {subjects.map((s) => (
                        <SelectItem key={s._id} value={s._id} className="text-zinc-300 hover:bg-white/5 hover:text-white">
                          {s.code} · {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>

              <Field label="ข้อเสนอแนะ" hint={`${message.length}/${MESSAGE_MAX}`}>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                  placeholder="เขียนข้อเสนอแนะ ปัญหาที่พบ หรือคำติชมของคุณที่นี่…"
                  rows={6}
                  className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                />
              </Field>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button
                type="submit"
                disabled={submitting || !message.trim()}
                className="mt-1 w-full rounded-full bg-white font-semibold text-black hover:bg-white/90"
              >
                {submitting ? 'กำลังส่ง…' : 'ส่งข้อเสนอแนะ'}
              </Button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
