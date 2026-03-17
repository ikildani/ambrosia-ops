'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Building2, DollarSign, Tag, Calendar, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { DEAL_STAGES, DEAL_TYPES } from '@/lib/data/constants';
import { formatCurrency, formatDate } from '@/lib/utils/format';

/* ---------- helpers ---------- */

const STAGE_BADGE_VARIANT: Record<string, 'teal' | 'blue' | 'amber' | 'green' | 'slate' | 'red'> = {
  sourcing: 'slate',
  initial_review: 'blue',
  due_diligence: 'amber',
  negotiation: 'teal',
  closing: 'green',
  closed_won: 'green',
  closed_lost: 'red',
};

const TYPE_BADGE_VARIANT: Record<string, 'teal' | 'blue' | 'amber' | 'green' | 'slate'> = {
  acquisition: 'teal',
  licensing: 'blue',
  partnership: 'amber',
  investment: 'green',
  divestiture: 'slate',
};

/* ---------- skeleton ---------- */

function DealDetailSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="bg-navy-900 noise rounded-lg p-8 mb-8">
        <div className="space-y-3">
          <Skeleton width={320} height={36} />
          <div className="flex gap-2">
            <Skeleton width={80} height={24} className="rounded-full" />
            <Skeleton width={90} height={24} className="rounded-full" />
          </div>
        </div>
        <div className="flex gap-8 mt-6 pt-6 border-t border-navy-700/50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <Skeleton width={60} height={12} />
              <Skeleton width={100} height={18} />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Skeleton height={200} className="rounded-lg" />
        </div>
        <Skeleton height={200} className="rounded-lg" />
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeal() {
      setLoading(true);
      try {
        const res = await fetch(`/api/deals/${id}`);
        if (res.ok) {
          const { data } = await res.json();
          setDeal(data);
        }
      } catch (err) {
        console.error('Failed to load deal:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDeal();
  }, [id]);

  if (loading) return <DealDetailSkeleton />;

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Briefcase className="w-12 h-12 mb-4" style={{ color: '#334155' }} />
        <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '24px', fontWeight: 600, color: '#e2e8f0' }}>
          Deal not found
        </h2>
        <p className="mt-2 text-[14px]" style={{ color: '#64748b' }}>
          This deal doesn&apos;t exist or has been removed.
        </p>
        <Link href="/deals" className="mt-6 text-[13px] font-medium" style={{ color: '#5fd4e3' }}>
          &larr; Back to Deals
        </Link>
      </div>
    );
  }

  const stageInfo = DEAL_STAGES.find((s) => s.id === deal.stage);
  const typeInfo = DEAL_TYPES.find((t) => t.id === deal.deal_type);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-navy-900 noise rounded-lg p-8 mb-8 border border-navy-700/40">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-navy-700/60 border border-navy-600/50 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-teal-500" />
              </div>
              <div>
                <h1 className="font-display text-3xl text-slate-100 leading-tight">
                  {deal.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={TYPE_BADGE_VARIANT[deal.deal_type] ?? 'slate'}>
                    {typeInfo?.label ?? deal.deal_type}
                  </Badge>
                  <Badge variant={STAGE_BADGE_VARIANT[deal.stage] ?? 'slate'}>
                    {stageInfo?.label ?? deal.stage}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="flex items-center gap-8 mt-6 pt-6 border-t border-navy-700/40">
          {deal.estimated_value !== null && deal.estimated_value !== undefined && (
            <div>
              <span className="label">Estimated Value</span>
              <p className="font-mono text-sm text-slate-200 mt-0.5">
                {formatCurrency(deal.estimated_value, true)}
              </p>
            </div>
          )}
          {deal.organization_id && (
            <div>
              <span className="label">Company</span>
              <p className="text-sm mt-0.5">
                <Link
                  href={`/crm/companies/${deal.organization_id}`}
                  className="text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {deal.organization_name ?? deal.organization_id}
                </Link>
              </p>
            </div>
          )}
          {deal.expected_close_date && (
            <div>
              <span className="label">Expected Close</span>
              <p className="font-mono text-sm text-slate-200 mt-0.5">
                {formatDate(deal.expected_close_date)}
              </p>
            </div>
          )}
          {deal.probability !== null && deal.probability !== undefined && (
            <div>
              <span className="label">Probability</span>
              <p className="font-mono text-sm text-slate-200 mt-0.5">{deal.probability}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.05s' } as React.CSSProperties}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-teal-500" />
              <h2 className="label text-xs tracking-widest">Description</h2>
            </div>
            {deal.description ? (
              <p className="text-sm text-slate-300 leading-relaxed">{deal.description}</p>
            ) : (
              <p className="text-sm text-slate-600 italic">No description provided.</p>
            )}
            {deal.notes && (
              <div className="mt-4 pt-4 border-t border-navy-700/30">
                <span className="label text-[10px] tracking-widest">Internal Notes</span>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{deal.notes}</p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Info */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' } as React.CSSProperties}>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-teal-500" />
              <h2 className="label text-xs tracking-widest">Deal Info</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Stage</span>
                <Badge variant={STAGE_BADGE_VARIANT[deal.stage] ?? 'slate'}>
                  {stageInfo?.label ?? deal.stage}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Type</span>
                <Badge variant={TYPE_BADGE_VARIANT[deal.deal_type] ?? 'slate'}>
                  {typeInfo?.label ?? deal.deal_type}
                </Badge>
              </div>
              {deal.therapy_areas && deal.therapy_areas.length > 0 && (
                <div className="pt-3 border-t border-navy-700/30">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                    <Tag className="w-3 h-3" /> Therapy Areas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {deal.therapy_areas.map((ta: string) => (
                      <span key={ta} className="badge badge-teal text-[10px]">{ta}</span>
                    ))}
                  </div>
                </div>
              )}
              {deal.created_at && (
                <div className="flex items-center justify-between pt-3 border-t border-navy-700/30">
                  <span className="text-xs text-slate-500">Created</span>
                  <span className="text-sm text-slate-400 font-mono flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(deal.created_at)}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
