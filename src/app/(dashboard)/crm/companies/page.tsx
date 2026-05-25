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
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useOrganizations } from '@/lib/hooks/use-data';
import { formatCurrency, daysSince } from '@/lib/utils/format';
import type { Organization } from '@/types/database';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

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
  { value: 'recently_added', label: 'Recently Added' },
  { value: 'name_asc', label: 'Name A-Z' },
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
  medtech: 'teal',
  diagnostics: 'teal',
  digital_health: 'teal',
  healthcare: 'teal',
  nutraceuticals: 'teal',
  vc: 'blue',
  pe: 'green',
  family_office: 'amber',
  angel: 'amber',
  cro: 'slate',
  advisory: 'slate',
  other: 'slate',
};

const typeLabel: Record<string, string> = {
  biotech: 'Biotech',
  pharma: 'Pharma',
  medtech: 'MedTech',
  diagnostics: 'Diagnostics',
  digital_health: 'Digital Health',
  healthcare: 'Healthcare',
  nutraceuticals: 'Nutraceuticals',
  vc: 'VC',
  pe: 'PE',
  family_office: 'Family Office',
  angel: 'Angel',
  cro: 'CRO',
  advisory: 'Advisory',
  other: 'Other',
};

const taLabel: Record<string, string> = {
  oncology: 'Oncology',
  neurology: 'Neurology',
  immunology: 'Immunology',
  rare_disease: 'Rare Disease',
  cardiovascular: 'Cardiovascular',
  metabolic: 'Metabolic',
  psychiatry: 'Psychiatry',
  pain_management: 'Pain Mgmt',
  infectious_disease: 'Infectious',
  hematology: 'Hematology',
  ophthalmology: 'Ophthalmology',
  pulmonology: 'Pulmonology',
  nephrology: 'Nephrology',
  dermatology: 'Dermatology',
  gastroenterology: 'GI',
  hepatology: 'Hepatology',
  endocrinology: 'Endocrinology',
  musculoskeletal: 'MSK',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function agingDot(lastDate?: string | null) {
  if (!lastDate) return 'bg-slate-600';
  const days = daysSince(lastDate);
  if (days <= 7) return 'bg-signal-green';
  if (days <= 30) return 'bg-signal-amber';
  return 'bg-signal-red';
}

function agingLabel(lastDate?: string | null) {
  if (!lastDate) return 'Never';
  const days = daysSince(lastDate);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

function formatFunding(amount: number | null): string | null {
  if (!amount) return null;
  return formatCurrency(amount, true);
}

function getOwnerInitials(name?: string | null): string {
  if (!name) return '—';
  const parts = name.split(' ');
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function locationString(city?: string | null, country?: string | null): string | null {
  if (city && country) return `${city}, ${country}`;
  return city || country || null;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CompaniesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recently_added');
  const [therapyArea, setTherapyArea] = useState('');
  const [page, setPage] = useState(1);

  const { data: response, isLoading, error } = useOrganizations({
    type: activeTab !== 'all' ? activeTab : undefined,
    therapy_area: therapyArea || undefined,
    search: search || undefined,
    page,
    limit: 30,
  });

  const organizations = response?.data ?? [];
  const pagination = response?.pagination;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTherapyArea = (value: string) => {
    setTherapyArea(value);
    setPage(1);
  };

  const sorted = [...organizations].sort((a, b) => {
    if (sort === 'name_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <>
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

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Total Companies', value: pagination?.total ?? 0, icon: Building2 },
          { label: 'Biotech', value: organizations.filter((c) => c.type === 'biotech').length, icon: FlaskConical },
          { label: 'Investors', value: organizations.filter((c) => ['vc', 'pe', 'family_office', 'angel'].includes(c.type)).length, icon: TrendingUp },
          { label: 'Recently Added', value: organizations.filter((c) => daysSince(c.created_at) <= 7).length, icon: Clock },
        ].map((stat) => (
          <Card variant="stat" key={stat.label}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-navy-800">
                <stat.icon className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="label">{stat.label}</p>
                <p className="font-mono text-xl text-slate-100 mt-0.5">
                  {isLoading ? '—' : stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter / Search Bar */}
      <Card className="mb-10 !bg-navy-900">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input pl-9 py-2 text-sm w-full"
            />
          </div>

          <div className="overflow-x-auto -mx-1 px-1">
            <Tabs tabs={orgTypeTabs} activeTab={activeTab} onTabChange={handleTabChange} />
          </div>

          <select
            value={therapyArea}
            onChange={(e) => handleTherapyArea(e.target.value)}
            className="input py-2 text-sm w-full lg:w-44"
          >
            {therapyAreaOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

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

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center justify-between pt-2 border-t border-subtle">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-signal-red mb-2">Failed to load companies</p>
            <p className="text-xs text-slate-500">{error.message}</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && sorted.length === 0 && (
        <div className="relative rounded-xl border border-subtle overflow-hidden">
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
      )}

      {/* Company Cards */}
      {!isLoading && !error && sorted.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-7">
            {sorted.map((company, idx) => {
              const hq = locationString(company.hq_city, company.hq_country);
              const funding = formatFunding(company.total_funding);

              return (
                <Card
                  key={company.id}
                  className="group transition-all duration-200 hover:border-teal-500/20 hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
                  style={{ animation: `slideUp 0.4s ease-out ${idx * 0.06}s both` }}
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/crm/companies/${company.id}`}
                          className="text-base font-medium text-slate-100 hover:text-teal-400 transition-colors truncate block"
                        >
                          {company.name}
                        </Link>
                        {hq && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span className="text-xs text-slate-500 truncate">{hq}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={typeBadgeVariant[company.type] || 'slate'}>
                          {typeLabel[company.type] || company.type}
                        </Badge>
                        {company.stage && (
                          <Badge variant="slate">{company.stage.replace('_', ' ')}</Badge>
                        )}
                      </div>
                    </div>

                    {company.therapy_areas.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {company.therapy_areas.slice(0, 3).map((ta) => (
                          <span
                            key={ta}
                            className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-navy-800 text-slate-400 border border-subtle"
                          >
                            {taLabel[ta] || ta}
                          </span>
                        ))}
                        {company.therapy_areas.length > 3 && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-navy-800 text-slate-500">
                            +{company.therapy_areas.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      {company.lead_asset ? (
                        <div className="flex items-center gap-2">
                          <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono text-sm text-slate-300">
                            {company.lead_asset}
                          </span>
                          {company.lead_asset_phase && (
                            <Badge variant="slate">{company.lead_asset_phase}</Badge>
                          )}
                        </div>
                      ) : (
                        <span />
                      )}
                      {funding && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono text-sm text-slate-300">
                            {funding}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-subtle">
                      <div className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {getOwnerInitials(company.name)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${agingDot(company.updated_at)}`} />
                        <span className="text-xs text-slate-500">
                          {agingLabel(company.updated_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="font-mono text-xs text-slate-500">
                {page} / {pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
