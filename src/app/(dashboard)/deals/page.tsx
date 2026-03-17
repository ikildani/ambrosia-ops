'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  BarChart3,
  Lock,
  Kanban,
  List,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { DEAL_STAGES, DEAL_TYPES } from '@/lib/data/constants';
import { THERAPY_AREA_MAP } from '@/lib/data/therapy-areas';
import { formatCurrency, formatDate } from '@/lib/utils/format';

/* ── Types ──────────────────────────────────── */

interface MockDeal {
  id: string;
  title: string;
  company: string;
  companyId: string;
  dealType: string;
  stage: string;
  therapyArea: string;
  estimatedValue: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidentiality: 'public' | 'confidential' | 'highly_confidential';
  leadAdvisor: string;
  leadInitials: string;
  expectedClose: string;
}

/* ── Stage colour dots for the kanban ────────── */

const STAGE_DOT: Record<string, string> = {
  sourcing: 'bg-slate-400',
  initial_review: 'bg-signal-blue',
  due_diligence: 'bg-signal-amber',
  negotiation: 'bg-purple-400',
  closing: 'bg-teal-400',
  closed_won: 'bg-signal-green',
  closed_lost: 'bg-signal-red',
};

const STAGE_BADGE: Record<string, string> = {
  sourcing: 'stage-sourcing',
  initial_review: 'stage-review',
  due_diligence: 'stage-diligence',
  negotiation: 'stage-negotiation',
  closing: 'stage-closing',
  closed_won: 'stage-won',
  closed_lost: 'stage-lost',
};

const DEAL_TYPE_BADGE: Record<string, string> = {
  ma: 'badge-red',
  licensing: 'badge-blue',
  partnership: 'badge-green',
  fundraising: 'badge-amber',
  co_development: 'badge-teal',
};

const TA_BADGE: Record<string, string> = {
  oncology: 'bg-red-500/10 text-red-400 border border-red-500/20',
  immunology: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  neurology: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  rare_disease: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  cardiovascular: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
};

const PRIORITY_BORDER: Record<string, string> = {
  critical: 'border-l-signal-red',
  high: 'border-l-signal-amber',
  medium: 'border-l-transparent',
  low: 'border-l-transparent',
};

/* ── Mock deals ──────────────────────────────── */

const MOCK_DEALS: MockDeal[] = [];

/* ── Computed metrics ────────────────────────── */

const activeDealStages = ['sourcing', 'initial_review', 'due_diligence', 'negotiation', 'closing'];
const activeDeals = MOCK_DEALS.filter((d) => activeDealStages.includes(d.stage));
const totalPipelineValue = activeDeals.reduce((s, d) => s + d.estimatedValue, 0);
const avgDealSize = activeDeals.length > 0 ? totalPipelineValue / activeDeals.length : 0;
const wonDeals = MOCK_DEALS.filter((d) => d.stage === 'closed_won');
const closedDeals = MOCK_DEALS.filter((d) => d.stage === 'closed_won' || d.stage === 'closed_lost');
const winRate = closedDeals.length > 0 ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;

/* ── View tabs ───────────────────────────────── */

const viewTabs = [
  { id: 'kanban', label: 'Kanban' },
  { id: 'list', label: 'List' },
  { id: 'analytics', label: 'Analytics' },
];

/* ── helpers ─────────────────────────────────── */

function dealTypeLabel(id: string): string {
  return DEAL_TYPES.find((t) => t.id === id)?.label ?? id;
}

function stageLabel(id: string): string {
  return DEAL_STAGES.find((s) => s.id === id)?.label ?? id;
}

function taLabel(id: string): string {
  return THERAPY_AREA_MAP[id]?.label ?? id;
}

/* ── Page ────────────────────────────────────── */

