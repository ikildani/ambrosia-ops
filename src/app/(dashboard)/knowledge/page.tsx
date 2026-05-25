'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import {
  Plus,
  Search,
  BookOpen,
  TrendingUp,
  FileText,
  Lightbulb,
  Clock,
  User,
} from 'lucide-react';

/* -------------------------------------------------- */
/* CATEGORY METADATA                                   */
/* -------------------------------------------------- */

type KnowledgeCategory = 'playbook' | 'template' | 'market_intel' | 'lesson';

const CATEGORY_META: Record<
  KnowledgeCategory,
  { label: string; icon: React.ElementType; badgeVariant: 'teal' | 'blue' | 'amber' | 'green' }
> = {
  playbook:    { label: 'Playbook',          icon: BookOpen,    badgeVariant: 'teal' },
  template:    { label: 'Template',          icon: FileText,    badgeVariant: 'amber' },
  market_intel:{ label: 'Market Intel',      icon: TrendingUp,  badgeVariant: 'blue' },
  lesson:      { label: 'Lesson Learned',    icon: Lightbulb,   badgeVariant: 'green' },
};

/* -------------------------------------------------- */
/* FILTER TABS                                         */
/* -------------------------------------------------- */

const categoryTabs = [
  { id: 'all', label: 'All' },
  { id: 'playbook', label: 'Playbooks' },
  { id: 'template', label: 'Templates' },
  { id: 'market_intel', label: 'Market Intel' },
  { id: 'lesson', label: 'Lessons Learned' },
];

/* -------------------------------------------------- */
/* KNOWLEDGE ENTRY TYPE                                */
/* -------------------------------------------------- */

interface KnowledgeEntry {
  id: string;
  title: string;
  category: KnowledgeCategory;
  description: string;
  content: string;
  tags: string[];
  lastUpdated: string;
  author: string;
  readTime: string;
}

/* -------------------------------------------------- */
/* INSTITUTIONAL CONTENT                               */
/* -------------------------------------------------- */

