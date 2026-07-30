export default function LoadingSkeleton() {
  return (
    <div className="glass-panel p-5 sm:p-8">
      <div className="flex items-center gap-4">
        <div className="skeleton-shimmer h-14 w-14 shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-shimmer h-4 w-2/3 rounded-full" />
          <div className="skeleton-shimmer h-3 w-1/3 rounded-full" />
        </div>
      </div>

      <div className="mt-6 skeleton-shimmer h-12 w-full rounded-2xl" />

      <div className="mt-4 flex items-center gap-3">
        <div className="skeleton-shimmer h-9 w-9 rounded-full" />
        <div className="skeleton-shimmer h-2 flex-1 rounded-full" />
        <div className="skeleton-shimmer h-3 w-10 rounded-full" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-9 w-24 rounded-full" />
        ))}
      </div>
    </div>
  );
}
