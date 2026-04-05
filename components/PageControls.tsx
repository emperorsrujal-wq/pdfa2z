import * as React from 'react';
import { 
  Trash2, 
  Search, 
  RotateCcw, 
  RotateCw, 
  Plus, 
  Minus, 
  Undo2, 
  Redo2 
} from 'lucide-react';

interface PageControlsProps {
  pageNumber: number;
  onDelete: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onInsertPage: () => void;
}

export const PageControls: React.FC<PageControlsProps> = ({
  pageNumber,
  onDelete,
  onZoomIn,
  onZoomOut,
  onUndo,
  onRedo,
  onInsertPage
}) => {
  return (
    <div className="flex items-center gap-4 mb-2 animate-in fade-in slide-in-from-top-1 duration-700 delay-100">
      <div className="text-[#3b82f6] font-bold text-2xl mr-2">
        {pageNumber}
      </div>
      
      <div className="flex items-center bg-white border border-[#d1e6ff] rounded shadow-sm overflow-hidden">
        <button 
          onClick={onDelete}
          className="p-2 text-[#4b5563] hover:bg-red-50 hover:text-red-600 transition-colors border-r border-[#d1e6ff]"
          title="Delete Page"
        >
          <Trash2 size={16} />
        </button>
        
        <button 
          onClick={onZoomIn}
          className="p-2 text-[#4b5563] hover:bg-[#e0efff] transition-colors border-r border-[#d1e6ff]"
          title="Zoom In"
        >
          <Plus size={16} />
        </button>
        
        <button 
          onClick={onZoomOut}
          className="p-2 text-[#4b5563] hover:bg-[#e0efff] transition-colors border-r border-[#d1e6ff]"
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
        
        <button 
          onClick={onUndo}
          className="p-2 text-[#4b5563] hover:bg-[#e0efff] transition-colors border-r border-[#d1e6ff]"
          title="Undo"
        >
          <RotateCcw size={16} />
        </button>
        
        <button 
          onClick={onRedo}
          className="p-2 text-[#4b5563] hover:bg-[#e0efff] transition-colors"
          title="Redo"
        >
          <RotateCw size={16} />
        </button>
      </div>

      <button 
        onClick={onInsertPage}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#3b82f6] text-[#3b82f6] rounded font-medium text-[13px] hover:bg-[#f0f7ff] transition-all shadow-sm"
      >
        <Plus size={14} strokeWidth={3} />
        <span>Insert page here</span>
      </button>
    </div>
  );
};
