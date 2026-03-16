'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Globe,
  Linkedin,
  Edit,
  Plus,
  ExternalLink,
  Mail,
  Phone,
  FileText,
  Clock,
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Calendar,
  Tag,
  ChevronRight,
  Activity,
  Briefcase,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type {
  Organization,
  Contact,
  Deal,
  Activity as ActivityType,
  InvestorProfile,
  Document as DocumentType,
} from '@/types/database';
import { ORG_TYPES, DEAL_STAGES, DEAL_TYPES } from '@/lib/data/constants';
import { THERAPY_AREAS, THERAPY_AREA_MAP } from '@/lib/data/therapy-areas';
import { formatCurrency, formatRelativeDate, daysSince, formatDate } from '@/lib/utils/format';

// ---------------------------------------------------------------------------
// Mock data — demonstrates a fully populated company profile
// ---------------------------------------------------------------------------

const MOCK_COMPANY: Organization = {
  id: 'comp_001',
  name: 'Helix Therapeutics',
  type: 'biotech',
  stage: 'series_b',
  therapy_areas: ['oncology', 'immunology'],
  indications: ['NSCLC', 'Melanoma'],
  website: 'https://helixtx.com',
  linkedin: 'https://linkedin.com/company/helixtx',
  hq_city: 'San Francisco',
  hq_country: 'US',
  description:
    'Helix Therapeutics is a clinical-stage biopharmaceutical company developing next-generation bispecific antibodies for solid tumors. Their lead program, HLX-101, targets PD-L1/4-1BB and has demonstrated durable responses in a Phase 2 study across multiple solid tumor types including NSCLC and melanoma.',
  employee_count_range: '51-200',
  founded_year: 2019,
  lead_asset: 'HLX-101',
  lead_asset_phase: 'Phase 2',
  last_funding_amount: 85_000_000,
  last_funding_date: '2025-09-15',
  total_funding: 142_000_000,
  tags: ['high-conviction', 'board-relationship', 'active-fundraise'],
  notes: 'Strong executive network. CEO previously built and sold ArgenX subsidiary. Keep close for upcoming Series C.',
  owner_id: 'tm_001',
  targeting_score: 87,
  targeting_signals: null,
  created_by: 'tm_001',
  created_at: '2024-06-10T14:00:00Z',
  updated_at: '2026-03-01T09:30:00Z',
};

const MOCK_CONTACTS: Contact[] = [
  {
    id: 'ct_001',
    first_name: 'Elena',
    last_name: 'Vasquez',
    email: 'elena.v@helixtx.com',
    phone: '+1 415-555-0142',
    title: 'Chief Executive Officer',
    organization_id: 'comp_001',
    contact_type: 'executive',
    linkedin: 'https://linkedin.com/in/elenavasquez',
    therapy_area_expertise: ['oncology'],
    relationship_strength: 'warm_intro',
    relationship_owner_id: 'tm_001',
    last_contacted_at: '2026-03-10T11:00:00Z',
    notes: null,
    tags: [],
    created_by: 'tm_001',
    created_at: '2024-06-10T14:00:00Z',
    updated_at: '2026-03-10T11:00:00Z',
  },
  {
    id: 'ct_002',
    first_name: 'James',
    last_name: 'Thornton',
    email: 'j.thornton@helixtx.com',
    phone: '+1 415-555-0198',
    title: 'VP, Business Development',
    organization_id: 'comp_001',
    contact_type: 'founder',
    linkedin: null,
    therapy_area_expertise: ['oncology', 'immunology'],
    relationship_strength: 'direct',
    relationship_owner_id: 'tm_001',
    last_contacted_at: '2026-02-22T15:00:00Z',
    notes: null,
    tags: [],
    created_by: 'tm_001',
    created_at: '2024-09-05T10:00:00Z',
    updated_at: '2026-02-22T15:00:00Z',
  },
  {
    id: 'ct_003',
    first_name: 'Priya',
    last_name: 'Mehta',
    email: 'p.mehta@helixtx.com',
    phone: null,
    title: 'Chief Medical Officer',
    organization_id: 'comp_001',
    contact_type: 'advisor',
    linkedin: 'https://linkedin.com/in/priyamehta',
    therapy_area_expertise: ['oncology'],
    relationship_strength: 'met_once',
    relationship_owner_id: null,
    last_contacted_at: '2026-01-05T09:00:00Z',
    notes: null,
    tags: [],
    created_by: 'tm_001',
    created_at: '2025-03-12T10:00:00Z',
    updated_at: '2026-01-05T09:00:00Z',
  },
];

