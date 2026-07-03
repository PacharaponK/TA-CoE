'use client';

import { useEffect, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { GlobeBackground } from '@/components/GlobeBackground';
import { EmptyState } from '@/components/ui';
import Loading from '@/app/loading';
import { Mail, Clock, Calendar, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tasApi } from '@/lib/api';
import type { PublicTaProfile } from '@/lib/types';

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

export default function ContactPage() {
  const [tas, setTas] = useState<PublicTaProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    tasApi
      .public()
      .then(setTas)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

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

        {loading ? (
          <Loading />
        ) : error ? (
          <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>
        ) : tas.length === 0 ? (
          <EmptyState
            icon={<Users className="h-5 w-5 text-zinc-400" />}
            title="ยังไม่มีข้อมูลผู้ช่วยสอน"
            description="กรุณากลับมาตรวจสอบใหม่ภายหลัง"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* TAs List */}
            <section className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">ผู้ช่วยสอน (TA)</h2>
              <div className="flex flex-col gap-4">
                {tas.map((ta) => (
                  <Card
                    key={ta.id}
                    className="bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/80"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Left: Info */}
                        <div className="flex gap-4">
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/5 border border-white/5 text-base font-bold text-zinc-300">
                            {ta.displayName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-white truncate">{ta.displayName}</h3>
                            {ta.title && <p className="text-xs text-zinc-400">{ta.title}</p>}

                            <div className="mt-4 flex flex-col gap-2">
                              {ta.email && (
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                  <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                                  <a
                                    href={`mailto:${ta.email}`}
                                    className="hover:text-white transition-colors underline truncate"
                                  >
                                    {ta.email}
                                  </a>
                                </div>
                              )}
                              {ta.facebookUrl && (
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                  <FacebookIcon className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                                  <a
                                    href={ta.facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors underline truncate"
                                  >
                                    {ta.facebookName || ta.facebookUrl}
                                  </a>
                                </div>
                              )}
                              {ta.igName && (
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
                              )}
                              {ta.location && (
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                  <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                                  <span className="truncate">{ta.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Status */}
                        <div className="flex flex-row sm:flex-col sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t border-zinc-800/50 pt-3 sm:border-t-0 sm:pt-0">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium border',
                              ta.available
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50',
                            )}
                          >
                            <span
                              className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                ta.available ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500',
                              )}
                            />
                            {ta.available ? 'Active' : 'Offline'}
                          </span>
                          {ta.statusText && (
                            <span className="text-[11px] text-zinc-500">{ta.statusText}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Right sidebar: Schedule */}
            <aside className="flex flex-col gap-6">
              <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">ตารางปฏิบัติงาน</h2>
                <Card className="bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm">
                  <CardContent className="p-6 flex flex-col gap-6">
                    {tas.every((ta) => ta.schedule.length === 0) ? (
                      <p className="text-xs text-zinc-500">ยังไม่มีตารางปฏิบัติงาน</p>
                    ) : (
                      tas
                        .filter((ta) => ta.schedule.length > 0)
                        .map((ta) => (
                          <div key={ta.id} className="flex flex-col gap-4">
                            {tas.length > 1 && (
                              <p className="text-xs font-semibold text-white">{ta.displayName}</p>
                            )}
                            {ta.schedule.map((s, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  'flex flex-col gap-1 pb-3',
                                  idx !== ta.schedule.length - 1 && 'border-b border-zinc-800/50',
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
                                {s.note && (
                                  <span className="text-[10px] text-zinc-500 ml-5">({s.note})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ))
                    )}
                  </CardContent>
                </Card>
              </section>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
