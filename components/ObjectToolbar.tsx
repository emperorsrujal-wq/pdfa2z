import * as React from 'react';
import {
  Trash2,
  Copy,
  ChevronDown,
  Pipette,
  Square,
  Circle,
  Bold,
  Italic,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline,
  Minus,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  StickyNote,
  List,
  MoreVertical,
} from 'lucide-react';
import { Tooltip } from './Tooltip';
import { EditElement } from '../utils/pdfHelpers';

interface ObjectToolbarProps {
  element: EditElement;
  onUpdate: (id: string, updates: Partial<EditElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (element: EditElement) => void;
  onBringToFront?: (id: string) => void;
  onSendToBack?: (id: string) => void;
  setMode?: (mode: any) => void;
}

const SEJDA_COLORS = [
  '#000000', '#424242', '#636363', '#9c9c9c', '#cecece', '#e7e7e7', '#ffffff',
  '#ff0000', '#ff9c00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9c00ff',
  '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9dadb',
  '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6',
  '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3'
];

const FONTS = [
  { name: 'Helvetica', value: 'Helvetica' },
  { name: 'Times New Roman', value: 'Times-Roman' },
  { name: 'Courier New', value: 'Courier' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Verdana', value: 'Verdana' }
];

const SIZES = [8, 10, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72];

export const ObjectToolbar: React.FC<ObjectToolbarProps> = ({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  setMode
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState<null | 'color' | 'bg'>(null);
  const [showFontPicker, setShowFontPicker] = React.useState(false);
  const [showSizePicker, setShowSizePicker] = React.useState(false);

  const ColorDropdown = ({ selected, onSelect, title }: { selected?: string, onSelect: (color: string) => void, title: string }) => (
    <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 p-4 rounded-xl shadow-xl z-[400] w-[280px] animate-in fade-in slide-in-from-top-1 space-y-4">
      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
        {title}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {SEJDA_COLORS.map(color => (
          <button
            key={color}
            className={`w-8 h-8 rounded border-2 transition-all ${selected === color ? 'border-indigo-600 scale-110 shadow-md' : 'border-slate-100 hover:border-slate-300'}`}
            style={{ backgroundColor: color }}
            onClick={() => onSelect(color)}
          />
        ))}
      </div>
      <div className="border-t border-slate-100 pt-3">
        <button
          onClick={() => {
            setMode?.('picker');
            setShowColorPicker(null);
          }}
          className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg group transition-all border border-slate-200"
        >
          <div className="p-1.5 bg-indigo-600 rounded text-white group-hover:scale-110 transition-all">
            <Pipette size={14} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[12px] font-bold text-slate-800 leading-none">Pick from Document</span>
            <span className="text-[10px] text-slate-400 mt-1">Select any color from the PDF</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="absolute -top-16 left-0 flex items-center gap-1 bg-white border border-slate-200 p-1.5 rounded-xl shadow-lg z-[450] animate-in fade-in zoom-in-95 duration-200 whitespace-nowrap">
      
      {/* TEXT FORMATTING */}
      {element.type === 'text' && (
        <>
          <div className="flex items-center gap-1 px-1">
            <button
              onClick={() => onUpdate(element.id, { fontName: element.fontName === 'Helvetica' ? 'Times-Roman' : 'Helvetica' })}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all min-w-[100px]"
            >
              <span className="text-[11px] font-bold text-slate-700 truncate">{element.fontName || 'Helvetica'}</span>
              <ChevronDown size={10} className="text-slate-400" />
            </button>
            <button
              onClick={() => setShowSizePicker(!showSizePicker)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all"
            >
              <span className="text-[11px] font-bold text-slate-700">{element.size || 14}</span>
              <ChevronDown size={10} className="text-slate-400" />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200 mx-1" />

          <div className="flex gap-1 px-1">
            <button
              onClick={() => onUpdate(element.id, { isBold: !element.isBold })}
              className={`p-1.5 rounded-lg transition-all ${element.isBold ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}
              title="Bold"
            >
              <Bold size={14} />
            </button>
            <button
              onClick={() => onUpdate(element.id, { isItalic: !element.isItalic })}
              className={`p-1.5 rounded-lg transition-all ${element.isItalic ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}
              title="Italic"
            >
              <Italic size={14} />
            </button>
          </div>
          
          <div className="w-px h-6 bg-slate-200 mx-1" />
        </>
      )}

      {/* COLOR PICKERS */}
      <div className="flex items-center gap-1 px-1">
        <div className="relative">
          <button 
            onClick={() => setShowColorPicker(showColorPicker === 'color' ? null : 'color')}
            className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${showColorPicker === 'color' ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
            title="Color"
          >
            <div className="w-4 h-4 rounded shadow-sm border border-slate-200" style={{ backgroundColor: element.color || '#000000' }} />
            <ChevronDown size={10} className="text-slate-400" />
          </button>
          {showColorPicker === 'color' && (
            <ColorDropdown selected={element.color} onSelect={(c) => { onUpdate(element.id, { color: c }); setShowColorPicker(null); }} title="Text/Stroke Color" />
          )}
        </div>

        {['rect', 'circle', 'text', 'sticky-note'].includes(element.type) && (
          <div className="relative">
            <button 
              onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}
              className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${showColorPicker === 'bg' ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              title="Background Color"
            >
              <div className="w-4 h-4 rounded border border-slate-200 relative overflow-hidden" style={{ backgroundColor: element.bgColor || 'transparent' }}>
                 {!element.bgColor || element.bgColor === 'transparent' ? <div className="absolute inset-0 border-t border-red-500 rotate-45" /> : null}
              </div>
              <ChevronDown size={10} className="text-slate-400" />
            </button>
            {showColorPicker === 'bg' && (
              <ColorDropdown selected={element.bgColor} onSelect={(c) => { onUpdate(element.id, { bgColor: c }); setShowColorPicker(null); }} title="Background Fill" />
            )}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* ACTIONS */}
      <div className="flex items-center gap-1 px-1">
        <button onClick={() => onDuplicate(element)} className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-all" title="Duplicate"><Copy size={14} /></button>
        <button onClick={() => onDelete(element.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all" title="Delete"><Trash2 size={14} /></button>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <button onClick={() => onBringToFront?.(element.id)} className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-all" title="Bring to Front"><ArrowUp size={14} /></button>
        <button onClick={() => onSendToBack?.(element.id)} className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-all" title="Send to Back"><ArrowDown size={14} /></button>
      </div>

      {showSizePicker && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 p-2 rounded-xl shadow-xl z-[400] grid grid-cols-4 gap-1 w-44 animate-in fade-in slide-in-from-top-1">
          {SIZES.map(s => (
            <button key={s} onClick={() => { onUpdate(element.id, { size: s }); setShowSizePicker(false); }} className={`p-2 text-[11px] font-bold rounded-lg ${element.size === s ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>{s}</button>
          ))}
        </div>
      )}
    </div>
  );
};
