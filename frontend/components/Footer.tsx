export function Footer() {
  return (
    <footer className="mt-xxl border-t border-hairline bg-canvas-soft">
      <div className="container-page flex flex-col items-center gap-xxs py-xl text-center">
        <div className="flex items-center gap-xs">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-on-primary text-caption font-bold">
            Q
          </span>
          <span className="text-body-sm font-semibold text-ink-secondary">
            TA@CoE
          </span>
        </div>
        <p className="text-caption text-ink-faint">
          ระบบจัดคิว Checkpoint การทดลอง · อัปเดตแบบเรียลไทม์
        </p>
      </div>
    </footer>
  );
}
