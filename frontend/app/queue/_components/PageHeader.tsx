export function PageHeader() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 animate-[fadeSlideUp_0.8s_ease_0.1s_both]">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur-sm">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80">Live</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">CoE Queue Status</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        คิวตรวจ{' '}
        <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Checkpoint
        </span>
      </h1>
      <p className="text-sm text-zinc-400 max-w-md">
        เลือกวิชาและ Lab เพื่อแสดงลำดับคิวและสถานะปัจจุบันแบบเรียลไทม์
      </p>
    </div>
  );
}
