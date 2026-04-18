import * as React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showLabel = true,
  size = 'md',
  color = 'primary',
  animated = true,
  striped = false,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-blue-600 dark:bg-blue-500',
    success: 'bg-emerald-600 dark:bg-emerald-500',
    warning: 'bg-amber-600 dark:bg-amber-500',
    error: 'bg-red-600 dark:bg-red-500',
  };

  const animationClass = animated ? 'animate-pulse' : '';
  const stripedClass = striped ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:30px_30px] animate-[shimmer_2s_infinite]' : '';

  return (
    <div className={className}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
          {showLabel && <span className="text-sm text-slate-600 dark:text-slate-400">{Math.round(percentage)}%</span>}
        </div>
      )}

      <div className={`${sizeClasses[size]} w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden`}>
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} ${stripedClass} ${animationClass} transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  );
};

interface LinearProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
}) => {
  return (
    <ProgressBar
      value={value}
      max={max}
      size={size}
      color={color}
      showLabel={false}
      animated
      striped
    />
  );
};
