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
  ArrowDown
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
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showFontPicker, setShowFontPicker] = React.useState(false);
  const [showSizePicker, setShowSizePicker] = React.useState(false);

  return (
    <div className="absolute -top-14 left-0 flex items-center gap-1 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 p-1 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[300] animate-in fade-in zoom-in-95 duration-200">
      
      {/* TEXT SPECIFIC CONTROLS */}
      {element.type === 'text' && (
        <>
          {/* Text Formatting Buttons */}
          <div className="flex border-r border-white/5 pr-1 mr-1">
            <button
              onClick={() => onUpdate(element.id, { isBold: !element.isBold })}
              className={`p-2 rounded-lg transition-all ${element.isBold ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-white/5 text-slate-400'}`}
              title="Bold"
            >
              <Bold size={14} />
            </button>
            <button
              onClick={() => onUpdate(element.id, { isItalic: !element.isItalic })}
              className={`p-2 rounded-lg transition-all ${element.isItalic ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-white/5 text-slate-400'}`}
              title="Italic"
            >
              <Italic size={14} />
            </button>
            <button
              onClick={() => onUpdate(element.id, { isUnderline: !element.isUnderline })}
              className={`p-2 rounded-lg transition-all ${element.isUnderline ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-white/5 text-slate-400'}`}
              title="Underline"
            >
              <Underline size={14} />
            </button>
          </div>

          {/* Text Alignment */}
          <div className="flex border-r border-white/5 pr-1 mr-1">
            <button
              onClick={() => onUpdate(element.id, { textAlign: 'left' })}
              className={`p-2 rounded-lg transition-all ${element.textAlign === 'left' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-white/5 text-slate-400'}`}
              title="Align Left"
            >
              <AlignLeft size={14} />
            </button>
            <button
              onClick={() => onUpdate(element.id, { textAlign: 'center' })}
              className={`p-2 rounded-lg transition-all ${element.textAlign === 'center' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-white/5 text-slate-400'}`}
              title="Align Center"
            >
              <AlignCenter size={14} />
            </button>
            <button
              onClick={() => onUpdate(element.id, { textAlign: 'right' })}
              className={`p-2 rounded-lg transition-all ${element.textAlign === 'right' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-white/5 text-slate-400'}`}
              title="Align Right"
            >
              <AlignRight size={14} />
            </button>
          </div>

          {/* Font Family Selector */}
          <div className="relative flex items-center border-r border-white/5 pr-1 mr-1">
            <button 
              onClick={() => setShowFontPicker(!showFontPicker)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-all min-w-[120px] text-left"
            >
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter truncate w-24">
                {FONTS.find(f => f.value === element.fontName)?.name || 'Helvetica'}
              </span>
              <ChevronDown size={10} className="text-slate-500" />
            </button>
            
            {showFontPicker && (
              <div className="absolute top-full left-0 mt-2 bg-[#1e293b] border border-white/10 p-1.5 rounded-xl shadow-2xl z-[400] w-52 animate-in fade-in slide-in-from-top-1">
                {FONTS.map(font => (
                  <button
                    key={font.value}
                    className={`w-full text-left px-3 py-2 text-[11px] font-bold rounded-lg hover:bg-indigo-600/20 transition-all ${element.fontName === font.value ? 'text-indigo-400 bg-indigo-600/10' : 'text-slate-400 hover:text-white'}`}
                    style={{ fontFamily: font.name }}
                    onClick={() => {
                      onUpdate(element.id, { fontName: font.value });
                      setShowFontPicker(false);
                    }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Size Selector */}
          <div className="relative flex items-center border-r border-white/5 pr-1 mr-1">
            <button 
              onClick={() => setShowSizePicker(!showSizePicker)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <span className="text-[10px] font-black text-indigo-400 tabular-nums">{element.size || 24}</span>
              <ChevronDown size={10} className="text-slate-500" />
            </button>
            
            {showSizePicker && (
              <div className="absolute top-full left-0 mt-2 bg-[#1e293b] border border-white/10 p-2 rounded-xl shadow-2xl z-[400] grid grid-cols-4 gap-1 w-40 animate-in fade-in slide-in-from-top-1">
                {SIZES.map(size => (
                  <button
                    key={size}
                    className={`px-2 py-1.5 text-[10px] font-black rounded-lg hover:bg-indigo-600/20 transition-all ${element.size === size ? 'text-white bg-indigo-600 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => {
                      const clampedSize = clampSize(size);
                      onUpdate(element.id, { size: clampedSize });
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

      {/* SHAPE/WHITE OUT SPECIFIC */}
      {(element.type === 'rect' || element.type === 'circle' || element.type === 'line') && (
        <div className="flex border-r border-white/5 pr-1 mr-1">
          <button
            className="p-2 bg-white/5 rounded-lg text-indigo-400"
            title={element.type === 'circle' ? 'Circle' : element.type === 'line' ? 'Line' : 'Rectangle'}
          >
            {element.type === 'circle' ? <Circle size={14} /> : element.type === 'line' ? <Minus size={14} /> : <Square size={14} />}
          </button>
        </div>
      )}

      {/* STROKE WIDTH (for shapes and lines) */}
      {(element.type === 'rect' || element.type === 'circle' || element.type === 'line') && (
        <div className="relative flex items-center border-r border-white/5 pr-1 mr-1">
          <div className="flex items-center gap-2 px-2">
            <span className="text-[10px] font-bold text-slate-400">Border:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={element.strokeWidth || 3}
              onChange={(e) => onUpdate(element.id, { strokeWidth: clampStrokeWidth(parseInt(e.target.value)) })}
              className="w-16 h-1 bg-white/10 rounded-lg cursor-pointer accent-indigo-500"
              title="Stroke Width"
            />
            <span className="text-[10px] font-bold text-slate-300 w-6 text-right">{element.strokeWidth || 3}px</span>
          </div>
        </div>
      )}

      {/* Color Picker Grid (Standard for most objects) */}
      <div className="relative flex items-center border-r border-white/5 pr-1 mr-1">
        <button 
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-all"
        >
          <div 
            className="w-4 h-4 rounded-full border border-white/20 shadow-inner" 
            style={{ backgroundColor: element.color === 'transparent' ? 'transparent' : (element.color || '#000000') }}
          >
             {element.color === 'transparent' && <div className="w-full h-full border-t border-red-500 rotate-45" />}
          </div>
          <ChevronDown size={10} className="text-slate-500" />
        </button>

        {showColorPicker && (
          <div className="absolute top-full left-0 mt-2 bg-[#1e293b] border border-white/10 p-4 rounded-2xl shadow-2xl z-[400] w-[260px] animate-in fade-in slide-in-from-top-1 space-y-3">
             {/* Helper Text */}
             <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
               Choose Color
             </div>

             {/* Color Grid */}
             <div className="grid grid-cols-8 gap-2">
                {SEJDA_COLORS.map(color => (
                  <button
                    key={color}
                    className={`w-7 h-7 rounded-lg border-2 hover:scale-110 transition-all shadow-md ${element.color === color ? 'border-white ring-2 ring-indigo-500' : 'border-white/10 hover:border-white/30'}`}
                    style={{ backgroundColor: color }}
                    title={color}
                    onClick={() => {
                      onUpdate(element.id, { color });
                      setShowColorPicker(false);
                    }}
                  />
                ))}
             </div>

             {/* Divider */}
             <div className="border-t border-white/5" />

             {/* Eyedropper Row */}
             <button
               onClick={() => {
                 setMode?.('picker');
                 setShowColorPicker(false);
               }}
               className="w-full flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-xl text-left group transition-all"
             >
               <div className="p-2 bg-white/5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all shadow-inner">
                 <Pipette size={14} />
               </div>
               <div className="flex flex-col flex-1">
                 <span className="text-[10px] font-black text-slate-200 tracking-tight leading-none">Pick from Document</span>
                 <span className="text-[9px] font-bold text-slate-500 leading-none mt-0.5">Sample color from PDF</span>
               </div>
             </button>

             {/* Transparent Option */}
             <button
               onClick={() => {
                 onUpdate(element.id, { color: 'transparent' });
                 setShowColorPicker(false);
               }}
               className="w-full py-2.5 border border-white/10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-indigo-600/10 text-[9px] font-black text-slate-400 hover:text-indigo-400 uppercase tracking-widest transition-all"
             >
               No Color / Transparent
             </button>
          </div>
        )}
      </div>

      {/* Action Group */}
      <div className="flex items-center gap-0.5">
        {onSendToBack && (
          <button
            onClick={() => onSendToBack(element.id)}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
            title="Send to Back (Ctrl+Shift+B)"
          >
            <ArrowDown size={14} />
          </button>
        )}
        {onBringToFront && (
          <button
            onClick={() => onBringToFront(element.id)}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
            title="Bring to Front (Ctrl+Shift+F)"
          >
            <ArrowUp size={14} />
          </button>
        )}
        <button
          onClick={() => onDuplicate(element)}
          className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
          title="Duplicate"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => onDelete(element.id)}
          className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-all"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>

    </div>
  );
};
