import * as React from 'react';
import {
  MousePointer2, Type, Image as ImageIcon, PenLine,
  Eraser, Square, Link2, FileSignature, MessageSquare, Search,
  ChevronRight, Minus, Circle as CircleIcon, ArrowRight,
  CheckSquare, Droplets, LayoutList, ChevronDown,
  Stamp as StampIcon, Ruler
} from 'lucide-react';
import type { EditorMode } from './types';
import {
  HighlightIcon, WhiteoutIcon, SmartWhiteoutIcon,
  ShapeRectIcon, ShapeCircleIcon, ShapeEllipseIcon,
  ShapeLineIcon, ShapeArrowIcon, StampIcon as CustomStampIcon,
  MeasureIcon
} from '../ToolIcons';

interface ToolPaletteProps {
  activeMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

interface ToolDef {
  mode: EditorMode;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
}

interface ToolCategory {
  id: string;
  label: string;
  color: string;
  tools: ToolDef[];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; activeBorder: string }> = {
  content:   { bg: 'bg-blue-50',  text: 'text-blue-600',  activeBorder: 'border-blue-500' },
  annotate:  { bg: 'bg-amber-50', text: 'text-amber-600', activeBorder: 'border-amber-500' },
  whiteout:  { bg: 'bg-slate-50', text: 'text-slate-600', activeBorder: 'border-slate-500' },
  shapes:    { bg: 'bg-emerald-50', text: 'text-emerald-600', activeBorder: 'border-emerald-500' },
  forms:     { bg: 'bg-indigo-50', text: 'text-indigo-600', activeBorder: 'border-indigo-500' },
  page:      { bg: 'bg-cyan-50',  text: 'text-cyan-600',  activeBorder: 'border-cyan-500' },
};

const CATEGORIES: ToolCategory[] = [
  {
    id: 'content',
    label: 'Content',
    color: 'blue',
    tools: [
      { mode: 'select', label: 'Select', icon: <MousePointer2 size={18} />, shortcut: 'V' },
      { mode: 'magic-edit', label: 'Text', icon: <Type size={18} />, shortcut: 'T' },
      { mode: 'image', label: 'Image', icon: <ImageIcon size={18} />, shortcut: 'I' },
      { mode: 'link', label: 'Link', icon: <Link2 size={18} />, shortcut: 'L' },
      { mode: 'stamp', label: 'Stamp', icon: <CustomStampIcon size={20} /> },
    ],
  },
  {
    id: 'annotate',
    label: 'Annotate',
    color: 'amber',
    tools: [
      { mode: 'highlight', label: 'Highlight', icon: <HighlightIcon size={20} />, shortcut: 'H' },
      { mode: 'underline', label: 'Underline', icon: <Minus size={18} /> },
      { mode: 'strikeout', label: 'Strikeout', icon: <Minus size={18} className="rotate-12" /> },
      { mode: 'draw', label: 'Draw', icon: <PenLine size={18} />, shortcut: 'D' },
      { mode: 'sticky-note', label: 'Comment', icon: <MessageSquare size={18} />, shortcut: 'C' },
    ],
  },
  {
    id: 'whiteout',
    label: 'Whiteout',
    color: 'slate',
    tools: [
      { mode: 'erase', label: 'Whiteout', icon: <WhiteoutIcon size={20} />, shortcut: 'E' },
      { mode: 'smart-erase', label: 'Smart Whiteout', icon: <SmartWhiteoutIcon size={20} /> },
    ],
  },
  {
    id: 'shapes',
    label: 'Shapes',
    color: 'emerald',
    tools: [
      { mode: 'rect', label: 'Rectangle', icon: <ShapeRectIcon size={20} />, shortcut: 'S' },
      { mode: 'circle', label: 'Circle', icon: <ShapeCircleIcon size={20} /> },
      { mode: 'ellipse', label: 'Ellipse', icon: <ShapeEllipseIcon size={20} /> },
      { mode: 'line', label: 'Line', icon: <ShapeLineIcon size={20} /> },
      { mode: 'arrow', label: 'Arrow', icon: <ShapeArrowIcon size={20} /> },
    ],
  },
  {
    id: 'forms',
    label: 'Fill & Sign',
    color: 'indigo',
    tools: [
      { mode: 'form-text', label: 'Text Field', icon: <CheckSquare size={18} /> },
      { mode: 'form-check', label: 'Checkbox', icon: <CheckSquare size={18} className="rotate-0" /> },
      { mode: 'form-radio', label: 'Radio', icon: <CircleIcon size={18} /> },
      { mode: 'form-select', label: 'Dropdown', icon: <LayoutList size={18} /> },
      { mode: 'sign', label: 'Signature', icon: <FileSignature size={18} />, shortcut: 'N' },
    ],
  },
  {
    id: 'page',
    label: 'Page Tools',
    color: 'cyan',
    tools: [
      { mode: 'find-replace', label: 'Find & Replace', icon: <Search size={18} />, shortcut: 'Ctrl+F' },
      { mode: 'watermark', label: 'Watermark', icon: <Droplets size={18} /> },
      { mode: 'measure', label: 'Measure', icon: <MeasureIcon size={20} /> },
    ],
  },
];

export const ToolPalette: React.FC<ToolPaletteProps> = ({
  activeMode,
  onModeChange,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [expandedCats, setExpandedCats] = React.useState<Record<string, boolean>>({
    content: true, annotate: true, whiteout: true, shapes: true, forms: true, page: true,
  });

  const toggleCat = (id: string) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      className={`shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-[210px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-11 px-3 border-b border-slate-100">
        {!collapsed && <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tools</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors ml-auto"
          title={collapsed ? 'Expand tools' : 'Collapse tools'}
        >
          <ChevronRight size={14} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* Tools */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {CATEGORIES.map((cat) => {
          const colors = CATEGORY_COLORS[cat.id];
          return (
            <div key={cat.id} className="mb-2">
              {!collapsed && (
                <button
                  onClick={() => toggleCat(cat.id)}
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  <ChevronDown size={10} className={`transition-transform ${expandedCats[cat.id] ? '' : '-rotate-90'}`} />
                  {cat.label}
                </button>
              )}
              {(!collapsed ? expandedCats[cat.id] : true) && (
                <div className="flex flex-col gap-px px-2">
                  {cat.tools.map((tool) => {
                    const isActive = activeMode === tool.mode;
                    return (
                      <button
                        key={tool.mode}
                        onClick={() => onModeChange(tool.mode)}
                        className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all group text-left ${
                          isActive
                            ? `bg-slate-50 ${colors.activeBorder} border-l-2 text-slate-900 shadow-sm`
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent'
                        }`}
                        title={collapsed ? tool.label : undefined}
                      >
                        <span className={`shrink-0 ${isActive ? colors.text : 'text-slate-400 group-hover:text-slate-600'}`}>
                          {tool.icon}
                        </span>
                        {!collapsed && (
                          <>
                            <span className="text-xs font-medium flex-1">{tool.label}</span>
                            {tool.shortcut && (
                              <span className={`text-[10px] font-mono ${isActive ? 'text-slate-400' : 'text-slate-300'}`}>
                                {tool.shortcut}
                              </span>
                            )}
                          </>
                        )}
                        {isActive && collapsed && (
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
