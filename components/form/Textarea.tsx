import * as React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'md',
      error = false,
      maxLength,
      showCharCount = false,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const charCount = typeof value === 'string' ? value.length : 0;

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-4 py-3 text-base',
    };

    const baseStyles =
      'w-full rounded-lg border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none';

    const variantStyles = {
      default: error
        ? 'border-red-300 dark:border-red-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-900/30 hover:border-slate-300 dark:hover:border-slate-600',
      minimal: 'border-b-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:border-b-blue-500 dark:focus:border-b-blue-400 rounded-none px-0',
    };

    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-950' : '';

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabledStyles} ${className}`}
          rows={props.rows || 4}
          {...props}
        />

        {maxLength && showCharCount && (
          <div className="absolute right-3 bottom-3 text-xs text-slate-500 dark:text-slate-400">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
