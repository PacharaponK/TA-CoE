'use client';

import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { GlobeBackground } from '@/components/GlobeBackground';
import { Mail, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

function FacebookIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

interface TAInfo {
  name: string;
  role: string;
  email: string;
  facebookName: string;
  facebookUrl: string;
  igName: string;
  location: string;
  status: 'active' | 'idle';
  statusText: string;
}

const TAS: TAInfo[] = [
  {
    name: 'Pacharapon Ketkaew (พี่บอล)',
    role: '',
    email: 'pacharapon.ketkaew@gmail.com',
    facebookName: 'Pacharapon Ketkaew',
    facebookUrl: 'https://www.facebook.com/pacharapon.ketkaew',
    igName: '_saball',
    location: 'Lab CoE (Room 405)',
    status: 'active',
    statusText: 'พร้อมให้คำปรึกษาในห้องแล็บ',
  },
];

const SCHEDULE = [
  { day: 'วันจันทร์', time: '08:00 – 09:50', note: '240-216 EXPLORING SOFTWARE (Sec 02) · COM 1' },
  { day: 'วันอังคาร', time: '08:00 – 10:50', note: '240-319 EMBEDDED SYS DEVELOP (Sec 01) · R404' },
  { day: 'วันพุธ', time: '10:00 – 11:50', note: '240-121 BASIC HARDWARE LAB (Sec 02) · R404' },
  { day: 'วันพฤหัสบดี', time: '10:00 – 11:50', note: '200-116 BASIC ENGINEERING PROGRAMMING (Sec 01) · COM 2' },
  { day: 'วันศุกร์', time: '08:00 – 09:50', note: '240-316 EXPER AD TECHN IN COM ENG (Sec 01)' },
];

export default function ContactPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black font-geist">
      <GlobeBackground opacity={0.12} ringCount={0} />

      <NavBar />

      <main className="container-page relative z-10 flex w-full flex-1 flex-col gap-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/40 px-2.5 py-1 backdrop-blur-sm text-[10px] uppercase tracking-widest text-zinc-400">
              Support Center
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            ติดต่อ{' '}
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              ผู้ช่วยสอน (TA)
            </span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-md">
            ช่องทางการติดต่อสอบถาม ตารางการเข้าเวร และสถานที่ปฏิบัติการในแต่ละสัปดาห์
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* TAs List */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">ผู้ช่วยสอน (TA)</h2>
            <div className="flex flex-col gap-4">
              {TAS.map((ta, idx) => (
                <Card
                  key={idx}
                  className="bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/80"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Info */}
                      <div className="flex gap-4">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/5 border border-white/5 text-base font-bold text-zinc-300">
                          บ
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-white truncate">{ta.name}</h3>
                          {ta.role && <p className="text-xs text-zinc-400">{ta.role}</p>}

                          <div className="mt-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                              <a
                                href={`mailto:${ta.email}`}
                                className="hover:text-white transition-colors underline truncate"
                              >
                                {ta.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <FacebookIcon className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                              <a
                                href={ta.facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors underline truncate"
                              >
                                {ta.facebookName}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <InstagramIcon className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                              <a
                                href={`https://www.instagram.com/${ta.igName.replace('@', '')}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors underline truncate"
                              >
                                {ta.igName}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status */}
                      <div className="flex flex-row sm:flex-col sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t border-zinc-800/50 pt-3 sm:border-t-0 sm:pt-0">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium border',
                            ta.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50',
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              ta.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500',
                            )}
                          />
                          {ta.status === 'active' ? 'Active' : 'Offline'}
                        </span>
                        <span className="text-[11px] text-zinc-500">{ta.statusText}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Right sidebar: Office & Schedule */}
          <aside className="flex flex-col gap-6">
            {/* Schedule */}
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">ตารางปฏิบัติงาน</h2>
              <Card className="bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm">
                <CardContent className="p-6 flex flex-col gap-4">
                  {SCHEDULE.map((s, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex flex-col gap-1 pb-3',
                        idx !== SCHEDULE.length - 1 && 'border-b border-zinc-800/50',
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="text-xs font-semibold text-white">{s.day}</span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-5">
                        <Clock className="h-3.5 w-3.5 text-zinc-600" />
                        <span className="text-xs text-zinc-400 font-mono">{s.time}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 ml-5">({s.note})</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
