import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div aria-hidden="true" className={`ui-skeleton rounded-xl ${className}`} />
);

export const MiningCardSkeleton: React.FC = () => (
  <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-[#242A42] dark:bg-[#10121A]">
    <div className="mb-4 flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-3 w-32" />
    </div>
    <Skeleton className="mb-3 aspect-4/5 w-full" />
    <Skeleton className="mb-2 h-4 w-4/5" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="mt-2 h-3 w-3/5" />
  </div>
);
