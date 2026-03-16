'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Plus,
  Edit3,
  CheckSquare,
  AlertCircle,
  User,
  Briefcase,
  ExternalLink,
  MessageSquare,
  Mail,
  Phone,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils/format';

/* ── colour maps ─────────────────────────────── */

const PROJECT_TYPE_BADGE: Record<string, string> = {
  strategy: 'badge-teal',
  market_assessment: 'badge-blue',
  partner_search: 'badge-green',
  due_diligence: 'badge-amber',
  valuation: 'bg-violet-500/12 text-violet-400 border border-violet-500/20',
  fundraising_support: 'badge-slate',
};

const PROJECT_TYPE_LABEL: Record<string, string> = {
  strategy: 'Strategy',
  market_assessment: 'Market Assessment',
  partner_search: 'Partner Search',
  due_diligence: 'Due Diligence',
  valuation: 'Valuation',
  fundraising_support: 'Fundraising Support',
};

const STATUS_BADGE: Record<string, string> = {
  active: 'badge-green',
  planning: 'badge-blue',
  on_hold: 'badge-amber',
  completed: 'badge-teal',
  cancelled: 'badge-red',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  planning: 'Planning',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const TASK_STATUS_BADGE: Record<string, string> = {
  todo: 'badge-slate',
  in_progress: 'badge-blue',
  review: 'badge-amber',
  done: 'badge-green',
};

const TASK_STATUS_LABEL: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-signal-red',
  high: 'bg-signal-amber',
  medium: 'bg-slate-500',
  low: 'bg-slate-700',
};

/* ── mock data ───────────────────────────────── */

const project = {
  id: 'proj-001',
  name: 'Project Helios',
  client_org_id: 'org-001',
  client_name: 'NeuroGen Therapeutics',
  deal_id: 'deal-004',
  project_type: 'due_diligence' as const,
  status: 'active' as const,
  start_date: '2026-01-15',
  target_end_date: '2026-04-30',
  budget: 175000,
  description: 'Comprehensive due diligence on NeuroGen Therapeutics\u2019 lead CNS pipeline asset for potential M&A transaction.',
  lead_name: 'Sarah Chen',
  lead_initials: 'SC',
  team: [
    { name: 'Sarah Chen', initials: 'SC' },
    { name: 'James Whitfield', initials: 'JW' },
    { name: 'Priya Patel', initials: 'PP' },
  ],
};

const deliverables = [
  { id: 'd1', name: 'Market Landscape Analysis', status: 'complete' as const, due: '2026-02-01' },
  { id: 'd2', name: 'Competitive Intelligence Report', status: 'complete' as const, due: '2026-02-15' },
  { id: 'd3', name: 'Financial Model & Valuation', status: 'overdue' as const, due: '2026-03-01' },
  { id: 'd4', name: 'Clinical Data Review', status: 'in_progress' as const, due: '2026-03-20' },
  { id: 'd5', name: 'Final Due Diligence Report', status: 'pending' as const, due: '2026-04-15' },
];

const milestones = [
  { id: 'm1', name: 'Project Kickoff', date: '2026-01-15', completed: true },
  { id: 'm2', name: 'Data Collection Complete', date: '2026-02-15', completed: true },
  { id: 'm3', name: 'Draft Report', date: '2026-03-25', completed: false },
  { id: 'm4', name: 'Final Delivery', date: '2026-04-30', completed: false },
];

const tasks = [
  { id: 't1', title: 'Review Phase 2b clinical data package', priority: 'urgent' as const, status: 'in_progress' as const, assignee: 'PP', due: '2026-03-16' },
  { id: 't2', title: 'Build DCF model with risk-adjusted NPV', priority: 'high' as const, status: 'todo' as const, assignee: 'JW', due: '2026-03-18' },
  { id: 't3', title: 'Draft competitive positioning section', priority: 'medium' as const, status: 'review' as const, assignee: 'SC', due: '2026-03-14' },
  { id: 't4', title: 'Update patent landscape analysis', priority: 'low' as const, status: 'done' as const, assignee: 'PP', due: '2026-03-10' },
];

