import * as React from 'react';
import {
  MousePointer2, Type, Image as ImageIcon, PenLine, Highlighter,
  Eraser, Square, Link2, FileSignature, MessageSquare, Search,
  ChevronUp, X, Droplets, Circle as CircleIcon, Minus, ArrowRight,
  CheckSquare, CheckCircle2, LayoutList
} from 'lucide-react';
import type { EditorMode } from './types';

interface MobileToolBarProps {
  activeMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

const tools: { mode: EditorMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'select', label: 'Select', icon: <MousePointer2 size={20} /> },
  { mode: 'magic-edit', label: 'Text', icon: <Type size={20} /> },
  { mode: 'image', label: 'Image', icon: <ImageIcon size={20} /> },
  { mode: 'draw', label: 'Draw', icon: <PenLine size={20} /> },
  { mode: 'highlight', label: 'Highlight', icon: <Highlighter size={20} /> },
  { mode: 'erase', label: 'Whiteout', icon: <Eraser size={20} /> },
  { mode: 'rect', label: 'Rectangle', icon: <Square size={20} /> },
  { mode: 'circle', label: 'Circle', icon: <CircleIcon size={20} /> },
  { mode: 'line', label: 'Line', icon: <Minus size={20} /> },
  { mode: 'arrow', label: 'Arrow', icon: <ArrowRight size={20} /> },
  { mode: 'link', label: 'Link', icon: <Link2 size={20} /> },
  { mode: 'sign', label: 'Sign', icon: <FileSignature size={20} /> },
  { mode: 'form-text', label: 'Text Field', icon: <CheckSquare size={20} /> },
  { mode: 'form-check', label: 'Checkbox', icon: <CheckCircle2 size={20} /> },
  { mode: 'form-select', label: 'Dropdown', icon: <LayoutList size={20} /> },
  { mode: 'sticky-note', label: 'Comment', icon: <MessageSquare size={20} /> },
  { mode: 'find-replace', label: 'Find', icon: <Search size={20} /> },
];

export const MobileToolBar: React.FC<MobileToolBarProps> = ({ activeMode, onModeChange }) => {
  const [expanded, setExpanded] = React.useState(false);

  const activeTool = tools.find(t => t.mode === activeMode) || tools[0];

  return (
    <>
      {/* Collapsed bar */}
      {!expanded && (
        <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 bg-white border border-slate-200 shadow-lg rounded-2xl px-2 py-2">
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl text-sm font-medium text-slate-700"
          >
            <span className="text-blue-600">{activeTool.icon}</span>
            {activeTool.label}
            <ChevronUp size={14} className="text-slate-400" />
          </button>
        </div>
      )}

      {/* Expanded sheet */}
      {expanded && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-[300]">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setExpanded(false)} />
          <div className="relative bg-white rounded-t-2xl shadow-xl border-t border-slate-200 p-4 animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Tools</h3>
              <button onClick={() => setExpanded(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {tools.map((tool) => (
                <button
                  key={tool.mode}
                  onClick={() => { onModeChange(tool.mode); setExpanded(false); }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                    activeMode === tool.mode
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tool.icon}
                  <span className="text-[10px] font-medium">{tool.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-center">
              <button
                onClick={() => { onModeChange('watermark'); setExpanded(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeMode === 'watermark' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Droplets size={16} /> Watermark
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
