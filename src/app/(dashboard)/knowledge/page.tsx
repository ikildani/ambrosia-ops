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
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(Object.keys(CATEGORY_META) as KnowledgeCategory[]).map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const count = knowledgeEntries.filter((e) => e.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              className="text-left"
              onClick={() => setActiveTab(cat)}
            >
              <Card className="flex items-center gap-3 cursor-pointer transition-all duration-200 hover:border-teal-500/20">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-800 border border-subtle">
                  <Icon className="h-4 w-4 text-teal-400" />
                </div>
                <div>
                  <p className="font-mono text-lg font-semibold text-slate-100 tabular-nums">{count}</p>
                  <p className="text-[11px] text-slate-500">{meta.label}s</p>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="mb-8">
        <Tabs tabs={categoryTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Search */}
      <div className="relative mb-10">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content Grid or No-Results */}
      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="mb-5 h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-400 leading-relaxed">
            No entries match your search. Try different keywords or filters.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((entry, i) => (
            <div
              key={entry.id}
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              className="animate-[slideUp_0.4s_ease-out]"
            >
              <Link href={`/knowledge/${entry.id}`}>
                <EntryCard entry={entry} />
              </Link>
            </div>
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
    <Card className="group relative cursor-pointer transition-all duration-200 hover:border-teal-500/20 hover:shadow-[var(--shadow-card-hover)]">
      {/* Category icon + badge */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 border border-subtle">
            <Icon className="h-4 w-4 text-teal-400" />
          </div>
          <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
        </div>
        <span className="font-mono text-[11px] text-slate-500">{entry.readTime}</span>
      </div>

      {/* Title */}
      <h3 className="mb-3 text-base font-medium text-slate-100 group-hover:text-teal-300 transition-colors leading-snug">
        {entry.title}
      </h3>

      {/* Description preview */}
      <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-slate-400">
        {entry.description}
      </p>

      {/* Tags */}
      <div className="mb-5 flex flex-wrap gap-2">
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-navy-800 px-2.5 py-1 text-[10px] text-slate-500"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Author + date */}
      <div className="flex items-center gap-2 border-t border-subtle pt-4 text-xs text-slate-500">
        <User className="h-3 w-3" />
        <span className="font-medium text-slate-400">{entry.author}</span>
        <span className="text-slate-600">|</span>
        <Clock className="h-3 w-3" />
        <span>{entry.lastUpdated}</span>
      </div>
    </Card>
  );
}
