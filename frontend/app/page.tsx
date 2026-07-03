'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NavBar } from '@/components/NavBar';
import { Globe } from '@/components/CobeGlobe';

// Globe is rendered at 72% of viewport width
const GLOBE_X = '72%';

export default function HeroPage() {

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black font-geist">

      {/* ── Globe ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Globe
          className="absolute"
          style={{
            left: '72%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '56vw',
            maxWidth: '800px',
            height: '56vw',
            maxHeight: '800px',
          }}
        />
      </div>

      {/* ── Gradient overlays ── */}
      {/* left-to-right: darken text side */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent" />
      {/* top & bottom vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/75" />

      {/* ── Decorative layer ── */}

      {/* White radial glow behind the globe */}
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
            'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 45%, transparent 70%)',
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
            borderColor: 'rgba(255,255,255,0.05)',
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
          className="absolute bg-white/10"
          style={{ width: 24, height: 1, marginLeft: -12, marginTop: -0.5 }}
        />
        {/* vertical bar */}
        <div
          className="absolute bg-white/10"
          style={{ width: 1, height: 24, marginLeft: -0.5, marginTop: -12 }}
        />
        {/* centre dot */}
        <div
          className="absolute rounded-full border border-white/15"
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

      <NavBar />

      {/* ── Hero content ── */}
      <div className="relative z-10 flex h-[calc(100vh-80px)] flex-col justify-between px-6 pb-10 pt-10 sm:pb-12 sm:pt-14 md:px-12 md:pb-14 md:pt-18 lg:px-16">

        {/* Top block */}
        <div className="max-w-xl">

          {/* Badge */}
          <div className="mb-6 flex items-center gap-3 animate-[fadeSlideUp_0.8s_ease_0.15s_both]">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/40 px-3 py-1.5 backdrop-blur-sm">
              <LivePulse />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-350">Live</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/30">
              <span className="h-px w-4 bg-white/20" />
              <span className="tracking-widest uppercase">CoE Queue</span>
            </div>
          </div>

          {/* H1 */}
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl animate-[fadeSlideUp_0.8s_ease_0.3s_both]">
            ระบบจัดคิว<br />
            ตรวจ{' '}
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Checkpoint
            </span>
            <br />
            CoE ปฏิบัติการ
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
            เลือกวิชาและปฏิบัติการเพื่อดูลำดับคิวปัจจุบัน อัปเดตอัตโนมัติโดยไม่ต้องรีเฟรชหน้า
          </p>

          {/* CTA */}
          <Link
            href="/queue"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:scale-[1.03] hover:bg-white/95 hover:shadow-lg hover:shadow-white/5 animate-[fadeSlideUp_0.8s_ease_0.75s_both]"
          >
            <span className="relative z-10 flex items-center gap-2">
              ดูคิวปัจจุบัน
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            {/* shimmer sweep */}
            <span className="absolute inset-0 animate-[shimmer-slide_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
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
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/30 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-white/60" />
    </span>
  );
}
