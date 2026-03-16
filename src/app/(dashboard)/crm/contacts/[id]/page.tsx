'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  Linkedin,
  Edit,
  Plus,
  ExternalLink,
  Clock,
  Users,
  Calendar,
  Tag,
  Briefcase,
  Activity,
  GitBranch,
  MessageSquare,
  PhoneCall,
  FileText,
  StickyNote,
  Send,
  User,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type {
  Contact,
  Deal,
  Activity as ActivityType,
} from '@/types/database';
import { CONTACT_TYPES, DEAL_STAGES, DEAL_TYPES } from '@/lib/data/constants';
import { THERAPY_AREA_MAP } from '@/lib/data/therapy-areas';
import { formatCurrency, formatRelativeDate, daysSince } from '@/lib/utils/format';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_CONTACT: Contact = {
  id: 'ct_010',
  first_name: 'Sarah',
  last_name: 'Chen',
  email: 'sarah.chen@neurogentx.com',
  phone: '+1 617-555-0234',
  title: 'VP, Business Development',
  organization_id: 'comp_005',
  contact_type: 'executive',
  linkedin: 'https://linkedin.com/in/sarahchen-bd',
  therapy_area_expertise: ['oncology', 'neurology'],
  relationship_strength: 'warm_intro',
  relationship_owner_id: 'tm_001',
  last_contacted_at: '2026-03-09T14:30:00Z',
  notes: '## Key Insights\n\nDr. Chen has deep connections across both neuroscience and oncology BD teams at major pharma. Previously at Biogen for 8 years where she led the Aduhelm commercial partnership negotiations.\n\n**Priority follow-ups:**\n- Reconnect re: NeuroGen Phase 2 data readout (expected Q2 2026)\n- Explore co-development interest from her network\n- Intro to her former Biogen colleague now at Roche Neuroscience',
  tags: ['high-priority', 'neuroscience-network', 'conference-speaker'],
  created_by: 'tm_001',
  created_at: '2025-04-18T10:00:00Z',
  updated_at: '2026-03-09T14:30:00Z',
};

const MOCK_ORG = {
  id: 'comp_005',
  name: 'NeuroGen Therapeutics',
  type: 'biotech' as const,
};

const MOCK_ACTIVITIES: ActivityType[] = [
  {
    id: 'act_020',
    activity_type: 'meeting',
    subject: 'BD Strategy Session & Pipeline Review',
    body: 'Reviewed NeuroGen\'s updated pipeline positioning. Sarah shared competitive intel on Cerevel\'s CNS program. Discussed potential licensing structure for NGN-205 with 3 interested parties.',
    organization_id: 'comp_005',
    contact_id: 'ct_010',
    deal_id: 'deal_010',
    project_id: null,
    participant_contact_ids: ['ct_010', 'ct_011'],
    team_member_id: 'tm_001',
    occurred_at: '2026-03-09T14:00:00Z',
    duration_minutes: 45,
    is_pinned: true,
    metadata: null,
    created_at: '2026-03-09T15:00:00Z',
  },
  {
    id: 'act_021',
    activity_type: 'email',
    subject: 'Follow-up: Term Sheet Comparables',
    body: 'Sent Sarah the compiled comparable deal terms for recent neurology licensing transactions. Included Biogen/Sage, AbbVie/Cerevel, and Roche/Prothena as benchmarks.',
    organization_id: 'comp_005',
    contact_id: 'ct_010',
    deal_id: 'deal_010',
    project_id: null,
    participant_contact_ids: ['ct_010'],
    team_member_id: 'tm_001',
    occurred_at: '2026-03-06T11:00:00Z',
    duration_minutes: null,
    is_pinned: false,
    metadata: null,
    created_at: '2026-03-06T11:05:00Z',
  },
  {
    id: 'act_022',
    activity_type: 'call',
    subject: 'Quick Check-in on JPM Week Leads',
    body: 'Sarah flagged 2 warm leads from JPM Healthcare Conference. One large pharma interested in NGN-205 neuro-oncology crossover data. Will send intros next week.',
    organization_id: 'comp_005',
    contact_id: 'ct_010',
    deal_id: null,
    project_id: null,
    participant_contact_ids: ['ct_010'],
    team_member_id: 'tm_002',
    occurred_at: '2026-02-14T16:30:00Z',
    duration_minutes: 20,
    is_pinned: false,
    metadata: null,
    created_at: '2026-02-14T17:00:00Z',
  },
  {
    id: 'act_023',
    activity_type: 'intro_made',
    subject: 'Intro: Sarah Chen <> Mark Hoffman (Roche Neuroscience)',
    body: 'Facilitated introduction between Sarah and Mark Hoffman, Head of Neuroscience Partnerships at Roche. Mark expressed interest in NeuroGen\'s dual mechanism approach.',
    organization_id: 'comp_005',
    contact_id: 'ct_010',
    deal_id: null,
    project_id: null,
    participant_contact_ids: ['ct_010'],
    team_member_id: 'tm_001',
    occurred_at: '2026-01-28T09:00:00Z',
    duration_minutes: null,
    is_pinned: false,
    metadata: null,
    created_at: '2026-01-28T09:15:00Z',
  },
];

