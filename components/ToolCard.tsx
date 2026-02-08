import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  colorClass: string;
  popular?: boolean;
  className?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon, onClick, colorClass, popular, className = '' }) => {
  // Extract color base for light background usage
  const baseColor = colorClass.split(' ')[0].replace('bg-', '').replace('-600', '');

  return (
    <div 
      onClick={onClick}
      className={`group relative flex flex-col items-start p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full ${className}`}
    >
      {popular && (
        <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
          Popular
        </span>
      )}
      
      <div className={`mb-4 p-3 rounded-xl ${colorClass.includes('text-white') ? colorClass : `${colorClass.split(' ')[0]} bg-opacity-10 text-${baseColor}-600`} transition-transform group-hover:scale-110`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>
      
      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
        {description}
      </p>

      <div className="flex items-center text-xs font-bold text-indigo-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        Start Tool <ArrowRight size={14} className="ml-1" />
      </div>
    </div>
  );
};