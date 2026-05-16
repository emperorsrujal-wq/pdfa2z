import * as React from 'react';
import {
  ZoomIn, ZoomOut, Maximize, Expand, Shrink, Grid3X3, Ruler,
  Columns2, FileText, BookOpen
} from 'lucide-react';
import type { ViewMode, ZoomPreset } from './types';

interface ViewControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showGrid: boolean;
  onShowGridChange: (v: boolean) => void;
  showRulers: boolean;
  onShowRulersChange: (v: boolean) => void;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  zoom,
  onZoomChange,
  viewMode,
  onViewModeChange,
  showGrid,
  onShowGridChange,
  showRulers,
  onShowRulersChange,
}) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const applyPreset = (preset: ZoomPreset) => {
    if (preset === 'actual') onZoomChange(1);
    else if (preset === 'fit-page') onZoomChange(0.85);
    else if (preset === 'fit-width') onZoomChange(1.25);
    else if (preset === 'fit-height') onZoomChange(0.75);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1">
      <div className="hidden sm:flex items-center gap-0.5 bg-slate-50 rounded-lg border border-slate-200 px-0.5">
        <button
          onClick={() => onZoomChange(Math.max(0.25, zoom - 0.1))}
          className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={() => setOpen(!open)}
          className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors min-w-[48px] text-center"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => onZoomChange(Math.min(4, zoom + 0.1))}
          className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
      </div>

      {open && (
        <div ref={ref} className="absolute top-10 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-xl rounded-lg z-[500] w-44 py-1">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Zoom</div>
          {[
            { label: 'Actual Size', value: 'actual' as ZoomPreset, icon: <FileText size={12} /> },
            { label: 'Fit Page', value: 'fit-page' as ZoomPreset, icon: <Maximize size={12} /> },
            { label: 'Fit Width', value: 'fit-width' as ZoomPreset, icon: <Expand size={12} /> },
            { label: 'Fit Height', value: 'fit-height' as ZoomPreset, icon: <Shrink size={12} /> },
          ].map((z) => (
            <button
              key={z.value}
              onClick={() => applyPreset(z.value)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {z.icon} {z.label}
            </button>
          ))}
        </div>
      )}

      <div className="hidden md:flex items-center gap-0.5 bg-slate-50 rounded-lg border border-slate-200 px-0.5">
        <button
          onClick={() => onViewModeChange('single')}
          className={`p-1.5 rounded transition-colors ${viewMode === 'single' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          title="Single page"
        >
          <FileText size={14} />
        </button>
        <button
          onClick={() => onViewModeChange('continuous')}
          className={`p-1.5 rounded transition-colors ${viewMode === 'continuous' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          title="Continuous scroll"
        >
          <BookOpen size={14} />
        </button>
        <button
          onClick={() => onViewModeChange('facing')}
          className={`p-1.5 rounded transition-colors ${viewMode === 'facing' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          title="Facing pages"
        >
          <Columns2 size={14} />
        </button>
      </div>

      <div className="hidden md:flex items-center gap-0.5 bg-slate-50 rounded-lg border border-slate-200 px-0.5">
        <button
          onClick={() => onShowGridChange(!showGrid)}
          className={`p-1.5 rounded transition-colors ${showGrid ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          title="Toggle grid"
        >
          <Grid3X3 size={14} />
        </button>
        <button
          onClick={() => onShowRulersChange(!showRulers)}
          className={`p-1.5 rounded transition-colors ${showRulers ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          title="Toggle rulers"
        >
          <Ruler size={14} />
        </button>
      </div>
    </div>
  );
};
