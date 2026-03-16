'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  Lock,
  Sparkles,
  Pencil,
  ArrowRightLeft,
  Calendar,
  Clock,
  User,
  Building2,
  FileText,
  FileSpreadsheet,
  File,
  MessageSquare,
  Phone,
  Mail,
  StickyNote,
  TrendingUp,
  Users,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Target,
  Pill,
  BarChart3,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

/* ---------- helpers ---------- */

const stageConfig: Record<string, { label: string; cssClass: string; variant: 'teal' | 'green' | 'amber' | 'red' | 'slate' | 'blue' }> = {
  sourcing:        { label: 'Sourcing',        cssClass: 'stage-sourcing',     variant: 'slate' },
  initial_review:  { label: 'Initial Review',  cssClass: 'stage-review',       variant: 'blue' },
  due_diligence:   { label: 'Due Diligence',   cssClass: 'stage-diligence',    variant: 'amber' },
  negotiation:     { label: 'Negotiation',      cssClass: 'stage-negotiation',  variant: 'blue' },
  closing:         { label: 'Closing',          cssClass: 'stage-closing',      variant: 'teal' },
  closed_won:      { label: 'Closed Won',       cssClass: 'stage-won',          variant: 'green' },
  closed_lost:     { label: 'Closed Lost',      cssClass: 'stage-lost',         variant: 'red' },
};

const dealTypeLabels: Record<string, string> = {
  ma: 'M&A',
  licensing: 'Licensing',
  partnership: 'Partnership',
  fundraising: 'Fundraising',
  co_development: 'Co-Development',
};

const priorityConfig: Record<string, { label: string; variant: 'red' | 'amber' | 'slate' | 'blue' }> = {
  critical: { label: 'Critical', variant: 'red' },
  high:     { label: 'High',     variant: 'amber' },
  medium:   { label: 'Medium',   variant: 'slate' },
  low:      { label: 'Low',      variant: 'slate' },
};

