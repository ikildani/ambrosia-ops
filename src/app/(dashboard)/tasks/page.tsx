'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ListTodo,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';

/* ---------- helpers ---------- */

const statusConfig: Record<string, { label: string; variant: 'slate' | 'blue' | 'amber' | 'green' }> = {
  todo:        { label: 'To Do',       variant: 'slate' },
  in_progress: { label: 'In Progress', variant: 'blue' },
  review:      { label: 'In Review',   variant: 'amber' },
  done:        { label: 'Done',        variant: 'green' },
};

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-400',
  high:   'bg-amber-400',
  medium: 'bg-slate-500',
  low:    'bg-transparent',
};

function dueDateInfo(dateStr: string | null): { text: string; className: string } {
  if (!dateStr) return { text: 'No due date', className: 'text-slate-600' };
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
  const formatted = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diff < 0) return { text: `Overdue (${formatted})`, className: 'text-red-400' };
  if (diff === 0) return { text: `Due today`, className: 'text-amber-400' };
  if (diff <= 3) return { text: formatted, className: 'text-amber-400' };
  return { text: formatted, className: 'text-slate-500' };
}

/* ---------- mock data ---------- */

interface MockTask {
  id: string;
  title: string;
  project_name: string;
  project_id: string;
  status: string;
  priority: string;
  due_date: string;
  assigned_to: string;
  assigned_initials: string;
}

const mockTasks: MockTask[] = [];

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'In Review' },
  { id: 'done', label: 'Done' },
];

/* ---------- page ---------- */

export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredTasks =
    activeFilter === 'all'
      ? mockTasks
      : mockTasks.filter((t) => t.status === activeFilter);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Tasks"
        subtitle="Track your work across all projects and deals"
      />

      {/* Filter tabs */}
      <div className="mb-6">
        <Tabs tabs={filterTabs} activeTab={activeFilter} onTabChange={setActiveFilter} />
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-navy-800 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-8 h-8 text-teal-500" />
          </div>
          <h3 className="font-display text-xl text-slate-100 mb-2">You&apos;re all caught up</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            No tasks match this filter. Check other categories or enjoy the moment.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const status = statusConfig[task.status] ?? statusConfig.todo;
            const due = dueDateInfo(task.due_date);
            const barColor = priorityColors[task.priority] ?? 'bg-transparent';

            return (
              <div
                key={task.id}
                className="card flex items-center gap-4 group hover:border-teal-500/20 transition-all duration-200 pr-5"
              >
                {/* Priority indicator bar */}
                <div className={`w-1 self-stretch -ml-5 -my-5 rounded-l-lg ${barColor}`} />

                {/* Status icon */}
                <div className="shrink-0 ml-1">
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : task.status === 'in_progress' ? (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-400 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-0.5">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-teal-400 transition-colors truncate">
                    {task.title}
                  </p>
                  <Link
                    href={`/projects/${task.project_id}`}
                    className="text-xs text-slate-500 hover:text-teal-400 transition-colors"
                  >
                    {task.project_name}
                  </Link>
                </div>

                {/* Due date */}
                <div className={`flex items-center gap-1 text-xs shrink-0 ${due.className}`}>
                  <Calendar className="w-3 h-3" />
                  {due.text}
                </div>

                {/* Status badge */}
                <Badge variant={status.variant}>{status.label}</Badge>

                {/* Assigned avatar */}
                <div
                  title={task.assigned_to}
                  className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center text-[10px] font-medium text-teal-400 ring-1 ring-teal-500/20 shrink-0"
                >
                  {task.assigned_initials}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
