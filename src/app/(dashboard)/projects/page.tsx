'use client';

import Link from 'next/link';
import {
  FolderKanban,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  ListTodo,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

/* ---------- helpers ---------- */

const projectTypeLabels: Record<string, string> = {
  strategy: 'Strategy',
  market_assessment: 'Market Assessment',
  partner_search: 'Partner Search',
  due_diligence: 'Due Diligence',
  valuation: 'Valuation',
  fundraising_support: 'Fundraising Support',
};

const statusConfig: Record<string, { label: string; variant: 'green' | 'blue' | 'amber' | 'teal' | 'slate' | 'red' }> = {
  active:    { label: 'Active',    variant: 'green' },
  planning:  { label: 'Planning',  variant: 'blue' },
  on_hold:   { label: 'On Hold',   variant: 'amber' },
  completed: { label: 'Completed', variant: 'teal' },
  cancelled: { label: 'Cancelled', variant: 'slate' },
};

function daysRemaining(targetDate: string): { text: string; variant: 'green' | 'amber' | 'red' | 'slate' } {
  const diff = Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86_400_000);
  if (diff < 0) return { text: `Overdue by ${Math.abs(diff)} days`, variant: 'red' };
  if (diff === 0) return { text: 'Due today', variant: 'amber' };
  if (diff <= 7) return { text: `${diff} days remaining`, variant: 'amber' };
  return { text: `${diff} days remaining`, variant: 'slate' };
}

/* ---------- mock data ---------- */

interface MockProject {
  id: string;
  name: string;
  client_name: string;
  client_id: string;
  project_type: string;
  status: string;
  completed_deliverables: number;
  total_deliverables: number;
  lead_name: string;
  target_end_date: string;
  team: { initials: string; name: string }[];
}

const mockProjects: MockProject[] = [];

const stats = [
  { label: 'Active Projects', value: 0, icon: FolderKanban },
  { label: 'Completed', value: 0, icon: CheckCircle2 },
  { label: 'Total Tasks', value: 0, icon: ListTodo },
  { label: 'Overdue Tasks', value: 0, icon: AlertTriangle },
];

const showEmpty = false;

/* ---------- page ---------- */

export default function ProjectsPage() {
  const projects = showEmpty ? [] : mockProjects;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Projects"
        subtitle="Track advisory engagements and deliverables"
        actions={
          <Button>
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        }
      />

      {/* Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat) => (
          <Card key={stat.label} variant="stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="font-mono text-2xl text-slate-100">{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-teal-500" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Project Cards or Empty State */}
      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-800 flex items-center justify-center mb-6">
            <FolderKanban className="w-8 h-8 text-teal-500" />
          </div>
          <h3 className="font-display text-xl text-slate-100 mb-3">No projects yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
            Create your first engagement to start tracking deliverables and team assignments.
          </p>
          <Button>
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => {
            const status = statusConfig[project.status] ?? statusConfig.planning;
            const remaining = daysRemaining(project.target_end_date);
            const progressPct =
              project.total_deliverables > 0
                ? Math.round((project.completed_deliverables / project.total_deliverables) * 100)
                : 0;

            return (
              <Card key={project.id} className="group hover:border-teal-500/20 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-lg font-medium text-slate-100 hover:text-teal-400 transition-colors block truncate"
                    >
                      {project.name}
                    </Link>
                    <Link
                      href={`/crm/companies/${project.client_id}`}
                      className="text-sm text-slate-500 hover:text-teal-400 transition-colors"
                    >
                      {project.client_name}
                    </Link>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <Badge variant="slate">{projectTypeLabels[project.project_type] ?? project.project_type}</Badge>
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500">Deliverables</span>
                    <span className="font-mono text-slate-300">
                      {project.completed_deliverables}/{project.total_deliverables}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-navy-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-700 to-teal-400 transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between pt-4 border-t border-subtle">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project.lead_name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Team avatars */}
                    <div className="flex -space-x-2">
                      {project.team.map((member) => (
                        <div
                          key={member.initials}
                          title={member.name}
                          className="w-6 h-6 rounded-full bg-navy-700 flex items-center justify-center text-[9px] font-medium text-teal-400 ring-1 ring-navy-900"
                        >
                          {member.initials}
                        </div>
                      ))}
                    </div>

                    {/* Due date */}
                    <span
                      className={`text-[11px] flex items-center gap-1 ${
                        remaining.variant === 'red'
                          ? 'text-red-400'
                          : remaining.variant === 'amber'
                          ? 'text-amber-400'
                          : 'text-slate-500'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {remaining.text}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
