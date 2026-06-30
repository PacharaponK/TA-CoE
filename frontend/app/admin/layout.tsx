'use client';

import { AdminGate } from '@/components/AdminGate';
import { AdminSidebar } from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <div className="min-h-screen">
        <AdminSidebar />
        <div className="md:pl-60">
          {children}
        </div>
      </div>
    </AdminGate>
  );
}