const MOCK_DEALS: Deal[] = [
  {
    id: 'deal_010',
    title: 'NeuroGen NGN-205 Licensing',
    deal_type: 'licensing',
    stage: 'negotiation',
    priority: 'high',
    company_id: 'comp_005',
    counterparty_ids: ['comp_042'],
    estimated_value: 380_000_000,
    upfront_amount: 60_000_000,
    milestone_amount: 320_000_000,
    royalty_range: '10-15%',
    therapy_area: 'neurology',
    indication: 'Alzheimer\'s Disease',
    modality: 'Small Molecule',
    development_stage: 'Phase 2',
    scorecard: null,
    confidentiality_level: 'highly_confidential',
    lead_advisor_id: 'tm_001',
    team_member_ids: ['tm_001', 'tm_002'],
    sourced_at: '2025-11-10T10:00:00Z',
    expected_close_date: '2026-06-15T00:00:00Z',
    actual_close_date: null,
    tags: ['flagship', 'active-negotiation'],
    notes: null,
    created_by: 'tm_001',
    created_at: '2025-11-10T10:00:00Z',
    updated_at: '2026-03-08T14:00:00Z',
  },
  {
    id: 'deal_011',
    title: 'NeuroGen Series B Extension',
    deal_type: 'fundraising',
    stage: 'due_diligence',
    priority: 'medium',
    company_id: 'comp_005',
    counterparty_ids: [],
    estimated_value: 120_000_000,
    upfront_amount: null,
    milestone_amount: null,
    royalty_range: null,
    therapy_area: 'neurology',
    indication: null,
    modality: null,
    development_stage: null,
    scorecard: null,
    confidentiality_level: 'confidential',
    lead_advisor_id: 'tm_001',
    team_member_ids: ['tm_001'],
    sourced_at: '2026-01-20T10:00:00Z',
    expected_close_date: '2026-05-01T00:00:00Z',
    actual_close_date: null,
    tags: [],
    notes: null,
    created_by: 'tm_001',
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-03-01T09:00:00Z',
  },
];

const MOCK_CONNECTIONS = [
  {
    id: 'ct_011',
    name: 'Dr. Michael Park',
    title: 'Chief Scientific Officer',
    org: 'NeuroGen Therapeutics',
    relationship_type: 'colleague',
    relationship_strength: 'direct' as const,
  },
  {
    id: 'ct_012',
    name: 'Lisa Huang',
    title: 'General Counsel',
    org: 'NeuroGen Therapeutics',
    relationship_type: 'colleague',
    relationship_strength: 'met_once' as const,
  },
  {
    id: 'ct_013',
    name: 'Prof. Robert Klein',
    title: 'Scientific Advisory Board Chair',
    org: 'NeuroGen Therapeutics',
    relationship_type: 'advisor_to',
    relationship_strength: 'warm_intro' as const,
  },
];

const MOCK_TEAM_MEMBERS: Record<string, string> = {
  tm_001: 'Marcus Reed',
  tm_002: 'Anna Kowalski',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STAGE_BADGE_MAP: Record<string, string> = {
  sourcing: 'stage-sourcing',
  initial_review: 'stage-review',
  due_diligence: 'stage-diligence',
  negotiation: 'stage-negotiation',
  closing: 'stage-closing',
  closed_won: 'stage-won',
  closed_lost: 'stage-lost',
};

const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  meeting: 'bg-teal-500',
  call: 'bg-signal-blue',
  email: 'bg-signal-amber',
  note: 'bg-slate-400',
  document_shared: 'bg-signal-green',
  intro_made: 'bg-teal-400',
  deal_update: 'bg-signal-red',
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  meeting: 'Meeting',
  call: 'Call',
  email: 'Email',
  note: 'Note',
  document_shared: 'Document',
  intro_made: 'Intro',
  deal_update: 'Deal Update',
};

