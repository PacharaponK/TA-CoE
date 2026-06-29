'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import RotatingEarth from '@/components/ui/wireframe-dotted-globe';

const NAV_LINKS = [
  { href: '/queue',          label: 'ดูคิว' },
  { href: '/admin',          label: 'จัดการคิว' },
  { href: '/admin/subjects', label: 'วิชา & Lab' },
  { href: '/admin/students', label: 'นักศึกษา' },
];

// Globe is rendered at 72% of viewport width
const GLOBE_X = '72%';

export default function HeroPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black font-geist">

      {/* ── Globe ── */}
      <div className="absolute inset-0 overflow-hidden">
        <RotatingEarth width={2560} height={1440} rounded={false} fullscreen xPosition={0.72} />
      </div>

      {/* ── Gradient overlays ── */}
      {/* left-to-right: darken text side */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      {/* top & bottom vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

      {/* ── Decorative layer ── */}

      {/* Blue radial glow behind the globe */}
      <div
        className="pointer-events-none absolute animate-[globe-glow-pulse_5s_ease-in-out_infinite]"
        style={{
          left: GLOBE_X,
          top: '50%',
          width: '60vmin',
          height: '60vmin',
          marginLeft: '-30vmin',
          marginTop: '-30vmin',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(59,130,246,0.45) 0%, rgba(37,99,235,0.15) 45%, transparent 70%)',
        }}
      />

      {/* Sonar / radar rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-full border animate-[sonar_4.5s_ease-out_infinite]"
          style={{
            left: GLOBE_X,
            top: '50%',
            width: '34vmin',
            height: '34vmin',
            marginLeft: '-17vmin',
            marginTop: '-17vmin',
            borderColor: 'rgba(99,170,255,0.22)',
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}

      {/* Crosshair centred on globe */}
      <div
        className="pointer-events-none absolute hidden md:block"
        style={{ left: GLOBE_X, top: '50%' }}
      >
        {/* horizontal bar */}
        <div
          className="absolute bg-blue-400/40"
          style={{ width: 24, height: 1, marginLeft: -12, marginTop: -0.5 }}
        />
        {/* vertical bar */}
        <div
          className="absolute bg-blue-400/40"
          style={{ width: 1, height: 24, marginLeft: -0.5, marginTop: -12 }}
        />
        {/* centre dot */}
        <div
          className="absolute rounded-full border border-blue-400/50"
          style={{ width: 7, height: 7, marginLeft: -3.5, marginTop: -3.5 }}
        />
      </div>

      {/* Corner brackets */}
      {/* top-left (below navbar) */}
      <div className="pointer-events-none absolute top-[76px] left-5 h-9 w-9 border-l border-t border-white/20 md:left-10 lg:left-14" />
      {/* top-right */}
      <div className="pointer-events-none absolute top-[76px] right-5 h-9 w-9 border-r border-t border-white/20 md:right-10 lg:right-14" />
      {/* bottom-left */}
      <div className="pointer-events-none absolute bottom-7 left-5 h-9 w-9 border-l border-b border-white/20 md:left-10 lg:left-14" />
      {/* bottom-right */}
      <div className="pointer-events-none absolute bottom-7 right-5 h-9 w-9 border-r border-b border-white/20 md:right-10 lg:right-14" />

      {/* Left vertical accent line */}
      <div
        className="pointer-events-none absolute top-[76px] bottom-7 hidden w-px md:left-10 lg:left-14 md:block"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12) 15%, rgba(255,255,255,0.12) 85%, transparent)',
        }}
      />

      {/* Tech coordinate label — bottom-right */}
      <div className="pointer-events-none absolute bottom-9 right-14 hidden text-right font-mono text-[10px] tracking-widest text-white/20 lg:right-16 md:block">
        <div>13°45′N · 100°31′E</div>
        <div className="mt-0.5 tracking-wider">CoE · Bangkok</div>
      </div>

      {/* ── Mobile menu ── */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 z-20 overflow-hidden bg-black/98 backdrop-blur-xl',
          'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          menuOpen ? 'h-screen opacity-100' : 'h-0 opacity-0 pointer-events-none',
        )}
      >
        <div
          className={cn(
            'flex h-full flex-col justify-center px-8 transition-all duration-500',
            menuOpen ? 'translate-y-0 opacity-100 delay-100' : 'translate-y-8 opacity-0',
          )}
        >
          <nav className="flex flex-col gap-8">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-3xl font-medium text-white/90 transition-colors hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/queue"
            onClick={() => setMenuOpen(false)}
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-medium text-black transition-transform hover:scale-105"
          >
            ดูคิวปัจจุบัน
          </Link>
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-30 flex items-center justify-between px-6 py-5 md:px-12 lg:px-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            TA@CoE
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/queue"
            className="hidden rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition-transform hover:scale-105 md:block"
          >
            ดูคิว
          </Link>
          <button
            aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            onClick={() => setMenuOpen((v) => !v)}
            className="relative z-50 flex h-10 w-10 items-center justify-center text-white transition-transform active:scale-90 md:hidden"
          >
            <Menu size={22} className={cn('absolute transition-all duration-300',
              menuOpen ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100')} />
            <X size={22} className={cn('absolute transition-all duration-300',
              menuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0')} />
          </button>
        </div>
      </nav>

      {/* ── Hero content ── */}
      <div className="relative z-10 flex h-[calc(100vh-80px)] flex-col justify-between px-6 pb-10 pt-10 sm:pb-12 sm:pt-14 md:px-12 md:pb-14 md:pt-18 lg:px-16">

        {/* Top block */}
        <div className="max-w-xl">

          {/* Badge */}
          <div className="mb-6 flex items-center gap-3 animate-[fadeSlideUp_0.8s_ease_0.15s_both]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
              <LivePulse />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-white/80">Live</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/30">
              <span className="h-px w-4 bg-white/20" />
              <span className="tracking-widest uppercase">CoE Queue</span>
            </div>
          </div>

          {/* H1 */}
          <h1 className="text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl animate-[fadeSlideUp_0.8s_ease_0.3s_both]">
            ระบบจัดคิว<br />
            ตรวจ{' '}
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-200 bg-clip-text text-transparent">
              Checkpoint
            </span>
            <br />
            CoE Lab
          </h1>
        </div>

        {/* Bottom block */}
        <div className="max-w-md animate-[fadeSlideUp_0.8s_ease_0.55s_both]">

          {/* Thin divider */}
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
            <span className="font-mono text-[10px] tracking-widest text-white/25 uppercase">System Online</span>
          </div>

          <p className="mb-6 text-sm leading-relaxed text-white/55 sm:text-base">
            เลือกวิชาและ Lab เพื่อดูลำดับคิวปัจจุบัน อัปเดตอัตโนมัติโดยไม่ต้องรีเฟรชหน้า
          </p>

          {/* CTA */}
          <Link
            href="/queue"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03] animate-[fadeSlideUp_0.8s_ease_0.75s_both]"
          >
            <span className="relative z-10 flex items-center gap-2">
              ดูคิวปัจจุบัน
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            {/* shimmer sweep */}
            <span className="absolute inset-0 animate-[shimmer-slide_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-black/8 to-transparent" />
          </Link>

          {/* Tech meta row */}
          <div className="mt-5 flex items-center gap-4 text-[11px] text-white/25">
            <span className="font-mono tracking-wider">Socket.io · Real-time</span>
            <span className="h-3 w-px bg-white/15" />
            <span className="font-mono tracking-wider">MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LivePulse() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400/70 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
    </span>
  );
}