const MOCK_DEALS: Deal[] = [
  {
    id: 'deal_001',
    title: 'Helix Series C Advisory',
    deal_type: 'fundraising',
    stage: 'due_diligence',
    priority: 'high',
    company_id: 'comp_001',
    counterparty_ids: [],
    estimated_value: 200_000_000,
    upfront_amount: null,
    milestone_amount: null,
    royalty_range: null,
    therapy_area: 'oncology',
    indication: 'NSCLC',
    modality: 'Bispecific Antibody',
    development_stage: 'Phase 2',
    scorecard: null,
    confidentiality_level: 'highly_confidential',
    lead_advisor_id: 'tm_001',
    team_member_ids: ['tm_001', 'tm_002'],
    sourced_at: '2026-01-15T10:00:00Z',
    expected_close_date: '2026-06-30T00:00:00Z',
    actual_close_date: null,
    tags: ['flagship'],
    notes: null,
    created_by: 'tm_001',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-03-01T09:00:00Z',
  },
  {
    id: 'deal_002',
    title: 'Helix / NovaPharma Licensing',
    deal_type: 'licensing',
    stage: 'initial_review',
    priority: 'medium',
    company_id: 'comp_001',
    counterparty_ids: ['comp_042'],
    estimated_value: 450_000_000,
    upfront_amount: 75_000_000,
    milestone_amount: 375_000_000,
    royalty_range: '8-12%',
    therapy_area: 'oncology',
    indication: 'Melanoma',
    modality: 'Bispecific Antibody',
    development_stage: 'Phase 2',
    scorecard: null,
    confidentiality_level: 'confidential',
    lead_advisor_id: 'tm_001',
    team_member_ids: ['tm_001'],
    sourced_at: '2026-02-20T10:00:00Z',
    expected_close_date: '2026-09-01T00:00:00Z',
    actual_close_date: null,
    tags: [],
    notes: null,
    created_by: 'tm_001',
    created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-03-05T14:00:00Z',
  },
];

