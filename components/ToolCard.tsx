import * as React from 'react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass?: string;
  onClick?: () => void;
  to?: string;
  popular?: boolean;
}

/** Strip HTML tags like <em> from strings for safe plain-text rendering */
const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');

export const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  icon,
  colorClass = 'bg-blue-600 text-white',
  onClick,
  popular = false,
}) => {
  return (
    <div
      onClick={onClick}
      className="group p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Icon */}
      <div className="relative">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${colorClass}`}
        >
          {icon}
        </div>
        {popular && (
          <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
            POPULAR
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-0.5 flex-1">
        <h3 className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">
          {stripHtml(title)}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Arrow indicator */}
      <div className="flex justify-end">
        <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all text-[10px]">
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
