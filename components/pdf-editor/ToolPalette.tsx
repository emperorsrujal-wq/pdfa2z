import * as React from 'react';
import {
  MousePointer2,
  Type,
  Image as ImageIcon,
  PenLine,
  Highlighter,
  Eraser,
  Square,
  Link2,
  FileSignature,
  MessageSquare,
  Search,
  ChevronRight,
  Minus,
  Circle as CircleIcon,
  ArrowRight,
  CheckSquare,
  StickyNote,
  Droplets,
  X,
} from 'lucide-react';
import type { EditorMode } from './types';

interface ToolPaletteProps {
  activeMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onSignClick?: () => void;
  onFormClick?: () => void;
  onShapeClick?: () => void;
  onAnnotateClick?: () => void;
}

const mainTools: { mode: EditorMode; label: string; icon: React.ReactNode; shortcut?: string }[] = [
  { mode: 'select', label: 'Select', icon: <MousePointer2 size={20} />, shortcut: 'V' },
  { mode: 'magic-edit', label: 'Text', icon: <Type size={20} />, shortcut: 'T' },
  { mode: 'image', label: 'Image', icon: <ImageIcon size={20} />, shortcut: 'I' },
  { mode: 'draw', label: 'Draw', icon: <PenLine size={20} />, shortcut: 'D' },
  { mode: 'highlight', label: 'Highlight', icon: <Highlighter size={20} />, shortcut: 'H' },
  { mode: 'erase', label: 'Whiteout', icon: <Eraser size={20} />, shortcut: 'E' },
  { mode: 'rect', label: 'Shapes', icon: <Square size={20} />, shortcut: 'S' },
  { mode: 'link', label: 'Link', icon: <Link2 size={20} />, shortcut: 'L' },
  { mode: 'sign', label: 'Sign', icon: <FileSignature size={20} />, shortcut: 'N' },
  { mode: 'form-text', label: 'Form', icon: <CheckSquare size={20} />, shortcut: 'F' },
  { mode: 'sticky-note', label: 'Comment', icon: <MessageSquare size={20} />, shortcut: 'C' },
  { mode: 'find-replace', label: 'Find', icon: <Search size={20} />, shortcut: 'Ctrl+F' },
];

export const ToolPalette: React.FC<ToolPaletteProps> = ({
  activeMode,
  onModeChange,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div
      className={`shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-16 md:w-20'
      }`}
    >
      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex items-center justify-center h-10 border-b border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        title={collapsed ? 'Expand tools' : 'Collapse tools'}
      >
        <ChevronRight size={14} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>

      {/* Tools */}
      <div className="flex-1 overflow-y-auto py-2 flex flex-col items-center gap-1 custom-scrollbar">
        {mainTools.map((tool) => {
          const isActive = activeMode === tool.mode;
          return (
            <button
              key={tool.mode}
              onClick={() => onModeChange(tool.mode)}
              className={`relative w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={tool.label}
            >
              {tool.icon}
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute right-1 top-1 w-1.5 h-1.5 bg-white rounded-full" />
              )}
              {/* Tooltip label for collapsed state */}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-[300]">
                  {tool.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="border-t border-slate-100 py-2 flex flex-col items-center gap-1">
        <button
          onClick={() => onModeChange('watermark')}
          className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all ${
            activeMode === 'watermark'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
          }`}
          title="Watermark"
        >
          <Droplets size={18} />
        </button>
      </div>
    </div>
  );
};
