'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Upload,
  Building2,
  MapPin,
  DollarSign,
  FlaskConical,
  TrendingUp,
  Clock,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

interface MockCompany {
  id: string;
  name: string;
  type: 'biotech' | 'pharma' | 'vc' | 'pe' | 'family_office' | 'other';
  stage?: string;
  therapyAreas: string[];
  leadAsset?: string;
  phase?: string;
  hq?: string;
  totalFunding?: string;
  ownerInitials: string;
  ownerColor: string;
  lastContactedDays?: number;
}

const orgTypeTabs = [
  { id: 'all', label: 'All' },
  { id: 'biotech', label: 'Biotech' },
  { id: 'pharma', label: 'Pharma' },
  { id: 'vc', label: 'VC' },
  { id: 'pe', label: 'PE' },
  { id: 'family_office', label: 'Family Office' },
  { id: 'other', label: 'Other' },
];

const sortOptions = [
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'recently_added', label: 'Recently Added' },
  { value: 'last_contacted', label: 'Last Contacted' },
];

const therapyAreaOptions = [
  { value: '', label: 'All Therapy Areas' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'immunology', label: 'Immunology' },
  { value: 'rare_disease', label: 'Rare Disease' },
  { value: 'cardiovascular', label: 'Cardiovascular' },
  { value: 'metabolic', label: 'Metabolic' },
];

const typeBadgeVariant: Record<string, 'teal' | 'blue' | 'green' | 'amber' | 'slate'> = {
  biotech: 'teal',
  pharma: 'teal',
  vc: 'blue',
  pe: 'green',
  family_office: 'amber',
  other: 'slate',
};

const typeLabel: Record<string, string> = {
  biotech: 'Biotech',
  pharma: 'Pharma',
  vc: 'VC',
  pe: 'PE',
  family_office: 'Family Office',
  other: 'Other',
};

const taLabel: Record<string, string> = {
  oncology: 'Oncology',
  neurology: 'Neurology',
  immunology: 'Immunology',
  rare_disease: 'Rare Disease',
  cardiovascular: 'Cardiovascular',
  metabolic: 'Metabolic',
};

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_COMPANIES: MockCompany[] = [];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function agingDot(days?: number) {
  if (days === undefined) return 'bg-slate-600';
  if (days <= 7) return 'bg-signal-green';
  if (days <= 30) return 'bg-signal-amber';
  return 'bg-signal-red';
}

function agingLabel(days?: number) {
  if (days === undefined) return 'Never';
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CompaniesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [therapyArea, setTherapyArea] = useState('');
  const [showEmpty] = useState(false); // toggle to preview empty state

  const filtered = MOCK_COMPANIES.filter((c) => {
    if (activeTab !== 'all' && c.type !== activeTab) return false;
    if (therapyArea && !c.therapyAreas.includes(therapyArea)) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      {/* --- Header --- */}
      <PageHeader
        title="Companies"
        subtitle="Track organizations across your network"
        actions={
          <>
            <Link href="/crm/companies/import">
              <Button variant="ghost" size="sm">
                <Upload className="w-4 h-4" />
                Import CSV
              </Button>
            </Link>
            <Link href="/crm/companies/new">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                Add Company
              </Button>
            </Link>
          </>
        }
      />

      {/* --- Stats Strip --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Companies', value: MOCK_COMPANIES.length, icon: Building2 },
          { label: 'Biotech', value: MOCK_COMPANIES.filter((c) => c.type === 'biotech').length, icon: FlaskConical },
          { label: 'Investors', value: MOCK_COMPANIES.filter((c) => ['vc', 'pe', 'family_office'].includes(c.type)).length, icon: TrendingUp },
          { label: 'Recently Added', value: 2, icon: Clock },
        ].map((stat) => (
          <Card variant="stat" key={stat.label}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-navy-800">
                <stat.icon className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="label">{stat.label}</p>
                <p className="font-mono text-xl text-slate-100 mt-0.5">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* --- Filter / Search Bar --- */}
      <Card className="mb-6 !bg-navy-900">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 py-2 text-sm w-full"
            />
          </div>

          {/* Type tabs */}
          <div className="overflow-x-auto -mx-1 px-1">
            <Tabs tabs={orgTypeTabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Therapy area filter */}
          <select
            value={therapyArea}
            onChange={(e) => setTherapyArea(e.target.value)}
            className="input py-2 text-sm w-full lg:w-44"
          >
            {therapyAreaOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input py-2 text-sm w-full lg:w-40"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* --- Company Cards or Empty State --- */}
      {showEmpty || filtered.length === 0 ? (
        <div className="relative rounded-xl border border-subtle overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 via-transparent to-navy-950 pointer-events-none" />
          <div className="relative flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="p-4 rounded-2xl bg-navy-800/60 mb-5">
              <Building2 className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="font-display text-xl text-slate-100 mb-2">No companies yet</h3>
            <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
              Start building your network by adding companies you work with — biotechs,
              investors, partners, and advisors.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/crm/companies/new">
                <Button>
                  <Plus className="w-4 h-4" />
                  Add Company
                </Button>
              </Link>
              <Link href="/crm/companies/import">
                <Button variant="secondary">
                  <Upload className="w-4 h-4" />
                  Import CSV
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((company, idx) => (
            <Card
              key={company.id}
              className="group transition-all duration-200 hover:border-teal-500/20 hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
              style={{ animation: `slideUp 0.4s ease-out ${idx * 0.06}s both` }}
            >
              <div className="flex flex-col gap-3">
                {/* Top row: Name + type badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/crm/companies/${company.id}`}
                      className="text-base font-medium text-slate-100 hover:text-teal-400 transition-colors truncate block"
                    >
                      {company.name}
                    </Link>
                    {company.hq && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span className="text-xs text-slate-500 truncate">{company.hq}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={typeBadgeVariant[company.type] || 'slate'}>
                      {typeLabel[company.type] || company.type}
                    </Badge>
                    {company.stage && (
                      <Badge variant="slate">{company.stage}</Badge>
                    )}
                  </div>
                </div>

                {/* Therapy areas */}
                {company.therapyAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {company.therapyAreas.slice(0, 3).map((ta) => (
                      <span
                        key={ta}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-navy-800 text-slate-400 border border-subtle"
                      >
                        {taLabel[ta] || ta}
                      </span>
                    ))}
                    {company.therapyAreas.length > 3 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-navy-800 text-slate-500">
                        +{company.therapyAreas.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Lead asset + funding row */}
                <div className="flex items-center justify-between text-sm">
                  {company.leadAsset ? (
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-sm text-slate-300">
                        {company.leadAsset}
                      </span>
                      {company.phase && (
                        <Badge variant="slate">{company.phase}</Badge>
                      )}
                    </div>
                  ) : (
                    <span />
                  )}
                  {company.totalFunding && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-sm text-slate-300">
                        {company.totalFunding}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer: owner + last contacted */}
                <div className="flex items-center justify-between pt-2 border-t border-subtle">
                  <div
                    className={`w-7 h-7 rounded-full ${company.ownerColor} flex items-center justify-center`}
                  >
                    <span className="text-[10px] font-semibold text-white">
                      {company.ownerInitials}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${agingDot(company.lastContactedDays)}`} />
                    <span className="text-xs text-slate-500">
                      {agingLabel(company.lastContactedDays)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
