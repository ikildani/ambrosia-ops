'use client';

import Link from 'next/link';
import { Plus, Briefcase, Target, Wallet, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

/* ── Data will be fetched from Supabase ───────── */

const INVESTOR_TYPE_BADGE: Record<string, 'blue' | 'green' | 'amber' | 'teal'> = {
  vc: 'blue',
  pe: 'green',
  family_office: 'amber',
  crossover: 'teal',
};

const INVESTOR_TYPE_LABEL: Record<string, string> = {
  vc: 'Venture Capital',
  pe: 'Private Equity',
  family_office: 'Family Office',
  crossover: 'Crossover',
};

const investors: {
  id: string;
  name: string;
  type: string;
  therapyAreas: string[];
  checkSizeMin: string;
  checkSizeMax: string;
  stageFocus: string;
  portfolioCount: number;
  hq: string;
}[] = [];

const stats = [
  { label: 'Total Investors', value: 0, icon: Building2 },
  { label: 'VC Firms', value: 0, icon: Briefcase },
  { label: 'Avg Check Size', value: '--', icon: Wallet },
  { label: 'Portfolio Cos.', value: 0, icon: Target },
];

export default function InvestorsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Investor Directory"
        subtitle="Track investor thesis, check sizes, and portfolio alignment"
        actions={
          <Link href="/crm/companies/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Add Investor
            </Button>
          </Link>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <Card key={stat.label} variant="stat">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {stat.label}
                </p>
                <p className="font-mono text-2xl text-slate-100">{stat.value}</p>
              </div>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#0d1b2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon className="w-5 h-5 text-teal-500" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Investor cards */}
      {investors.length === 0 ? (
        <div className="relative rounded-2xl border border-subtle overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 via-transparent to-navy-950 pointer-events-none" />
          <div className="relative flex flex-col items-center justify-center py-32 px-8 text-center">
            <div style={{ padding: '20px', borderRadius: '20px', background: 'rgba(13,27,46,0.6)', marginBottom: '28px' }}>
              <Building2 className="w-14 h-14 text-slate-500" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontSize: '26px', fontWeight: 600, color: '#f0f4f8', marginBottom: '12px' }}>
              No investors yet
            </h2>
            <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '480px', lineHeight: 1.7 }}>
              Add your first investor to start tracking thesis alignment and check sizes.
            </p>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-7">
        {investors.map((investor, idx) => (
          <Card
            key={investor.id}
            className="group hover:border-teal-500/20 transition-all duration-200"
            style={{ animation: `slideUp 0.4s ease-out ${idx * 0.06}s both` }}
          >
            <div className="flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/crm/investors/${investor.id}`}
                    className="text-base font-medium text-slate-100 hover:text-teal-400 transition-colors truncate block"
                  >
                    {investor.name}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">{investor.hq}</p>
                </div>
                <Badge variant={INVESTOR_TYPE_BADGE[investor.type] || 'slate'}>
                  {INVESTOR_TYPE_LABEL[investor.type] || investor.type}
                </Badge>
              </div>

              {/* Therapy area tags */}
              <div className="flex flex-wrap gap-2">
                {investor.therapyAreas.map((ta) => (
                  <span
                    key={ta}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-navy-800 text-slate-400 border border-subtle"
                  >
                    {ta}
                  </span>
                ))}
              </div>

              {/* Check size + stage */}
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                    Check Size
                  </p>
                  <p className="font-mono text-sm text-teal-400">
                    {investor.checkSizeMin} &ndash; {investor.checkSizeMax}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                    Stage Focus
                  </p>
                  <p className="text-sm text-slate-300">{investor.stageFocus}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-subtle">
                <span className="text-xs text-slate-500">
                  {investor.portfolioCount} portfolio companies
                </span>
                <Link
                  href={`/crm/investors/${investor.id}`}
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
