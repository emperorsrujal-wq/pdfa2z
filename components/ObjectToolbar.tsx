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
  Type
} from 'lucide-react';
import { Tooltip } from './Tooltip';
import { EditElement } from '../utils/pdfHelpers';

interface ObjectToolbarProps {
  element: EditElement;
  onUpdate: (id: string, updates: Partial<EditElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (element: EditElement) => void;
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
  { name: 'Times New Roman', value: 'Times-Roman' },
  { name: 'Arial / Helvetica', value: 'Helvetica' },
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
  setMode
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showFontPicker, setShowFontPicker] = React.useState(false);
  const [showSizePicker, setShowSizePicker] = React.useState(false);

  return (
    <div className="absolute -top-12 left-0 flex items-center gap-0.5 bg-white border border-[#3b82f6]/30 p-0.5 rounded shadow-lg z-[300] animate-in fade-in zoom-in-95 duration-200">
      
      {/* TEXT SPECIFIC CONTROLS */}
      {element.type === 'text' && (
        <>
          <div className="flex border-r border-slate-100 pr-0.5 mr-0.5">
            <button 
              onClick={() => onUpdate(element.id, { isBold: !element.isBold })}
              className={`p-1.5 rounded transition-colors ${element.isBold ? 'bg-[#f0f7ff] text-[#3b82f6]' : 'hover:bg-[#f0f7ff] text-slate-500'}`}
            >
              <Bold size={16} />
            </button>
            <button 
              onClick={() => onUpdate(element.id, { isItalic: !element.isItalic })}
              className={`p-1.5 rounded transition-colors ${element.isItalic ? 'bg-[#f0f7ff] text-[#3b82f6]' : 'hover:bg-[#f0f7ff] text-slate-500'}`}
            >
              <Italic size={16} />
            </button>
          </div>

          {/* Font Family Selector */}
          <div className="relative flex items-center border-r border-slate-100 pr-0.5 mr-0.5">
            <button 
              onClick={() => setShowFontPicker(!showFontPicker)}
              className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-[#f0f7ff] rounded transition-colors min-w-[100px] text-left"
            >
              <span className="text-[10px] font-bold text-slate-700 truncate w-20">
                {FONTS.find(f => f.value === element.fontName)?.name || 'Helvetica'}
              </span>
              <ChevronDown size={10} className="text-slate-400" />
            </button>
            
            {showFontPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 p-1 rounded shadow-2xl z-[400] w-48">
                {FONTS.map(font => (
                  <button
                    key={font.value}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded hover:bg-[#f0f7ff] transition-colors ${element.fontName === font.value ? 'text-[#3b82f6] bg-[#f0f7ff]' : 'text-slate-700'}`}
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
          <div className="relative flex items-center border-r border-slate-100 pr-0.5 mr-0.5">
            <button 
              onClick={() => setShowSizePicker(!showSizePicker)}
              className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-[#f0f7ff] rounded transition-colors"
            >
              <span className="text-[10px] font-bold text-slate-700">{element.size || 24}</span>
              <ChevronDown size={10} className="text-slate-400" />
            </button>
            
            {showSizePicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 p-1 rounded shadow-2xl z-[400] grid grid-cols-3 gap-1">
                {SIZES.map(size => (
                  <button
                    key={size}
                    className={`px-2 py-1 text-[10px] font-bold rounded hover:bg-[#f0f7ff] transition-colors ${element.size === size ? 'text-[#3b82f6] bg-[#f0f7ff]' : 'text-slate-700'}`}
                    onClick={() => {
                      onUpdate(element.id, { size });
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
      {(element.type === 'rect' || element.type === 'circle') && (
        <div className="flex border-r border-slate-100 pr-0.5 mr-0.5">
          <button 
            className="p-1.5 hover:bg-[#f0f7ff] rounded text-[#3b82f6]"
          >
            {element.type === 'circle' ? <Circle size={16} /> : <Square size={16} />}
          </button>
        </div>
      )}

      {/* Color Picker Grid (Standard for most objects) */}
      <div className="relative flex items-center border-r border-slate-100 pr-0.5 mr-0.5">
        <button 
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="flex items-center gap-1 p-1.5 hover:bg-[#f0f7ff] rounded transition-colors"
        >
          <div 
            className="w-4 h-4 rounded-sm border border-slate-200" 
            style={{ backgroundColor: element.color === 'transparent' ? 'white' : (element.color || '#000000') }}
          >
             {element.color === 'transparent' && <div className="w-full h-full border-t border-red-500 rotate-45" />}
          </div>
          <ChevronDown size={10} className="text-slate-400" />
        </button>

        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 p-2 rounded shadow-2xl z-[400] w-[180px]">
             <div className="grid grid-cols-7 gap-1">
                {SEJDA_COLORS.map(color => (
                  <button
                    key={color}
                    className="w-5 h-5 rounded-sm border border-slate-100 hover:scale-110 transition-transform shadow-sm"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onUpdate(element.id, { color });
                      setShowColorPicker(false);
                    }}
                  />
                ))}
             </div>
             
             {/* Eyedropper Row */}
             <div className="mt-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setMode?.('picker');
                    setShowColorPicker(false);
                  }}
                  className="flex items-center gap-2 w-full p-2 hover:bg-[#f0f7ff] rounded text-left group"
                >
                  <div className="p-1 bg-slate-100 rounded group-hover:bg-[#3b82f6] group-hover:text-white transition-colors">
                    <Pipette size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-700 leading-none">Select a color from</span>
                    <span className="text-[10px] font-bold text-slate-500 leading-none mt-1">the document</span>
                  </div>
                </button>

                <button 
                   onClick={() => { onUpdate(element.id, { color: 'transparent' }); setShowColorPicker(false); }}
                   className="mt-2 w-full h-8 border border-slate-100 rounded flex items-center justify-center bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-400"
                >
                   Transparent / No Color
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Action Group */}
      <div className="flex items-center">
        <button 
          onClick={() => onDuplicate(element)}
          className="p-1.5 hover:bg-[#f0f7ff] rounded text-slate-500"
          title="Duplicate"
        >
          <Copy size={16} />
        </button>
        <button 
          onClick={() => onDelete(element.id)}
          className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-500"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>

    </div>
  );
};