export default function DealsPage() {
  const [activeView, setActiveView] = useState('kanban');

  const handleTabChange = (tabId: string) => {
    if (tabId === 'analytics') {
      // In a real app this would use router.push
      // For now just set the tab
    }
    setActiveView(tabId);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Deal Pipeline"
        subtitle="Track M&A advisory engagements through every stage"
        actions={
          <>
            <Link href="/deals/analytics">
              <Button variant="ghost" size="sm">
                <BarChart3 className="w-4 h-4" /> Analytics
              </Button>
            </Link>
            <Link href="/deals/new">
              <Button size="sm">
                <Plus className="w-4 h-4" /> New Deal
              </Button>
            </Link>
          </>
        }
      />

      {/* ── Pipeline Value Strip ──────────── */}
      {MOCK_DEALS.length > 0 && (
      <div className="grid grid-cols-4 gap-px bg-navy-700/50 rounded-lg overflow-hidden border border-subtle mb-6">
        <div className="bg-navy-900 p-4 flex flex-col items-center justify-center">
          <span className="label mb-1 flex items-center gap-1.5">
            <DollarSign className="w-3 h-3" /> Total Pipeline
          </span>
          <span className="font-mono text-xl text-teal-400">
            {formatCurrency(totalPipelineValue, true)}
          </span>
        </div>
        <div className="bg-navy-900 p-4 flex flex-col items-center justify-center">
          <span className="label mb-1 flex items-center gap-1.5">
            <Target className="w-3 h-3" /> Active Deals
          </span>
          <span className="font-mono text-xl text-slate-100">{activeDeals.length}</span>
        </div>
        <div className="bg-navy-900 p-4 flex flex-col items-center justify-center">
          <span className="label mb-1 flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Avg Deal Size
          </span>
          <span className="font-mono text-xl text-slate-100">
            {formatCurrency(avgDealSize, true)}
          </span>
        </div>
        <div className="bg-navy-900 p-4 flex flex-col items-center justify-center">
          <span className="label mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" /> Win Rate
          </span>
          <span className="font-mono text-xl text-signal-green">{winRate}%</span>
        </div>
      </div>
      )}

      {/* ── View Toggle ───────────────────── */}
      {MOCK_DEALS.length > 0 && (
      <div className="mb-6">
        <Tabs tabs={viewTabs} activeTab={activeView} onTabChange={handleTabChange} />
      </div>
      )}

      {/* ── KANBAN VIEW ───────────────────── */}
      {MOCK_DEALS.length > 0 && activeView === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2" style={{ scrollBehavior: 'smooth' }}>
          {DEAL_STAGES.map((stage) => {
            const stageDeals = MOCK_DEALS.filter((d) => d.stage === stage.id);
            const stageValue = stageDeals.reduce((s, d) => s + d.estimatedValue, 0);

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 rounded-lg bg-navy-900/50 border border-subtle"
                style={{ minWidth: 280, width: 280 }}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 p-3 border-b border-subtle">
                  <span className={`w-2 h-2 rounded-full ${STAGE_DOT[stage.id]}`} />
                  <span className="text-xs font-medium text-slate-300 uppercase tracking-wider flex-1">
                    {stage.label}
                  </span>
                  <span className="badge badge-slate text-[10px] px-1.5 py-0.5">{stageDeals.length}</span>
                  {stageValue > 0 && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatCurrency(stageValue, true)}
                    </span>
                  )}
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[120px]">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-xs text-slate-600">No deals</p>
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <Link
                        key={deal.id}
                        href={`/deals/${deal.id}`}
                        className="block"
                      >
                        <div
                          className={`rounded-md bg-navy-800 border border-subtle p-3 border-l-2 ${PRIORITY_BORDER[deal.priority]} transition-all duration-200 hover:border-teal-500/30 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer`}
                        >
                          {/* Title row */}
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-slate-200 leading-snug">
                              {deal.title}
                            </p>
                            {(deal.confidentiality === 'confidential' ||
                              deal.confidentiality === 'highly_confidential') && (
                              <Lock className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                            )}
                          </div>

                          {/* Company */}
                          <p className="text-xs text-slate-400 mt-1">{deal.company}</p>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className={`badge text-[10px] px-1.5 py-0 ${DEAL_TYPE_BADGE[deal.dealType] || 'badge-slate'}`}>
                              {dealTypeLabel(deal.dealType)}
                            </span>
                            <span className={`badge text-[10px] px-1.5 py-0 ${TA_BADGE[deal.therapyArea] || 'badge-slate'}`}>
                              {taLabel(deal.therapyArea)}
                            </span>
                          </div>

                          {/* Value + advisor */}
                          <div className="flex items-center justify-between mt-2.5">
                            <span className="font-mono text-sm text-teal-400">
                              {formatCurrency(deal.estimatedValue, true)}
                            </span>
                            <span
                              title={deal.leadAdvisor}
                              className="w-6 h-6 rounded-full bg-navy-700 border border-slate-600 flex items-center justify-center text-[9px] font-medium text-slate-400"
                            >
                              {deal.leadInitials}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── LIST VIEW ─────────────────────── */}
      {MOCK_DEALS.length > 0 && activeView === 'list' && (
        <Card className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Company</th>
                <th>Type</th>
                <th>Stage</th>
                <th>Value</th>
                <th>Therapy Area</th>
                <th>Priority</th>
                <th>Lead</th>
                <th>Expected Close</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DEALS.map((deal) => (
                <tr key={deal.id}>
                  <td>
                    <Link
                      href={`/deals/${deal.id}`}
                      className="text-slate-200 hover:text-teal-400 font-medium transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        {deal.title}
                        {(deal.confidentiality === 'confidential' ||
                          deal.confidentiality === 'highly_confidential') && (
                          <Lock className="w-3 h-3 text-slate-500" />
                        )}
                      </span>
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/crm/companies/${deal.companyId}`}
                      className="text-slate-400 hover:text-teal-400 transition-colors"
                    >
                      {deal.company}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge text-[10px] ${DEAL_TYPE_BADGE[deal.dealType] || 'badge-slate'}`}>
                      {dealTypeLabel(deal.dealType)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge text-[10px] ${STAGE_BADGE[deal.stage]}`}>
                      {stageLabel(deal.stage)}
                    </span>
                  </td>
                  <td className="numeric">
                    <span className="font-mono text-teal-400">
                      {formatCurrency(deal.estimatedValue, true)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge text-[10px] ${TA_BADGE[deal.therapyArea] || 'badge-slate'}`}>
                      {taLabel(deal.therapyArea)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge text-[10px] priority-${deal.priority}`}>
                      {deal.priority.charAt(0).toUpperCase() + deal.priority.slice(1)}
                    </span>
                  </td>
                  <td className="text-slate-300">{deal.leadAdvisor}</td>
                  <td className="font-mono text-xs text-slate-400">{formatDate(deal.expectedClose)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* ── ANALYTICS PLACEHOLDER ─────────── */}
      {MOCK_DEALS.length > 0 && activeView === 'analytics' && (
        <Card>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BarChart3 className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-1">Pipeline Analytics</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Detailed pipeline analytics, conversion funnels, and revenue forecasts.
            </p>
            <Link href="/deals/analytics" className="mt-4">
              <Button size="sm">
                <BarChart3 className="w-4 h-4" /> View Analytics
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ── EMPTY STATE (shown when no deals exist) ── */}
      {MOCK_DEALS.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Kanban className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-1">Your pipeline is empty</h3>
            <p className="text-sm text-slate-500 max-w-md mb-6">
              Create your first deal to start tracking M&A engagements
            </p>
            <Link href="/deals/new">
              <Button>
                <Plus className="w-4 h-4" /> New Deal
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