const activities = [
  { id: 'a1', type: 'meeting' as const, subject: 'Kick-off call with NeuroGen management', user: 'SC', time: '2 days ago' },
  { id: 'a2', type: 'document_shared' as const, subject: 'Clinical data room access granted', user: 'JW', time: '3 days ago' },
  { id: 'a3', type: 'note' as const, subject: 'Updated competitive landscape with latest FDA approval', user: 'PP', time: '5 days ago' },
  { id: 'a4', type: 'email' as const, subject: 'Follow-up on manufacturing capacity questions', user: 'SC', time: '1 week ago' },
  { id: 'a5', type: 'call' as const, subject: 'Advisory call on CNS market dynamics', user: 'JW', time: '1 week ago' },
];

const documents = [
  { id: 'doc1', name: 'Market Landscape Analysis v2.pdf', type: 'dd_report', size: '2.4 MB', uploaded: '2026-02-14' },
  { id: 'doc2', name: 'Competitive Intelligence Deck.pptx', type: 'pitch_deck', size: '8.1 MB', uploaded: '2026-02-28' },
];

const linkedDeal = {
  id: 'deal-004',
  title: 'Project Falcon',
  stage: 'due_diligence',
  estimated_value: 450_000_000,
};

/* ── helpers ────────────────────────────────── */

