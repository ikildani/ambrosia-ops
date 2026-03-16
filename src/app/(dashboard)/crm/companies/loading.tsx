import { Skeleton } from '@/components/ui/Skeleton';

export default function CompaniesLoading() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <Skeleton width={160} height={28} className="mb-2" />
        <Skeleton width={260} height={16} />
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-start gap-3">
              <Skeleton width={36} height={36} className="rounded-md" />
              <div>
                <Skeleton width={70} height={12} className="mb-2" />
                <Skeleton width={32} height={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <Skeleton height={56} className="w-full rounded-lg mb-6" />

      {/* Card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <Skeleton width={160} height={18} className="mb-2" />
                <Skeleton width={100} height={12} />
              </div>
              <Skeleton width={56} height={22} className="rounded-full" />
            </div>
            <div className="flex gap-1.5 mb-3">
              <Skeleton width={64} height={20} className="rounded-full" />
              <Skeleton width={52} height={20} className="rounded-full" />
            </div>
            <Skeleton height={1} className="w-full my-3" />
            <div className="flex items-center justify-between">
              <Skeleton width={28} height={28} className="rounded-full" />
              <Skeleton width={48} height={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
