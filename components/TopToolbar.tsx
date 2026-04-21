import React, { useState, useRef, useEffect } from 'react';
import { EditorMode } from '../utils/pdfHelpers';
import {
  Type, Link, FormInput, Image as ImageIcon, FileSignature, Eraser,
  Highlighter, Square, Undo2, ChevronDown, CheckSquare, AlignLeft, AlignCenter, AlignRight,
  CircleDot, Pencil, StickyNote, Circle, MoveDiagonal, Plus, Grid
} from 'lucide-react';

interface TopToolbarProps {
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  canUndo?: boolean;
  undo: () => void;
  canRedo?: boolean;
  redo?: () => void;
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
  isBold?: boolean;
  setIsBold?: (v: boolean) => void;
  isItalic?: boolean;
  setIsItalic?: (v: boolean) => void;
  isUnderline?: boolean;
  setIsUnderline?: (v: boolean) => void;
  textAlign?: 'left' | 'center' | 'right';
  setTextAlign?: (v: 'left' | 'center' | 'right') => void;
  zoom: number;
  setZoom: (v: number) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  showGrid?: boolean;
  setShowGrid?: (v: boolean) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ 
  mode, setMode, undo, canUndo, redo, canRedo, triggerImageUpload, 
  activeColor, setActiveColor, whiteoutColor, setWhiteoutColor, colors, 
  activeFontSize, setActiveFontSize, activeFont, setActiveFont,
  isBold, setIsBold, isItalic, setIsItalic, isUnderline, setIsUnderline,
  textAlign, setTextAlign, zoom, setZoom, searchTerm, setSearchTerm,
  showGrid, setShowGrid
}) => {
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
    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
      isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`;

  const dropdownMenuClass = "absolute top-full left-0 mt-2 w-52 bg-[#222222] border border-white/10 rounded-2xl shadow-2xl z-[600] py-1.5 animate-slide-up backdrop-blur-xl";
  const dropdownItemClass = "w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-300 hover:bg-white/5 hover:text-white text-left transition-all uppercase tracking-tight";

  return (
    <div ref={toolbarRef} className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-white/5 shadow-2xl h-14 shrink-0 relative z-[500]">
      
      {/* Left: Tool Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        
        {/* EDIT GROUP */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
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
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* ANNOTATE GROUP */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
          <button onClick={() => selectMode('highlight')} className={btnClass(mode === 'highlight')}><Highlighter size={16}/> Highlight</button>
          <button onClick={() => selectMode('sticky-note')} className={btnClass(mode === 'sticky-note')}><StickyNote size={16}/> Note</button>
          <button onClick={() => selectMode('draw')} className={btnClass(mode === 'draw')}><Pencil size={16}/> Draw</button>
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* INSERT GROUP */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => {
              selectMode('image');
              triggerImageUpload();
            }} 
            className={btnClass(mode === 'image')}
          >
            <ImageIcon size={16} /> Image
          </button>

          <button onClick={() => selectMode('signature')} className={btnClass(mode === 'signature')}>
            <FileSignature size={16} /> Sign
          </button>

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
        </div>
        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* FORMS GROUP */}
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

        {/* --- INLINE TOOL SETTINGS --- */}
        {(['text', 'magic-edit'].includes(mode)) && (
          <div className="flex items-center gap-3 px-4 py-1.5 studio-glass rounded-xl animate-in fade-in zoom-in-95 duration-200 ml-2 shadow-xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Font</span>
              <select 
                value={activeFont}
                onChange={e => setActiveFont(e.target.value)}
                className="bg-[#222] border border-white/10 rounded-lg py-1 px-2 text-[11px] font-bold text-slate-300 outline-none hover:border-indigo-500 transition-all cursor-pointer"
              >
                {['Helvetica', 'Times-Roman', 'Courier', 'Verdana', 'Georgia'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Size</span>
              <select 
                value={activeFontSize}
                onChange={e => setActiveFontSize(parseInt(e.target.value))}
                className="bg-[#222] border border-white/10 rounded-lg py-1 px-2 text-[11px] font-bold text-slate-300 outline-none hover:border-indigo-500 transition-all cursor-pointer"
              >
                {[8, 10, 12, 14, 16, 18, 24, 30, 36, 48, 64, 72].map(s => <option key={s} value={s}>{s}pt</option>)}
              </select>
            </div>
            <div className="h-4 w-px bg-white/10" />
            
            <div className="flex items-center bg-[#222] border border-white/10 rounded-lg overflow-hidden shadow-sm">
              <button onClick={() => setIsBold?.(!isBold)} className={`px-2.5 py-1 text-[11px] font-black ${isBold ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>B</button>
              <button onClick={() => setIsItalic?.(!isItalic)} className={`px-2.5 py-1 text-[11px] font-black italic border-l border-white/5 ${isItalic ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>I</button>
            </div>

            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center bg-[#222] border border-white/10 rounded-lg overflow-hidden shadow-sm">
              <button onClick={() => setTextAlign?.('left')} className={`p-1.5 ${textAlign === 'left' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><AlignLeft size={12} /></button>
              <button onClick={() => setTextAlign?.('center')} className={`p-1.5 border-l border-white/5 ${textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><AlignCenter size={12} /></button>
            </div>
          </div>
        )}

        {mode === 'erase' && (
          <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in zoom-in-95 duration-200 ml-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Eraser Mode</span>
             <div className="h-4 w-px bg-emerald-500/20 mx-1" />
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">Color</span>
                <div className="relative">
                  <button 
                    onClick={(e) => toggleDropdown('whiteoutColorTop', e)}
                    className="w-6 h-6 rounded-md border border-white/10 bg-white shadow-sm transition-all hover:scale-110"
                    style={{ backgroundColor: whiteoutColor }}
                  />
                  {openDropdown === 'whiteoutColorTop' && renderColorPicker(whiteoutColor, setWhiteoutColor, true)}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Middle: Zoom, Grid and Search */}
      <div className="flex items-center gap-4 px-4 border-l border-r border-white/5 mx-4 h-8">
        <div className="flex items-center gap-2">
           <button onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} className="p-1.5 hover:bg-white/5 rounded-md text-slate-500 hover:text-white transition-all">
              <Plus size={14} className="rotate-45" />
           </button>
           <div className="relative">
              <button 
                onClick={(e) => toggleDropdown('zoom', e)}
                className="px-2 py-1 bg-[#222] border border-white/10 rounded-lg text-[11px] font-black text-slate-300 min-w-[65px] flex items-center justify-between hover:border-indigo-500 transition-all"
              >
                {Math.round(zoom * 100)}% <ChevronDown size={12} className="opacity-40" />
              </button>
              {openDropdown === 'zoom' && (
                <div className={dropdownMenuClass + " min-w-[100px]"}>
                   {[0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4].map(z => (
                     <button key={z} className={dropdownItemClass} onClick={() => { setZoom(z); setOpenDropdown(null); }}>{z * 100}%</button>
                   ))}
                </div>
              )}
           </div>
           <button onClick={() => setZoom(Math.min(4, zoom + 0.25))} className="p-1.5 hover:bg-white/5 rounded-md text-slate-500 hover:text-white transition-all">
              <Plus size={14} />
           </button>
        </div>

        <button
          onClick={() => setShowGrid?.(!showGrid)}
          className={`p-2 rounded-lg transition-all border ${showGrid ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'text-slate-500 border-transparent hover:bg-white/5 hover:text-white'}`}
          title="Toggle Layout Grid (G)"
        >
          <Grid size={16} />
        </button>

        <div className="relative group">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
           </div>
           <input 
             type="text" 
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             placeholder="Search document..."
             className="pl-9 pr-3 py-1.5 bg-[#222] border border-white/10 rounded-xl text-[11px] font-bold text-slate-300 outline-none focus:border-indigo-500 focus:bg-[#2a2a2a] w-44 transition-all"
           />
        </div>
      </div>

      <div className="flex-1" />

      {/* Right: History Actions */}
      <div className="flex items-center gap-1 pr-6">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`p-2.5 rounded-xl transition-all border ${!canUndo ? 'text-slate-300 border-transparent cursor-not-allowed opacity-40' : 'text-slate-600 border-slate-200 hover:bg-white hover:shadow-md active:scale-95'}`}
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className={`p-2.5 rounded-xl transition-all border ${!canRedo ? 'text-slate-300 border-transparent cursor-not-allowed opacity-40' : 'text-slate-600 border-slate-200 hover:bg-white hover:shadow-md active:scale-95'}`}
        >
          <div className="scale-x-[-1]"><Undo2 size={18} /></div>
        </button>
      </div>

    </div>
  );
};
