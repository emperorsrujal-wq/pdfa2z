import * as React from 'react';
import { ArrowRight } from 'lucide-react';

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
  colorClass = 'bg-blue-600',
  onClick,
  popular = false,
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer flex flex-col p-5 gap-4"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Popular badge */}
      {popular && (
        <span className="absolute -top-2 left-5 bg-amber-400 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
          Popular
        </span>
      )}

      {/* Icon */}
      <div className="flex items-start justify-between">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${colorClass}`}
        >
          {icon}
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all duration-300">
          <ArrowRight size={14} />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5 flex-1">
        <h3 className="font-semibold text-slate-800 text-[15px] leading-snug group-hover:text-blue-600 transition-colors">
          {stripHtml(title)}
        </h3>
        <p className="text-[13px] text-slate-400 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* CTA */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition-colors flex items-center gap-1">
          Open Tool
          <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
};
