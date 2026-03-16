'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Landmark,
  GitBranch,
  Kanban,
  Eye,
  BarChart3,
  FolderKanban,
  CheckSquare,
  Zap,
  BookOpen,
  Library,
  Settings,
  Shield,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'CRM',
    items: [
      { label: 'Companies', href: '/crm/companies', icon: Building2 },
      { label: 'Contacts', href: '/crm/contacts', icon: Users },
      { label: 'Investors', href: '/crm/investors', icon: Landmark },
      { label: 'Graph', href: '/crm/graph', icon: GitBranch },
    ],
  },
  {
    title: 'DEALS',
    items: [
      { label: 'Pipeline', href: '/deals', icon: Kanban },
      { label: 'Screen', href: '/deals/screen', icon: Eye },
      { label: 'Analytics', href: '/deals/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'WORK',
    items: [
      { label: 'Projects', href: '/projects', icon: FolderKanban },
      { label: 'My Tasks', href: '/tasks', icon: CheckSquare },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'Intelligence', href: '/intelligence', icon: Zap },
      { label: 'Research', href: '/research', icon: BookOpen },
      { label: 'Knowledge', href: '/knowledge', icon: Library },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Team', href: '/settings/team', icon: Shield },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Ambrosia Ventures"
            className="h-8 w-auto"
          />
          <span className="badge badge-teal text-[10px] font-semibold tracking-wider">
            OPS
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((section) => (
          <div key={section.title}>
            <div className="sidebar-section-label">{section.title}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-nav-item${isActive ? ' active' : ''}`}
                >
                  <Icon />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
