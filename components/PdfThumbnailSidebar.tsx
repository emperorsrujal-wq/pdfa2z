import * as React from 'react';
import { ChevronRight, ChevronLeft, FileText, Plus, Trash2, Copy, RotateCw } from 'lucide-react';

interface PdfThumbnailSidebarProps {
  images: string[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
  pageEdits: Record<number, number>;
  onDuplicatePage?: (index: number) => void;
  onDeletePage?: (index: number) => void;
  onRotatePage?: (index: number, angle: number) => void;
}

export const PdfThumbnailSidebar: React.FC<PdfThumbnailSidebarProps> = ({
  images,
  activeIndex,
  onSelect,
  pageEdits,
  onDuplicatePage,
  onDeletePage,
  onRotatePage
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [selectedIndices, setSelectedIndices] = React.useState<number[]>([]);

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
      className={`relative h-full flex flex-col transition-all duration-300 ease-in-out shrink-0 ${isOpen ? 'w-52' : 'w-12'}`}
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
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={13} className="text-slate-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pages</span>
          </div>
          <div className="flex items-center gap-2">
            {selectedIndices.length > 1 && (
              <button 
                onClick={() => {
                  if (confirm(`Delete ${selectedIndices.length} pages?`)) {
                    selectedIndices.sort((a,b) => b-a).forEach(idx => onDeletePage?.(idx));
                    setSelectedIndices([]);
                  }
                }}
                className="p-1 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"
                title="Delete Selected Pages"
              >
                <Trash2 size={12} />
              </button>
            )}
            <span className="text-[9px] font-black text-blue-400/70 bg-blue-400/10 px-1.5 py-0.5 rounded-full border border-blue-400/20">
              {images.length}
            </span>
          </div>
        </div>
      )}

      {/* Thumbnails */}
      <div className={`flex-1 overflow-y-auto editor-scrollbar ${isOpen ? 'p-3 space-y-3' : 'flex flex-col items-center pt-6 gap-3'}`}>
        {images.map((img, i) => (
          isOpen ? (
            <div
              key={i}
              onClick={(e) => handleThumbnailClick(e, i)}
              className={`group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 ${
                selectedIndices.includes(i)
                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#161b27] shadow-lg shadow-blue-500/20'
                  : 'hover:ring-1 hover:ring-white/20 ring-transparent'
              }`}
            >
              <div className="aspect-[3/4] bg-slate-800 rounded-lg overflow-hidden relative">
                <img src={img} className="w-full h-full object-contain" alt={`Page ${i + 1}`} />

                {/* Active overlay */}
                {activeIndex === i && (
                  <div className="absolute inset-0 bg-blue-500/5" />
                )}

                {/* Page Action Overlay (Visible on Hover) */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <button 
                     onClick={(e) => { e.stopPropagation(); onRotatePage?.(i, 90); }}
                     className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-colors"
                     title="Rotate 90°"
                   >
                     <RotateCw size={12} />
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); onDuplicatePage?.(i); }}
                     className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-colors"
                     title="Duplicate Page"
                   >
                     <Copy size={12} />
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); onDeletePage?.(i); }}
                     className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                     title="Delete Page"
                   >
                     <Trash2 size={12} />
                   </button>
                </div>

                {/* Edit count badge */}
                {pageEdits[i] > 0 && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg">
                    {pageEdits[i] > 9 ? '9+' : pageEdits[i]}
                  </div>
                )}
              </div>
              <div className={`mt-1.5 text-center text-[9px] font-bold transition-colors ${selectedIndices.includes(i) ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                Page {i + 1}
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
                  ? 'bg-blue-500 ring-2 ring-blue-400/40'
                  : 'bg-white/10 hover:bg-white/25'
              }`}
            >
              {pageEdits[i] > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full" />
              )}
            </button>
          )
        ))}
      </div>

      {/* Add page placeholder */}
      {isOpen && (
        <div className="shrink-0 p-3 border-t border-white/5">
          <button
            title="Feature coming soon"
            disabled
            className="w-full py-2 rounded-xl border border-dashed border-white/10 text-slate-600 text-[10px] font-bold flex items-center justify-center gap-1.5 hover:border-white/20 transition-colors cursor-not-allowed"
          >
            <Plus size={12} /> Add Page
          </button>
        </div>
      )}
    </div>
  );
};
