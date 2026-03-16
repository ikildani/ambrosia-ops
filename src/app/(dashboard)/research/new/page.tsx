'use client';

import { useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { THERAPY_AREAS } from '@/lib/data/therapy-areas';
import {
  Sparkles,
  X,
} from 'lucide-react';
import type { ResearchNote } from '@/types/database';

/* -------------------------------------------------- */
/* SCHEMA                                              */
/* -------------------------------------------------- */

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  note_type: z.string().min(1, 'Note type is required'),
  content: z.string().min(1, 'Content is required'),
  organization_id: z.string().optional(),
  deal_id: z.string().optional(),
  therapy_area: z.string().optional(),
});

type NoteFormData = z.infer<typeof noteSchema>;

/* -------------------------------------------------- */
/* NOTE TYPES                                          */
/* -------------------------------------------------- */

const NOTE_TYPES: { id: ResearchNote['note_type']; label: string }[] = [
  { id: 'company_deep_dive', label: 'Company Deep Dive' },
  { id: 'market_memo', label: 'Market Memo' },
  { id: 'competitive_intel', label: 'Competitive Intel' },
  { id: 'deal_thesis', label: 'Deal Thesis' },
  { id: 'meeting_summary', label: 'Meeting Summary' },
  { id: 'sector_overview', label: 'Sector Overview' },
];

/* -------------------------------------------------- */
/* PAGE                                                */
/* -------------------------------------------------- */

export default function NewResearchNotePage() {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NoteFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(noteSchema) as any,
    defaultValues: {
      title: '',
      note_type: '',
      content: '',
      organization_id: '',
      deal_id: '',
      therapy_area: '',
    },
  });

  function handleTypeSelect(typeId: string) {
    setSelectedType(typeId);
    setValue('note_type', typeId);
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function onSubmit(data: NoteFormData) {
    // In production, this would POST to /api/research
    console.log('Creating note:', { ...data, tags });
    router.push('/research');
  }

  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      <PageHeader
        title="New Research Note"
        actions={
          <>
            <Button variant="secondary" onClick={() => router.push('/research')}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleSubmit(onSubmit)}>
              Save Draft
            </Button>
            <Button onClick={handleSubmit(onSubmit)}>
              Publish
            </Button>
          </>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-6">
          {/* Left — Editor */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Title */}
            <input
              type="text"
              className="w-full bg-transparent font-display text-2xl text-slate-100 placeholder:text-slate-600 outline-none border-none py-2"
              placeholder="Untitled research note..."
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-400">{errors.title.message}</p>
            )}

            {/* Note type pills */}
            <div>
              <label className="input-label mb-2 block">Note Type</label>
              <div className="flex flex-wrap gap-2">
                {NOTE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTypeSelect(type.id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      selectedType === type.id
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'bg-navy-800 text-slate-400 border border-subtle hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              {errors.note_type && (
                <p className="mt-1.5 text-sm text-red-400">{errors.note_type.message}</p>
              )}
              {/* Hidden input for react-hook-form */}
              <input type="hidden" {...register('note_type')} />
            </div>

            {/* Content textarea */}
            <div>
              <textarea
                className="input min-h-[500px] w-full bg-navy-900 text-[15px] leading-relaxed resize-y"
                placeholder="Start writing... Markdown is supported."
                {...register('content')}
              />
              {errors.content && (
                <p className="mt-1.5 text-sm text-red-400">{errors.content.message}</p>
              )}
              <p className="mt-2 text-xs text-slate-600">
                Supports Markdown formatting
              </p>
            </div>
          </div>

          {/* Right — Metadata */}
          <div className="hidden lg:block w-[320px] flex-shrink-0 space-y-5">
            {/* Link to Organization */}
            <Select
              label="Link to Organization"
              placeholder="Search organizations..."
              options={[
                { value: '', label: 'None' },
                { value: 'org-1', label: 'NeuroGen Therapeutics' },
                { value: 'org-2', label: 'Vertex Pharmaceuticals' },
                { value: 'org-3', label: 'Alnylam Pharmaceuticals' },
              ]}
              {...register('organization_id')}
            />

            {/* Link to Deal */}
            <Select
              label="Link to Deal"
              placeholder="Search deals..."
              options={[
                { value: '', label: 'None' },
                { value: 'deal-1', label: 'NeuroGen Acquisition' },
                { value: 'deal-2', label: 'Vertex Licensing' },
              ]}
              {...register('deal_id')}
            />

            {/* Therapy Area */}
            <Select
              label="Therapy Area"
              placeholder="Select therapy area"
              options={[
                { value: '', label: 'None' },
                ...THERAPY_AREAS.map((ta) => ({
                  value: ta.id,
                  label: ta.label,
                })),
              ]}
              {...register('therapy_area')}
            />

            {/* Tags */}
            <div>
              <label className="input-label mb-1.5 block">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-navy-800 px-2.5 py-1 text-xs text-slate-300 border border-subtle"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                placeholder="Type and press Enter to add"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>

            {/* AI Generate Card */}
            <Card
              className="p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(0,201,167,0.04), rgba(0,77,64,0.08))',
                border: '1px solid rgba(0,201,167,0.2)',
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15">
                  <Sparkles className="h-4 w-4 text-teal-400" />
                </div>
                <h4 className="text-sm font-medium text-slate-200">Generate with AI</h4>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-slate-400">
                Enter a company name or topic and let Claude generate a comprehensive research memo
                using data from Terrain, Benchmarker, and ClinicalTrials.gov
              </p>
              <Input
                placeholder="e.g., NeuroGen Therapeutics"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
              />
              <Button
                type="button"
                variant="primary"
                className="mt-3 w-full shadow-[0_0_16px_rgba(0,201,167,0.2)]"
                disabled
              >
                <Sparkles className="h-4 w-4" />
                Generate
              </Button>
              <p className="mt-2 text-center text-[10px] text-slate-600">
                Coming soon
              </p>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
