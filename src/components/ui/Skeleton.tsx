import React from 'react';

interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', rounded = 'md', style }: SkeletonProps) {
  const roundedClass = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={`animate-pulse bg-gray-200 ${roundedClass} ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
    />
  );
}

// ─── Compound Skeletons ───────────────────────────────────────────────────────

export function CropCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-20" rounded="full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-14" rounded="lg" />
        <Skeleton className="h-14" rounded="lg" />
      </div>
      <Skeleton className="h-10" rounded="md" />
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <Skeleton className="h-64 w-full" rounded="lg" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 shadow-sm">
      <Skeleton className="h-5 w-40" />
      <div className="flex items-end gap-3 h-40 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${30 + Math.random() * 70}%` } as React.CSSProperties}
            rounded="sm"
          />
        ))}
      </div>
    </div>
  );
}
