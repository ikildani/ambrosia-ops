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
import { CONTACT_TYPES, RELATIONSHIP_STRENGTHS } from '@/lib/data/constants';

const contactSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Must be a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  title: z.string().optional(),
  organization_id: z.string().optional(),
  contact_type: z.string().optional(),
  linkedin: z.string().optional(),
  relationship_strength: z.string().optional(),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface OrgOption {
  id: string;
  name: string;
}

export default function NewContactPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);
  const [orgSearch, setOrgSearch] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(contactSchema) as any,
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      title: '',
      organization_id: '',
      contact_type: '',
      linkedin: '',
      relationship_strength: '',
      notes: '',
    },
  });

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const searchParam = orgSearch ? `&search=${encodeURIComponent(orgSearch)}` : '';
        const res = await fetch(`/api/organizations?limit=50${searchParam}`);
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
  }, [orgSearch]);

  async function onSubmit(data: ContactFormData) {
    setSubmitting(true);
    setServerError(null);

    // Clean up empty strings
    const payload: Record<string, unknown> = { ...data };
    for (const [key, value] of Object.entries(payload)) {
      if (value === '') {
        delete payload[key];
      }
    }

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || 'Failed to create contact');
        setSubmitting(false);
        return;
      }

      router.push('/crm/contacts');
    } catch {
      setServerError('An unexpected error occurred');
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Add Contact" />

      <Card className="bg-navy-800 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="First Name"
              placeholder="Enter first name"
              error={errors.first_name?.message}
              {...register('first_name')}
            />

            <Input
              label="Last Name"
              placeholder="Enter last name"
              error={errors.last_name?.message}
              {...register('last_name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone"
              placeholder="+1 (555) 000-0000"
              {...register('phone')}
            />

            <Input
              label="Title"
              placeholder="e.g., VP of Business Development"
              {...register('title')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="input-label">Organization</label>
              <input
                type="text"
                className="input mb-1"
                placeholder="Search organizations..."
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
              />
              <select
                className="input appearance-none"
                {...register('organization_id')}
              >
                <option value="">Select organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <Select
              label="Contact Type"
              placeholder="Select type"
              options={CONTACT_TYPES.map((t) => ({
                value: t.id,
                label: t.label,
              }))}
              {...register('contact_type')}
            />

            <Input
              label="LinkedIn"
              placeholder="https://linkedin.com/in/..."
              {...register('linkedin')}
            />

            <Select
              label="Relationship Strength"
              placeholder="Select strength"
              options={RELATIONSHIP_STRENGTHS.map((r) => ({
                value: r.id,
                label: r.label,
              }))}
              {...register('relationship_strength')}
            />
          </div>

          <div>
            <label className="input-label mb-2 block">Notes</label>
            <textarea
              className="input min-h-[100px] w-full"
              placeholder="Additional notes about this contact"
              {...register('notes')}
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Contact'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/crm/contacts')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
