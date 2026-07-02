export function SectionHeader({
  title,
  count,
  live,
}: {
  title: string;
  count: number;
  live?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">{title}</h2>
        {live && <LiveDot />}
      </div>
      <span className="rounded-full bg-white/5 border border-white/5 px-2.5 py-0.5 text-xs text-zinc-400">
        {count} คิว
      </span>
    </div>
  );
}

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  );
}