const knowledgeEntries: KnowledgeEntry[] = [
  // ── Playbooks ──────────────────────────────────────
  {
    id: 'pb-001',
    title: 'M&A Transaction Playbook',
    category: 'playbook',
    description:
      'End-to-end guide for managing life sciences M&A transactions from initial sourcing through definitive agreement and close. Covers target identification, outreach sequencing, management presentations, due diligence coordination, bid process management, and post-signing obligations.',
    content: 'Full content available in the knowledge base',
    tags: ['M&A', 'deal process', 'sell-side', 'buy-side', 'closing mechanics'],
    lastUpdated: 'May 20, 2026',
    author: 'Issa Kildani',
    readTime: '15 min read',
  },
  {
    id: 'pb-002',
    title: 'Due Diligence Checklist',
    category: 'playbook',
    description:
      'Comprehensive due diligence framework tailored for life sciences assets including clinical, regulatory, IP, commercial, and financial workstreams. Includes stage-specific checklists for preclinical through commercial-stage assets and red flag indicators for common deal-breakers.',
    content: 'Full content available in the knowledge base',
    tags: ['due diligence', 'clinical', 'IP', 'regulatory', 'CMC'],
    lastUpdated: 'May 18, 2026',
    author: 'Issa Kildani',
    readTime: '12 min read',
  },
  {
    id: 'pb-003',
    title: 'Licensing Deal Negotiation Guide',
    category: 'playbook',
    description:
      'Framework for structuring and negotiating licensing transactions across therapeutic areas. Covers key economic terms (upfront, milestones, royalties), territory splits, co-development rights, diligence obligations, and common red flags in licensor vs. licensee positions.',
    content: 'Full content available in the knowledge base',
    tags: ['licensing', 'negotiation', 'royalties', 'milestones', 'term sheets'],
    lastUpdated: 'May 14, 2026',
    author: 'Issa Kildani',
    readTime: '10 min read',
  },
  {
    id: 'pb-004',
    title: 'Fundraising Advisory Process',
    category: 'playbook',
    description:
      'Step-by-step advisory workflow for guiding biotech clients through fundraising from Series A through IPO. Includes investor targeting methodology, data room preparation, roadshow management, term sheet negotiation, and syndicate construction best practices.',
    content: 'Full content available in the knowledge base',
    tags: ['fundraising', 'Series A', 'IPO', 'investor targeting', 'syndicate'],
    lastUpdated: 'May 10, 2026',
    author: 'Issa Kildani',
    readTime: '11 min read',
  },
  {
    id: 'pb-005',
    title: 'Partner Search Methodology',
    category: 'playbook',
    description:
      'Systematic approach for identifying and prioritizing potential strategic partners for licensing, co-development, or acquisition. Covers therapeutic area mapping, pipeline gap analysis, corporate development outreach protocols, and NDA/CDA management workflows.',
    content: 'Full content available in the knowledge base',
    tags: ['partner search', 'business development', 'strategic fit', 'outreach'],
    lastUpdated: 'May 6, 2026',
    author: 'Issa Kildani',
    readTime: '9 min read',
  },

  // ── Templates ──────────────────────────────────────
  {
    id: 'tp-001',
    title: 'Confidential Information Memorandum (CIM)',
    category: 'template',
    description:
      'Standard CIM structure for sell-side advisory mandates in life sciences. Includes section templates for executive summary, company overview, technology platform, clinical pipeline, IP portfolio, commercial opportunity, financial projections, and transaction rationale.',
    content: 'Full content available in the knowledge base',
    tags: ['CIM', 'sell-side', 'data room', 'pitch materials'],
    lastUpdated: 'May 22, 2026',
    author: 'Issa Kildani',
    readTime: '8 min read',
  },
  {
    id: 'tp-002',
    title: 'Term Sheet Template',
    category: 'template',
    description:
      'Standardized term sheet framework covering key economic and governance terms for licensing and M&A transactions. Includes typical ranges for upfront payments, milestone structures, royalty tiers, and representations/warranties with life sciences-specific provisions.',
    content: 'Full content available in the knowledge base',
    tags: ['term sheet', 'deal terms', 'economic terms', 'governance'],
    lastUpdated: 'May 16, 2026',
    author: 'Issa Kildani',
    readTime: '7 min read',
  },
  {
    id: 'tp-003',
    title: 'Board Presentation Template',
    category: 'template',
    description:
      'Investment committee deck structure for presenting deal recommendations to client boards. Covers strategic rationale, valuation analysis (rNPV, comparables, precedent transactions), risk factors, deal structure options, and recommended next steps with decision framework.',
    content: 'Full content available in the knowledge base',
    tags: ['IC deck', 'board materials', 'valuation', 'recommendation'],
    lastUpdated: 'May 12, 2026',
    author: 'Issa Kildani',
    readTime: '6 min read',
  },
  {
    id: 'tp-004',
    title: 'Valuation Model Guide',
    category: 'template',
    description:
      'Reference guide for the risk-adjusted NPV (rNPV) methodology used across all Ambrosia advisory mandates. Documents standard assumptions for discount rates, probability of success by phase, peak sales estimation, patent life adjustments, and scenario modeling frameworks.',
    content: 'Full content available in the knowledge base',
    tags: ['rNPV', 'valuation', 'DCF', 'assumptions', 'modeling'],
    lastUpdated: 'May 8, 2026',
    author: 'Issa Kildani',
    readTime: '10 min read',
  },

  // ── Market Intelligence ────────────────────────────
  {
    id: 'mi-001',
    title: '2026 Biopharma M&A Landscape',
    category: 'market_intel',
    description:
      'Comprehensive overview of 2026 biopharma M&A activity including deal volume trends, median premiums by therapeutic area, emerging buyer profiles, and key regulatory developments. Covers the impact of IRA pricing provisions on transaction structures and acquirer appetite across oncology, immunology, and rare disease.',
    content: 'Full content available in the knowledge base',
    tags: ['M&A landscape', '2026 trends', 'deal volume', 'premiums', 'IRA'],
    lastUpdated: 'May 23, 2026',
    author: 'Issa Kildani',
    readTime: '14 min read',
  },
  {
    id: 'mi-002',
    title: 'China Cross-Border Licensing Wave',
    category: 'market_intel',
    description:
      'Analysis of the accelerating outbound licensing trend from Chinese biotech companies to ex-China partners. Examines deal structures, typical upfront-to-total ratios, territory splits, and the strategic implications for Western mid-caps evaluating China-originated assets in oncology and immunology.',
    content: 'Full content available in the knowledge base',
    tags: ['China', 'cross-border', 'licensing', 'outbound', 'ex-China rights'],
    lastUpdated: 'May 19, 2026',
    author: 'Issa Kildani',
    readTime: '12 min read',
  },
  {
    id: 'mi-003',
    title: 'AI-Driven Drug Discovery Deals',
    category: 'market_intel',
    description:
      'Survey of emerging deal structures at the intersection of artificial intelligence and drug discovery. Covers platform licensing vs. asset-specific partnerships, computational milestone triggers, data rights provisions, and how traditional pharma is pricing AI/ML-generated candidates relative to conventional discovery programs.',
    content: 'Full content available in the knowledge base',
    tags: ['AI/ML', 'drug discovery', 'platform deals', 'data rights', 'computational'],
    lastUpdated: 'May 15, 2026',
    author: 'Issa Kildani',
    readTime: '11 min read',
  },
  {
    id: 'mi-004',
    title: 'Orphan Drug Premium Analysis',
    category: 'market_intel',
    description:
      'Quantitative analysis of acquisition and licensing premiums observed in rare disease transactions over the past 36 months. Benchmarks premiums by clinical stage, regulatory designation status (orphan, breakthrough, fast track), and market exclusivity profile against non-orphan comparables across 118 transactions.',
    content: 'Full content available in the knowledge base',
    tags: ['rare disease', 'orphan drug', 'premiums', 'exclusivity', 'designations'],
    lastUpdated: 'May 11, 2026',
    author: 'Issa Kildani',
    readTime: '13 min read',
  },

  // ── Lessons Learned ────────────────────────────────
  {
    id: 'll-001',
    title: 'Pipeline Failure Recovery Strategies',
    category: 'lesson',
    description:
      'Institutional lessons on advising clients through clinical pipeline failures including communication frameworks for boards and investors, strategic pivot options (indication expansion, platform re-positioning, reverse mergers), and timeline management for maintaining enterprise value post-failure.',
    content: 'Full content available in the knowledge base',
    tags: ['pipeline failure', 'crisis management', 'strategic pivot', 'communication'],
    lastUpdated: 'May 21, 2026',
    author: 'Issa Kildani',
    readTime: '9 min read',
  },
  {
    id: 'll-002',
    title: 'Competitive Auction Management',
    category: 'lesson',
    description:
      'Lessons from managing multi-bidder auction processes for sell-side mandates. Covers bidder qualification strategies, information asymmetry management, timeline compression tactics, markup negotiation sequencing, and how to maintain competitive tension while preserving bidder relationships for future transactions.',
    content: 'Full content available in the knowledge base',
    tags: ['auction', 'sell-side', 'competitive process', 'bidder management'],
    lastUpdated: 'May 17, 2026',
    author: 'Issa Kildani',
    readTime: '10 min read',
  },
  {
    id: 'll-003',
    title: 'Regulatory Risk Pricing',
    category: 'lesson',
    description:
      'Framework for quantifying and pricing regulatory uncertainty into deal terms based on lessons from past advisory engagements. Covers CRL scenario modeling, AdCom vote probability adjustments, PDUFA date risk allocation between buyer and seller, and structuring regulatory milestones to bridge valuation gaps.',
    content: 'Full content available in the knowledge base',
    tags: ['regulatory risk', 'CRL', 'PDUFA', 'milestone structuring', 'risk allocation'],
    lastUpdated: 'May 13, 2026',
    author: 'Issa Kildani',
    readTime: '8 min read',
  },
];

