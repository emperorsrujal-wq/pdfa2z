import * as React from 'react';
import { 
  Type, 
  Link as LinkIcon, 
  CheckSquare, 
  Image as ImageIcon, 
  FileSignature, 
  Eraser, 
  Highlighter, 
  Strikethrough, 
  Underline as UnderlineIcon, 
  Square, 
  Circle as CircleIcon,
  ChevronDown,
  Zap
} from 'lucide-react';
import { Tooltip } from './Tooltip';

interface FloatingToolbarProps {
  mode: string;
  setMode: (mode: any) => void;
  onImageUpload: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ 
  mode, 
  setMode,
  onImageUpload
}) => {
  return (
    <div className="sticky top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl border border-slate-200/50 animate-in slide-in-from-top-4 duration-500">
      <div className="flex bg-slate-100/50 rounded-xl p-1 gap-0.5">
        <Tooltip content="Direct Text Edit: Click anywhere to edit or add text.">
          <button 
            onClick={() => setMode('magic-edit')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${mode === 'magic-edit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}
          >
            <Zap size={14} className={mode === 'magic-edit' ? 'fill-indigo-600' : ''} /> Text
          </button>
        </Tooltip>

        <Tooltip content="Add external links or internal anchors.">
          <button 
            onClick={() => setMode('link')} 
            className={`p-2 rounded-lg transition-all ${mode === 'link' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-white/50'}`}
          >
            <LinkIcon size={16} />
          </button>
        </Tooltip>

        <Tooltip content="Insert form elements: Checkboxes, Radio buttons, etc.">
          <button 
            onClick={() => setMode('forms')} 
            className={`p-2 rounded-lg transition-all ${mode === 'forms' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-white/50'}`}
          >
            <CheckSquare size={16} />
          </button>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      <div className="flex bg-slate-100/50 rounded-xl p-1 gap-0.5">
        <Tooltip content="Upload and insert images.">
          <button 
            onClick={onImageUpload} 
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-all"
          >
            <ImageIcon size={16} />
          </button>
        </Tooltip>

        <Tooltip content="Sign the document or add initials.">
          <button 
            onClick={() => setMode('sign')} 
            className={`p-2 rounded-lg transition-all ${mode === 'sign' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-white/50'}`}
          >
            <FileSignature size={16} />
          </button>
        </Tooltip>

        <Tooltip content="Whiteout: Erase parts of the page with a clean mask.">
          <button 
            onClick={() => setMode('erase')} 
            className={`p-2 rounded-lg transition-all ${mode === 'erase' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-white/50'}`}
          >
            <Eraser size={16} />
          </button>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      <div className="flex bg-slate-100/50 rounded-xl p-1 gap-0.5">
        <Tooltip content="Highlight text with semi-transparent colors.">
          <button 
            onClick={() => setMode('highlight')} 
            className={`p-2 rounded-lg transition-all ${mode === 'highlight' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-900 hover:bg-white/50'}`}
          >
            <Highlighter size={16} />
          </button>
        </Tooltip>

        <Tooltip content="Strikeout or Underline content.">
          <div className="relative group/sub">
             <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-all flex items-center">
                <Strikethrough size={16} />
                <ChevronDown size={10} className="ml-1 opacity-50" />
             </button>
             <div className="absolute top-full left-0 mt-1 hidden group-hover/sub:flex flex-col bg-white border border-slate-200 rounded-xl shadow-xl p-1 min-w-[120px] z-[110]">
                <button onClick={() => setMode('strikeout')} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg">
                   <Strikethrough size={14} /> Strikeout
                </button>
                <button onClick={() => setMode('underline')} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg">
                   <UnderlineIcon size={14} /> Underline
                </button>
             </div>
          </div>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      <div className="flex bg-slate-100/50 rounded-xl p-1 gap-0.5">
        <Tooltip content="Add geometric shapes (Rect/Circle).">
          <div className="relative group/sub">
             <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white/50 rounded-lg transition-all flex items-center">
                <Square size={16} />
                <ChevronDown size={10} className="ml-1 opacity-50" />
             </button>
             <div className="absolute top-full right-0 mt-1 hidden group-hover/sub:flex flex-col bg-white border border-slate-200 rounded-xl shadow-xl p-1 min-w-[120px] z-[110]">
                <button onClick={() => setMode('rect')} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg">
                   <Square size={14} /> Rectangle
                </button>
                <button onClick={() => setMode('circle')} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg">
                   <CircleIcon size={14} /> Circle
                </button>
             </div>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};
