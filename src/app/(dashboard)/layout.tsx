import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="dashboard-layout">
        <Topbar />
        <main style={{ flex: 1, padding: '40px 48px', maxWidth: '1400px', width: '100%' }}>
          {children}
        </main>
      </div>
    </>
  );
}
