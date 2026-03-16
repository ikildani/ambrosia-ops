'use client';

import { use } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ChevronRight,
  Sparkles,
  Edit3,
  Pin,
  Trash2,
  Building2,
  Tag,
  FileText,
  Database,
} from 'lucide-react';

/* -------------------------------------------------- */
/* MOCK NOTE CONTENT                                   */
/* -------------------------------------------------- */

const MOCK_NOTE = {
  id: '2',
  title: 'NeuroGen Therapeutics — Company Deep Dive',
  note_type: 'company_deep_dive' as const,
  ai_generated: false,
  is_pinned: false,
  therapy_area: 'neurology',
  tags: ['LRRK2', "Parkinson's", 'Phase 2'],
  author_name: 'James Rivera',
  created_at: '2026-03-10T14:15:00Z',
  linked_org: { id: 'org-1', name: 'NeuroGen Therapeutics', type: 'biotech' as const, stage: 'Series B' },
  linked_deal: null as { id: string; title: string } | null,
};

const NOTE_TYPE_META: Record<string, { label: string; badgeVariant: 'teal' | 'blue' | 'amber' | 'green' | 'slate' }> = {
  company_deep_dive: { label: 'Company Deep Dive', badgeVariant: 'teal' },
  market_memo:       { label: 'Market Memo',       badgeVariant: 'blue' },
  competitive_intel: { label: 'Competitive Intel',  badgeVariant: 'amber' },
  deal_thesis:       { label: 'Deal Thesis',        badgeVariant: 'green' },
  meeting_summary:   { label: 'Meeting Summary',    badgeVariant: 'slate' },
  sector_overview:   { label: 'Sector Overview',     badgeVariant: 'blue' },
};

const RELATED_NOTES = [
  { id: '1', title: 'ADC Landscape 2026 — Competitive Analysis', note_type: 'competitive_intel' as const, therapy_area: 'oncology' },
  { id: '3', title: 'KRAS G12C Market Sizing Implications', note_type: 'market_memo' as const, therapy_area: 'oncology' },
  { id: '5', title: 'Neuro-Immune Crosstalk — Sector Overview', note_type: 'sector_overview' as const, therapy_area: 'neurology' },
];

/* -------------------------------------------------- */
/* PAGE                                                */
/* -------------------------------------------------- */

