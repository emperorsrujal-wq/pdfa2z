import * as React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
  circle?: boolean;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  count = 1,
  circle = false,
  variant = 'rectangular',
  width,
  height,
}) => {
  const variantClass = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  }[circle ? 'circular' : variant];

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width || '100%',
    height: typeof height === 'number' ? `${height}px` : height || '20px',
  };

  const skeletons = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={`${variantClass} bg-slate-200 dark:bg-slate-700 animate-pulse ${className}`}
      style={i === 0 ? style : { ...style, marginTop: '8px' }}
      role="status"
      aria-label="Loading..."
    />
  ));

  return <div className="space-y-2">{skeletons}</div>;
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        width={i === lines - 1 ? '80%' : '100%'}
        height="16px"
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`p-4 rounded-lg border border-slate-200 dark:border-slate-700 ${className}`}
  >
    <Skeleton width="60%" height="24px" className="mb-4" />
    <SkeletonText lines={3} />
  </div>
);
