import * as React from 'react';
import {
  Move,
  Copy,
  Trash2,
  ChevronDown,
  Pipette,
  Palette,
  Link2,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
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
  { name: 'Arial', value: 'Arial' },
  { name: 'Times New Roman', value: 'Times-Roman' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Garamond', value: 'Garamond' },
  { name: 'Palatino', value: 'Palatino' },
  { name: 'Book Antiqua', value: 'Palatino' },
  { name: 'Courier New', value: 'Courier' },
  { name: 'Verdana', value: 'Verdana' },
  { name: 'Trebuchet MS', value: 'Trebuchet MS' },
  { name: 'Impact', value: 'Impact' },
  { name: 'Comic Sans MS', value: 'Comic Sans MS' },
  { name: 'Bookman Old Style', value: 'Bookman Old Style' },
  { name: 'Candara', value: 'Candara' },
  { name: 'Calibri', value: 'Calibri' },
  { name: 'Cambria', value: 'Cambria' },
  { name: 'Segoe UI', value: 'Segoe UI' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Merriweather', value: 'Merriweather' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro' },
  { name: 'Playfair Display', value: 'Playfair Display' },
  { name: 'Fira Sans', value: 'Fira Sans' },
  { name: 'Noto Sans', value: 'Noto Sans' },
  { name: 'PT Serif', value: 'PT Serif' },
  { name: 'Ubuntu', value: 'Ubuntu' },
  { name: 'Oswald', value: 'Oswald' },
  { name: 'Nunito', value: 'Nunito' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Inter', value: 'Inter' },
  { name: 'Libre Baskerville', value: 'Libre Baskerville' },
  { name: 'Cormorant Garamond', value: 'Cormorant Garamond' },
  { name: 'DM Sans', value: 'DM Sans' },
  { name: 'Work Sans', value: 'Work Sans' },
];

const SIZES = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 48, 52, 56, 60, 64, 68, 72, 80, 88, 96];

const STROKE_WIDTHS = [1, 2, 3, 4, 6, 8, 10, 14];

function getFontPreviewFamily(value: string) {
  const serifFonts = ['Times-Roman', 'Georgia', 'Garamond', 'Palatino', 'Bookman', 'Merriweather', 'Playfair Display', 'PT Serif', 'Libre Baskerville', 'Cormorant Garamond'];
  const monoFonts = ['Courier', 'Courier New'];
  if (serifFonts.some(f => value.toLowerCase().includes(f.toLowerCase()))) return 'serif';
  if (monoFonts.some(f => value.toLowerCase().includes(f.toLowerCase()))) return 'monospace';
  return 'sans-serif';
}

export const ObjectToolbar: React.FC<ObjectToolbarProps> = ({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
  setMode
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState<null | 'color' | 'bg' | 'border' | 'textbg'>(null);
  const [showFontPicker, setShowFontPicker] = React.useState(false);
  const [showSizePicker, setShowSizePicker] = React.useState(false);
  const [showStrokePicker, setShowStrokePicker] = React.useState(false);
  const [showLinkInput, setShowLinkInput] = React.useState(false);
  const [linkInputVal, setLinkInputVal] = React.useState('');

  const closeAll = () => {
    setShowColorPicker(null);
    setShowFontPicker(false);
    setShowSizePicker(false);
    setShowStrokePicker(false);
    setShowLinkInput(false);
  };

  // Smart positioning: if element is near top of page, show toolbar below instead of above
  const isNearTop = (element.y ?? 0) < 80;
  const toolbarPosition = isNearTop
    ? 'top-full mt-2'
    : '-top-[58px]';
  const dropdownPosition = isNearTop
    ? 'top-full mt-2'
    : 'bottom-full mb-3';

  const ColorDropdown = ({ selected, onSelect }: { selected?: string; onSelect: (c: string) => void }) => (
    <div className={`absolute ${dropdownPosition} left-1/2 -translate-x-1/2 bg-white border border-[#ccc] p-2.5 shadow-2xl z-[400] w-[280px] rounded-lg animate-in fade-in ${isNearTop ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'}`}>
      <div className="grid grid-cols-10 gap-0.5 mb-2">
        {SEJDA_COLORS.map(color => (
          <button
            key={color}
            className={`w-6 h-6 border transition-all ${selected === color ? 'border-white ring-1 ring-blue-500 z-10' : 'border-transparent'} hover:scale-110`}
            style={{ backgroundColor: color }}
            onClick={() => onSelect(color)}
          />
        ))}
      </div>
      <div className="border-t border-slate-100 pt-2 flex items-center gap-2">
        <label className="flex-1 flex items-center gap-2 cursor-pointer text-[11px] text-slate-600 hover:text-blue-600 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-300 transition-colors">
          <input type="color" value={selected || '#000000'} onChange={e => onSelect(e.target.value)} className="sr-only" />
          <Palette size={13} /> Custom color…
        </label>
        <button
          onClick={() => { setMode?.('picker'); setShowColorPicker(null); }}
          className="flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-blue-600 border border-slate-200 rounded px-2 py-1.5 hover:border-blue-300 transition-colors"
        >
          <Pipette size={13} /> Pick from doc
        </button>
      </div>
    </div>
  );

  const opacityPct = Math.round((element.opacity ?? 1) * 100);

  return (
    <div
      className={`absolute ${toolbarPosition} left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center bg-white border border-[#2196f3] rounded-lg shadow-[0_4px_16px_rgba(33,150,243,0.18)] z-[450] p-1 min-h-[44px] max-w-[calc(100vw-20px)] animate-in fade-in ${isNearTop ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'} duration-200`}
      onClick={e => e.stopPropagation()}
    >

      {/* ── TEXT ─────────────────────────────── */}
      {element.type === 'text' && (
        <div className="flex items-center flex-wrap gap-px">

          {/* Bold */}
          <Tooltip content="Bold">
            <button onClick={() => onUpdate(element.id, { isBold: !element.isBold })}
              className={`flex items-center justify-center w-9 h-8 font-bold text-base ${element.isBold ? 'text-blue-600 bg-blue-50' : 'text-[#333]'} hover:bg-slate-50 border-r border-[#eee] transition-colors`}>
              B
            </button>
          </Tooltip>

          {/* Italic */}
          <Tooltip content="Italic">
            <button onClick={() => onUpdate(element.id, { isItalic: !element.isItalic })}
              className={`flex items-center justify-center w-9 h-8 italic text-base ${element.isItalic ? 'text-blue-600 bg-blue-50' : 'text-[#333]'} hover:bg-slate-50 border-r border-[#eee] transition-colors`}>
              I
            </button>
          </Tooltip>

          {/* Underline */}
          <Tooltip content="Underline">
            <button onClick={() => onUpdate(element.id, { isUnderline: !element.isUnderline })}
              className={`flex items-center justify-center w-9 h-8 ${element.isUnderline ? 'text-blue-600 bg-blue-50' : 'text-[#333]'} hover:bg-slate-50 border-r border-[#eee] transition-colors`}>
              <Underline size={15} />
            </button>
          </Tooltip>

          {/* Strikethrough */}
          <Tooltip content="Strikethrough">
            <button onClick={() => onUpdate(element.id, { isStrikeout: !element.isStrikeout })}
              className={`flex items-center justify-center w-9 h-8 ${element.isStrikeout ? 'text-blue-600 bg-blue-50' : 'text-[#333]'} hover:bg-slate-50 border-r border-[#eee] transition-colors`}>
              <Strikethrough size={15} />
            </button>
          </Tooltip>

          {/* Align */}
          <Tooltip content="Align left">
            <button onClick={() => onUpdate(element.id, { textAlign: 'left' })}
              className={`flex items-center justify-center w-8 h-8 ${(element.textAlign ?? 'left') === 'left' ? 'text-blue-600 bg-blue-50' : 'text-[#333]'} hover:bg-slate-50 transition-colors`}>
              <AlignLeft size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Align center">
            <button onClick={() => onUpdate(element.id, { textAlign: 'center' })}
              className={`flex items-center justify-center w-8 h-8 ${element.textAlign === 'center' ? 'text-blue-600 bg-blue-50' : 'text-[#333]'} hover:bg-slate-50 transition-colors`}>
              <AlignCenter size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Align right">
            <button onClick={() => onUpdate(element.id, { textAlign: 'right' })}
              className={`flex items-center justify-center w-8 h-8 border-r border-[#eee] ${element.textAlign === 'right' ? 'text-blue-600 bg-blue-50' : 'text-[#333]'} hover:bg-slate-50 transition-colors`}>
              <AlignRight size={14} />
            </button>
          </Tooltip>

          {/* Font size */}
          <div className="relative">
            <Tooltip content="Font size">
              <button onClick={() => { setShowSizePicker(!showSizePicker); setShowFontPicker(false); setShowColorPicker(null); }}
                className={`flex items-center justify-center gap-0.5 w-14 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors text-xs font-semibold ${showSizePicker ? 'bg-slate-50' : ''}`}>
                {element.size ?? 14}pt <ChevronDown size={9} className="text-slate-400" />
              </button>
            </Tooltip>
            {showSizePicker && (
              <div className={`absolute ${dropdownPosition} left-0 bg-white border border-[#ccc] shadow-2xl z-[400] w-40 rounded-lg overflow-hidden animate-in fade-in ${isNearTop ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'}`}>
                <div className="p-1.5 border-b border-[#eee]">
                  <input type="number" step="0.5" min="1" max="200"
                    defaultValue={element.size ?? 14} placeholder="Custom…"
                    className="w-full px-2 py-1 text-xs font-bold text-blue-600 border border-slate-200 rounded outline-none"
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') { const v = parseFloat((e.target as HTMLInputElement).value); if (!isNaN(v) && v > 0) { onUpdate(element.id, { size: v }); setShowSizePicker(false); } } }}
                    onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v) && v > 0) onUpdate(element.id, { size: v }); }}
                  />
                </div>
                <div className="p-1 grid grid-cols-3 gap-0.5 max-h-40 overflow-y-auto">
                  {SIZES.map(s => (
                    <button key={s} onClick={() => { onUpdate(element.id, { size: s }); setShowSizePicker(false); }}
                      className={`p-1.5 text-xs font-bold rounded ${element.size === s ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Font family */}
          <div className="relative">
            <Tooltip content="Font family">
              <button onClick={() => { setShowFontPicker(!showFontPicker); setShowSizePicker(false); setShowColorPicker(null); }}
                className={`flex items-center gap-0.5 px-2 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] text-xs font-medium transition-colors max-w-[100px] truncate ${showFontPicker ? 'bg-slate-50' : ''}`}>
                <span className="truncate">{FONTS.find(f => f.value === element.fontName)?.name ?? 'Helvetica'}</span>
                <ChevronDown size={9} className="text-slate-400 shrink-0" />
              </button>
            </Tooltip>
            {showFontPicker && (
              <div className={`absolute ${dropdownPosition} left-0 bg-white border border-[#ccc] shadow-2xl z-[400] w-52 rounded-lg overflow-hidden animate-in fade-in ${isNearTop ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'}`}>
                {FONTS.map(f => (
                  <button key={f.value} onClick={() => { onUpdate(element.id, { fontName: f.value }); setShowFontPicker(false); }}
                    className={`w-full text-left px-3 py-2 text-sm ${element.fontName === f.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                    style={{ fontFamily: getFontPreviewFamily(f.value) }}>
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text color */}
          <div className="relative">
            <Tooltip content="Text color">
              <button onClick={() => { setShowColorPicker(showColorPicker === 'color' ? null : 'color'); setShowFontPicker(false); setShowSizePicker(false); }}
                className={`flex items-center gap-0.5 w-9 h-8 justify-center text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors ${showColorPicker === 'color' ? 'bg-slate-100' : ''}`}>
                <div className="w-4 h-4 rounded border border-slate-300 shadow-sm" style={{ backgroundColor: element.color }} />
                <ChevronDown size={9} className="text-slate-400" />
              </button>
            </Tooltip>
            {showColorPicker === 'color' && (
              <ColorDropdown selected={element.color} onSelect={c => { onUpdate(element.id, { color: c }); setShowColorPicker(null); }} />
            )}
          </div>

          {/* Text background color */}
          <div className="relative">
            <Tooltip content="Text box background">
              <button onClick={() => { setShowColorPicker(showColorPicker === 'textbg' ? null : 'textbg'); setShowFontPicker(false); setShowSizePicker(false); }}
                className={`flex items-center gap-0.5 w-9 h-8 justify-center text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors ${showColorPicker === 'textbg' ? 'bg-slate-100' : ''}`}>
                <div className="w-4 h-4 rounded border-2 border-slate-300 shadow-sm relative overflow-hidden" style={{ backgroundColor: element.bgColor ?? 'transparent' }}>
                  {!element.bgColor && <div className="absolute inset-0 flex items-center justify-center text-[8px] text-slate-400 font-bold">bg</div>}
                </div>
                <ChevronDown size={9} className="text-slate-400" />
              </button>
            </Tooltip>
            {showColorPicker === 'textbg' && (
              <ColorDropdown selected={element.bgColor} onSelect={c => { onUpdate(element.id, { bgColor: c }); setShowColorPicker(null); }} />
            )}
          </div>

          {/* Link */}
          <div className="relative">
            <Tooltip content="Add hyperlink">
              <button onClick={() => { setLinkInputVal(element.linkUrl || ''); setShowLinkInput(v => !v); closeAll(); }}
                className={`flex items-center justify-center w-9 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors ${showLinkInput ? 'bg-blue-50 text-blue-600' : ''}`}>
                <Link2 size={15} />
              </button>
            </Tooltip>
            {showLinkInput && (
              <div className={`absolute ${dropdownPosition} left-0 bg-white border border-[#ccc] rounded-lg shadow-2xl p-3 z-[500] w-64 animate-in fade-in ${isNearTop ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'}`} onClick={e => e.stopPropagation()}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Hyperlink URL</p>
                <input type="url" value={linkInputVal} onChange={e => setLinkInputVal(e.target.value)}
                  placeholder="https://example.com" autoFocus
                  className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-500 mb-2"
                  onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') { onUpdate(element.id, { linkUrl: linkInputVal }); setShowLinkInput(false); } if (e.key === 'Escape') setShowLinkInput(false); }}
                />
                <div className="flex gap-1.5">
                  <button onClick={() => { onUpdate(element.id, { linkUrl: linkInputVal }); setShowLinkInput(false); }}
                    className="flex-1 py-1 bg-[#2196f3] text-white rounded text-xs font-bold hover:bg-[#1976d2] transition-colors">Apply</button>
                  {element.linkUrl && (
                    <button onClick={() => { onUpdate(element.id, { linkUrl: '' }); setShowLinkInput(false); }}
                      className="px-2 py-1 border border-slate-200 text-red-500 rounded text-xs hover:bg-red-50 transition-colors">Remove</button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Opacity */}
          <Tooltip content={`Opacity: ${opacityPct}%`}>
            <div className="flex items-center gap-1 px-2 border-r border-[#eee]">
              <input type="range" min={5} max={100} step={5} value={opacityPct}
                onChange={e => onUpdate(element.id, { opacity: Number(e.target.value) / 100 })}
                className="w-16 accent-blue-500 cursor-pointer" />
              <span className="text-[10px] font-bold text-slate-500 w-7 shrink-0">{opacityPct}%</span>
            </div>
          </Tooltip>

          {/* Move handle */}
          <Tooltip content="Move (drag)">
            <button className="flex items-center justify-center w-9 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] cursor-move transition-colors">
              <Move size={15} />
            </button>
          </Tooltip>

          {/* Duplicate */}
          <Tooltip content="Duplicate (Ctrl+D)">
            <button onClick={() => onDuplicate(element)} className="flex items-center justify-center w-9 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors">
              <Copy size={14} />
            </button>
          </Tooltip>

          {/* Delete */}
          <Tooltip content="Delete (Del)">
            <button onClick={() => onDelete(element.id)} className="flex items-center justify-center w-9 h-8 text-red-500 hover:bg-red-50 transition-colors rounded-r-lg">
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      )}

      {/* ── SHAPE (rect / ellipse / circle) ────────── */}
      {(element.type === 'rect' || element.type === 'ellipse' || element.type === 'circle') && (
        <div className="flex items-center gap-px">

          {/* Shape indicator */}
          <Tooltip content={element.type}>
            <button className="flex items-center justify-center w-9 h-8 text-slate-400 border-r border-[#eee]">
              {element.type === 'rect' ? <Square size={15} /> : <Circle size={15} />}
            </button>
          </Tooltip>

          {/* Fill color */}
          <div className="relative">
            <Tooltip content="Fill color">
              <button onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}
                className={`flex items-center gap-0.5 w-9 h-8 justify-center text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors ${showColorPicker === 'bg' ? 'bg-slate-100' : ''}`}>
                <div className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: element.bgColor || element.color }} />
                <ChevronDown size={9} className="text-slate-400" />
              </button>
            </Tooltip>
            {showColorPicker === 'bg' && (
              <ColorDropdown selected={element.bgColor || element.color} onSelect={c => { onUpdate(element.id, { bgColor: c, color: c }); setShowColorPicker(null); }} />
            )}
          </div>

          {/* Border color */}
          <div className="relative">
            <Tooltip content="Border color">
              <button onClick={() => setShowColorPicker(showColorPicker === 'border' ? null : 'border')}
                className={`flex items-center gap-0.5 w-9 h-8 justify-center text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors ${showColorPicker === 'border' ? 'bg-slate-100' : ''}`}>
                <div className="w-4 h-4 rounded border-2" style={{ borderColor: element.borderColor ?? '#000', backgroundColor: 'transparent' }} />
                <ChevronDown size={9} className="text-slate-400" />
              </button>
            </Tooltip>
            {showColorPicker === 'border' && (
              <ColorDropdown selected={element.borderColor} onSelect={c => { onUpdate(element.id, { borderColor: c }); setShowColorPicker(null); }} />
            )}
          </div>

          {/* Border width */}
          <div className="relative">
            <Tooltip content="Border width">
              <button onClick={() => { setShowStrokePicker(!showStrokePicker); setShowColorPicker(null); }}
                className={`flex items-center gap-0.5 px-2 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] text-xs font-semibold transition-colors ${showStrokePicker ? 'bg-slate-50' : ''}`}>
                {element.borderWidth ?? 0}px <ChevronDown size={9} className="text-slate-400" />
              </button>
            </Tooltip>
            {showStrokePicker && (
              <div className={`absolute ${dropdownPosition} left-0 bg-white border border-[#ccc] shadow-2xl z-[400] rounded-lg overflow-hidden animate-in fade-in ${isNearTop ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2'} w-32`}>
                <div className="p-1.5 border-b border-[#eee]">
                  <input type="number" min={0} max={40} defaultValue={element.borderWidth ?? 0}
                    className="w-full px-2 py-1 text-xs font-bold text-blue-600 border border-slate-200 rounded outline-none"
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') { onUpdate(element.id, { borderWidth: Number((e.target as HTMLInputElement).value) }); setShowStrokePicker(false); } }}
                    onBlur={e => onUpdate(element.id, { borderWidth: Math.max(0, Number(e.target.value)) })}
                  />
                </div>
                <div className="p-1">
                  {STROKE_WIDTHS.map(w => (
                    <button key={w} onClick={() => { onUpdate(element.id, { borderWidth: w }); setShowStrokePicker(false); }}
                      className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded ${element.borderWidth === w ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}>
                      <div className="flex-1 rounded" style={{ height: `${Math.min(w, 6)}px`, backgroundColor: 'currentColor', opacity: 0.6 }} />
                      {w}px
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Opacity */}
          <Tooltip content={`Opacity: ${opacityPct}%`}>
            <div className="flex items-center gap-1 px-2 border-r border-[#eee]">
              <input type="range" min={5} max={100} step={5} value={opacityPct}
                onChange={e => onUpdate(element.id, { opacity: Number(e.target.value) / 100 })}
                className="w-16 accent-blue-500 cursor-pointer" />
              <span className="text-[10px] font-bold text-slate-500 w-7 shrink-0">{opacityPct}%</span>
            </div>
          </Tooltip>

          {/* Duplicate */}
          <Tooltip content="Duplicate (Ctrl+D)">
            <button onClick={() => onDuplicate(element)} className="flex items-center justify-center w-9 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors">
              <Copy size={14} />
            </button>
          </Tooltip>

          {/* Delete */}
          <Tooltip content="Delete (Del)">
            <button onClick={() => onDelete(element.id)} className="flex items-center justify-center w-9 h-8 text-red-500 hover:bg-red-50 transition-colors rounded-r-lg">
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      )}

      {/* ── PATH / LINE / ARROW ─────────────────── */}
      {(element.type === 'path' || element.type === 'line' || element.type === 'arrow') && (
        <div className="flex items-center gap-px">

          {/* Color */}
          <div className="relative">
            <Tooltip content="Color">
              <button onClick={() => setShowColorPicker(showColorPicker === 'color' ? null : 'color')}
                className={`flex items-center gap-0.5 w-9 h-8 justify-center text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors ${showColorPicker === 'color' ? 'bg-slate-100' : ''}`}>
                <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: element.color }} />
                <ChevronDown size={9} className="text-slate-400" />
              </button>
            </Tooltip>
            {showColorPicker === 'color' && (
              <ColorDropdown selected={element.color} onSelect={c => { onUpdate(element.id, { color: c }); setShowColorPicker(null); }} />
            )}
          </div>

          {/* Stroke width */}
          <div className="relative">
            <Tooltip content="Stroke width">
              <button onClick={() => { setShowStrokePicker(!showStrokePicker); setShowColorPicker(null); }}
                className={`flex items-center gap-0.5 px-2 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] text-xs font-semibold transition-colors ${showStrokePicker ? 'bg-slate-50' : ''}`}>
                {element.strokeWidth ?? 3}px <ChevronDown size={9} className="text-slate-400" />
              </button>
            </Tooltip>
            {showStrokePicker && (
              <div className="absolute bottom-full left-0 mb-3 bg-white border border-[#ccc] shadow-2xl z-[400] rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 w-32">
                <div className="p-1">
                  {STROKE_WIDTHS.map(w => (
                    <button key={w} onClick={() => { onUpdate(element.id, { strokeWidth: w }); setShowStrokePicker(false); }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded ${element.strokeWidth === w ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}>
                      <div className="flex-1 rounded" style={{ height: `${Math.min(w, 6)}px`, backgroundColor: 'currentColor', opacity: 0.6 }} />
                      {w}px
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Opacity */}
          <Tooltip content={`Opacity: ${opacityPct}%`}>
            <div className="flex items-center gap-1 px-2 border-r border-[#eee]">
              <input type="range" min={5} max={100} step={5} value={opacityPct}
                onChange={e => onUpdate(element.id, { opacity: Number(e.target.value) / 100 })}
                className="w-16 accent-blue-500 cursor-pointer" />
              <span className="text-[10px] font-bold text-slate-500 w-7 shrink-0">{opacityPct}%</span>
            </div>
          </Tooltip>

          {/* Duplicate */}
          <Tooltip content="Duplicate">
            <button onClick={() => onDuplicate(element)} className="flex items-center justify-center w-9 h-8 text-[#333] hover:bg-slate-50 border-r border-[#eee] transition-colors">
              <Copy size={14} />
            </button>
          </Tooltip>

          {/* Delete */}
          <Tooltip content="Delete">
            <button onClick={() => onDelete(element.id)} className="flex items-center justify-center w-9 h-8 text-red-500 hover:bg-red-50 transition-colors rounded-r-lg">
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      )}

      {/* ── OTHER (image, highlight, sticky-note, form fields, etc.) ── */}
      {!['text', 'rect', 'ellipse', 'circle', 'path', 'line', 'arrow'].includes(element.type) && (
        <div className="flex items-center px-1 gap-px">

          {/* Opacity (where applicable) */}
          {['highlight', 'sticky-note', 'image'].includes(element.type) && (
            <Tooltip content={`Opacity: ${opacityPct}%`}>
              <div className="flex items-center gap-1 px-2 border-r border-[#eee]">
                <input type="range" min={5} max={100} step={5} value={opacityPct}
                  onChange={e => onUpdate(element.id, { opacity: Number(e.target.value) / 100 })}
                  className="w-16 accent-blue-500 cursor-pointer" />
                <span className="text-[10px] font-bold text-slate-500 w-7 shrink-0">{opacityPct}%</span>
              </div>
            </Tooltip>
          )}

          <Tooltip content="Duplicate">
            <button onClick={() => onDuplicate(element)} className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors">
              <Copy size={14} />
            </button>
          </Tooltip>
          <div className="w-px h-5 bg-slate-200 mx-0.5" />
          <Tooltip content="Delete">
            <button onClick={() => onDelete(element.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
