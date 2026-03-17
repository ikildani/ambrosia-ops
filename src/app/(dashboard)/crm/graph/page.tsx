'use client';

import Link from 'next/link';
import { GitBranch, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';

export default function RelationshipGraphPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Relationship Graph"
        subtitle="Visualize connections across your network"
      />

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700/40 bg-navy-900">
          <GitBranch className="h-6 w-6 text-slate-500" />
        </div>

        <h2
          className="text-2xl font-semibold text-slate-100 mb-3"
          style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
        >
          Relationship Graph
        </h2>

        <p className="max-w-md text-sm leading-relaxed text-slate-500 mb-8">
          Your relationship network will visualize here once you add companies
          and contacts to your CRM.
        </p>

        <Link href="/crm/companies/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Company
          </Button>
        </Link>
      </div>
    </div>
  );
}
