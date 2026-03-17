import Link from 'next/link';

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p style={{
        fontFamily: 'var(--font-cormorant), Georgia, serif',
        fontSize: '72px',
        fontWeight: 600,
        color: '#1e293b',
        lineHeight: 1,
      }}>
        404
      </p>
      <h2 className="mt-4" style={{
        fontFamily: 'var(--font-cormorant), Georgia, serif',
        fontSize: '24px',
        fontWeight: 600,
        color: '#e2e8f0',
      }}>
        Page not found
      </h2>
      <p className="mt-2 text-[14px]" style={{ color: '#64748b' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/dashboard" className="mt-8 text-[13px] font-medium" style={{ color: '#5fd4e3' }}>
        ← Back to Dashboard
      </Link>
    </div>
  );
}
