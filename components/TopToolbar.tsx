import React, { useState, useRef, useEffect } from 'react';
import { EditorMode } from '../utils/pdfHelpers';
import {
  Type, Link, FormInput, Image as ImageIcon, FileSignature, Eraser,
  Highlighter, Square, Undo2, ChevronDown, CheckSquare, AlignLeft,
  CircleDot, Pencil, StickyNote, Circle, MoveDiagonal, Plus
} from 'lucide-react';

interface TopToolbarProps {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  canUndo?: boolean;
  undo: () => void;
  triggerImageUpload: () => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
  whiteoutColor: string;
  setWhiteoutColor: (color: string) => void;
  colors: string[];
  activeFontSize: number;
  setActiveFontSize: (size: number) => void;
  activeFont: string;
  setActiveFont: (font: string) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ mode, setMode, undo, canUndo, triggerImageUpload, activeColor, setActiveColor, whiteoutColor, setWhiteoutColor, colors, activeFontSize, setActiveFontSize, activeFont, setActiveFont }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const renderColorPicker = (currentColor: string, setColor: (c: string) => void, isWhiteout: boolean = false) => (
    <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 p-3 rounded-xl shadow-xl z-[600] w-[220px] animate-slide-up grid grid-cols-6 gap-1" onClick={e => e.stopPropagation()}>
      <div className="col-span-6 text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1">
        {isWhiteout ? 'Whiteout Color' : 'Text Color'}
      </div>
      {colors.map(color => (
        <button
          key={color}
          className={`w-6 h-6 rounded-md border hover:scale-110 transition-all shadow-sm ${currentColor === color ? 'border-indigo-600 ring-2 ring-indigo-500/20 scale-110' : 'border-slate-200'}`}
          style={{ backgroundColor: color }}
          onClick={(e) => {
            e.stopPropagation();
            setColor(color);
            setOpenDropdown(null);
          }}
        />
      ))}
    </div>
  );

  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(prev => prev === name ? null : name);
  };

  const selectMode = (m: EditorMode) => {
    setMode(m);
    setOpenDropdown(null);
  };

  const btnClass = (isActive: boolean) => 
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
      isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const dropdownMenuClass = "absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-[600] py-1 animate-slide-up";
  const dropdownItemClass = "w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-left transition-all";

  return (
    <div ref={toolbarRef} className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shadow-[0_4px_10px_rgba(0,0,0,0.03)] h-14 shrink-0 relative z-[500]">
      
      {/* Left: Tool Categories */}
      <div className="flex items-center gap-1">
        
        {/* TEXT */}
        <div className="relative flex items-center group">
          <button onClick={() => selectMode('text')} className={btnClass(mode === 'text' || mode === 'magic-edit') + " pr-1 rounded-r-none border-r border-transparent group-hover:border-slate-200"}>
            <Type size={16} /> Text
          </button>
          <button 
            onClick={(e) => toggleDropdown('textColor', e)}
            className={`px-1.5 py-2 transition-all ${(mode === 'text' || mode === 'magic-edit') ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-100'} rounded-r-md flex items-center justify-center`}
          >
            <div className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{backgroundColor: activeColor}} />
          </button>
          {openDropdown === 'textColor' && renderColorPicker(activeColor, setActiveColor, false)}
        </div>

        {/* LINKS */}
        <button onClick={() => selectMode('link')} className={btnClass(mode === 'link')}>
          <Link size={16} /> Links
        </button>

        {/* FORMS DROPDOWN */}
        <div className="relative">
          <button 
            onClick={(e) => toggleDropdown('forms', e)} 
            className={btnClass(mode.startsWith('form-'))}
          >
            <FormInput size={16} /> Forms <ChevronDown size={14} className="opacity-50" />
          </button>
          {openDropdown === 'forms' && (
            <div className={dropdownMenuClass}>
              <button onClick={() => selectMode('form-check')} className={dropdownItemClass}><CheckSquare size={14}/> Checkbox</button>
              <button onClick={() => selectMode('form-radio')} className={dropdownItemClass}><CircleDot size={14}/> Radio Button</button>
              <button onClick={() => selectMode('form-text')} className={dropdownItemClass}><Type size={14}/> Text Field</button>
              <button onClick={() => selectMode('form-textarea')} className={dropdownItemClass}><AlignLeft size={14}/> Textarea</button>
              <button onClick={() => selectMode('form-select')} className={dropdownItemClass}><ChevronDown size={14}/> Dropdown</button>
            </div>
          )}
        </div>

        {/* IMAGES */}
        <button 
          onClick={() => {
            selectMode('image');
            triggerImageUpload();
          }} 
          className={btnClass(mode === 'image')}
        >
          <ImageIcon size={16} /> Images
        </button>

        {/* SIGNATURE */}
        <button onClick={() => selectMode('signature')} className={btnClass(mode === 'signature')}>
          <FileSignature size={16} /> Sign
        </button>

        {/* WHITEOUT */}
        <div className="relative flex items-center group">
          <button onClick={() => selectMode('erase')} className={btnClass(mode === 'erase') + " pr-1 rounded-r-none border-r border-transparent group-hover:border-slate-200"}>
            <Eraser size={16} /> Whiteout
          </button>
          <button 
            onClick={(e) => toggleDropdown('whiteoutColor', e)}
            className={`px-1.5 py-2 transition-all ${mode === 'erase' ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-100'} rounded-r-md flex items-center justify-center`}
          >
            <div className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{backgroundColor: whiteoutColor}} />
          </button>
          {openDropdown === 'whiteoutColor' && renderColorPicker(whiteoutColor, setWhiteoutColor, true)}
        </div>

        {/* ANNOTATE DROPDOWN */}
        <div className="relative">
          <button 
            onClick={(e) => toggleDropdown('annotate', e)} 
            className={btnClass(['highlight', 'strikeout', 'underline', 'sticky-note'].includes(mode))}
          >
            <Highlighter size={16} /> Annotate <ChevronDown size={14} className="opacity-50" />
          </button>
          {openDropdown === 'annotate' && (
            <div className={dropdownMenuClass}>
              <button onClick={() => selectMode('highlight')} className={dropdownItemClass}><Highlighter size={14}/> Highlight</button>
              <button onClick={() => selectMode('strikeout')} className={dropdownItemClass}><span className="line-through">S</span> Strikeout</button>
              <button onClick={() => selectMode('underline')} className={dropdownItemClass}><span className="underline">U</span> Underline</button>
              <button onClick={() => selectMode('sticky-note')} className={dropdownItemClass}><StickyNote size={14}/> Sticky Note</button>
              <button onClick={() => selectMode('draw')} className={dropdownItemClass}><Pencil size={14}/> Freehand Draw</button>
            </div>
          )}
        </div>

        {/* SHAPES DROPDOWN */}
        <div className="relative">
          <button 
            onClick={(e) => toggleDropdown('shapes', e)} 
            className={btnClass(['rect', 'circle', 'line'].includes(mode))}
          >
            <Square size={16} /> Shapes <ChevronDown size={14} className="opacity-50" />
          </button>
          {openDropdown === 'shapes' && (
            <div className={dropdownMenuClass}>
              <button onClick={() => selectMode('rect')} className={dropdownItemClass}><Square size={14}/> Rectangle</button>
              <button onClick={() => selectMode('circle')} className={dropdownItemClass}><Circle size={14}/> Ellipse</button>
              <button onClick={() => selectMode('line')} className={dropdownItemClass}><MoveDiagonal size={14}/> Arrow/Line</button>
            </div>
          )}
        </div>

        {/* --- INLINE TOOL SETTINGS --- */}
        {(['text', 'magic-edit'].includes(mode)) && (
          <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in zoom-in-95 duration-200 ml-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Font</span>
              <select 
                value={activeFont}
                onChange={e => setActiveFont(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-[11px] font-bold text-slate-700 outline-none hover:border-indigo-400 transition-all cursor-pointer"
              >
                {['Helvetica', 'Times-Roman', 'Courier', 'Verdana', 'Georgia'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</span>
              <select 
                value={activeFontSize}
                onChange={e => setActiveFontSize(parseInt(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-[11px] font-bold text-slate-700 outline-none hover:border-indigo-400 transition-all cursor-pointer"
              >
                {[8, 10, 12, 14, 16, 18, 24, 30, 36, 48, 64, 72].map(s => <option key={s} value={s}>{s}pt</option>)}
              </select>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Color</span>
              <div className="relative">
                <button 
                  onClick={(e) => toggleDropdown('textColor', e)}
                  className="w-6 h-6 rounded-md border border-slate-200 shadow-sm transition-all hover:scale-110"
                  style={{ backgroundColor: activeColor }}
                />
                {openDropdown === 'textColor' && renderColorPicker(activeColor, setActiveColor)}
              </div>
            </div>
          </div>
        )}

        {mode === 'erase' && (
          <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl animate-in fade-in zoom-in-95 duration-200 ml-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Eraser Mode</span>
             <div className="h-4 w-px bg-emerald-200 mx-1" />
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Color</span>
                <div className="relative">
                  <button 
                    onClick={(e) => toggleDropdown('whiteoutColorTop', e)}
                    className="w-6 h-6 rounded-md border border-emerald-200 bg-white shadow-sm transition-all hover:scale-110"
                    style={{ backgroundColor: whiteoutColor }}
                  />
                  {openDropdown === 'whiteoutColorTop' && renderColorPicker(whiteoutColor, setWhiteoutColor, true)}
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Undo */}
      <div className="flex items-center gap-2 pr-4">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${!canUndo ? 'text-slate-300 border-transparent cursor-not-allowed opacity-50' : 'text-slate-600 border-slate-200 hover:bg-slate-100 active:scale-95 shadow-sm'}`}
        >
          <Undo2 size={16} /> Undo
        </button>
      </div>

    </div>
  );
};
