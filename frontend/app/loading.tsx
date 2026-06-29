import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black font-geist">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: '50vw',
          height: '50vh',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }}
      />
      
      {/* Premium glassmorphic container */}
      <div className="relative flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-zinc-950/20 backdrop-blur-md p-8 shadow-2xl">
        {/* Animated logo / loading spinner */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-white/5 border border-white/10" />
          <div className="absolute h-10 w-10 animate-spin rounded-full border-2 border-zinc-800 border-t-white" />
          {/* Logo center image */}
          <img src="/logo.png" alt="Logo" className="h-6 w-6 object-cover rounded-md opacity-80" />
        </div>
        
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-sm font-semibold tracking-tight text-white">กำลังโหลด...</span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Loading System</span>
        </div>
      </div>
    </div>
  );
}
