import * as React from 'react';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioGroupProps>(
  (
    {
      className = '',
      options = [],
      value,
      onChange,
      direction = 'vertical',
      size = 'md',
      error = false,
      disabled,
      name,
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

    const containerClass = direction === 'horizontal' ? 'flex gap-6' : 'flex flex-col gap-3';

    return (
      <div className={`${containerClass} ${className}`}>
        {options.map((option) => {
          const inputId = `radio-${name}-${option.value}`;
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <div key={option.value} className="flex items-center gap-2">
              <div className="relative">
                <input
                  ref={ref}
                  type="radio"
                  id={inputId}
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={isDisabled}
                  className={`${sizeStyles[size]} rounded-full border-2 appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950 ${
                    error
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-900/30'
                      : 'border-slate-300 dark:border-slate-600 focus:ring-blue-200 dark:focus:ring-blue-900/30 hover:border-slate-400 dark:hover:border-slate-500'
                  } ${isSelected ? 'border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500' : 'bg-white dark:bg-slate-900'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  {...props}
                />
                {isSelected && (
                  <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${sizeStyles[size]}`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>

              <label
                htmlFor={inputId}
                className={`${labelSizeStyles[size]} text-slate-700 dark:text-slate-300 cursor-pointer select-none ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
