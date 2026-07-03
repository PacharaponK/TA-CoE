'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
  // The API is on a free-tier host that spins down when idle, so a cold
  // start can take up to ~1 minute. Say so instead of leaving people
  // staring at a silent spinner.
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black font-geist">
      {/* Pulse Brand Logo */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16 animate-pulse">
          <img
            src="/logo.png"
            alt="Loading Logo"
            className="h-full w-full object-cover rounded-2xl opacity-80"
          />
          {/* Subtle neon glow reflection */}
          <div className="absolute inset-0 rounded-2xl bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.15)] pointer-events-none" />
        </div>

        {/* Bouncing Loader Dots */}
        <div className="flex items-center gap-2 mt-2">
          <span
            className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>

      {slow && (
        <p className="mt-6 max-w-[260px] animate-[fadeSlideUp_0.4s_ease_both] text-center text-xs text-zinc-500">
          กำลังปลุกเซิร์ฟเวอร์ อาจใช้เวลาถึง 1 นาที เนื่องจากใช้ hosting ฟรี
        </p>
      )}
    </div>
  );
}