const MOCK_ACTIVITIES: ActivityType[] = [
  {
    id: 'act_001',
    activity_type: 'meeting',
    subject: 'Series C Kick-off Meeting',
    body: 'Discussed timeline, target raise amount ($200M), and investor landscape. Elena wants to prioritize crossover funds with oncology expertise. Agreed on 6-week roadshow starting May.',
    organization_id: 'comp_001',
    contact_id: 'ct_001',
    deal_id: 'deal_001',
    project_id: null,
    participant_contact_ids: ['ct_001', 'ct_002'],
    team_member_id: 'tm_001',
    occurred_at: '2026-03-10T14:00:00Z',
    duration_minutes: 60,
    is_pinned: true,
    metadata: null,
    created_at: '2026-03-10T15:00:00Z',
  },
  {
    id: 'act_002',
    activity_type: 'call',
    subject: 'BD Strategy Follow-up',
    body: 'James walked through the NovaPharma term sheet. Key sticking point is territory rights for Greater China. Need to run comps on recent bispecific licensing deals.',
    organization_id: 'comp_001',
    contact_id: 'ct_002',
    deal_id: 'deal_002',
    project_id: null,
    participant_contact_ids: ['ct_002'],
    team_member_id: 'tm_001',
    occurred_at: '2026-03-07T10:30:00Z',
    duration_minutes: 30,
    is_pinned: false,
    metadata: null,
    created_at: '2026-03-07T11:00:00Z',
  },
  {
    id: 'act_003',
    activity_type: 'email',
    subject: 'Updated CIM Draft Sent',
    body: 'Sent v3 of the Confidential Information Memorandum to Elena for review. Incorporated latest Phase 2 interim data and updated competitive landscape section.',
    organization_id: 'comp_001',
    contact_id: 'ct_001',
    deal_id: 'deal_001',
    project_id: null,
    participant_contact_ids: ['ct_001'],
    team_member_id: 'tm_001',
    occurred_at: '2026-03-04T16:00:00Z',
    duration_minutes: null,
    is_pinned: false,
    metadata: null,
    created_at: '2026-03-04T16:05:00Z',
  },
  {
    id: 'act_004',
    activity_type: 'note',
    subject: 'Competitive Intel: BioNova Phase 3 Read-out',
    body: 'BioNova reported positive Phase 3 topline for their PD-L1/TIGIT bispecific in NSCLC. ORR 42% vs 28% SOC. Could affect Helix positioning — need to discuss differentiation strategy.',
    organization_id: 'comp_001',
    contact_id: null,
    deal_id: null,
    project_id: null,
    participant_contact_ids: [],
    team_member_id: 'tm_001',
    occurred_at: '2026-02-28T09:00:00Z',
    duration_minutes: null,
    is_pinned: true,
    metadata: null,
    created_at: '2026-02-28T09:15:00Z',
  },
];

const MOCK_DOCUMENTS: DocumentType[] = [
  {
    id: 'doc_001',
    name: 'Helix CIM v3.pdf',
    file_path: '/docs/helix-cim-v3.pdf',
    file_size: 4_200_000,
    mime_type: 'application/pdf',
    document_type: 'cim',
    organization_id: 'comp_001',
    deal_id: 'deal_001',
    project_id: null,
    uploaded_by: 'tm_001',
    confidentiality_level: 'highly_confidential',
    tags: [],
    created_at: '2026-03-04T16:00:00Z',
  },
  {
    id: 'doc_002',
    name: 'Helix Pitch Deck Q1 2026.pptx',
    file_path: '/docs/helix-pitch-q1.pptx',
    file_size: 8_700_000,
    mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    document_type: 'pitch_deck',
    organization_id: 'comp_001',
    deal_id: 'deal_001',
    project_id: null,
    uploaded_by: 'tm_001',
    confidentiality_level: 'confidential',
    tags: [],
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'doc_003',
    name: 'HLX-101 Phase 2 Interim Data.pdf',
    file_path: '/docs/hlx101-ph2-interim.pdf',
    file_size: 2_100_000,
    mime_type: 'application/pdf',
    document_type: 'other',
    organization_id: 'comp_001',
    deal_id: null,
    project_id: null,
    uploaded_by: 'tm_001',
    confidentiality_level: 'confidential',
    tags: ['clinical-data'],
    created_at: '2026-01-20T14:00:00Z',
  },
];

const MOCK_INVESTOR_PROFILE: InvestorProfile | null = null;

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

