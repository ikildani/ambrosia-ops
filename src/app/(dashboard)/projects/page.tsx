'use client';

import Link from 'next/link';
import {
  FolderKanban,
  Plus,
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
import { Skeleton } from '@/components/ui/Skeleton';
import { useProjects } from '@/lib/hooks/use-data';
import { formatDate } from '@/lib/utils/format';

/* ---------- helpers ---------- */

const projectTypeLabels: Record<string, string> = {
  strategy: 'Strategy',
  market_assessment: 'Market Assessment',
  partner_search: 'Partner Search',
  due_diligence: 'Due Diligence',
  valuation: 'Valuation',
  fundraising_support: 'Fundraising Support',
};

const statusConfig: Record<string, { label: string; variant: 'green' | 'blue' | 'amber' | 'teal' | 'slate' }> = {
  active:    { label: 'Active',    variant: 'green' },
  planning:  { label: 'Planning',  variant: 'blue' },
  on_hold:   { label: 'On Hold',   variant: 'amber' },
  completed: { label: 'Completed', variant: 'teal' },
  cancelled: { label: 'Cancelled', variant: 'slate' },
};

function daysRemaining(targetDate: string | null): { text: string; variant: 'green' | 'amber' | 'red' | 'slate' } {
  if (!targetDate) return { text: 'No deadline', variant: 'slate' };
  const diff = Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86_400_000);
  if (diff < 0) return { text: `Overdue by ${Math.abs(diff)} days`, variant: 'red' };
  if (diff === 0) return { text: 'Due today', variant: 'amber' };
  if (diff <= 7) return { text: `${diff} days remaining`, variant: 'amber' };
  return { text: `${diff} days remaining`, variant: 'slate' };
}

/* ---------- page ---------- */

export default function ProjectsPage() {
  const { data: response, isLoading, error } = useProjects({ limit: 50 });

  const projects = response?.data ?? [];
  const pagination = response?.pagination;

  const activeCount = projects.filter(p => p.status === 'active').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Projects"
        subtitle="Track advisory engagements and deliverables"
        actions={
          <Link href="/projects/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        }
      />

      {/* Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Projects', value: pagination?.total ?? 0, icon: FolderKanban },
          { label: 'Active', value: activeCount, icon: ListTodo },
          { label: 'Completed', value: completedCount, icon: CheckCircle2 },
          { label: 'On Hold', value: projects.filter(p => p.status === 'on_hold').length, icon: AlertTriangle },
        ].map((stat) => (
          <Card key={stat.label} variant="stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="font-mono text-2xl text-slate-100">{isLoading ? '—' : stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-teal-500" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-6 w-48 mb-3" />
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-2 w-full mb-4" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-signal-red mb-2">Failed to load projects</p>
          <p className="text-xs text-slate-500">{error.message}</p>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && projects.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-800 flex items-center justify-center mb-6">
            <FolderKanban className="w-8 h-8 text-teal-500" />
          </div>
          <h3 className="font-display text-xl text-slate-100 mb-3">No projects yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
            Create your first engagement to start tracking deliverables and team assignments.
          </p>
          <Link href="/projects/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </Card>
      )}

      {/* Project Cards */}
      {!isLoading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {projects.map((project) => {
            const status = statusConfig[project.status] ?? statusConfig.planning;
            const remaining = daysRemaining(project.target_end_date);
            const orgName = (project as any).organizations?.name ?? '';

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
                    {orgName && (
                      <Link
                        href={`/crm/companies/${project.client_org_id}`}
                        className="text-sm text-slate-500 hover:text-teal-400 transition-colors"
                      >
                        {orgName}
                      </Link>
                    )}
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <Badge variant="slate">{projectTypeLabels[project.project_type] ?? project.project_type}</Badge>
                </div>

                {project.description && (
                  <p className="text-sm text-slate-400 line-clamp-2 mb-5">{project.description}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-subtle">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project.team_member_ids?.length ?? 0} team members</span>
                  </div>

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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
