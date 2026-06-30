export default function Loading() {
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
    </div>
  );
}
