import type { Metadata } from 'next';
import { Inter, Noto_Sans_Thai } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { SystemBanner } from '@/components/SystemBanner';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

// Inter for Latin; Noto Sans Thai for Thai characters.
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

const notoThai = Noto_Sans_Thai({
  subsets: ['thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-thai',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TA@CoE',
  description: 'ระบบจัดคิว Checkpoint การทดลองในแต่ละ Lab',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${inter.variable} ${notoThai.variable} ${GeistSans.variable}`}>
      <body>
        <SystemBanner />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