/* -------------------------------------------------- */
/* PAGE COMPONENT                                      */
/* -------------------------------------------------- */

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = knowledgeEntries.filter((entry) => {
    if (activeTab !== 'all' && entry.category !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Knowledge Base"
        subtitle="Institutional playbooks, templates, and market intelligence"
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        }
      />

      {/* Category Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '48px' }}>
        {(Object.keys(CATEGORY_META) as KnowledgeCategory[]).map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const count = knowledgeEntries.filter((e) => e.category === cat).length;
          const isActive = activeTab === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveTab(cat)}
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <div style={{
                background: '#07101e',
                border: `1px solid ${isActive ? 'rgba(95,212,227,0.2)' : 'rgba(100,116,139,0.15)'}`,
                borderRadius: '14px',
                padding: '28px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s ease',
              }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>{meta.label}s</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 600, color: '#f0f4f8' }}>{count}</p>
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#0d1b2e', border: '1px solid rgba(100,116,139,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '20px', height: '20px', color: '#00c9a7' }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter + Search */}
      <div style={{ background: '#07101e', border: '1px solid rgba(100,116,139,0.15)', borderRadius: '14px', padding: '28px 32px', marginBottom: '40px' }}>
        <div className="relative" style={{ marginBottom: '20px' }}>
          <Search className="absolute top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#475569', left: '18px' }} />
          <input
            type="text"
            className="input"
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '46px', width: '100%' }}
          />
        </div>
        <Tabs tabs={categoryTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Content Grid or No-Results */}
      {filtered.length === 0 ? (
        <div style={{ background: '#07101e', border: '1px solid rgba(100,116,139,0.15)', borderRadius: '14px', padding: '80px 32px', textAlign: 'center' }}>
          <Search style={{ width: '32px', height: '32px', color: '#334155', margin: '0 auto 20px' }} />
          <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.7 }}>
            No entries match your search. Try different keywords or filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {filtered.map((entry, i) => (
            <Link
              key={entry.id}
              href={`/knowledge/${entry.id}`}
              style={{ textDecoration: 'none', animation: `slideUp 0.4s ease-out ${i * 60}ms both` }}
            >
              <EntryCard entry={entry} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------- */
/* ENTRY CARD                                          */
/* -------------------------------------------------- */

function EntryCard({ entry }: { entry: KnowledgeEntry }) {
  const meta = CATEGORY_META[entry.category];
  const Icon = meta.icon;

  return (
    <div style={{
      background: '#07101e',
      border: '1px solid rgba(100,116,139,0.1)',
      borderRadius: '14px',
      padding: '32px',
      cursor: 'pointer',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
    className="group hover:!border-teal-500/20"
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,201,167,0.2)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,116,139,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Category icon + badge + read time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#0d1b2e', border: '1px solid rgba(100,116,139,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ width: '18px', height: '18px', color: '#00c9a7' }} />
          </div>
          <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#475569' }}>{entry.readTime}</span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#f0f4f8', lineHeight: 1.35, marginBottom: '14px', transition: 'color 0.2s ease' }}
        className="group-hover:!text-teal-300"
      >
        {entry.title}
      </h3>

      {/* Description preview */}
      <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#64748b', marginBottom: '24px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
        {entry.description}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {entry.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            style={{ background: '#0d1b2e', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', color: '#64748b', letterSpacing: '0.02em' }}
          >
            {tag}
          </span>
        ))}
        {entry.tags.length > 4 && (
          <span style={{ padding: '5px 8px', fontSize: '11px', color: '#475569' }}>
            +{entry.tags.length - 4}
          </span>
        )}
      </div>

      {/* Author + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid rgba(100,116,139,0.08)', paddingTop: '20px', fontSize: '13px', color: '#475569' }}>
        <User style={{ width: '14px', height: '14px' }} />
        <span style={{ fontWeight: 500, color: '#94a3b8' }}>{entry.author}</span>
        <span style={{ color: '#1e293b' }}>|</span>
        <Clock style={{ width: '14px', height: '14px' }} />
        <span>{entry.lastUpdated}</span>
      </div>
    </div>
  );
}
