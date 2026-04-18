import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'md',
      error = false,
      type = 'text',
      maxLength,
      showCharCount = false,
      icon,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const charCount = typeof value === 'string' ? value.length : 0;

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-4 py-3 text-base',
    };

    const baseStyles =
      'w-full rounded-lg border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-slate-400 dark:placeholder:text-slate-500';

    const variantStyles = {
      default: error
        ? 'border-red-300 dark:border-red-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-900/30 hover:border-slate-300 dark:hover:border-slate-600',
      minimal: 'border-b-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 focus:border-b-blue-500 dark:focus:border-b-blue-400 rounded-none px-0',
    };

    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-950' : '';

    return (
      <div className="relative w-full">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">{icon}</div>}

        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
            icon ? 'pl-10' : ''
          } ${isPassword && showPassword ? 'pr-10' : ''} ${disabledStyles} ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:cursor-not-allowed"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {maxLength && showCharCount && (
          <div className="absolute right-3 bottom-1 text-xs text-slate-500 dark:text-slate-400">
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