function daysRemaining(target: string): number {
  const now = new Date();
  const end = new Date(target);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

const completedCount = deliverables.filter((d) => d.status === 'complete').length;
const totalDeliverables = deliverables.length;
const progressPct = Math.round((completedCount / totalDeliverables) * 100);

const ACTIVITY_ICON: Record<string, typeof Mail> = {
  meeting: Briefcase,
  email: Mail,
  call: Phone,
  note: MessageSquare,
  document_shared: FileText,
};

/* ── page ───────────────────────────────────── */

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  void id; // will be used to fetch real data

  return (
    <div className="animate-fade-in">
      {/* ── HEADER ────────────────────────── */}
      <div className="rounded-lg bg-navy-900 border border-subtle p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl text-slate-100">{project.name}</h1>
            <Link
              href={`/crm/companies/${project.client_org_id}`}
              className="text-teal-400 hover:text-teal-300 text-sm transition-colors mt-1 inline-block"
            >
              {project.client_name} <ExternalLink className="inline w-3 h-3 ml-0.5 -mt-0.5" />
            </Link>
            <div className="flex items-center gap-2 mt-3">
              <span className={`badge ${PROJECT_TYPE_BADGE[project.project_type]}`}>
                {PROJECT_TYPE_LABEL[project.project_type]}
              </span>
              <span className={`badge ${STATUS_BADGE[project.status]}`}>
                {STATUS_LABEL[project.status]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Edit3 className="w-4 h-4" /> Edit
            </Button>
            <Button size="sm">
              <CheckCircle2 className="w-4 h-4" /> Complete Project
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-5 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> {project.lead_name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(project.start_date)} &rarr; {formatDate(project.target_end_date)}
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="font-mono">{formatCurrency(project.budget, true)}</span>
          </span>
        </div>
      </div>

      {/* ── PROGRESS BAR ─────────────────── */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">
            {completedCount} of {totalDeliverables} deliverables complete
          </span>
          <span className="font-mono text-2xl text-teal-400">{progressPct}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-navy-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #004d40, #00c9a7)',
            }}
          />
        </div>
      </Card>

      {/* ── TWO-COLUMN LAYOUT ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deliverables */}
          <Card>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Deliverables
            </h2>
            <ul className="space-y-1">
              {deliverables.map((d) => {
                const isComplete = d.status === 'complete';
                const isOverdue = d.status === 'overdue';
                return (
                  <li
                    key={d.id}
                    className="flex items-center gap-3 py-2.5 px-2 rounded hover:bg-navy-800/60 transition-colors"
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    )}
                    <span
                      className={`flex-1 text-sm ${
                        isComplete ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {d.name}
                    </span>
                    <span className={`badge text-[10px] ${isComplete ? 'badge-green' : isOverdue ? 'badge-red' : 'badge-slate'}`}>
                      {isComplete ? 'Complete' : isOverdue ? 'Overdue' : d.status === 'in_progress' ? 'In Progress' : 'Pending'}
                    </span>
                    <span
                      className={`text-xs font-mono ${isOverdue ? 'text-signal-red' : 'text-slate-500'}`}
                    >
                      {formatDate(d.due)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Milestones Timeline */}
          <Card>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">
              Milestones
            </h2>
            <div className="relative pl-6">
              {/* Vertical line */}
              <div className="absolute left-[9px] top-1.5 bottom-1.5 w-px bg-navy-600" />
              <ul className="space-y-6">
                {milestones.map((m, i) => (
                  <li key={m.id} className="relative flex items-start gap-4">
                    {/* Dot */}
                    <div
                      className={`absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                        m.completed
                          ? 'bg-teal-500 border-teal-400'
                          : i === milestones.findIndex((x) => !x.completed)
                            ? 'bg-navy-800 border-teal-500'
                            : 'bg-navy-800 border-slate-600'
                      }`}
                    >
                      {m.completed && <CheckCircle2 className="w-3 h-3 text-navy-950" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${m.completed ? 'text-slate-300' : 'text-slate-400'}`}>
                        {m.name}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {formatDate(m.date)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Tasks */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Tasks
              </h2>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" /> Add Task
              </Button>
            </div>
            <ul className="space-y-1">
              {tasks.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 py-2.5 px-2 rounded hover:bg-navy-800/60 transition-colors"
                >
                  {/* Priority bar */}
                  <div className={`w-1 h-8 rounded-full ${PRIORITY_COLORS[t.priority]}`} />
                  <span className="flex-1 text-sm text-slate-200">{t.title}</span>
                  {/* Assignee */}
                  <span className="w-7 h-7 rounded-full bg-navy-700 border border-slate-600 flex items-center justify-center text-[10px] font-medium text-slate-300">
                    {t.assignee}
                  </span>
                  <span className={`badge text-[10px] ${TASK_STATUS_BADGE[t.status]}`}>
                    {TASK_STATUS_LABEL[t.status]}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{formatDate(t.due)}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Activity Feed */}
          <Card>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Activity
            </h2>
            <ul className="space-y-4">
              {activities.map((a) => {
                const Icon = ACTIVITY_ICON[a.type] || MessageSquare;
                return (
                  <li key={a.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-700 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200">{a.subject}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {a.user} &middot; {a.time}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* RIGHT — 1/3 */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Project Info
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Client</dt>
                <dd>
                  <Link
                    href={`/crm/companies/${project.client_org_id}`}
                    className="text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    {project.client_name}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Linked Deal</dt>
                <dd>
                  <Link
                    href={`/deals/${linkedDeal.id}`}
                    className="text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    {linkedDeal.title}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Project Type</dt>
                <dd className="text-slate-200">{PROJECT_TYPE_LABEL[project.project_type]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <span className={`badge text-[10px] ${STATUS_BADGE[project.status]}`}>
                    {STATUS_LABEL[project.status]}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Lead Advisor</dt>
                <dd className="text-slate-200">{project.lead_name}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-slate-500">Team</dt>
                <dd className="flex -space-x-2">
                  {project.team.map((m) => (
                    <span
                      key={m.initials}
                      title={m.name}
                      className="w-7 h-7 rounded-full bg-navy-700 border-2 border-navy-900 flex items-center justify-center text-[10px] font-medium text-slate-300"
                    >
                      {m.initials}
                    </span>
                  ))}
                </dd>
              </div>
              <div className="border-t border-subtle my-2" />
              <div className="flex justify-between">
                <dt className="text-slate-500">Budget</dt>
                <dd className="font-mono text-teal-400">{formatCurrency(project.budget, true)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Start Date</dt>
                <dd className="text-slate-200 font-mono text-xs">{formatDate(project.start_date)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Target End</dt>
                <dd className="text-slate-200 font-mono text-xs">{formatDate(project.target_end_date)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Days Remaining</dt>
                <dd className="font-mono text-signal-amber">{daysRemaining(project.target_end_date)}</dd>
              </div>
            </dl>
          </Card>

          {/* Documents */}
          <Card>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Documents
            </h2>
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center gap-3 p-2.5 rounded hover:bg-navy-800/60 transition-colors group"
                >
                  <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{doc.name}</p>
                    <p className="text-xs text-slate-500">
                      {doc.size} &middot; {formatDate(doc.uploaded)}
                    </p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-teal-400">
                    <Download className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {/* Linked Deal */}
          <Card className="border-teal-500/20">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Linked Deal
            </h2>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-200">{linkedDeal.title}</p>
              <span className="badge stage-diligence text-[10px]">Due Diligence</span>
              <p className="font-mono text-teal-400 text-lg mt-1">
                {formatCurrency(linkedDeal.estimated_value, true)}
              </p>
              <Link
                href={`/deals/${linkedDeal.id}`}
                className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors mt-2"
              >
                View Deal <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