const ORG_STAGE_LABELS: Record<string, string> = {
  seed: 'Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  series_c: 'Series C',
  growth: 'Growth',
  public: 'Public',
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

const RELATIONSHIP_COLORS: Record<string, { dot: string; label: string; badge: 'green' | 'blue' | 'amber' | 'slate' }> = {
  warm_intro: { dot: 'bg-signal-green', label: 'Warm Intro', badge: 'green' },
  direct: { dot: 'bg-signal-blue', label: 'Direct', badge: 'blue' },
  met_once: { dot: 'bg-signal-amber', label: 'Met Once', badge: 'amber' },
  cold: { dot: 'bg-slate-500', label: 'Cold', badge: 'slate' },
};

const CONTACT_TYPE_LABELS: Record<string, string> = {
  executive: 'Executive',
  founder: 'Founder',
  investor: 'Investor',
  advisor: 'Advisor',
  board_member: 'Board Member',
  operator: 'Operator',
};

const DOC_TYPE_LABELS: Record<string, string> = {
  term_sheet: 'Term Sheet',
  cim: 'CIM',
  pitch_deck: 'Pitch Deck',
  financial_model: 'Model',
  dd_report: 'DD Report',
  memo: 'Memo',
  other: 'Document',
};

function orgTypeBadgeVariant(type: Organization['type']): 'teal' | 'blue' | 'amber' | 'green' | 'slate' | 'red' {
  const map: Record<string, 'teal' | 'blue' | 'amber' | 'green' | 'slate' | 'red'> = {
    biotech: 'teal',
    pharma: 'blue',
    vc: 'blue',
    pe: 'amber',
    family_office: 'green',
    angel: 'green',
    cro: 'slate',
    advisory: 'slate',
    other: 'slate',
  };
  return map[type] ?? 'slate';
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function lastContactedColor(dateStr: string | null): 'green' | 'amber' | 'red' {
  if (!dateStr) return 'red';
  const days = daysSince(dateStr);
  if (days < 7) return 'green';
  if (days <= 30) return 'amber';
  return 'red';
}

const INVESTOR_ORG_TYPES: Organization['type'][] = ['vc', 'pe', 'family_office', 'angel'];

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function CompanyDetailSkeleton() {
  return (
    <div className="animate-fade-in">
      {/* Header skeleton */}
      <div className="bg-navy-900 noise rounded-lg p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Skeleton width={320} height={36} />
            <div className="flex gap-2">
              <Skeleton width={70} height={24} className="rounded-full" />
              <Skeleton width={80} height={24} className="rounded-full" />
            </div>
            <div className="flex gap-2 mt-2">
              <Skeleton width={80} height={20} className="rounded-full" />
              <Skeleton width={90} height={20} className="rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton width={72} height={36} />
            <Skeleton width={120} height={36} />
          </div>
        </div>
        <div className="flex gap-8 mt-6 pt-6 border-t border-navy-700/50">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1">
              <Skeleton width={60} height={12} />
              <Skeleton width={100} height={18} />
            </div>
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Skeleton height={160} className="rounded-lg" />
          <Skeleton height={280} className="rounded-lg" />
          <Skeleton height={180} className="rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton height={240} className="rounded-lg" />
          <Skeleton height={200} className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Organization | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);

  // Simulate data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setCompany(MOCK_COMPANY);
      setContacts(MOCK_CONTACTS);
      setDeals(MOCK_DEALS);
      setActivities(MOCK_ACTIVITIES);
      setDocuments(MOCK_DOCUMENTS);
      setInvestorProfile(MOCK_INVESTOR_PROFILE);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) return <CompanyDetailSkeleton />;
  if (!company) return null;

  const orgTypeLabel = ORG_TYPES.find((o) => o.id === company.type)?.label ?? company.type;
  const stageLabel = company.stage ? ORG_STAGE_LABELS[company.stage] ?? company.stage : null;
  const isInvestorType = INVESTOR_ORG_TYPES.includes(company.type);

  // Relationship owner (mock)
  const ownerName = company.owner_id ? 'Sarah Chen' : null;

  // Last contacted — most recent activity
  const lastContactedDate =
    activities.length > 0
      ? activities.reduce((latest, a) =>
          new Date(a.occurred_at) > new Date(latest.occurred_at) ? a : latest
        ).occurred_at
      : null;

  return (
    <div className="animate-fade-in">
      {/* ================================================================
          COMPANY HEADER
          ================================================================ */}
      <div className="bg-navy-900 noise rounded-lg p-8 mb-8 border border-navy-700/40">
        <div className="flex items-start justify-between">
          {/* Left: Identity */}
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-navy-700/60 border border-navy-600/50 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-teal-500" />
              </div>
              <div>
                <h1 className="font-display text-3xl text-slate-100 leading-tight">
                  {company.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={orgTypeBadgeVariant(company.type)}>{orgTypeLabel}</Badge>
                  {stageLabel && <Badge variant="green">{stageLabel}</Badge>}
                  {company.targeting_score !== null && (
                    <span className="badge badge-teal font-mono text-xs">
                      <Target className="w-3 h-3" />
                      {company.targeting_score}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Therapy area badges */}
            {company.therapy_areas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 ml-16">
                {company.therapy_areas.map((ta) => {
                  const area = THERAPY_AREA_MAP[ta];
                  return (
                    <span
                      key={ta}
                      className="badge badge-teal text-[10px] px-2 py-0.5"
                    >
                      {area?.label ?? ta}
                    </span>
                  );
                })}
                {company.indications.map((ind) => (
                  <span
                    key={ind}
                    className="badge badge-slate text-[10px] px-2 py-0.5"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            <div className="flex items-center gap-4 mt-3 ml-16">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{company.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              )}
              {company.linkedin && (
                <a
                  href={company.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Add Activity
            </Button>
          </div>
        </div>

        {/* Key metrics strip */}
        <div className="flex items-center gap-8 mt-6 pt-6 border-t border-navy-700/40">
          {company.founded_year && (
            <div>
              <span className="label">Founded</span>
              <p className="font-mono text-sm text-slate-200 mt-0.5">{company.founded_year}</p>
            </div>
          )}
          {(company.hq_city || company.hq_country) && (
            <div>
              <span className="label">Headquarters</span>
              <p className="text-sm text-slate-200 mt-0.5">
                {[company.hq_city, company.hq_country].filter(Boolean).join(', ')}
              </p>
            </div>
          )}
          {company.employee_count_range && (
            <div>
              <span className="label">Employees</span>
              <p className="font-mono text-sm text-slate-200 mt-0.5">{company.employee_count_range}</p>
            </div>
          )}
          {company.lead_asset && (
            <div>
              <span className="label">Lead Asset</span>
              <p className="text-sm text-slate-200 mt-0.5">
                <span className="font-mono">{company.lead_asset}</span>
                {company.lead_asset_phase && (
                  <span className="text-slate-400 ml-1">({company.lead_asset_phase})</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================
          TWO-COLUMN LAYOUT
          ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ============================================================
            LEFT COLUMN (2/3)
            ============================================================ */}
        <div className="lg:col-span-2 space-y-6">
          {/* --- About card --- */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.05s' } as React.CSSProperties}>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-teal-500" />
              <h2 className="label text-xs tracking-widest">About</h2>
            </div>
            {company.description ? (
              <p className="text-sm text-slate-300 leading-relaxed">{company.description}</p>
            ) : (
              <p className="text-sm text-slate-600 italic">No description provided.</p>
            )}
            {company.notes && (
              <div className="mt-4 pt-4 border-t border-navy-700/30">
                <span className="label text-[10px] tracking-widest">Internal Notes</span>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{company.notes}</p>
              </div>
            )}
          </Card>

          {/* --- Activity Timeline --- */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-500" />
                <h2 className="label text-xs tracking-widest">Activity Timeline</h2>
                {activities.length > 0 && (
                  <span className="font-mono text-[10px] text-slate-500 ml-1">{activities.length}</span>
                )}
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="w-8 h-8 text-slate-700 mb-3" />
                <p className="text-sm text-slate-500">No activities logged.</p>
                <p className="text-xs text-slate-600 mt-1">
                  Start tracking interactions with this company.
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-navy-700/60" />

                <div className="space-y-0">
                  {activities.map((act, idx) => (
                    <div key={act.id} className="relative flex gap-4 pb-6 last:pb-0 group">
                      {/* Dot */}
                      <div className="relative z-10 flex-shrink-0 mt-1">
                        <div
                          className={`w-[15px] h-[15px] rounded-full border-2 border-navy-900 ${
                            ACTIVITY_TYPE_COLORS[act.activity_type] ?? 'bg-slate-500'
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                            {ACTIVITY_TYPE_LABELS[act.activity_type] ?? act.activity_type}
                          </span>
                          {act.is_pinned && (
                            <span className="text-[9px] text-teal-500 uppercase tracking-wider">Pinned</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-200 font-medium leading-snug">
                          {act.subject}
                        </p>
                        {act.body && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                            {act.body}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[11px] text-slate-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelativeDate(act.occurred_at)}
                          </span>
                          {act.duration_minutes && (
                            <span className="text-[11px] text-slate-600 font-mono">
                              {act.duration_minutes}min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* --- Deals card --- */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.15s' } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-500" />
                <h2 className="label text-xs tracking-widest">Deals</h2>
                {deals.length > 0 && (
                  <span className="font-mono text-[10px] text-slate-500 ml-1">{deals.length}</span>
                )}
              </div>
            </div>

            {deals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Briefcase className="w-8 h-8 text-slate-700 mb-3" />
                <p className="text-sm text-slate-500">No deals associated with this company.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deals.map((deal) => {
                  const stageInfo = DEAL_STAGES.find((s) => s.id === deal.stage);
                  const dealTypeInfo = DEAL_TYPES.find((t) => t.id === deal.deal_type);
                  return (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="flex items-center justify-between p-3 rounded-md bg-navy-800/40 border border-navy-700/30 hover:border-teal-500/20 hover:bg-navy-800/60 transition-all group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-slate-200 font-medium truncate group-hover:text-teal-400 transition-colors">
                            {deal.title}
                          </p>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`badge text-[10px] ${STAGE_BADGE_MAP[deal.stage] ?? 'badge-slate'}`}>
                            {stageInfo?.label ?? deal.stage}
                          </span>
                          <span className="badge badge-slate text-[10px]">
                            {dealTypeInfo?.label ?? deal.deal_type}
                          </span>
                        </div>
                      </div>
                      {deal.estimated_value !== null && (
                        <span className="font-mono text-sm text-slate-300 flex-shrink-0 ml-4">
                          {formatCurrency(deal.estimated_value, true)}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          {/* --- Documents card --- */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.2s' } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-500" />
                <h2 className="label text-xs tracking-widest">Documents</h2>
                {documents.length > 0 && (
                  <span className="font-mono text-[10px] text-slate-500 ml-1">{documents.length}</span>
                )}
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-8 h-8 text-slate-700 mb-3" />
                <p className="text-sm text-slate-500">No documents yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 p-3 rounded-md bg-navy-800/40 border border-navy-700/30 hover:border-teal-500/20 transition-all cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded bg-navy-700/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-200 truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                          {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                        </span>
                        {doc.file_size && (
                          <span className="text-[10px] text-slate-600 font-mono">
                            {formatFileSize(doc.file_size)}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-600">
                          {formatRelativeDate(doc.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ============================================================
            RIGHT COLUMN (1/3)
            ============================================================ */}
        <div className="space-y-6">
          {/* --- Quick Info --- */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.05s' } as React.CSSProperties}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              <h2 className="label text-xs tracking-widest">Quick Info</h2>
            </div>

            <div className="space-y-4">
              {/* Relationship Owner */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Relationship Owner</span>
                <span className="text-sm text-slate-200">
                  {ownerName ?? <span className="text-slate-600 italic">Unassigned</span>}
                </span>
              </div>

              {/* Relationship Strength — from most recent contact's strength */}
              {contacts.length > 0 && (() => {
                const bestStrength = contacts[0].relationship_strength;
                const rel = RELATIONSHIP_COLORS[bestStrength];
                return (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Relationship</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${rel.dot}`} />
                      <Badge variant={rel.badge}>{rel.label}</Badge>
                    </div>
                  </div>
                );
              })()}

              {/* Last Contacted */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Last Contacted</span>
                {lastContactedDate ? (
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        lastContactedColor(lastContactedDate) === 'green'
                          ? 'bg-signal-green'
                          : lastContactedColor(lastContactedDate) === 'amber'
                          ? 'bg-signal-amber'
                          : 'bg-signal-red'
                      }`}
                    />
                    <span className="text-sm text-slate-200 font-mono">
                      {formatRelativeDate(lastContactedDate)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-600 italic">Never</span>
                )}
              </div>

              {/* Total Funding */}
              {company.total_funding !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Total Funding</span>
                  <span className="text-sm text-slate-200 font-mono">
                    {formatCurrency(company.total_funding, true)}
                  </span>
                </div>
              )}

              {/* Last Funding */}
              {company.last_funding_amount !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Last Funding</span>
                  <div className="text-right">
                    <span className="text-sm text-slate-200 font-mono">
                      {formatCurrency(company.last_funding_amount, true)}
                    </span>
                    {company.last_funding_date && (
                      <span className="text-[10px] text-slate-500 ml-1.5">
                        {formatDate(company.last_funding_date)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {company.tags.length > 0 && (
                <div className="pt-3 border-t border-navy-700/30">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                    <Tag className="w-3 h-3" /> Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {company.tags.map((tag) => (
                      <span key={tag} className="badge badge-slate text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* --- Contacts at This Company --- */}
          <Card className="animate-slide-up" style={{ animationDelay: '0.1s' } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-500" />
                <h2 className="label text-xs tracking-widest">Contacts</h2>
                {contacts.length > 0 && (
                  <span className="font-mono text-[10px] text-slate-500 ml-1">{contacts.length}</span>
                )}
              </div>
            </div>

            {contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="w-7 h-7 text-slate-700 mb-2" />
                <p className="text-sm text-slate-500">No contacts yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => {
                  const rel = RELATIONSHIP_COLORS[contact.relationship_strength];
                  return (
                    <Link
                      key={contact.id}
                      href={`/crm/contacts/${contact.id}`}
                      className="flex items-start gap-3 p-2.5 -mx-1 rounded-md hover:bg-navy-800/50 transition-all group"
                    >
                      {/* Avatar placeholder */}
                      <div className="w-8 h-8 rounded-full bg-navy-700/60 border border-navy-600/40 flex items-center justify-center flex-shrink-0 text-xs text-slate-400 font-medium">
                        {contact.first_name[0]}
                        {contact.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-slate-200 font-medium truncate group-hover:text-teal-400 transition-colors">
                            {contact.first_name} {contact.last_name}
                          </p>
                          <ChevronRight className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                        {contact.title && (
                          <p className="text-[11px] text-slate-500 truncate">{contact.title}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={rel.badge} className="text-[9px] px-1.5 py-0">
                            {rel.label}
                          </Badge>
                          <span className="badge badge-slate text-[9px] px-1.5 py-0">
                            {CONTACT_TYPE_LABELS[contact.contact_type] ?? contact.contact_type}
                          </span>
                        </div>
                        {contact.email && (
                          <p className="text-[10px] text-slate-600 mt-1 flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            {contact.email}
                          </p>
                        )}
                        {contact.phone && (
                          <p className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            {contact.phone}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <Link
              href="/crm/contacts/new"
              className="flex items-center gap-1.5 text-xs text-teal-500 hover:text-teal-400 transition-colors mt-4 pt-3 border-t border-navy-700/30"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Contact
            </Link>
          </Card>

          {/* --- Investor Profile (conditional) --- */}
          {isInvestorType && (
            <Card className="animate-slide-up" style={{ animationDelay: '0.15s' } as React.CSSProperties}>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-4 h-4 text-teal-500" />
                <h2 className="label text-xs tracking-widest">Investor Profile</h2>
              </div>

              {investorProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Type</span>
                    <Badge variant="blue">{investorProfile.investor_type}</Badge>
                  </div>

                  {investorProfile.therapy_area_focus.length > 0 && (
                    <div>
                      <span className="text-xs text-slate-500 block mb-1.5">Thesis Focus</span>
                      <div className="flex flex-wrap gap-1.5">
                        {investorProfile.therapy_area_focus.map((ta) => (
                          <span key={ta} className="badge badge-teal text-[10px]">
                            {THERAPY_AREA_MAP[ta]?.label ?? ta}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {investorProfile.stage_focus.length > 0 && (
                    <div>
                      <span className="text-xs text-slate-500 block mb-1.5">Stage Focus</span>
                      <div className="flex flex-wrap gap-1.5">
                        {investorProfile.stage_focus.map((s) => (
                          <span key={s} className="badge badge-slate text-[10px]">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(investorProfile.check_size_min !== null || investorProfile.check_size_max !== null) && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Check Size</span>
                      <span className="font-mono text-sm text-slate-200">
                        {investorProfile.check_size_min !== null && formatCurrency(investorProfile.check_size_min, true)}
                        {investorProfile.check_size_min !== null && investorProfile.check_size_max !== null && ' - '}
                        {investorProfile.check_size_max !== null && formatCurrency(investorProfile.check_size_max, true)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Lead Preference</span>
                    <span className="text-sm text-slate-300 capitalize">
                      {investorProfile.lead_preference.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <DollarSign className="w-7 h-7 text-slate-700 mb-2" />
                  <p className="text-sm text-slate-500">No investor profile configured.</p>
                  <p className="text-xs text-slate-600 mt-1">Add investment thesis and preferences.</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* ================================================================
          ENRICHMENT / TERRAIN INTEGRATION SECTION
          ================================================================ */}
      <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.25s' } as React.CSSProperties}>
        <Card className="relative overflow-hidden">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded bg-teal-900/40 border border-teal-700/30 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-teal-500" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-slate-200">Market Intelligence</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="badge badge-teal text-[9px] px-1.5 py-0">Terrain</span>
                    <span className="text-[10px] text-slate-600">Powered by Ambrosia Ventures</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed max-w-xl mt-2">
                Connect to Terrain to see TAM/SAM analysis, competitive landscape, and regulatory
                pathways for this company&apos;s indication. Unlock pricing benchmarks, likelihood
                of approval data, and S-curve market projections.
              </p>

              <div className="flex items-center gap-3 mt-4">
                {company.therapy_areas.map((ta) => (
                  <span key={ta} className="badge badge-teal text-[10px] opacity-60">
                    {THERAPY_AREA_MAP[ta]?.label ?? ta}
                  </span>
                ))}
                {company.indications.map((ind) => (
                  <span key={ind} className="badge badge-slate text-[10px] opacity-60">
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            <Button variant="ghost" size="sm" disabled className="flex-shrink-0 mt-1">
              <ExternalLink className="w-3.5 h-3.5" />
              Fetch from Terrain
            </Button>
          </div>

          {/* Placeholder grid — hints at the data that would appear */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-navy-700/30">
            {[
              { label: 'TAM Estimate', value: '--', sub: 'Total Addressable Market' },
              { label: 'Competitive Intensity', value: '--', sub: 'Active programs in indication' },
              { label: 'LoA (Phase 2 \u2192 Approval)', value: '--', sub: 'Likelihood of Approval' },
              { label: 'Peak Revenue', value: '--', sub: 'S-curve projection' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <span className="label text-[9px]">{item.label}</span>
                <p className="font-mono text-lg text-slate-600 mt-1">{item.value}</p>
                <p className="text-[10px] text-slate-700 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
