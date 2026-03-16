'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import {
  DEAL_TYPES,
  DEAL_STAGES,
  PRIORITIES,
  CONFIDENTIALITY_LEVELS,
} from '@/lib/data/constants';
import { THERAPY_AREAS } from '@/lib/data/therapy-areas';

const MODALITIES = [
  { value: 'small_molecule', label: 'Small Molecule' },
  { value: 'biologic', label: 'Biologic' },
  { value: 'antibody', label: 'Antibody' },
  { value: 'cell_therapy', label: 'Cell Therapy' },
  { value: 'gene_therapy', label: 'Gene Therapy' },
  { value: 'rna', label: 'RNA' },
  { value: 'adc', label: 'ADC' },
  { value: 'peptide', label: 'Peptide' },
  { value: 'vaccine', label: 'Vaccine' },
  { value: 'other', label: 'Other' },
];

const dealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  deal_type: z.string().min(1, 'Deal type is required'),
  stage: z.string().optional(),
  priority: z.string().optional(),
  company_id: z.string().optional(),
  therapy_area: z.string().optional(),
  indication: z.string().optional(),
  modality: z.string().optional(),
  estimated_value: z
    .union([z.coerce.number().positive(), z.nan()])
    .optional(),
  confidentiality_level: z.string().optional(),
  notes: z.string().optional(),
});

type DealFormData = z.infer<typeof dealSchema>;

interface OrgOption {
  id: string;
  name: string;
}

export default function NewDealPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DealFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(dealSchema) as any,
    defaultValues: {
      title: '',
      deal_type: '',
      stage: 'sourcing',
      priority: '',
      company_id: '',
      therapy_area: '',
      indication: '',
      modality: '',
      confidentiality_level: '',
      notes: '',
    },
  });

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const res = await fetch('/api/organizations?limit=100');
        const result = await res.json();
        if (result.data) {
          setOrganizations(
            result.data.map((org: { id: string; name: string }) => ({
              id: org.id,
              name: org.name,
            })),
          );
        }
      } catch {
        console.error('Failed to fetch organizations');
      }
    }

    fetchOrgs();
  }, []);

  async function onSubmit(data: DealFormData) {
    setSubmitting(true);
    setServerError(null);

    // Clean up empty strings and NaN
    const payload: Record<string, unknown> = { ...data };
    for (const [key, value] of Object.entries(payload)) {
      if (value === '' || (typeof value === 'number' && isNaN(value))) {
        delete payload[key];
      }
    }

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || 'Failed to create deal');
        setSubmitting(false);
        return;
      }

      router.push('/deals');
    } catch {
      setServerError('An unexpected error occurred');
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Deal" />

      <Card className="bg-navy-800 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Deal Title"
              placeholder="Enter deal title"
              error={errors.title?.message}
              {...register('title')}
            />

            <Select
              label="Deal Type"
              placeholder="Select deal type"
              options={DEAL_TYPES.map((t) => ({
                value: t.id,
                label: t.label,
              }))}
              error={errors.deal_type?.message}
              {...register('deal_type')}
            />

            <Select
              label="Stage"
              placeholder="Select stage"
              options={DEAL_STAGES.map((s) => ({
                value: s.id,
                label: s.label,
              }))}
              {...register('stage')}
            />

            <Select
              label="Priority"
              placeholder="Select priority"
              options={PRIORITIES.map((p) => ({
                value: p.id,
                label: p.label,
              }))}
              {...register('priority')}
            />

            <Select
              label="Company"
              placeholder="Select company"
              options={organizations.map((org) => ({
                value: org.id,
                label: org.name,
              }))}
              {...register('company_id')}
            />

            <Select
              label="Therapy Area"
              placeholder="Select therapy area"
              options={THERAPY_AREAS.map((ta) => ({
                value: ta.id,
                label: ta.label,
              }))}
              {...register('therapy_area')}
            />

            <Input
              label="Indication"
              placeholder="e.g., Non-Small Cell Lung Cancer"
              {...register('indication')}
            />

            <Select
              label="Modality"
              placeholder="Select modality"
              options={MODALITIES}
              {...register('modality')}
            />

            <Input
              label="Estimated Value ($)"
              type="number"
              placeholder="e.g., 50000000"
              error={errors.estimated_value?.message}
              {...register('estimated_value', { valueAsNumber: true })}
            />

            <Select
              label="Confidentiality Level"
              placeholder="Select level"
              options={CONFIDENTIALITY_LEVELS.map((c) => ({
                value: c.id,
                label: c.label,
              }))}
              {...register('confidentiality_level')}
            />
          </div>

          <div>
            <label className="input-label mb-2 block">Notes</label>
            <textarea
              className="input min-h-[100px] w-full"
              placeholder="Deal notes and context"
              {...register('notes')}
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Deal'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/deals')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
