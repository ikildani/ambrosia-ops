'use client';

import { use } from 'react';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';

/* ---------- page ---------- */

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // TODO: Fetch real deal data from Supabase by id
  const deal = null;
  void id;

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Briefcase className="w-12 h-12 mb-4" style={{ color: '#334155' }} />
        <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '24px', fontWeight: 600, color: '#e2e8f0' }}>
          Deal not found
        </h2>
        <p className="mt-2 text-[14px]" style={{ color: '#64748b' }}>
          This deal doesn&apos;t exist or has been removed.
        </p>
        <Link href="/deals" className="mt-6 text-[13px] font-medium" style={{ color: '#5fd4e3' }}>
          &larr; Back to Deals
        </Link>
      </div>
    );
  }
}
