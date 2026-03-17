'use client';

import { use } from 'react';
import Link from 'next/link';
import { FolderKanban } from 'lucide-react';

/* ── page ───────────────────────────────────── */

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  void id;

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <FolderKanban className="w-12 h-12 mb-4" style={{ color: '#334155' }} />
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '24px', fontWeight: 600, color: '#e2e8f0' }}>
        Project not found
      </h2>
      <p className="mt-2 text-[14px] max-w-md" style={{ color: '#64748b' }}>
        This project will display once you create projects and link them to mandates.
        Project detail pages are coming soon.
      </p>
      <Link href="/projects" className="mt-6 text-[13px] font-medium" style={{ color: '#5fd4e3' }}>
        &larr; Back to Projects
      </Link>
    </div>
  );
}
