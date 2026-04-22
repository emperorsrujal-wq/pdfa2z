import * as React from 'react';
import { ChevronRight, ChevronLeft, FileText, Plus, Trash2, Copy, RotateCw } from 'lucide-react';

interface PdfThumbnailSidebarProps {
  images: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
  pageEdits: Record<number, number>;
  onDuplicatePage?: (index: number) => void;
  onDeletePage?: (index: number) => void;
  onRotatePage?: (index: number, angle: number) => void;
  onMovePage?: (index: number, direction: 'up' | 'down') => void;
  elements: any[];
}

export const PdfThumbnailSidebar: React.FC<PdfThumbnailSidebarProps> = ({
  images,
  activeIndex,
  onSelect,
  pageEdits,
  onDuplicatePage,
  onDeletePage,
  onRotatePage,
  onMovePage,
  elements
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [selectedIndices, setSelectedIndices] = React.useState<number[]>([]);
  const [viewMode, setViewMode] = React.useState<'pages' | 'layers'>('pages');

  const handleThumbnailClick = (e: React.MouseEvent, index: number) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedIndices(prev => 
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
    } else {
      setSelectedIndices([index]);
      onSelect(index);
    }
  };

  return (
    <div
      className={`relative h-full flex flex-col transition-all duration-300 ease-in-out shrink-0 ${isOpen ? 'w-56' : 'w-12'}`}
      style={{ background: 'var(--editor-sidebar)', borderRight: '1px solid var(--editor-border)' }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-8 z-20 w-6 h-6 bg-[#2a3347] border border-white/10 shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
      >
        {isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Header */}
      {isOpen && (
        <div className="shrink-0">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workspace</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">Live</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[11px] font-black text-white truncate">Document Editor</h3>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none block mt-0.5">
                  {images.length} {images.length === 1 ? 'Page' : 'Pages'}
                </span>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="p-2 flex gap-1">
            <button 
              onClick={() => setViewMode('pages')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${viewMode === 'pages' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Pages
            </button>
            <button 
              onClick={() => setViewMode('layers')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${viewMode === 'layers' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Layers
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto editor-scrollbar ${isOpen ? 'p-3 space-y-3' : 'flex flex-col items-center pt-6 gap-3'}`}>
        {viewMode === 'pages' ? images.map((img, i) => (
          isOpen ? (
            <div
              key={i}
              onClick={(e) => handleThumbnailClick(e, i)}
              className={`group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 ${
                selectedIndices.includes(i)
                  ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#1a1a1a] shadow-lg shadow-indigo-500/20'
                  : 'hover:ring-1 hover:ring-white/20 ring-transparent'
              }`}
            >
              <div className="aspect-[3/4] bg-slate-800 rounded-lg overflow-hidden relative">
                <img src={img} className="w-full h-full object-contain" alt={`Page ${i + 1}`} />

                {/* Active overlay */}
                {activeIndex === i && (
                  <div className="absolute inset-0 bg-indigo-500/5" />
                )}

                {/* Page Action Overlay (Visible on Hover) */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 p-2">
                   <div className="flex gap-2">
                     <button 
                       onClick={(e) => { e.stopPropagation(); onRotatePage?.(i, 90); }}
                       className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                       title="Rotate 90°"
                     >
                       <RotateCw size={14} />
                     </button>
                     <button 
                       onClick={(e) => { e.stopPropagation(); onDuplicatePage?.(i); }}
                       className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                       title="Duplicate Page"
                     >
                       <Copy size={14} />
                     </button>
                   </div>
                   <div className="flex gap-2">
                     <button 
                       onClick={(e) => { e.stopPropagation(); onMovePage?.(i, 'up'); }}
                       className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                       title="Move Up"
                     >
                       <ChevronLeft size={14} className="rotate-90" />
                     </button>
                     <button 
                       onClick={(e) => { e.stopPropagation(); onMovePage?.(i, 'down'); }}
                       className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                       title="Move Down"
                     >
                       <ChevronLeft size={14} className="-rotate-90" />
                     </button>
                   </div>
                   <button 
                      onClick={(e) => { e.stopPropagation(); onDeletePage?.(i); }}
                      className="p-2 w-full max-w-[80px] bg-red-500/40 hover:bg-red-500/60 rounded-lg text-white text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                </div>

                {/* Edit count badge */}
                {pageEdits[i] > 0 && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-indigo-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg border border-white/20">
                    {pageEdits[i]}
                  </div>
                )}
              </div>
              <div className={`mt-1.5 text-center text-[9px] font-black transition-colors ${selectedIndices.includes(i) ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                PAGE {i + 1}
              </div>
            </div>
          ) : (
            // Collapsed: show dot indicators
            <button
              key={i}
              onClick={(e) => handleThumbnailClick(e, i)}
              title={`Page ${i + 1}`}
              className={`relative w-4 h-4 rounded-full transition-all ${
                selectedIndices.includes(i)
                  ? 'bg-indigo-500 ring-2 ring-indigo-400/40'
                  : 'bg-white/10 hover:bg-white/25'
              }`}
            >
              {pageEdits[i] > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-400 rounded-full" />
              )}
            </button>
          )
        )) : (
          /* Layers View Mode */
          <div className="space-y-1.5 px-1 animate-in fade-in duration-300">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-2">Active Layers</div>
            {elements.filter(el => el.pageIndex === activeIndex).map((el, idx) => (
              <div 
                key={el.id} 
                className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group cursor-pointer"
              >
                 <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400">
                   {el.type.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="text-[11px] font-bold text-slate-300 truncate">{el.type} {idx + 1}</div>
                   <div className="text-[9px] text-slate-500 font-medium truncate uppercase tracking-tighter">Pos: {Math.round(el.x)},{Math.round(el.y)}</div>
                 </div>
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button className="p-1 hover:text-indigo-400 text-slate-500" title="Visibility"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>
                    <button className="p-1 hover:text-rose-400 text-slate-500" title="Lock"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17V7h5a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-5"/></svg></button>
                 </div>
              </div>
            ))}
            {elements.filter(el => el.pageIndex === activeIndex).length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                 <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3 text-slate-600">
                    <Plus size={24} className="opacity-20" />
                 </div>
                 <div className="text-xs font-bold text-slate-400">No objects on this page</div>
                 <div className="text-[10px] text-slate-500 mt-1">Add text, images or shapes to see them here</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add page placeholder */}
      {isOpen && (
        <div className="shrink-0 p-3 border-t border-white/5">
          <button
            title="Feature coming soon"
            disabled
            className="w-full py-2 rounded-xl border border-dashed border-white/10 text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:border-white/20 transition-colors cursor-not-allowed"
          >
            <Plus size={12} /> Add Page
          </button>
        </div>
      )}
    </div>
  );
};
