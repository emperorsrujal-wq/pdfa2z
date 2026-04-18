import * as React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className = '',
      label,
      error = false,
      size = 'md',
      disabled,
      checked,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const labelSizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const baseCheckboxStyles =
      'rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950 cursor-pointer';

    const checkboxStyles = error
      ? 'border-red-300 dark:border-red-700 bg-white dark:bg-slate-900 focus:ring-red-200 dark:focus:ring-red-900/30'
      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-blue-200 dark:focus:ring-blue-900/30 hover:border-slate-400 dark:hover:border-slate-500';

    const checkedStyles = checked
      ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
      : '';

    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

    const inputId = id || `checkbox-${Math.random()}`;

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={`${sizeStyles[size]} ${baseCheckboxStyles} ${checkboxStyles} ${checkedStyles} ${disabledStyles} appearance-none`}
            {...props}
          />
          {checked && (
            <Check className={`absolute inset-0 w-full h-full text-white dark:text-slate-900 pointer-events-none ${sizeStyles[size]}`} />
          )}
        </div>

        {label && (
          <label htmlFor={inputId} className={`${labelSizeStyles[size]} text-slate-700 dark:text-slate-300 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
