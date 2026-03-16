'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[DashboardError]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center animate-fade-in">
      <Image
        src="/icon-white.png"
        alt=""
        width={40}
        height={40}
        className="opacity-30 mb-6"
      />

      <h1 className="font-display text-2xl text-slate-100 mb-3">
        Something went wrong
      </h1>

      <p className="text-sm text-slate-400 max-w-md mb-3">
        An unexpected error occurred. The details below may help diagnose the issue.
      </p>

      <pre className="font-mono text-xs text-red-400 bg-navy-900 border border-subtle rounded-md px-4 py-3 max-w-lg overflow-x-auto mb-8">
        {error.message || 'Unknown error'}
      </pre>

      <div className="flex items-center gap-3">
        <Button onClick={() => reset()}>Try Again</Button>
        <Link href="/dashboard">
          <Button variant="ghost">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
