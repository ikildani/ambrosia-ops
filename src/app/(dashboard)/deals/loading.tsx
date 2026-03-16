import { Skeleton } from '@/components/ui/Skeleton';

export default function DealsLoading() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <Skeleton width={180} height={28} className="mb-2" />
        <Skeleton width={320} height={16} />
      </div>

      {/* Pipeline value strip */}
      <div className="grid grid-cols-4 gap-px bg-navy-700/50 rounded-lg overflow-hidden border border-subtle mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-navy-900 p-4 flex flex-col items-center justify-center">
            <Skeleton width={80} height={12} className="mb-2" />
            <Skeleton width={64} height={24} />
          </div>
        ))}
      </div>

      {/* View tabs */}
      <Skeleton width={200} height={36} className="rounded-md mb-6" />

      {/* Kanban columns */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, col) => (
          <div
            key={col}
            className="flex-shrink-0 rounded-lg bg-navy-900/50 border border-subtle"
            style={{ width: 280 }}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 p-3 border-b border-subtle">
              <Skeleton width={8} height={8} className="rounded-full" />
              <Skeleton width={80} height={12} />
            </div>

            {/* Deal card skeletons */}
            <div className="p-2 space-y-2">
              {Array.from({ length: col === 0 ? 2 : 1 }).map((_, card) => (
                <div
                  key={card}
                  className="rounded-md bg-navy-800 border border-subtle p-3"
                >
                  <Skeleton width="80%" height={14} className="mb-2" />
                  <Skeleton width={80} height={11} className="mb-3" />
                  <div className="flex gap-1 mb-3">
                    <Skeleton width={48} height={18} className="rounded-full" />
                    <Skeleton width={56} height={18} className="rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton width={64} height={16} />
                    <Skeleton width={24} height={24} className="rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
