import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Providers } from '@/lib/providers';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Sidebar />
      <div style={{ marginLeft: '260px', minHeight: '100vh', display: 'flex', flexDirection: 'column' as const, background: '#04080f' }}>
        <Topbar />
        <main style={{ flex: 1, padding: '48px 64px', maxWidth: '1440px', width: '100%' }}>
          {children}
        </main>
      </div>
    </Providers>
  );
}
