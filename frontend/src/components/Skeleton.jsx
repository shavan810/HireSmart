export const Skeleton = ({ className = '' }) => <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;

export const JobCardSkeleton = () => (
  <div className="card space-y-4 p-5" aria-hidden="true">
    <div className="flex gap-3">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  </div>
);

export const StatSkeleton = () => (
  <div className="card flex items-center gap-4 p-5" aria-hidden="true">
    <Skeleton className="h-12 w-12 rounded-xl" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-6 w-12" />
    </div>
  </div>
);

export const RowSkeleton = ({ rows = 5 }) => (
  <div className="card divide-y divide-slate-100" aria-hidden="true">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatSkeleton key={i} />
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-72 lg:col-span-2" />
      <Skeleton className="h-72" />
    </div>
  </div>
);
