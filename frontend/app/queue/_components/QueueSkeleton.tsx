/** Placeholder shapes matching CheckingList/WaitingList, shown while the first fetch is in flight. */
export function QueueSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="h-4 w-20 animate-pulse rounded bg-zinc-800" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-[104px] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md"
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="h-4 w-20 animate-pulse rounded bg-zinc-800" />
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[62px] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
