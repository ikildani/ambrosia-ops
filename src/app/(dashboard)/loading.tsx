import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="animate-fade-in">
      {/* Header skeleton */}
      <div className="mb-7">
        <Skeleton width={220} height={28} className="mb-2" />
        <Skeleton width={300} height={16} />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton width={80} height={12} className="mb-3" />
                <Skeleton width={48} height={28} />
              </div>
              <Skeleton width={40} height={40} className="rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Main content area skeleton */}
      <Skeleton height={400} className="w-full rounded-lg" />
    </div>
  );
}
