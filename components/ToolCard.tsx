import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  to?: string;
  colorClass: string;
  popular?: boolean;
  className?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon, onClick, to, colorClass, popular, className = '' }) => {
  // Extract color base for light background usage
  const baseColor = colorClass.split(' ')[0].replace('bg-', '').replace('-600', '');

  const CardWrapper = to ? Link : 'div';
  const wrapperProps = to ? { to, onClick } : { onClick };

  return (
    <CardWrapper
      {...(wrapperProps as any)}
      className={`group relative flex flex-col items-start p-6 premium-card cursor-pointer h-full ${className}`}
    >
      {popular && (
        <span className="absolute top-6 right-6 text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 px-2.5 py-1 rounded-full border border-blue-200/50">
          Popular
        </span>
      )}

      <div className={`mb-6 p-4 rounded-2xl ${colorClass.includes('text-white') ? colorClass : `${colorClass.split(' ')[0]} bg-opacity-10 text-${baseColor}-600`} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-blue-500/20`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
      </div>

      <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6 flex-1 font-medium">
        {description}
      </p>

      <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-40 group-hover:opacity-100 transition-all duration-300">
        Launch Tool <ArrowRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-1" />
      </div>
    </CardWrapper>
  );
};