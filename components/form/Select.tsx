import * as React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size'> {
  options: SelectOption[];
  variant?: 'default' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  icon?: React.ReactNode;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'md',
      error = false,
      options = [],
      icon,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-4 py-3 text-base',
    };

    const baseStyles =
      'w-full rounded-lg border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none cursor-pointer dark:bg-slate-900';

    const variantStyles = {
      default: error
        ? 'border-red-300 dark:border-red-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-900/30 hover:border-slate-300 dark:hover:border-slate-600',
      minimal: 'border-b-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:border-b-blue-500 dark:focus:border-b-blue-400 rounded-none px-0',
    };

    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-950' : '';

    return (
      <div className="relative w-full">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none">{icon}</div>}

        <select
          ref={ref}
          disabled={disabled}
          className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
            icon ? 'pl-10' : ''
          } pr-10 ${disabledStyles} ${className}`}
          {...props}
        >
          {props.placeholder && (
            <option value="" disabled selected>
              {props.placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400 pointer-events-none" />
      </div>
    );
  }
);

Select.displayName = 'Select';
