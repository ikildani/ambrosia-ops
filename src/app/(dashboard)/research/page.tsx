'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import {
  FileText,
  Sparkles,
  Search,
  Pin,
  BookOpen,
  Building2,
  Clock,
} from 'lucide-react';
import type { ResearchNote } from '@/types/database';

/* -------------------------------------------------- */
/* NOTE-TYPE METADATA                                  */
/* -------------------------------------------------- */

const NOTE_TYPE_META: Record<
  ResearchNote['note_type'],
  { label: string; badgeVariant: 'teal' | 'blue' | 'amber' | 'green' | 'slate' | 'red'; cssClass: string }
> = {
  company_deep_dive: { label: 'Company Deep Dive', badgeVariant: 'teal', cssClass: 'badge-teal' },
  market_memo:       { label: 'Market Memo',       badgeVariant: 'blue', cssClass: 'badge-blue' },
  competitive_intel: { label: 'Competitive Intel',  badgeVariant: 'amber', cssClass: 'badge-amber' },
  deal_thesis:       { label: 'Deal Thesis',        badgeVariant: 'green', cssClass: 'badge-green' },
  meeting_summary:   { label: 'Meeting Summary',    badgeVariant: 'slate', cssClass: 'badge-slate' },
  sector_overview:   { label: 'Sector Overview',     badgeVariant: 'blue', cssClass: 'bg-violet-500/12 text-violet-400 border border-violet-500/20' },
};

/* -------------------------------------------------- */
/* FILTER TABS                                         */
/* -------------------------------------------------- */

const noteTabs = [
  { id: 'all', label: 'All' },
  { id: 'company_deep_dive', label: 'Company Deep Dive' },
  { id: 'market_memo', label: 'Market Memo' },
  { id: 'competitive_intel', label: 'Competitive Intel' },
  { id: 'deal_thesis', label: 'Deal Thesis' },
  { id: 'meeting_summary', label: 'Meeting Summary' },
  { id: 'sector_overview', label: 'Sector Overview' },
];

/* -------------------------------------------------- */
/* MOCK DATA                                           */
/* -------------------------------------------------- */

interface MockNote {
  id: string;
  title: string;
  content: string;
  note_type: ResearchNote['note_type'];
  ai_generated: boolean;
  therapy_area: string | null;
  is_pinned: boolean;
  tags: string[];
  linked_entity: { type: 'organization' | 'deal'; name: string } | null;
  author_name: string;
  created_at: string;
}

const mockNotes: MockNote[] = [];

/* -------------------------------------------------- */
/* HELPERS                                             */
/* -------------------------------------------------- */

function formatRelativeDate(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function therapyAreaLabel(id: string): string {
  return id
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* -------------------------------------------------- */
/* PAGE COMPONENT                                      */
/* -------------------------------------------------- */

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockNotes.filter((note) => {
    if (activeTab !== 'all' && note.note_type !== activeTab) return false;
    if (
      searchQuery &&
      !note.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const showEmpty = filtered.length === 0 && !searchQuery && activeTab === 'all';

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Research Hub"
        subtitle="Proprietary research, market memos, and AI-generated deep dives"
        actions={
          <>
            <Link href="/research/new">
              <Button variant="secondary">
                <FileText className="h-4 w-4" />
                New Note
              </Button>
            </Link>
            <Link href="/research/new">
              <Button
                className="shadow-[0_0_20px_rgba(0,201,167,0.25)]"
              >
                <Sparkles className="h-4 w-4" />
                AI Deep Dive
              </Button>
            </Link>
          </>
        }
      />

      {/* Filter Tabs */}
      <div className="mb-5">
        <Tabs tabs={noteTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Search research notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Notes Grid or Empty State */}
      {showEmpty ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="mb-3 h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-400">
            No notes match your search. Try different keywords or filters.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------- */
/* NOTE CARD                                           */
/* -------------------------------------------------- */

function NoteCard({ note }: { note: MockNote }) {
  const meta = NOTE_TYPE_META[note.note_type];

  return (
    <Link href={`/research/${note.id}`} className="block">
      <Card className="group relative cursor-pointer transition-all duration-200 hover:border-teal-500/20 hover:shadow-[var(--shadow-card-hover)]">
        {/* Top row: type badge + pin */}
        <div className="mb-3 flex items-center justify-between">
          <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
          {note.is_pinned && (
            <Pin className="h-3.5 w-3.5 text-teal-400" />
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-base font-medium text-slate-100 group-hover:text-teal-300 transition-colors">
          {note.title}
        </h3>

        {/* Body preview */}
        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slate-400">
          {note.content}
        </p>

        {/* AI + Therapy area badges */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {note.ai_generated && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-400 border border-teal-500/20">
              <Sparkles className="h-3 w-3" />
              AI Generated
            </span>
          )}
          {note.therapy_area && (
            <Badge variant="slate">
              {therapyAreaLabel(note.therapy_area)}
            </Badge>
          )}
        </div>

        {/* Linked entity */}
        {note.linked_entity && (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="h-3 w-3" />
            <span className="text-teal-400/80 hover:text-teal-300">
              {note.linked_entity.name}
            </span>
          </div>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-navy-800 px-1.5 py-0.5 text-[10px] text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author + date */}
        <div className="flex items-center gap-2 border-t border-subtle pt-3 text-xs text-slate-500">
          <span className="font-medium text-slate-400">{note.author_name}</span>
          <span className="text-slate-600">·</span>
          <Clock className="h-3 w-3" />
          <span>{formatRelativeDate(note.created_at)}</span>
        </div>
      </Card>
    </Link>
  );
}

/* -------------------------------------------------- */
/* EMPTY STATE                                         */
/* -------------------------------------------------- */

function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-800 border border-subtle">
        <BookOpen className="h-8 w-8 text-teal-400" />
      </div>
      <h3 className="font-display text-xl text-slate-100 mb-2">
        Start building your research library
      </h3>
      <p className="max-w-md text-sm text-slate-400 mb-6">
        Create AI-powered deep dives, market memos, and competitive intelligence
        reports. All your proprietary research in one place.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/research/new">
          <Button variant="secondary">
            <FileText className="h-4 w-4" />
            New Note
          </Button>
        </Link>
        <Link href="/research/new">
          <Button className="shadow-[0_0_20px_rgba(0,201,167,0.25)]">
            <Sparkles className="h-4 w-4" />
            AI Deep Dive
          </Button>
        </Link>
      </div>
    </Card>
  );
}