const ACTIVITY_ICONS: Record<string, typeof Mail> = {
  meeting: Users,
  call: PhoneCall,
  email: Mail,
  note: StickyNote,
  document_shared: FileText,
  intro_made: GitBranch,
  deal_update: Activity,
};

const RELATIONSHIP_COLORS: Record<string, { dot: string; label: string; badge: 'green' | 'blue' | 'amber' | 'slate' }> = {
  warm_intro: { dot: 'bg-signal-green', label: 'Warm Intro', badge: 'green' },
  direct: { dot: 'bg-signal-blue', label: 'Direct', badge: 'blue' },
  met_once: { dot: 'bg-signal-amber', label: 'Met Once', badge: 'amber' },
  cold: { dot: 'bg-slate-500', label: 'Cold', badge: 'slate' },
};

const CONTACT_TYPE_BADGE: Record<string, 'teal' | 'blue' | 'amber' | 'green' | 'slate'> = {
  executive: 'blue',
  founder: 'teal',
  investor: 'green',
  advisor: 'amber',
  board_member: 'slate',
  operator: 'blue',
};

const CONTACT_TYPE_LABELS: Record<string, string> = {
  executive: 'Executive',
  founder: 'Founder',
  investor: 'Investor',
  advisor: 'Advisor',
  board_member: 'Board Member',
  operator: 'Operator',
};

const CONNECTION_TYPE_LABELS: Record<string, string> = {
  colleague: 'Colleague',
  advisor_to: 'Advisor',
  board_member: 'Board Member',
  reports_to: 'Reports To',
  introduced_by: 'Introduced By',
};

