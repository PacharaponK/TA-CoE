export function Footer() {
  return (
    <footer className="mt-12 border-t border-white/5 bg-transparent">
      <div className="container-page flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-xs text-zinc-500">
          ระบบจัดคิว Checkpoint การทดลอง · อัปเดตแบบเรียลไทม์
        </p>
        <p className="text-[11px] text-zinc-600 mt-1">
          Created by{' '}
          <a
            href="https://pacharapon-k.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
          >
            PacharaponK
          </a>
        </p>
      </div>
    </footer>
  );
}