function formatCurrency(v: number | null): string {
  if (v === null) return '--';
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}B`;
  return `$${v}M`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ---------- mock data ---------- */

const mockDeal = {
  id: 'deal_001',
  title: 'Project Falcon',
  deal_type: 'ma' as const,
  stage: 'due_diligence' as const,
  priority: 'high' as const,
  company_id: 'org_001',
  company_name: 'NeuroGen Therapeutics',
  counterparty_names: ['Astellas Pharma', 'Vertex Pharmaceuticals'],
  estimated_value: 340,
  upfront_amount: 180,
  milestone_amount: 160,
  royalty_range: '6-9%',
  therapy_area: 'Oncology',
  indication: 'Non-Small Cell Lung Cancer (NSCLC)',
  modality: 'ADC (Antibody-Drug Conjugate)',
  development_stage: 'Phase 2',
  confidentiality_level: 'highly_confidential' as 'public' | 'confidential' | 'highly_confidential',
  lead_advisor: 'Sarah Chen',
  sourced_at: '2026-01-15',
  expected_close_date: '2026-06-30',
  team: [
    { name: 'Sarah Chen', role: 'Lead Advisor', initials: 'SC' },
    { name: 'James Park', role: 'Associate', initials: 'JP' },
    { name: 'Maria Santos', role: 'Analyst', initials: 'MS' },
  ],
  scorecard: {
    market_opportunity: 4,
    asset_quality: 5,
    team: 3,
    competitive_position: 4,
    regulatory_path: 4,
  },
};

const mockStageHistory = [
  {
    id: 'sh_003',
    from_stage: 'initial_review',
    to_stage: 'due_diligence',
    changed_by: 'Sarah Chen',
    notes: 'Management presentation was strong. Proceeding to full DD with Astellas as lead counterparty.',
    changed_at: '2026-02-28T10:30:00Z',
  },
  {
    id: 'sh_002',
    from_stage: 'sourcing',
    to_stage: 'initial_review',
    changed_by: 'Sarah Chen',
    notes: 'Strong Phase 2 readout. Compelling MOA differentiation vs. Enhertu.',
    changed_at: '2026-02-05T14:00:00Z',
  },
  {
    id: 'sh_001',
    from_stage: null,
    to_stage: 'sourcing',
    changed_by: 'James Park',
    notes: 'Identified via ASCO poster session. CEO interested in exploring strategic options.',
    changed_at: '2026-01-15T09:00:00Z',
  },
];

const mockActivities = [
  {
    id: 'act_003',
    type: 'meeting',
    subject: 'Management Presentation to Astellas BD team',
    occurred_at: '2026-03-10T15:00:00Z',
    person: 'Sarah Chen',
    initials: 'SC',
  },
  {
    id: 'act_002',
    type: 'call',
    subject: 'Follow-up with NeuroGen CFO on valuation expectations',
    occurred_at: '2026-03-05T11:00:00Z',
    person: 'James Park',
    initials: 'JP',
  },
  {
    id: 'act_001',
    type: 'note',
    subject: 'Competitive landscape update: Daiichi Sankyo Phase 3 data due Q3',
    occurred_at: '2026-02-20T09:00:00Z',
    person: 'Maria Santos',
    initials: 'MS',
  },
];

const mockDocuments = [
  { id: 'doc_01', name: 'Project Falcon CIM v3.pdf', type: 'cim', size: '4.2 MB', uploaded: '2026-03-01' },
  { id: 'doc_02', name: 'NeuroGen Financial Model.xlsx', type: 'financial_model', size: '1.8 MB', uploaded: '2026-02-28' },
  { id: 'doc_03', name: 'Indicative Term Sheet - Draft.pdf', type: 'term_sheet', size: '320 KB', uploaded: '2026-03-08' },
];

const mockInvestorMatches = [
  { name: 'OrbiMed Advisors', score: 92, reason: 'Strong oncology thesis, active ADC portfolio' },
  { name: 'RA Capital Management', score: 85, reason: 'Recent NSCLC investments, check size aligned' },
  { name: 'Deerfield Management', score: 78, reason: 'Late-stage oncology focus, warm relationship' },
];

/* ---------- sub-components ---------- */

function ScorecardBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 5) * 100;
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-xs text-slate-400 w-36 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-navy-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-700 to-teal-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-xs text-slate-300 w-5 text-right">{score}</span>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const cls = 'w-4 h-4';
  switch (type) {
    case 'meeting': return <Users className={cls} />;
    case 'call': return <Phone className={cls} />;
    case 'email': return <Mail className={cls} />;
    default: return <StickyNote className={cls} />;
  }
}

function DocIcon({ type }: { type: string }) {
  switch (type) {
    case 'cim':
    case 'term_sheet':
    case 'dd_report':
    case 'memo':
      return <FileText className="w-4 h-4 text-red-400" />;
    case 'financial_model':
      return <FileSpreadsheet className="w-4 h-4 text-green-400" />;
    default:
      return <File className="w-4 h-4 text-slate-400" />;
  }
}

/* ---------- page ---------- */

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const deal = mockDeal;
  const stage = stageConfig[deal.stage] ?? stageConfig.sourcing;
  const priority = priorityConfig[deal.priority] ?? priorityConfig.medium;

  const scorecardLabels: Record<string, string> = {
    market_opportunity: 'Market Opportunity',
    asset_quality: 'Asset Quality',
    team: 'Team',
    competitive_position: 'Competitive Position',
    regulatory_path: 'Regulatory Path',
  };

  const overallScore =
    Object.values(deal.scorecard).reduce((a, b) => a + b, 0) /
    Object.values(deal.scorecard).length;

  return (
    <div className="animate-fade-in">
      {/* ===== HEADER ===== */}
      <div className="bg-navy-900 -mx-8 -mt-7 px-8 pt-7 pb-6 mb-6 border-b border-subtle">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/deals" className="text-xs text-slate-500 hover:text-teal-400 transition-colors">
                Deals
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-xs text-slate-400">{deal.title}</span>
            </div>
            <h1 className="font-display text-3xl text-slate-100">{deal.title}</h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Button variant="ghost" size="sm">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button variant="primary" size="sm">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Move Stage
            </Button>
            <Button variant="secondary" size="sm">
              <Sparkles className="w-3.5 h-3.5" />
              Generate Brief
            </Button>
          </div>
        </div>

        {/* badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="teal">{dealTypeLabels[deal.deal_type]}</Badge>
          <Badge variant={stage.variant}>{stage.label}</Badge>
          <Badge variant={priority.variant}>{priority.label} Priority</Badge>
          {deal.confidentiality_level !== 'public' && (
            <Badge variant="red">
              <Lock className="w-3 h-3" />
              {deal.confidentiality_level === 'highly_confidential' ? 'Highly Confidential' : 'Confidential'}
            </Badge>
          )}
        </div>

        {/* key metrics */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-400">Est. Value:</span>
            <span className="font-mono text-teal-400 font-medium">{formatCurrency(deal.estimated_value)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-slate-500" />
            <Badge variant="slate">{deal.therapy_area}</Badge>
          </div>
          <span className="text-slate-500">{deal.indication}</span>
        </div>

        {/* lead / sourced */}
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            Lead Advisor: <span className="text-slate-300">{deal.lead_advisor}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Sourced: <span className="text-slate-300">{new Date(deal.sourced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </span>
        </div>
      </div>

      {/* ===== VALUATION CONTEXT STRIP ===== */}
      <div className="mb-6 rounded-lg bg-navy-800/60 border-l-2 border-teal-700 px-5 py-3 flex items-center gap-3">
        <BarChart3 className="w-4 h-4 text-teal-500 shrink-0" />
        <p className="text-xs text-slate-400">
          <span className="text-slate-300">Comparable deals in {deal.therapy_area} at {deal.development_stage}:</span>{' '}
          median upfront <span className="font-mono text-teal-400">$165M</span>{' '}
          | total value <span className="font-mono text-teal-400">$420M</span>{' '}
          | royalty <span className="font-mono text-teal-400">5-10%</span>
          <span className="ml-3 text-slate-600">Connect to Benchmarker for comparable deal valuations</span>
        </p>
      </div>

      {/* ===== TWO-COLUMN LAYOUT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Scorecard */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-500" />
                Deal Scorecard
              </h2>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl text-teal-400 font-medium">{overallScore.toFixed(1)}</span>
                <span className="text-xs text-slate-500">/ 5</span>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(deal.scorecard).map(([key, value]) => (
                <ScorecardBar key={key} label={scorecardLabels[key] ?? key} score={value} />
              ))}
            </div>
          </Card>

          {/* Stage History */}
          <Card>
            <h2 className="text-sm font-medium text-slate-200 flex items-center gap-2 mb-5">
              <ArrowRightLeft className="w-4 h-4 text-teal-500" />
              Stage History
            </h2>
            <div className="relative ml-3">
              {/* vertical line */}
              <div className="absolute left-0 top-1 bottom-1 w-px bg-navy-700" />
              <div className="space-y-5">
                {mockStageHistory.map((entry, idx) => {
                  const toStage = stageConfig[entry.to_stage] ?? stageConfig.sourcing;
                  const fromStage = entry.from_stage ? stageConfig[entry.from_stage] : null;
                  return (
                    <div key={entry.id} className="relative pl-6">
                      {/* dot */}
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-teal-500 -translate-x-[3.5px] ring-2 ring-navy-900" />
                      <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
                        {fromStage ? (
                          <>
                            <Badge variant={fromStage.variant}>{fromStage.label}</Badge>
                            <ChevronRight className="w-3 h-3 text-slate-600" />
                            <Badge variant={toStage.variant}>{toStage.label}</Badge>
                          </>
                        ) : (
                          <Badge variant={toStage.variant}>{toStage.label}</Badge>
                        )}
                        <span className="text-slate-500 ml-2">{entry.changed_by}</span>
                        <span className="text-slate-600">{timeAgo(entry.changed_at)}</span>
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-slate-400 leading-relaxed">{entry.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Activity & Notes */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-500" />
                Activity & Notes
              </h2>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm"><Users className="w-3.5 h-3.5" /> Meeting</Button>
                <Button variant="ghost" size="sm"><Phone className="w-3.5 h-3.5" /> Call</Button>
                <Button variant="ghost" size="sm"><StickyNote className="w-3.5 h-3.5" /> Note</Button>
              </div>
            </div>
            <div className="relative ml-3">
              <div className="absolute left-0 top-1 bottom-1 w-px bg-navy-700" />
              <div className="space-y-4">
                {mockActivities.map((act) => (
                  <div key={act.id} className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-slate-600 -translate-x-[3.5px] ring-2 ring-navy-900" />
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center text-[10px] font-medium text-teal-400 shrink-0 mt-0.5">
                        {act.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <ActivityIcon type={act.type} />
                          <span className="text-xs font-medium text-slate-200 truncate">{act.subject}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {act.person} &middot; {timeAgo(act.occurred_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Documents */}
          <Card>
            <h2 className="text-sm font-medium text-slate-200 flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-teal-500" />
              Documents
            </h2>
            <div className="space-y-2">
              {mockDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-navy-800 transition-colors cursor-pointer group"
                >
                  <DocIcon type={doc.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 group-hover:text-teal-400 transition-colors truncate">{doc.name}</p>
                    <p className="text-[11px] text-slate-500">{doc.size} &middot; Uploaded {doc.uploaded}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT 1/3 */}
        <div className="space-y-6">
          {/* Deal Info */}
          <Card>
            <h2 className="text-sm font-medium text-slate-200 flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-teal-500" />
              Deal Info
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Company</span>
                <Link href={`/crm/companies/${deal.company_id}`} className="text-teal-400 hover:underline flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {deal.company_name}
                </Link>
              </div>
              <div className="border-t border-subtle" />
              <div className="flex justify-between">
                <span className="text-slate-500">Counterparties</span>
                <div className="text-right">
                  {deal.counterparty_names.map((c) => (
                    <p key={c} className="text-slate-300 text-xs">{c}</p>
                  ))}
                </div>
              </div>
              <div className="border-t border-subtle" />
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Close</span>
                <span className="text-slate-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-600" />
                  {new Date(deal.expected_close_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="border-t border-subtle" />
              <div className="flex justify-between">
                <span className="text-slate-500">Est. Value</span>
                <span className="font-mono text-teal-400">{formatCurrency(deal.estimated_value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Upfront</span>
                <span className="font-mono text-slate-200">{formatCurrency(deal.upfront_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Milestones</span>
                <span className="font-mono text-slate-200">{formatCurrency(deal.milestone_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Royalty Range</span>
                <span className="font-mono text-slate-200">{deal.royalty_range}</span>
              </div>
              <div className="border-t border-subtle" />
              <div className="flex justify-between">
                <span className="text-slate-500">Dev Stage</span>
                <span className="text-slate-300">{deal.development_stage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Modality</span>
                <span className="text-slate-300 text-right text-xs max-w-[140px]">{deal.modality}</span>
              </div>
            </div>
          </Card>

          {/* Investor Matches */}
          <Card>
            <h2 className="text-sm font-medium text-slate-200 flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              Investor Matches
            </h2>
            <p className="text-[11px] text-slate-500 mb-4">Top matches for this deal</p>
            <div className="space-y-4">
              {mockInvestorMatches.map((inv) => (
                <div key={inv.name} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-200 group-hover:text-teal-400 transition-colors cursor-pointer">{inv.name}</span>
                    <span className="font-mono text-xs text-teal-400">{inv.score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-navy-800 overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${inv.score}%`,
                        background: inv.score >= 90
                          ? 'linear-gradient(90deg, #004d40, #00c9a7)'
                          : inv.score >= 80
                          ? 'linear-gradient(90deg, #004d40, #00c9a7cc)'
                          : 'linear-gradient(90deg, #334155, #64748b)',
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{inv.reason}</p>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1">
              View All Matches <ChevronRight className="w-3 h-3" />
            </button>
            <p className="mt-3 text-[10px] text-slate-600 leading-relaxed">
              Matching engine will rank investors by thesis alignment, check size, and relationship warmth
            </p>
          </Card>

          {/* Team */}
          <Card>
            <h2 className="text-sm font-medium text-slate-200 flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-teal-500" />
              Team
            </h2>
            <div className="space-y-3">
              {deal.team.map((member) => (
                <div key={member.name} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-xs font-medium text-teal-400 ring-1 ring-teal-500/20">
                    {member.initials}
                  </div>
                  <div>
                    <p className="text-sm text-slate-200 group-hover:text-teal-400 transition-colors">{member.name}</p>
                    <p className="text-[11px] text-slate-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
