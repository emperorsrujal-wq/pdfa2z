import * as React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface FormFieldProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  successText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  errorText,
  required,
  children,
  className = '',
  successText,
}) => {
  const hasError = !!errorText;
  const hasSuccess = !!successText && !hasError;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="ml-1 text-red-600 dark:text-red-400">*</span>}
        </label>
      )}

      <div className="relative">
        {children}
      </div>

      {hasError && (
        <div className="flex items-start gap-2 mt-1.5 p-2 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-900/50">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{errorText}</p>
        </div>
      )}

      {hasSuccess && (
        <div className="flex items-start gap-2 mt-1.5 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-900/50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{successText}</p>
        </div>
      )}

      {helperText && !hasError && !hasSuccess && (
        <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{helperText}</p>
        </div>
      )}
    </div>
  );
};
