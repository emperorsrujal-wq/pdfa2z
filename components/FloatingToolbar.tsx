import * as React from 'react';
import { 
  Type, 
  Link as LinkIcon, 
  CheckSquare, 
  Image as ImageIcon, 
  FileSignature, 
  Eraser, 
  Highlighter, 
  Shapes,
  Undo2,
  ChevronDown
} from 'lucide-react';
import { Tooltip } from './Tooltip';

interface FloatingToolbarProps {
  mode: string;
  setMode: (mode: any) => void;
  onImageUpload: () => void;
  undo?: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ 
  mode, 
  setMode,
  onImageUpload,
  undo
}) => {
  return (
    <div className="flex flex-col items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-0.5 bg-[#f0f7ff] border border-[#d1e6ff] p-0.5 rounded-md shadow-sm">
        
        {/* Text Group */}
        <div className="flex items-center border-r border-[#d1e6ff] pr-1 mr-1">
          <button 
            onClick={() => setMode('magic-edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${mode === 'magic-edit' ? 'bg-[#3b82f6] text-white shadow-inner' : 'text-[#4b5563] hover:bg-[#e0efff]'}`}
          >
            <Type size={16} />
            <span>Text</span>
            <ChevronDown size={12} className="opacity-50" />
          </button>
        </div>

        {/* Links */}
        <button 
          onClick={() => setMode('link')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors border-r border-[#d1e6ff] ${mode === 'link' ? 'bg-[#3b82f6] text-white' : 'text-[#4b5563] hover:bg-[#e0efff]'}`}
        >
          <LinkIcon size={16} />
          <span>Links</span>
        </button>

        {/* Forms */}
        <div className="flex items-center border-r border-[#d1e6ff]">
          <button 
            onClick={() => setMode('forms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${mode === 'forms' ? 'bg-[#3b82f6] text-white' : 'text-[#4b5563] hover:bg-[#e0efff]'}`}
          >
            <CheckSquare size={16} />
            <span>Forms</span>
            <ChevronDown size={12} className="opacity-50" />
          </button>
        </div>

        {/* Images */}
        <div className="flex items-center border-r border-[#d1e6ff]">
          <button 
            onClick={onImageUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium text-[#4b5563] hover:bg-[#e0efff] transition-colors"
          >
            <ImageIcon size={16} />
            <span>Images</span>
            <ChevronDown size={12} className="opacity-50" />
          </button>
        </div>

        {/* Sign */}
        <div className="flex items-center border-r border-[#d1e6ff]">
          <button 
            onClick={() => setMode('sign')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${mode === 'sign' ? 'bg-[#3b82f6] text-white' : 'text-[#4b5563] hover:bg-[#e0efff]'}`}
          >
            <FileSignature size={16} />
            <span>Sign</span>
            <ChevronDown size={12} className="opacity-50" />
          </button>
        </div>

        {/* Whiteout */}
        <button 
          onClick={() => setMode('erase')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors border-r border-[#d1e6ff] ${mode === 'erase' ? 'bg-[#3b82f6] text-white' : 'text-[#4b5563] hover:bg-[#e0efff]'}`}
        >
          <Eraser size={16} />
          <span>Whiteout</span>
        </button>

        {/* Annotate */}
        <div className="flex items-center border-r border-[#d1e6ff]">
          <button 
            onClick={() => setMode('highlight')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${mode === 'highlight' ? 'bg-[#3b82f6] text-white' : 'text-[#4b5563] hover:bg-[#e0efff]'}`}
          >
            <Highlighter size={16} />
            <span>Annotate</span>
            <ChevronDown size={12} className="opacity-50" />
          </button>
        </div>

        {/* Shapes */}
        <div className="flex items-center border-r border-[#d1e6ff]">
          <button 
            onClick={() => setMode('rect')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${mode === 'rect' ? 'bg-[#3b82f6] text-white' : 'text-[#4b5563] hover:bg-[#e0efff]'}`}
          >
            <Shapes size={16} />
            <span>Shapes</span>
            <ChevronDown size={12} className="opacity-50" />
          </button>
        </div>

        {/* Undo */}
        <button 
          onClick={undo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[13px] font-medium text-[#4b5563] hover:bg-[#e0efff] transition-colors"
        >
          <Undo2 size={16} />
          <span>Undo</span>
        </button>

      </div>
    </div>
  );
};