function contactAgingInfo(dateStr: string | null): { days: number; color: string; barColor: string; label: string; pulse: boolean } {
  if (!dateStr) return { days: -1, color: 'text-signal-red', barColor: 'bg-signal-red', label: 'No contact logged', pulse: true };
  const days = daysSince(dateStr);
  if (days < 7) return { days, color: 'text-signal-green', barColor: 'bg-signal-green', label: 'Recently active', pulse: false };
  if (days <= 30) return { days, color: 'text-signal-amber', barColor: 'bg-signal-amber', label: 'Follow up recommended', pulse: false };
  return { days, color: 'text-signal-red', barColor: 'bg-signal-red', label: 'Going stale \u2014 reach out soon', pulse: false };
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function ContactDetailSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="bg-navy-900 noise rounded-lg p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-5">
            <Skeleton width={64} height={64} className="rounded-full" />
            <div className="space-y-3">
              <Skeleton width={260} height={36} />
              <Skeleton width={200} height={18} />
              <div className="flex gap-2">
                <Skeleton width={60} height={24} className="rounded-full" />
                <Skeleton width={80} height={24} className="rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton width={72} height={36} />
            <Skeleton width={120} height={36} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Skeleton height={300} className="rounded-lg" />
          <Skeleton height={200} className="rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton height={280} className="rounded-lg" />
          <Skeleton height={200} className="rounded-lg" />
          <Skeleton height={160} className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setContact(MOCK_CONTACT);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading || !contact) return <ContactDetailSkeleton />;

  const rel = RELATIONSHIP_COLORS[contact.relationship_strength] ?? RELATIONSHIP_COLORS.cold;
  const aging = contactAgingInfo(contact.last_contacted_at);
  const initials = `${contact.first_name[0]}${contact.last_name[0]}`;

  return (
    <div className="animate-fade-in">
      {/* ================================================================
          CONTACT HEADER
          ================================================================ */}
      <div
        className="bg-navy-900 noise rounded-lg p-8 mb-8"
        style={{ animation: 'slideUp 0.4s ease-out' }}
      >
        <div className="flex items-start justify-between">
          {/* Left: Avatar + Info */}
          <div className="flex items-start gap-5">
            {/* Avatar with gradient border */}
            <div className="relative flex-shrink-0">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #07101e, #0d1b2e)',
                  border: '2px solid transparent',
                  backgroundClip: 'padding-box',
                  boxShadow: '0 0 0 2px #00c9a7, 0 0 0 4px rgba(96,165,250,0.3)',
                }}
              >
                {initials}
              </div>
            </div>

            <div>
              {/* Name */}
              <h1 className="font-display text-3xl text-slate-100 leading-tight">
                Dr. {contact.first_name} {contact.last_name}
              </h1>

              {/* Title + Company */}
              <p className="text-slate-400 mt-1">
                {contact.title}
                {contact.organization_id && (
                  <>
                    {' at '}
                    <Link
                      href={`/crm/companies/${contact.organization_id}`}
                      className="text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      {MOCK_ORG.name}
                    </Link>
                  </>
                )}
              </p>

              {/* Badges row */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {/* Contact type badge */}
                <Badge variant={CONTACT_TYPE_BADGE[contact.contact_type] ?? 'slate'}>
                  {CONTACT_TYPE_LABELS[contact.contact_type] ?? contact.contact_type}
                </Badge>

                {/* Relationship strength */}
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${rel.dot} ${
                      contact.relationship_strength === 'cold' ? 'animate-pulse' : ''
                    }`}
                  />
                  <span className="text-xs text-slate-400 font-medium">{rel.label}</span>
                </span>

                {/* Therapy area badges */}
                {contact.therapy_area_expertise.map((ta) => {
                  const area = THERAPY_AREA_MAP[ta];
                  return (
                    <Badge key={ta} variant="teal">
                      {area?.label ?? ta}
                    </Badge>
                  );
                })}
              </div>

              {/* Contact methods */}
              <div className="flex items-center gap-4 mt-3">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {contact.phone}
                  </a>
                )}
                {contact.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    LinkedIn
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" />
              Log Activity
            </Button>
          </div>
        </div>

        {/* Contact Aging Indicator */}
        <div className="mt-6 pt-5 border-t border-navy-700/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${aging.color}`} />
              <span className={`text-sm font-medium ${aging.color}`}>
                {aging.days >= 0 ? `Last contacted ${aging.days} days ago` : 'Never contacted'}
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <span className={`text-xs ${aging.color} ${aging.pulse ? 'animate-pulse' : ''}`}>
              {aging.label}
            </span>
            {/* Bar indicator */}
            <div className="flex-1 max-w-48 h-1.5 bg-navy-800 rounded-full overflow-hidden ml-2">
              <div
                className={`h-full rounded-full transition-all duration-700 ${aging.barColor} ${aging.pulse ? 'animate-pulse' : ''}`}
                style={{
                  width: aging.days < 0 ? '100%' : aging.days < 7 ? '20%' : aging.days <= 30 ? '60%' : '100%',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          TWO-COLUMN LAYOUT
          ================================================================ */}
      <div className="grid grid-cols-3 gap-6">
        {/* ---- LEFT COLUMN (2/3) ---- */}
        <div className="col-span-2 space-y-6">
          {/* Activity Timeline */}
          <Card
            className="animate-slide-up"
            style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-500" />
                <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Activity Timeline
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">{MOCK_ACTIVITIES.length} entries</span>
            </div>

            {MOCK_ACTIVITIES.length > 0 ? (
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-navy-700" />

                <div className="space-y-5">
                  {MOCK_ACTIVITIES.map((act, idx) => {
                    const IconComponent = ACTIVITY_ICONS[act.activity_type] ?? Activity;
                    return (
                      <div key={act.id} className="relative flex items-start gap-4 pl-1">
                        {/* Timeline dot */}
                        <div
                          className={`relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 ${ACTIVITY_TYPE_COLORS[act.activity_type] ?? 'bg-slate-500'}`}
                        >
                          <IconComponent className="w-3 h-3 text-navy-950" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`badge ${
                                act.activity_type === 'meeting'
                                  ? 'badge-teal'
                                  : act.activity_type === 'email'
                                  ? 'badge-amber'
                                  : act.activity_type === 'call'
                                  ? 'badge-blue'
                                  : act.activity_type === 'intro_made'
                                  ? 'badge-green'
                                  : 'badge-slate'
                              }`}
                            >
                              {ACTIVITY_TYPE_LABELS[act.activity_type] ?? act.activity_type}
                            </span>
                            <span className="text-sm font-medium text-slate-200 truncate">
                              {act.subject}
                            </span>
                          </div>

                          {act.body && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{act.body}</p>
                          )}

                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                            <span>{MOCK_TEAM_MEMBERS[act.team_member_id] ?? 'Team'}</span>
                            {act.duration_minutes && (
                              <>
                                <span className="text-slate-700">&middot;</span>
                                <span className="font-mono">{act.duration_minutes}min</span>
                              </>
                            )}
                            <span className="text-slate-700">&middot;</span>
                            <span>{formatRelativeDate(act.occurred_at)}</span>
                            {act.is_pinned && (
                              <span className="badge badge-teal text-[10px] px-1.5 py-0">Pinned</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No activities logged yet</p>
                <p className="text-xs text-slate-600 mt-1">Log your first interaction to start tracking this relationship</p>
              </div>
            )}
          </Card>

          {/* Deals Involving This Contact */}
          <Card
            className="animate-slide-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-500" />
                <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Deals Involving This Contact
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">{MOCK_DEALS.length} deals</span>
            </div>

            {MOCK_DEALS.length > 0 ? (
              <div className="space-y-3">
                {MOCK_DEALS.map((deal) => {
                  const stageLabel = DEAL_STAGES.find((s) => s.id === deal.stage)?.label ?? deal.stage;
                  const typeLabel = DEAL_TYPES.find((t) => t.id === deal.deal_type)?.label ?? deal.deal_type;
                  return (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="flex items-center justify-between p-3 rounded-md bg-navy-800/50 hover:bg-navy-800 border border-transparent hover:border-teal-500/10 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Briefcase className="w-4 h-4 text-slate-500 flex-shrink-0 group-hover:text-teal-400 transition-colors" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-200 truncate group-hover:text-teal-400 transition-colors">
                              {deal.title}
                            </span>
                            <span className={`badge ${STAGE_BADGE_MAP[deal.stage] ?? 'badge-slate'}`}>
                              {stageLabel}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">{typeLabel}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {deal.estimated_value && (
                          <span className="text-sm font-mono text-slate-300">
                            {formatCurrency(deal.estimated_value, true)}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <Briefcase className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No deals linked to this contact</p>
              </div>
            )}
          </Card>

          {/* Notes */}
          <Card
            className="animate-slide-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-500" />
                <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Notes
                </h2>
              </div>
              <Button variant="ghost" size="sm">
                <Edit className="w-3.5 h-3.5" />
                Edit
              </Button>
            </div>

            {contact.notes ? (
              <div className="prose prose-invert prose-sm max-w-none text-slate-400 leading-relaxed">
                {/* Simple markdown rendering for mock */}
                {contact.notes.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return (
                      <h3 key={i} className="text-base font-semibold text-slate-200 mt-4 mb-2 first:mt-0">
                        {line.replace('## ', '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <p key={i} className="text-sm font-semibold text-slate-300 mt-3 mb-1">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <div key={i} className="flex gap-2 text-xs text-slate-400 ml-2 mb-0.5">
                        <span className="text-teal-500 mt-0.5">&bull;</span>
                        <span>{line.replace('- ', '')}</span>
                      </div>
                    );
                  }
                  if (line.trim() === '') return <div key={i} className="h-2" />;
                  return <p key={i} className="text-xs text-slate-400">{line}</p>;
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No notes yet</p>
              </div>
            )}
          </Card>
        </div>

        {/* ---- RIGHT COLUMN (1/3) ---- */}
        <div className="space-y-6">
          {/* Contact Details Card */}
          <Card
            className="animate-slide-up"
            style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <User className="w-4 h-4 text-teal-500" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Contact Details
              </h2>
            </div>

            <div className="space-y-4">
              {/* Organization */}
              <div>
                <span className="label">Organization</span>
                <div className="mt-0.5">
                  <Link
                    href={`/crm/companies/${MOCK_ORG.id}`}
                    className="flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    {MOCK_ORG.name}
                  </Link>
                </div>
              </div>

              {/* Title */}
              <div>
                <span className="label">Title</span>
                <p className="text-sm text-slate-300 mt-0.5">{contact.title ?? '\u2014'}</p>
              </div>

              {/* Email */}
              <div>
                <span className="label">Email</span>
                {contact.email ? (
                  <a
                    href={`mailto:${contact.email}`}
                    className="block text-sm text-teal-400 hover:text-teal-300 mt-0.5 truncate transition-colors"
                  >
                    {contact.email}
                  </a>
                ) : (
                  <p className="text-sm text-slate-600 mt-0.5">\u2014</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <span className="label">Phone</span>
                {contact.phone ? (
                  <a
                    href={`tel:${contact.phone}`}
                    className="block text-sm text-teal-400 hover:text-teal-300 mt-0.5 transition-colors"
                  >
                    {contact.phone}
                  </a>
                ) : (
                  <p className="text-sm text-slate-600 mt-0.5">\u2014</p>
                )}
              </div>

              {/* LinkedIn */}
              <div>
                <span className="label">LinkedIn</span>
                {contact.linkedin ? (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300 mt-0.5 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    View Profile
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p className="text-sm text-slate-600 mt-0.5">\u2014</p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-navy-700/50" />

              {/* Contact Type */}
              <div>
                <span className="label">Contact Type</span>
                <div className="mt-1">
                  <Badge variant={CONTACT_TYPE_BADGE[contact.contact_type] ?? 'slate'}>
                    {CONTACT_TYPE_LABELS[contact.contact_type] ?? contact.contact_type}
                  </Badge>
                </div>
              </div>

              {/* Relationship Owner */}
              <div>
                <span className="label">Relationship Owner</span>
                <p className="text-sm text-slate-300 mt-0.5">
                  {contact.relationship_owner_id
                    ? MOCK_TEAM_MEMBERS[contact.relationship_owner_id] ?? 'Unknown'
                    : '\u2014'}
                </p>
              </div>

              {/* Relationship Strength */}
              <div>
                <span className="label">Relationship Strength</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`w-2 h-2 rounded-full ${rel.dot} ${
                      contact.relationship_strength === 'cold' ? 'animate-pulse' : ''
                    }`}
                  />
                  <Badge variant={rel.badge}>{rel.label}</Badge>
                </div>
              </div>

              {/* Last Contacted */}
              <div>
                <span className="label">Last Contacted</span>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className={`w-3.5 h-3.5 ${aging.color}`} />
                  <span className={`text-sm font-mono ${aging.color}`}>
                    {contact.last_contacted_at
                      ? `${aging.days}d ago`
                      : 'Never'}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-navy-700/50" />

              {/* Tags */}
              <div>
                <span className="label">Tags</span>
                {contact.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {contact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-navy-800 border border-navy-700/50 rounded-full px-2 py-0.5"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 mt-1">No tags</p>
                )}
              </div>
            </div>
          </Card>

          {/* Relationship Network Card */}
          <Card
            className="animate-slide-up"
            style={{ animationDelay: '0.25s', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Users className="w-4 h-4 text-teal-500" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Connections
              </h2>
            </div>

            {MOCK_CONNECTIONS.length > 0 ? (
              <div className="space-y-3">
                {MOCK_CONNECTIONS.map((conn) => {
                  const connRel = RELATIONSHIP_COLORS[conn.relationship_strength] ?? RELATIONSHIP_COLORS.cold;
                  return (
                    <Link
                      key={conn.id}
                      href={`/crm/contacts/${conn.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-md hover:bg-navy-800/60 transition-colors group"
                    >
                      {/* Mini avatar */}
                      <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-xs font-medium text-slate-400 flex-shrink-0 group-hover:text-teal-400 transition-colors">
                        {conn.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-300 truncate group-hover:text-teal-400 transition-colors">
                          {conn.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{conn.title}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span
                          className={`badge text-[10px] px-1.5 py-0 ${
                            conn.relationship_type === 'advisor_to'
                              ? 'badge-amber'
                              : conn.relationship_type === 'board_member'
                              ? 'badge-green'
                              : 'badge-slate'
                          }`}
                        >
                          {CONNECTION_TYPE_LABELS[conn.relationship_type] ?? conn.relationship_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${connRel.dot}`} />
                          <span className="text-[10px] text-slate-600">{connRel.label}</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No connections mapped</p>
              </div>
            )}
          </Card>

          {/* Quick Actions Card */}
          <Card
            className="animate-slide-up"
            style={{ animationDelay: '0.35s', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-teal-500" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Quick Actions
              </h2>
            </div>

            <div className="space-y-2">
              <button className="btn btn-ghost w-full justify-start gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-500" />
                Send Email
              </button>
              <button className="btn btn-ghost w-full justify-start gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-500" />
                Schedule Meeting
              </button>
              <button className="btn btn-ghost w-full justify-start gap-3 text-sm">
                <GitBranch className="w-4 h-4 text-slate-500" />
                Make Intro
              </button>
              <button className="btn btn-ghost w-full justify-start gap-3 text-sm">
                <Briefcase className="w-4 h-4 text-slate-500" />
                Add to Deal
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
