'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  FileText,
  Sparkles,
  Search,
  Pin,
  BookOpen,
  Building2,
  Clock,
} from 'lucide-react';
import { useResearchNotes } from '@/lib/hooks/use-data';
import { formatRelativeDate } from '@/lib/utils/format';
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
/* HELPERS                                             */
/* -------------------------------------------------- */

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
  const [page, setPage] = useState(1);

  const { data: response, isLoading, error } = useResearchNotes({
    note_type: activeTab !== 'all' ? activeTab : undefined,
    search: searchQuery || undefined,
    page,
    limit: 30,
  });

  const notes = response?.data ?? [];
  const pagination = response?.pagination;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const showEmpty = !isLoading && !error && notes.length === 0 && !searchQuery && activeTab === 'all';

  return (
    <>
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
            <Link href="/intelligence">
              <Button className="shadow-[0_0_20px_rgba(0,201,167,0.25)]">
                <Sparkles className="h-4 w-4" />
                AI Deep Dive
              </Button>
            </Link>
          </>
        }
      />

      <div className="mb-8">
        <Tabs tabs={noteTabs} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      <div className="relative mb-10">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Search research notes..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-5 w-28 mb-4" />
              <Skeleton className="h-5 w-48 mb-3" />
              <Skeleton className="h-16 w-full mb-4" />
              <Skeleton className="h-4 w-24" />
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-signal-red mb-2">Failed to load research notes</p>
          <p className="text-xs text-slate-500">{error.message}</p>
        </Card>
      )}

      {/* Empty State */}
      {showEmpty && <EmptyState />}

      {/* No results for search */}
      {!isLoading && !error && !showEmpty && notes.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="mb-4 h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-400 leading-relaxed">
            No notes match your search. Try different keywords or filters.
          </p>
        </Card>
      )}

      {/* Notes Grid */}
      {!isLoading && !error && notes.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-7 lg:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
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

/* -------------------------------------------------- */
/* NOTE CARD                                           */
/* -------------------------------------------------- */

function NoteCard({ note }: { note: ResearchNote }) {
  const meta = NOTE_TYPE_META[note.note_type];

  return (
    <Link href={`/research/${note.id}`} className="block">
      <Card className="group relative cursor-pointer transition-all duration-200 hover:border-teal-500/20 hover:shadow-[var(--shadow-card-hover)]">
        <div className="mb-5 flex items-center justify-between">
          <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
          {note.is_pinned && (
            <Pin className="h-3.5 w-3.5 text-teal-400" />
          )}
        </div>

        <h3 className="mb-4 text-base font-medium text-slate-100 group-hover:text-teal-300 transition-colors leading-snug">
          {note.title}
        </h3>

        <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-slate-400">
          {note.content}
        </p>

        <div className="mb-5 flex flex-wrap items-center gap-2.5">
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

        {note.tags.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
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

        <div className="flex items-center gap-2 border-t border-subtle pt-4 text-xs text-slate-500">
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
    <Card className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-800 border border-subtle">
        <BookOpen className="h-8 w-8 text-teal-400" />
      </div>
      <h3 className="font-display text-xl text-slate-100 mb-3">
        Start building your research library
      </h3>
      <p className="max-w-md text-sm text-slate-400 mb-8 leading-relaxed">
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
        <Link href="/intelligence">
          <Button className="shadow-[0_0_20px_rgba(0,201,167,0.25)]">
            <Sparkles className="h-4 w-4" />
            AI Deep Dive
          </Button>
        </Link>
      </div>
    </Card>
  );
}
