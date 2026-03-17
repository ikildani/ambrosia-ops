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
  Globe,
  FileText,
  Lightbulb,
  Library,
  Clock,
  User,
} from 'lucide-react';

/* -------------------------------------------------- */
/* CATEGORY METADATA                                   */
/* -------------------------------------------------- */

type KnowledgeCategory = 'playbook' | 'primer' | 'template' | 'lesson';

const CATEGORY_META: Record<
  KnowledgeCategory,
  { label: string; icon: React.ElementType; badgeVariant: 'teal' | 'blue' | 'amber' | 'green' }
> = {
  playbook: { label: 'Playbook', icon: BookOpen, badgeVariant: 'teal' },
  primer: { label: 'Sector Primer', icon: Globe, badgeVariant: 'blue' },
  template: { label: 'Template', icon: FileText, badgeVariant: 'amber' },
  lesson: { label: 'Lesson Learned', icon: Lightbulb, badgeVariant: 'green' },
};

/* -------------------------------------------------- */
/* FILTER TABS                                         */
/* -------------------------------------------------- */

const categoryTabs = [
  { id: 'all', label: 'All' },
  { id: 'playbook', label: 'Playbooks' },
  { id: 'primer', label: 'Sector Primers' },
  { id: 'template', label: 'Templates' },
  { id: 'lesson', label: 'Lessons Learned' },
];

/* -------------------------------------------------- */
/* MOCK DATA                                           */
/* -------------------------------------------------- */

interface KnowledgeEntry {
  id: string;
  title: string;
  description: string;
  category: KnowledgeCategory;
  author: string;
  updated_at: string;
  version: number;
  tags: string[];
}

const mockEntries: KnowledgeEntry[] = [
  {
    id: '1',
    title: 'How to Run Due Diligence',
    description:
      'Step-by-step framework for conducting thorough due diligence on biotech targets. Covers scientific assessment, IP review, commercial viability, regulatory pathway, and management evaluation with scoring rubrics.',
    category: 'playbook',
    author: 'Issa Kildani',
    updated_at: '2w ago',
    version: 3,
    tags: ['due diligence', 'framework', 'process'],
  },
  {
    id: '2',
    title: 'Oncology ADC Landscape — Sector Primer',
    description:
      'Comprehensive overview of the antibody-drug conjugate landscape in oncology. Covers approved products, clinical-stage assets, key technology platforms, competitive dynamics, and investment thesis considerations.',
    category: 'primer',
    author: 'Alex Rivera',
    updated_at: '1w ago',
    version: 1,
    tags: ['oncology', 'ADC', 'competitive landscape'],
  },
  {
    id: '3',
    title: 'Engagement Letter Template',
    description:
      'Standard engagement letter template for advisory mandates. Includes fee structure options, exclusivity clauses, termination provisions, and indemnification language reviewed by outside counsel.',
    category: 'template',
    author: 'Issa Kildani',
    updated_at: '3w ago',
    version: 2,
    tags: ['legal', 'engagement', 'advisory'],
  },
  {
    id: '4',
    title: 'CIM Structure & Best Practices',
    description:
      'Template and guidelines for creating Confidential Information Memorandums. Covers executive summary, company overview, market opportunity, financial projections, and management team sections.',
    category: 'template',
    author: 'Jordan Lee',
    updated_at: '1mo ago',
    version: 1,
    tags: ['CIM', 'sell-side', 'documentation'],
  },
  {
    id: '5',
    title: 'Project Falcon Post-Mortem',
    description:
      'Retrospective analysis of a successfully closed oncology deal. Key takeaways on timeline management, buyer engagement strategy, and valuation negotiation tactics that led to a 15% premium over initial offer.',
    category: 'lesson',
    author: 'Dr. Maya Patel',
    updated_at: '2w ago',
    version: 1,
    tags: ['oncology', 'won deal', 'post-mortem'],
  },
  {
    id: '6',
    title: 'Negotiation Framework: Licensing Deals',
    description:
      'Structured approach to negotiating licensing agreements in biopharma. Covers upfront payments, milestones, royalty tiers, territory rights, co-development options, and common deal-breakers with resolution strategies.',
    category: 'playbook',
    author: 'Alex Rivera',
    updated_at: '1w ago',
    version: 5,
    tags: ['licensing', 'negotiation', 'deal structure'],
  },
];

/* -------------------------------------------------- */
/* PAGE COMPONENT                                      */
/* -------------------------------------------------- */

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockEntries.filter((entry) => {
    if (activeTab !== 'all' && entry.category !== activeTab) return false;
    if (
      searchQuery &&
      !entry.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !entry.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
      return false;
    return true;
  });

  const showEmpty = filtered.length === 0 && !searchQuery && activeTab === 'all';

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Knowledge Base"
        subtitle="Playbooks, templates, and institutional knowledge"
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="mb-6">
        <Tabs tabs={categoryTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content Grid or Empty State */}
      {showEmpty ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="mb-4 h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-400 leading-relaxed">
            No entries match your search. Try different keywords or filters.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((entry, i) => (
            <div
              key={entry.id}
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              className="animate-[slideUp_0.4s_ease-out]"
            >
              <EntryCard entry={entry} />
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
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 border border-subtle">
            <Icon className="h-4 w-4 text-teal-400" />
          </div>
          <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
        </div>
        <span className="font-mono text-xs text-slate-500">v{entry.version}</span>
      </div>

      {/* Title */}
      <h3 className="mb-3 text-base font-medium text-slate-100 group-hover:text-teal-300 transition-colors">
        {entry.title}
      </h3>

      {/* Description preview */}
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-400">
        {entry.description}
      </p>

      {/* Tags */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-navy-800 px-1.5 py-0.5 text-[10px] text-slate-500"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Author + date */}
      <div className="flex items-center gap-2 border-t border-subtle pt-4 text-xs text-slate-500">
        <User className="h-3 w-3" />
        <span className="font-medium text-slate-400">{entry.author}</span>
        <span className="text-slate-600">·</span>
        <Clock className="h-3 w-3" />
        <span>{entry.updated_at}</span>
      </div>
    </Card>
  );
}

/* -------------------------------------------------- */
/* EMPTY STATE                                         */
/* -------------------------------------------------- */

function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-800 border border-subtle">
        <Library className="h-8 w-8 text-teal-400" />
      </div>
      <h3 className="font-display text-xl text-slate-100 mb-3">
        Build your team&apos;s knowledge base
      </h3>
      <p className="max-w-md text-sm text-slate-400 mb-8 leading-relaxed">
        Capture institutional knowledge — playbooks, sector primers, templates,
        and lessons learned — so nothing gets lost when deals move fast.
      </p>
      <Button>
        <Plus className="h-4 w-4" />
        Add First Entry
      </Button>
    </Card>
  );
}
