import * as React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface PdfThumbnailSidebarProps {
  images: string[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
  pageEdits: Record<number, number>;
}

export const PdfThumbnailSidebar: React.FC<PdfThumbnailSidebarProps> = ({
  images,
  activeIndex,
  onSelect,
  pageEdits
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div 
      className={`relative h-full bg-slate-50 border-r transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-12'
      }`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-10 z-10 bg-white border shadow-md rounded-full p-1 text-slate-400 hover:text-indigo-600 transition-colors"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${!isOpen && 'hidden'}`}>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 px-2">Pages</h3>
        {images.map((img, i) => (
          <div 
            key={i}
            onClick={() => onSelect(i)}
            className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all p-1 ${
              activeIndex === i 
                ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                : 'border-transparent hover:border-slate-300'
            }`}
          >
            <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-sm relative">
               <img src={img} className="w-full h-full object-contain" alt={`Thumbnail ${i+1}`} />
               
               {pageEdits[i] > 0 && (
                <div className="absolute top-1 right-1 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                  {pageEdits[i]}
                </div>
               )}
            </div>
            <div className="mt-1 text-center text-[10px] font-bold text-slate-500">Page {i + 1}</div>
          </div>
        ))}
      </div>

      {!isOpen && (
        <div className="flex-1 flex flex-col items-center pt-10 gap-4">
          {images.map((_, i) => (
            <div 
              key={i}
              onClick={() => onSelect(i)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                activeIndex === i ? 'bg-indigo-600 ring-2 ring-indigo-200' : 'bg-slate-300 hover:bg-slate-400'
              }`}
              title={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
