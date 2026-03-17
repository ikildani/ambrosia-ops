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

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

interface MockContact {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  organization: string;
  orgId: string;
  contactType: 'executive' | 'founder' | 'investor' | 'advisor' | 'board_member' | 'operator';
  relationshipStrength: 'warm_intro' | 'direct' | 'met_once' | 'cold';
  email?: string;
  phone?: string;
  therapyAreas: string[];
  lastContactedDays?: number;
}

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
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'recently_contacted', label: 'Recently Contacted' },
  { value: 'relationship', label: 'Relationship Strength' },
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

const relBadgeVariant: Record<string, 'green' | 'blue' | 'amber' | 'slate' | 'red'> = {
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
};

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_CONTACTS: MockContact[] = [];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(first: string, last: string) {
  return `${first[0]}${last[0]}`.toUpperCase();
}

function agingDot(days?: number) {
  if (days === undefined) return 'bg-slate-600';
  if (days <= 7) return 'bg-signal-green';
  if (days <= 30) return 'bg-signal-amber';
  return 'bg-signal-red';
}

function agingLabel(days?: number) {
  if (days === undefined) return 'Never contacted';
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
  const [sort, setSort] = useState('name_asc');
  const [relFilter, setRelFilter] = useState('');
  const [showEmpty] = useState(false);

  const filtered = MOCK_CONTACTS.filter((c) => {
    if (activeTab !== 'all' && c.contactType !== activeTab) return false;
    if (relFilter && c.relationshipStrength !== relFilter) return false;
    if (
      search &&
      !`${c.firstName} ${c.lastName} ${c.title} ${c.organization}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <>
      {/* --- Header --- */}
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

      {/* --- Stats Strip --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Contacts', value: MOCK_CONTACTS.length, icon: Users },
          { label: 'Warm Intros', value: MOCK_CONTACTS.filter((c) => c.relationshipStrength === 'warm_intro').length, icon: Handshake },
          { label: 'Founders', value: MOCK_CONTACTS.filter((c) => c.contactType === 'founder').length, icon: GraduationCap },
          { label: 'Needs Follow-up', value: MOCK_CONTACTS.filter((c) => (c.lastContactedDays ?? 999) > 30).length, icon: AlertCircle },
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
      <Card className="mb-8 !bg-navy-900">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, title, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 py-2 text-sm w-full"
            />
          </div>

          {/* Type tabs */}
          <div className="overflow-x-auto -mx-1 px-1">
            <Tabs tabs={contactTypeTabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Relationship strength filter */}
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

          {/* Sort */}
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

      {/* --- Contact Cards or Empty State --- */}
      {showEmpty || filtered.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((contact, idx) => (
            <Card
              key={contact.id}
              className="group transition-all duration-200 hover:border-teal-500/20 hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
              style={{ animation: `slideUp 0.4s ease-out ${idx * 0.06}s both` }}
            >
              <div className="flex flex-col gap-4">
                {/* Top row: avatar + name + badges */}
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full bg-navy-800 border-2 ${relBorderColor[contact.relationshipStrength]} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-xs font-semibold text-slate-300">
                      {getInitials(contact.firstName, contact.lastName)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/crm/contacts/${contact.id}`}
                      className="text-base font-medium text-slate-100 hover:text-teal-400 transition-colors block truncate"
                    >
                      Dr. {contact.firstName} {contact.lastName}
                    </Link>
                    <p className="text-xs text-slate-400 truncate">
                      {contact.title} at{' '}
                      <Link
                        href={`/crm/companies/${contact.orgId}`}
                        className="text-slate-300 hover:text-teal-400 transition-colors"
                      >
                        {contact.organization}
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={contactTypeBadgeVariant[contact.contactType] || 'slate'}>
                    {contactTypeLabel[contact.contactType]}
                  </Badge>
                  <Badge variant={relBadgeVariant[contact.relationshipStrength] || 'slate'}>
                    {relLabel[contact.relationshipStrength]}
                  </Badge>
                </div>

                {/* Contact info */}
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

                {/* Therapy areas */}
                {contact.therapyAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {contact.therapyAreas.slice(0, 2).map((ta) => (
                      <span
                        key={ta}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-navy-800 text-slate-400 border border-subtle"
                      >
                        {taLabel[ta] || ta}
                      </span>
                    ))}
                    {contact.therapyAreas.length > 2 && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-navy-800 text-slate-500">
                        +{contact.therapyAreas.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer: last contacted */}
                <div className="flex items-center justify-end pt-2 border-t border-subtle">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${agingDot(contact.lastContactedDays)}`} />
                    <span className="text-xs text-slate-500">
                      {agingLabel(contact.lastContactedDays)}
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