export default function ResearchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const note = MOCK_NOTE;
  const meta = NOTE_TYPE_META[note.note_type] ?? { label: note.note_type, badgeVariant: 'slate' as const };

  // Suppress unused-var lint for dynamic route param
  void id;

  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/research" className="hover:text-teal-400 transition-colors">
          Research
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-300 truncate max-w-xs">{note.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
            {note.ai_generated && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-400 border border-teal-500/20">
                <Sparkles className="h-3 w-3" />
                AI Generated
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl text-slate-100 mb-2">{note.title}</h1>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="font-medium">{note.author_name}</span>
            <span className="text-slate-600">·</span>
            <span>{formatDate(note.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm">
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="ghost" size="sm">
            <Pin className="h-4 w-4" />
            {note.is_pinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main layout: content + sidebar */}
      <div className="flex gap-8">
        {/* Content area */}
        <article className="min-w-0 flex-1 max-w-3xl">
          <Card className="p-8">
            <div className="research-content space-y-6">
              {/* Executive Summary */}
              <section>
                <h2 className="font-display text-xl text-slate-100 mb-3 pb-2 border-b border-subtle">
                  Executive Summary
                </h2>
                <p className="text-[15px] leading-relaxed text-slate-300">
                  NeuroGen Therapeutics is a clinical-stage biotechnology company developing novel small molecule
                  therapies for neurodegenerative diseases. Founded in 2019, the company has raised $185M to date
                  and is advancing a pipeline of three programs targeting validated neurological pathways. Their lead
                  asset, NGT-4127, is a first-in-class LRRK2 kinase inhibitor in Phase 2 for Parkinson&apos;s disease,
                  with interim data showing a clinically meaningful 40% reduction in pS935 biomarker levels and
                  favorable safety profile.
                </p>
              </section>

              {/* Market Opportunity */}
              <section>
                <h2 className="font-display text-xl text-slate-100 mb-3 pb-2 border-b border-subtle">
                  Market Opportunity
                </h2>
                <p className="text-[15px] leading-relaxed text-slate-300 mb-4">
                  The Parkinson&apos;s disease therapeutics market represents one of the largest unmet medical needs in
                  neurology, with current disease-modifying treatment options limited to symptomatic relief.
                </p>
                <div className="rounded-lg bg-navy-900 border border-subtle p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="label mb-1">Total Addressable Market</p>
                      <p className="font-mono text-lg text-teal-400">$8.7B</p>
                    </div>
                    <div>
                      <p className="label mb-1">LRRK2 Segment (2030E)</p>
                      <p className="font-mono text-lg text-teal-400">$2.1B</p>
                    </div>
                    <div>
                      <p className="label mb-1">CAGR (2025-2032)</p>
                      <p className="font-mono text-lg text-teal-400">14.2%</p>
                    </div>
                  </div>
                </div>
                <p className="text-[15px] leading-relaxed text-slate-300">
                  The LRRK2 mutation is found in approximately 2-3% of sporadic PD cases and up to 40% of familial
                  PD in certain populations. Disease-modifying therapies targeting LRRK2 could command significant
                  premium pricing given the lack of alternatives and clear biomarker-driven patient selection.
                </p>
              </section>

              {/* Competitive Position */}
              <section>
                <h2 className="font-display text-xl text-slate-100 mb-3 pb-2 border-b border-subtle">
                  Competitive Position
                </h2>
                <p className="text-[15px] leading-relaxed text-slate-300 mb-4">
                  The LRRK2 inhibitor landscape is becoming increasingly competitive, with several well-funded
                  programs advancing through clinical development.
                </p>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Asset</th>
                        <th>Phase</th>
                        <th>Differentiation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-slate-200 font-medium">NeuroGen</td>
                        <td className="font-mono text-sm">NGT-4127</td>
                        <td><Badge variant="teal">Phase 2</Badge></td>
                        <td className="text-slate-400">Brain-penetrant, selective</td>
                      </tr>
                      <tr>
                        <td className="text-slate-200 font-medium">Denali Therapeutics</td>
                        <td className="font-mono text-sm">LRRK2-1</td>
                        <td><Badge variant="blue">Phase 2</Badge></td>
                        <td className="text-slate-400">First-mover advantage</td>
                      </tr>
                      <tr>
                        <td className="text-slate-200 font-medium">Biogen</td>
                        <td className="font-mono text-sm">BIIB122</td>
                        <td><Badge variant="blue">Phase 2</Badge></td>
                        <td className="text-slate-400">Commercial infrastructure</td>
                      </tr>
                      <tr>
                        <td className="text-slate-200 font-medium">Novartis (via Inception)</td>
                        <td className="font-mono text-sm">NVS-LRRK2</td>
                        <td><Badge variant="slate">Phase 1</Badge></td>
                        <td className="text-slate-400">Next-gen selectivity</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Pipeline Analysis */}
              <section>
                <h2 className="font-display text-xl text-slate-100 mb-3 pb-2 border-b border-subtle">
                  Pipeline Analysis
                </h2>
                <p className="text-[15px] leading-relaxed text-slate-300 mb-3">
                  Beyond their lead LRRK2 program, NeuroGen has built a complementary pipeline addressing
                  high-value neurological targets:
                </p>
                <ul className="space-y-2 text-[15px] text-slate-300 list-none">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400" />
                    <span>
                      <strong className="text-slate-200">NGT-4127</strong> (LRRK2 inhibitor) — Phase 2 in
                      Parkinson&apos;s disease. Primary endpoint readout expected Q3 2026.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                    <span>
                      <strong className="text-slate-200">NGT-5891</strong> (GBA activator) — Phase 1 in GBA-PD.
                      Addresses ~10% of PD patients with GBA mutations.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    <span>
                      <strong className="text-slate-200">NGT-7200</strong> (alpha-synuclein degrader) — Preclinical.
                      Novel PROTAC approach with potential for broader PD population.
                    </span>
                  </li>
                </ul>
              </section>

              {/* Key Risks */}
              <section>
                <h2 className="font-display text-xl text-slate-100 mb-3 pb-2 border-b border-subtle">
                  Key Risks
                </h2>
                <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-4">
                  <ul className="space-y-2 text-[15px] text-slate-300 list-none">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                      <span><strong className="text-red-300">Clinical risk:</strong> Phase 2 may not replicate biomarker improvements in broader population</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                      <span><strong className="text-red-300">Competition:</strong> Denali and Biogen have larger trials and more clinical data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                      <span><strong className="text-red-300">Funding:</strong> Current cash runway extends to Q1 2027; may need to raise before Phase 3</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                      <span><strong className="text-red-300">Regulatory:</strong> FDA endpoint alignment for disease-modification claims remains uncertain</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Investment Thesis */}
              <section>
                <h2 className="font-display text-xl text-slate-100 mb-3 pb-2 border-b border-subtle">
                  Investment Thesis
                </h2>
                <div className="rounded-lg bg-teal-500/5 border border-teal-500/10 p-4 mb-4">
                  <blockquote className="border-l-2 border-teal-500 pl-4 italic text-[15px] text-slate-300">
                    &ldquo;NeuroGen represents a compelling risk/reward profile as one of the few
                    clinical-stage pure-play LRRK2 companies. At current valuation (~$420M), the
                    stock prices in minimal pipeline optionality beyond the lead program.&rdquo;
                  </blockquote>
                </div>
                <p className="text-[15px] leading-relaxed text-slate-300 mb-3">
                  We believe NeuroGen is an attractive M&A target for mid-to-large pharma companies seeking
                  neuroscience pipeline expansion. Key value drivers include:
                </p>
                <ul className="space-y-2 text-[15px] text-slate-300 list-none">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400" />
                    <span>Differentiated clinical data with clear biomarker readout in H2 2026</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400" />
                    <span>Platform approach across multiple neurodegeneration targets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400" />
                    <span>Manageable premium (30-50% to current) with significant upside to Phase 3 data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-400" />
                    <span>Strategic fit for acquirers lacking Parkinson&apos;s disease presence</span>
                  </li>
                </ul>
              </section>
            </div>
          </Card>
        </article>

        {/* Right sidebar */}
        <aside className="hidden xl:block w-[280px] flex-shrink-0">
          <div className="sticky top-[calc(var(--topbar-height)+28px)] space-y-5">
            {/* Linked Organization */}
            {note.linked_org && (
              <Card className="p-4">
                <h4 className="label mb-3">Linked Organization</h4>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 border border-subtle">
                    <Building2 className="h-4 w-4 text-teal-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {note.linked_org.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {note.linked_org.type} · {note.linked_org.stage}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Terrain Data Card */}
            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-teal-400" />
                <h4 className="label !mb-0">Market Intelligence</h4>
              </div>
              <div className="space-y-2.5 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">TAM</span>
                  <span className="font-mono text-sm text-slate-400">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Competitors</span>
                  <span className="font-mono text-sm text-slate-400">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">LoA</span>
                  <span className="font-mono text-sm text-slate-400">--</span>
                </div>
              </div>
              <div className="mb-3 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-navy-800 px-2 py-0.5 text-[10px] text-slate-500 border border-subtle">
                  Powered by Terrain
                </span>
              </div>
              <Button variant="ghost" size="sm" disabled className="w-full">
                Fetch Data
              </Button>
            </Card>

            {/* Tags */}
            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-slate-500" />
                <h4 className="label !mb-0">Tags</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-navy-800 px-2 py-0.5 text-[11px] text-slate-400 border border-subtle"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>

            {/* Related Notes */}
            <Card className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <h4 className="label !mb-0">Related Notes</h4>
              </div>
              <div className="space-y-2.5">
                {RELATED_NOTES.map((rn) => {
                  const rnMeta = NOTE_TYPE_META[rn.note_type] ?? { label: rn.note_type, badgeVariant: 'slate' as const };
                  return (
                    <Link
                      key={rn.id}
                      href={`/research/${rn.id}`}
                      className="block rounded-md p-2 -mx-1 hover:bg-navy-800 transition-colors"
                    >
                      <p className="text-sm text-slate-300 mb-1 line-clamp-2">{rn.title}</p>
                      <Badge variant={rnMeta.badgeVariant}>{rnMeta.label}</Badge>
                    </Link>
                  );
                })}
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* HELPERS                                             */
/* -------------------------------------------------- */

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}
