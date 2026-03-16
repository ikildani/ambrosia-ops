'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PROJECT_TYPES } from '@/lib/data/constants';

/* ── Options ──────────────────────────────────── */

const companyOptions = [
  { value: '', label: 'Select a company...' },
  { value: 'org_001', label: 'NeuroGen Therapeutics' },
  { value: 'org_002', label: 'BioVantage Inc.' },
  { value: 'org_003', label: 'Apex Capital Partners' },
  { value: 'org_004', label: 'GenVista Therapeutics' },
];

const dealOptions = [
  { value: '', label: 'Select a deal...' },
  { value: 'deal-001', label: 'Project Atlas' },
  { value: 'deal-004', label: 'Project Falcon' },
  { value: 'deal-006', label: 'Gene Therapy Partnership' },
];

const advisorOptions = [
  { value: '', label: 'Select lead advisor...' },
  { value: 'sarah_chen', label: 'Sarah Chen' },
  { value: 'james_whitfield', label: 'James Whitfield' },
  { value: 'priya_patel', label: 'Priya Patel' },
  { value: 'david_kim', label: 'David Kim' },
];

export default function NewProjectPage() {
  const [selectedType, setSelectedType] = useState<string>('');

  return (
    <div className="animate-fade-in max-w-2xl">
      <PageHeader
        title="New Project"
        subtitle="Create a new advisory engagement"
        actions={
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Button>
          </Link>
        }
      />

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Handle form submission when Supabase is connected
          }}
          className="space-y-6"
        >
          {/* Project Name */}
          <Input
            label="Project Name"
            placeholder="e.g. Market Assessment — ADC Landscape"
            required
          />

          {/* Client Company */}
          <Select
            label="Client Company"
            options={companyOptions}
            defaultValue=""
          />

          {/* Linked Deal */}
          <Select
            label="Linked Deal"
            options={dealOptions}
            defaultValue=""
          />

          {/* Project Type — pill buttons */}
          <div className="flex flex-col gap-1.5">
            <label className="input-label">Project Type</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border ${
                    selectedType === type.id
                      ? 'bg-teal-500/15 text-teal-400 border-teal-500/30'
                      : 'bg-navy-800 text-slate-400 border-subtle hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="input-label">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Describe the project scope, objectives, and key deliverables..."
              className="input resize-none"
            />
          </div>

          {/* Lead Advisor */}
          <Select
            label="Lead Advisor"
            options={advisorOptions}
            defaultValue=""
          />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="start-date" className="input-label">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="start-date"
                  className="input pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="end-date" className="input-label">
                Target End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="end-date"
                  className="input pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-subtle">
            <Link href="/projects">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <button
              type="submit"
              className="btn btn-lg font-semibold text-navy-950"
              style={{
                background: 'linear-gradient(135deg, #00c9a7 0%, #00e4bf 100%)',
              }}
            >
              Create Project
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
