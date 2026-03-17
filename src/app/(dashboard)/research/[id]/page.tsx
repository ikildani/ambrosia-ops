'use client';

import { use } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

/* -------------------------------------------------- */
/* PAGE                                                */
/* -------------------------------------------------- */

export default function ResearchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  void id;

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <BookOpen className="w-12 h-12 mb-4" style={{ color: '#334155' }} />
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '24px', fontWeight: 600, color: '#e2e8f0' }}>
        Research note not found
      </h2>
      <p className="mt-2 text-[14px] max-w-md" style={{ color: '#64748b' }}>
        Research notes will display here once the research module is connected.
        You can create and manage notes from the Research hub.
      </p>
      <Link href="/research" className="mt-6 text-[13px] font-medium" style={{ color: '#5fd4e3' }}>
        &larr; Back to Research
      </Link>
    </div>
  );
}
