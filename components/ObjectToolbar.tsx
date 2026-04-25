import * as React from 'react';
import {
  PenTool,
  Maximize,
  Move,
  ExternalLink,
  RotateCw,
  Copy,
  Trash2,
  ChevronDown,
  Pipette,
  Bold,
  Italic,
  Type,
  Palette,
  Link2,
  Square,
  Circle,
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
  const [showColorPicker, setShowColorPicker] = React.useState<null | 'color' | 'bg' | 'border'>(null);
  const [showFontPicker, setShowFontPicker] = React.useState(false);
  const [showSizePicker, setShowSizePicker] = React.useState(false);

  const ColorDropdown = ({ selected, onSelect, title }: { selected?: string, onSelect: (color: string) => void, title: string }) => (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white border border-[#ccc] p-[10px] shadow-2xl z-[400] w-[280px] animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-10 gap-0.5">
        {SEJDA_COLORS.map(color => (
          <button
            key={color}
            className={`w-6 h-6 border transition-all ${selected === color ? 'border-white ring-1 ring-blue-500 z-10' : 'border-transparent'}`}
            style={{ backgroundColor: color }}
            onClick={() => onSelect(color)}
          />
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
        <button
          onClick={() => {
            setMode?.('picker');
            setShowColorPicker(null);
          }}
          className="w-full flex items-center justify-between p-2 hover:bg-slate-100 rounded text-slate-700 transition-all border border-slate-200"
        >
          <span className="text-[11px] font-bold">Select a color from the document</span>
          <Pipette size={14} className="text-slate-500" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="absolute -top-[55px] left-1/2 -translate-x-1/2 flex items-center bg-[#fff] border border-[#2196f3] rounded-lg shadow-[0_4px_12px_rgba(33,150,243,0.15)] z-[450] p-1 h-[42px] animate-in fade-in slide-in-from-bottom-2 duration-200">
      
      {/* TEXT TOOLS */}
      {element.type === 'text' && (
        <div className="flex items-center">
          {/* Bold */}
          <button
            onClick={() => onUpdate(element.id, { isBold: !element.isBold })}
            className={`flex items-center justify-center w-10 h-8 font-serif text-lg ${element.isBold ? 'text-indigo-600 bg-indigo-50' : 'text-[#333]'} hover:bg-slate-50 border-r border-[#eee] transition-colors`}
          >
            B
          </button>
          {/* Italic */}
          <button
            onClick={() => onUpdate(element.id, { isItalic: !element.isItalic })}
            className={`flex items-center justify-center w-10 h-8 font-serif italic text-lg ${element.isItalic ? 'text-indigo-600 bg-indigo-50' : 'text-[#333]'} hover:bg-slate-50 border-r border-[#eee] transition-colors`}
          >
            I
          </button>
          
          {/* Size (T arrow icon) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSizePicker(!showSizePicker);
                setShowFontPicker(false);
                setShowColorPicker(null);
              }}
              className={`flex items-center justify-center w-12 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] gap-0.5 transition-colors ${showSizePicker ? 'bg-slate-50' : ''}`}
            >
              <span className="text-sm font-semibold">T</span>
              <div className="flex flex-col -gap-0.5 scale-75">
                <ChevronDown size={8} className="rotate-180" />
                <ChevronDown size={8} />
              </div>
            </button>
            {showSizePicker && (
              <div className="absolute bottom-full left-0 mb-4 bg-white border border-[#ccc] p-1 shadow-2xl z-[400] grid grid-cols-3 gap-0.5 w-32 animate-in fade-in slide-in-from-bottom-2">
                {SIZES.map(s => (
                  <button key={s} onClick={() => { onUpdate(element.id, { size: s }); setShowSizePicker(false); }} className={`p-1.5 text-xs font-bold ${element.size === s ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Font selection (Aa) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFontPicker(!showFontPicker);
                setShowSizePicker(false);
                setShowColorPicker(null);
              }}
              className={`flex items-center justify-center w-12 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] gap-0.5 transition-colors ${showFontPicker ? 'bg-slate-50' : ''}`}
            >
              <span className="text-sm">Aa</span>
              <ChevronDown size={10} className="text-[#888]" />
            </button>
            {showFontPicker && (
              <div className="absolute bottom-full left-0 mb-4 bg-white border border-[#ccc] shadow-2xl z-[400] w-48 animate-in fade-in slide-in-from-bottom-2">
                {FONTS.map(f => (
                  <button key={f.value} onClick={() => { onUpdate(element.id, { fontName: f.value }); setShowFontPicker(false); }} className={`w-full text-left px-4 py-2 text-sm font-medium ${element.fontName === f.value ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}>{f.name}</button>
                ))}
              </div>
            )}
          </div>

          {/* Color Palette */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowColorPicker(showColorPicker === 'color' ? null : 'color');
                setShowFontPicker(false);
                setShowSizePicker(false);
              }}
              className={`flex items-center justify-center w-10 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors ${showColorPicker === 'color' ? 'bg-slate-100' : ''}`}
            >
              <Palette size={18} className={element.color ? '' : 'text-[#888]'} style={{ color: element.color }} />
              <ChevronDown size={10} className="text-[#888]" />
            </button>
            {showColorPicker === 'color' && (
              <ColorDropdown selected={element.color} onSelect={(c) => { onUpdate(element.id, { color: c }); setShowColorPicker(null); }} title="Color" />
            )}
          </div>

          {/* Link */}
          <button 
            onClick={() => {
              const url = prompt("Enter link URL:", element.linkUrl || "");
              if (url !== null) onUpdate(element.id, { linkUrl: url });
            }}
            className="flex items-center justify-center w-10 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors"
          >
            <Link2 size={18} />
          </button>

          {/* Move handle */}
          <button className="flex items-center justify-center w-10 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] cursor-move transition-colors">
            <Move size={18} />
          </button>

          {/* Duplicate */}
          <button onClick={() => onDuplicate(element)} className="flex items-center justify-center w-10 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors">
            <Copy size={16} />
          </button>

          {/* Delete */}
          <button onClick={() => onDelete(element.id)} className="flex items-center justify-center w-10 h-8 text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* SHAPE TOOLS (Whiteout / Rectangle) */}
      {(element.type === 'rect' || element.type === 'ellipse' || element.type === 'circle') && (
        <div className="flex items-center">
          {/* Border Style (Stub for now) */}
          <button className="flex items-center justify-center w-10 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors">
            <div className="w-4 h-[2px] bg-[#333]" />
          </button>

          {/* Shape Indicator */}
          <button className="flex items-center justify-center w-10 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors">
            {element.type === 'rect' ? <Square size={16} /> : <Circle size={16} />}
          </button>

          {/* Fill Color Palette */}
          <div className="relative">
            <button 
              onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}
              className={`flex items-center justify-center w-10 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors ${showColorPicker === 'bg' ? 'bg-slate-100' : ''}`}
            >
              <Palette size={18} style={{ color: element.bgColor || element.color }} />
              <ChevronDown size={10} className="text-[#888]" />
            </button>
            {showColorPicker === 'bg' && (
              <ColorDropdown selected={element.bgColor || element.color} onSelect={(c) => { onUpdate(element.id, { bgColor: c, color: c }); setShowColorPicker(null); }} title="Fill Color" />
            )}
          </div>

          {/* Duplicate */}
          <button onClick={() => onDuplicate(element)} className="flex items-center justify-center w-10 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors">
            <Copy size={16} />
          </button>

          {/* Delete */}
          <button onClick={() => onDelete(element.id)} className="flex items-center justify-center w-10 h-8 text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* OTHER TOOLS (Path, Line, Arrow, Image) */}
      {(element.type !== 'text' && element.type !== 'rect' && element.type !== 'ellipse' && element.type !== 'circle') && (
        <div className="flex items-center px-1">
          <button onClick={() => onDelete(element.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button onClick={() => onDuplicate(element)} className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors"><Copy size={14} /></button>
        </div>
      )}
    </div>
  );
};
