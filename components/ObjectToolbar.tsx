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
  { name: 'Helvetica (Sans)', value: 'Helvetica' },
  { name: 'Times New Roman', value: 'Times-Roman' },
  { name: 'Courier New', value: 'Courier' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Verdana', value: 'Verdana' },
  { name: 'Arial Bold', value: 'Helvetica-Bold' },
  { name: 'Times Bold', value: 'Times-Bold' }
];

const SIZES = [8, 10, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72];

// Bounds checking helpers
const clampSize = (size: number): number => Math.max(8, Math.min(96, Math.round(size)));
const clampStrokeWidth = (width: number): number => Math.max(1, Math.min(20, Math.round(width)));
const clampOpacity = (opacity: number): number => Math.max(0, Math.min(1, opacity));

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

  // Reusable Color Dropdown Component
  const ColorDropdown = ({ selected, onSelect, title }: { selected?: string, onSelect: (color: string) => void, title: string }) => (
    <div className="absolute top-full left-0 mt-2 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[400] w-[280px] animate-in fade-in slide-in-from-top-1 space-y-4">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
        {title}
      </div>
      <div className="grid grid-cols-8 gap-2">
        {SEJDA_COLORS.map(color => (
          <button
            key={color}
            className={`w-7 h-7 rounded-lg border-2 hover:scale-110 transition-all shadow-md ${selected === color ? 'border-indigo-500 scale-110 ring-2 ring-indigo-500/20' : 'border-white/5 hover:border-white/20'}`}
            style={{ backgroundColor: color }}
            title={color}
            onClick={() => onSelect(color)}
          />
        ))}
      </div>
      <div className="border-t border-white/5 my-1" />
      <button
        onClick={() => {
          setMode?.('picker');
          setShowColorPicker(null);
        }}
        className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left group transition-all"
      >
        <div className="p-2.5 bg-indigo-600 rounded-xl text-white group-hover:scale-110 transition-all shadow-lg shadow-indigo-600/20">
          <Pipette size={14} />
        </div>
        <div className="flex flex-col flex-1">
          <span className="text-[11px] font-black text-slate-100 tracking-tight leading-none">Pick from Document</span>
          <span className="text-[9px] font-bold text-slate-500 leading-none mt-1 uppercase tracking-tighter">Precise Color Match</span>
        </div>
      </button>
      <button
        onClick={() => onSelect('transparent')}
        className="w-full py-3 border border-white/10 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-red-500/10 text-[9px] font-black text-slate-400 hover:text-red-400 uppercase tracking-widest transition-all"
      >
        Clear / Transparent
      </button>
    </div>
  );

  return (
    <div className="absolute -top-16 left-0 flex items-center gap-1.5 bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 p-1.5 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] z-[450] animate-in fade-in zoom-in-95 duration-300">
      
      {/* TOOLBAR HANDLE (Aesthetic) */}
      <div className="flex flex-col gap-1 px-1 opacity-20 mr-1">
         <div className="w-0.5 h-0.5 bg-white rounded-full" />
         <div className="w-0.5 h-0.5 bg-white rounded-full" />
         <div className="w-0.5 h-0.5 bg-white rounded-full" />
      </div>

      {/* TEXT SPECIFIC CONTROLS */}
      {element.type === 'text' && (
        <>
          {/* Text Formatting Buttons */}
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => onUpdate(element.id, { isBold: !element.isBold })}
              className={`p-2 rounded-lg transition-all ${element.isBold ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}
              title="Bold"
            >
              <Bold size={14} />
            </button>
            <button
              onClick={() => onUpdate(element.id, { isItalic: !element.isItalic })}
              className={`p-2 rounded-lg transition-all ${element.isItalic ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}
              title="Italic"
            >
              <Italic size={14} />
            </button>
            <button
              onClick={() => onUpdate(element.id, { isUnderline: !element.isUnderline })}
              className={`p-2 rounded-lg transition-all ${element.isUnderline ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}
              title="Underline"
            >
              <Underline size={14} />
            </button>
          </div>

          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Font Family Selector */}
          <div className="relative flex items-center">
            <button 
              onClick={() => setShowFontPicker(!showFontPicker)}
              className="flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all min-w-[130px] text-left group"
            >
              <div className="p-1 px-2 bg-indigo-600/20 text-indigo-400 rounded text-[9px] font-black uppercase">Aa</div>
              <span className="text-[10px] font-black text-slate-200 uppercase tracking-tight truncate w-20">
                {FONTS.find(f => f.value === element.fontName)?.name.split(' ')[0] || 'Inter'}
              </span>
              <ChevronDown size={10} className="text-slate-500 group-hover:text-slate-300" />
            </button>
            
            {showFontPicker && (
              <div className="absolute top-full left-0 mt-3 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 p-2.5 rounded-2xl shadow-2xl z-[500] w-56 animate-in fade-in slide-in-from-top-1 space-y-1">
                {FONTS.map(font => (
                  <button
                    key={font.value}
                    className={`w-full text-left px-4 py-2.5 text-[11px] font-bold rounded-xl transition-all ${element.fontName === font.value ? 'text-white bg-indigo-600 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    style={{ fontFamily: font.name }}
                    onClick={() => {
                      onUpdate(element.id, { fontName: font.value });
                      setShowFontPicker(false);
                    }}
                  >
                    {font.name}
                  </button>
                ))}
                <div className="border-t border-white/5 my-2" />
                <button
                  onClick={() => {
                    setMode?.('font-picker');
                    setShowFontPicker(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl text-left transition-all"
                >
                   <Pipette size={14} />
                   <span className="text-[10px] font-black uppercase tracking-tighter">Auto-Match Font</span>
                </button>
              </div>
            )}
          </div>

          {/* Font Size */}
          <div className="relative flex items-center">
            <button 
              onClick={() => setShowSizePicker(!showSizePicker)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
            >
              <span className="text-[11px] font-black text-indigo-400 tabular-nums">{element.size || 14}</span>
              <ChevronDown size={10} className="text-slate-500" />
            </button>
            {showSizePicker && (
              <div className="absolute top-full right-0 mt-3 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 p-2.5 rounded-2xl shadow-2xl z-[500] grid grid-cols-4 gap-1.5 w-48 animate-in fade-in slide-in-from-top-1">
                {SIZES.map(size => (
                  <button
                    key={size}
                    className={`h-9 text-[11px] font-black rounded-xl transition-all ${element.size === size ? 'text-white bg-indigo-600 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    onClick={() => {
                      onUpdate(element.id, { size: clampSize(size) });
                      setShowSizePicker(false);
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── SHAPES & FORMS ─────────────────── */}
      {['rect', 'circle', 'line'].includes(element.type) && (
        <div className="flex items-center gap-3 px-2 bg-white/5 rounded-xl h-10">
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Border</span>
           <input
             type="range" min="1" max="20"
             value={element.strokeWidth || 3}
             onChange={(e) => onUpdate(element.id, { strokeWidth: clampStrokeWidth(parseInt(e.target.value)) })}
             className="w-20 h-1 bg-white/10 rounded-lg cursor-pointer accent-indigo-500"
           />
           <span className="text-[10px] font-black text-indigo-400 w-8 text-right tabular-nums">{element.strokeWidth || 3}px</span>
        </div>
      )}

      {/* ─── COLORS ─────────────────── */}
      <div className="flex items-center gap-1.5 px-1">
        <div className="relative flex items-center">
            <button 
              onClick={() => { setShowColorPicker(showColorPicker === 'color' ? null : 'color'); }}
              className={`flex items-center gap-2 p-2 rounded-xl border border-white/5 transition-all ${showColorPicker === 'color' ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-white/5 hover:bg-white/10'}`}
              title="Fore Color"
            >
              <div className="w-4 h-4 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: element.color === 'transparent' ? 'transparent' : (element.color || '#000000') }} />
              <ChevronDown size={10} className="text-slate-500" />
            </button>
          {showColorPicker === 'color' && (
             <ColorDropdown selected={element.color} onSelect={(color) => { onUpdate(element.id, { color }); setShowColorPicker(null); }} title="Primary Color" />
          )}
        </div>

        {['rect', 'circle', 'sticky-note', 'highlight', 'text'].includes(element.type) && (
          <div className="relative flex items-center">
              <button 
                onClick={() => { setShowColorPicker(showColorPicker === 'bg' ? null : 'bg'); }}
                className={`flex items-center gap-2 p-2 rounded-xl border border-white/5 transition-all ${showColorPicker === 'bg' ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-white/5 hover:bg-white/10'}`}
                title="Fill Color"
              >
                <div className="w-4 h-4 rounded border border-white/20 relative overflow-hidden" style={{ backgroundColor: element.bgColor || 'transparent' }}>
                   {(!element.bgColor || element.bgColor === 'transparent') && <div className="absolute inset-0 border-t-2 border-red-500/60 rotate-45" />}
                </div>
                <ChevronDown size={10} className="text-slate-500" />
              </button>
            {showColorPicker === 'bg' && (
              <ColorDropdown selected={element.bgColor} onSelect={(bgColor) => { onUpdate(element.id, { bgColor }); setShowColorPicker(null); }} title="Fill / Background" />
            )}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* LAYER CONTROLS (Front/Back) */}
      <div className="flex gap-1">
         <button onClick={() => onBringToFront?.(element.id)} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Bring to Front"><ArrowUp size={14} /></button>
         <button onClick={() => onSendToBack?.(element.id)} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all" title="Send to Back"><ArrowDown size={14} /></button>
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* ACTION GROUP */}
      <div className="flex items-center gap-1 pl-1">
        <button onClick={() => onDuplicate(element)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-indigo-400 transition-all border border-white/5 group" title="Duplicate">
          <Copy size={14} className="group-hover:scale-110 transition-transform" />
        </button>
        <button onClick={() => onDelete(element.id)} className="p-2 bg-red-500/10 hover:bg-red-500 rounded-xl text-red-400 hover:text-white transition-all border border-red-500/10 group" title="Delete">
          <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
};

    </div>
  );
};
