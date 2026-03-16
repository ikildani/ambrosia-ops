import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="dashboard-layout">
        <Topbar />
        <main className="page-content">{children}</main>
      </div>
    </>
  );
}
