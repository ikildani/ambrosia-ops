'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Users,
  Handshake,
  GraduationCap,
  AlertCircle,
  Mail,
  Phone,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useContacts } from '@/lib/hooks/use-data';
import { daysSince } from '@/lib/utils/format';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const contactTypeTabs = [
  { id: 'all', label: 'All' },
  { id: 'executive', label: 'Executive' },
  { id: 'founder', label: 'Founder' },
  { id: 'investor', label: 'Investor' },
  { id: 'advisor', label: 'Advisor' },
  { id: 'board_member', label: 'Board Member' },
  { id: 'operator', label: 'Operator' },
];

const relationshipFilterOptions = [
  { value: '', label: 'All Relationships' },
  { value: 'warm_intro', label: 'Warm Intro' },
  { value: 'direct', label: 'Direct' },
  { value: 'met_once', label: 'Met Once' },
  { value: 'cold', label: 'Cold' },
];

const sortOptions = [
  { value: 'recently_added', label: 'Recently Added' },
  { value: 'name_asc', label: 'Name A-Z' },
];

const contactTypeBadgeVariant: Record<string, 'teal' | 'blue' | 'green' | 'amber' | 'slate'> = {
  executive: 'blue',
  founder: 'teal',
  investor: 'green',
  advisor: 'amber',
  board_member: 'slate',
  operator: 'blue',
};

const contactTypeLabel: Record<string, string> = {
  executive: 'Executive',
  founder: 'Founder',
  investor: 'Investor',
  advisor: 'Advisor',
  board_member: 'Board Member',
  operator: 'Operator',
};

const relBadgeVariant: Record<string, 'green' | 'blue' | 'amber' | 'slate'> = {
  warm_intro: 'green',
  direct: 'blue',
  met_once: 'amber',
  cold: 'slate',
};

const relLabel: Record<string, string> = {
  warm_intro: 'Warm Intro',
  direct: 'Direct',
  met_once: 'Met Once',
  cold: 'Cold',
};

const relBorderColor: Record<string, string> = {
  warm_intro: 'border-signal-green',
  direct: 'border-signal-blue',
  met_once: 'border-signal-amber',
  cold: 'border-slate-600',
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
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

function agingDot(lastDate?: string | null) {
  if (!lastDate) return 'bg-slate-600';
  const days = daysSince(lastDate);
  if (days <= 7) return 'bg-signal-green';
  if (days <= 30) return 'bg-signal-amber';
  return 'bg-signal-red';
}

function agingLabel(lastDate?: string | null) {
  if (!lastDate) return 'Never contacted';
  const days = daysSince(lastDate);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

function truncateEmail(email: string, max = 24) {
  return email.length > max ? email.slice(0, max) + '...' : email;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recently_added');
  const [relFilter, setRelFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: response, isLoading, error } = useContacts({
    contact_type: activeTab !== 'all' ? activeTab : undefined,
    search: search || undefined,
    page,
    limit: 30,
  });

  const contacts = response?.data ?? [];
  const pagination = response?.pagination;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const filtered = contacts.filter((c) => {
    if (relFilter && c.relationship_strength !== relFilter) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'name_asc') return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
    return 0;
  });

  return (
    <>
      <PageHeader
        title="Contacts"
        subtitle="Your network of founders, investors, operators, and advisors"
        actions={
          <Link href="/crm/contacts/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Add Contact
            </Button>
          </Link>
        }
      />

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Contacts', value: pagination?.total ?? 0, icon: Users },
          { label: 'Warm Intros', value: contacts.filter((c) => c.relationship_strength === 'warm_intro').length, icon: Handshake },
          { label: 'Founders', value: contacts.filter((c) => c.contact_type === 'founder').length, icon: GraduationCap },
          { label: 'Needs Follow-up', value: contacts.filter((c) => !c.last_contacted_at || daysSince(c.last_contacted_at) > 30).length, icon: AlertCircle },
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
      <Card className="mb-8 !bg-navy-900">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, title, or company..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input pl-9 py-2 text-sm w-full"
            />
          </div>

          <div className="overflow-x-auto -mx-1 px-1">
            <Tabs tabs={contactTypeTabs} activeTab={activeTab} onTabChange={handleTabChange} />
          </div>

          <select
            value={relFilter}
            onChange={(e) => setRelFilter(e.target.value)}
            className="input py-2 text-sm w-full lg:w-44"
          >
            {relationshipFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input py-2 text-sm w-full lg:w-48"
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-36 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-signal-red mb-2">Failed to load contacts</p>
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
              <Users className="w-12 h-12 text-slate-500" />
            </div>
            <h3 className="font-display text-xl text-slate-100 mb-2">No contacts yet</h3>
            <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
              Build your network by adding the people behind the companies you work with —
              founders, investors, operators, and advisors.
            </p>
            <Link href="/crm/contacts/new">
              <Button>
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Contact Cards */}
      {!isLoading && !error && sorted.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sorted.map((contact, idx) => {
              const orgName = (contact as any).organizations?.name;
              const orgId = contact.organization_id;

              return (
                <Card
                  key={contact.id}
                  className="group transition-all duration-200 hover:border-teal-500/20 hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
                  style={{ animation: `slideUp 0.4s ease-out ${idx * 0.06}s both` }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-navy-800 border-2 ${relBorderColor[contact.relationship_strength] ?? 'border-slate-600'} flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="text-xs font-semibold text-slate-300">
                          {getInitials(contact.first_name, contact.last_name)}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/crm/contacts/${contact.id}`}
                          className="text-base font-medium text-slate-100 hover:text-teal-400 transition-colors block truncate"
                        >
                          {contact.first_name} {contact.last_name}
                        </Link>
                        <p className="text-xs text-slate-400 truncate">
                          {contact.title}
                          {orgName && (
                            <>
                              {' at '}
                              <Link
                                href={`/crm/companies/${orgId}`}
                                className="text-slate-300 hover:text-teal-400 transition-colors"
                              >
                                {orgName}
                              </Link>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={contactTypeBadgeVariant[contact.contact_type] || 'slate'}>
                        {contactTypeLabel[contact.contact_type]}
                      </Badge>
                      <Badge variant={relBadgeVariant[contact.relationship_strength] || 'slate'}>
                        {relLabel[contact.relationship_strength]}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{truncateEmail(contact.email)}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Phone className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>

                    {contact.therapy_area_expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {contact.therapy_area_expertise.slice(0, 2).map((ta) => (
                          <span
                            key={ta}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-navy-800 text-slate-400 border border-subtle"
                          >
                            {taLabel[ta] || ta}
                          </span>
                        ))}
                        {contact.therapy_area_expertise.length > 2 && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-navy-800 text-slate-500">
                            +{contact.therapy_area_expertise.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end pt-2 border-t border-subtle">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${agingDot(contact.last_contacted_at)}`} />
                        <span className="text-xs text-slate-500">
                          {agingLabel(contact.last_contacted_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="font-mono text-xs text-slate-500">{page} / {pagination.totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
