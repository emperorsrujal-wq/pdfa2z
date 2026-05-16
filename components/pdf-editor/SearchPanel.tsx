import * as React from 'react';
import { Search, X, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { findTextPositions, RedactionArea } from '../../utils/pdfHelpers';

interface SearchPanelProps {
  file: File;
  totalPages: number;
  onJumpToResult: (pageIndex: number, x: number, y: number) => void;
  onClose: () => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  file,
  totalPages,
  onJumpToResult,
  onClose,
}) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<RedactionArea[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(-1);
  const [isSearching, setIsSearching] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const performSearch = React.useCallback(async () => {
    if (!query.trim() || !file) return;
    setIsSearching(true);
    try {
      const buffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(buffer);
      const allResults: RedactionArea[] = [];
      for (let i = 0; i < totalPages; i++) {
        const pageResults = await findTextPositions(pdfBytes, i, [query]);
        allResults.push(...pageResults);
      }
      setResults(allResults);
      setCurrentIndex(allResults.length > 0 ? 0 : -1);
    } catch (e) {
      console.warn('Search failed:', e);
    } finally {
      setIsSearching(false);
    }
  }, [query, file, totalPages]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 400);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const goToResult = (index: number) => {
    if (index < 0 || index >= results.length) return;
    setCurrentIndex(index);
    const r = results[index];
    onJumpToResult(r.pageIndex, r.x, r.y);
  };

  const goNext = () => goToResult(currentIndex + 1);
  const goPrev = () => goToResult(currentIndex - 1);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') goNext();
      if (e.key === 'F3' || (e.shiftKey && e.key === 'Enter')) {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, results]);

  return (
    <div className="absolute top-14 right-0 w-80 bg-white border-l border-b border-slate-200 shadow-xl z-[400] flex flex-col max-h-[70vh]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
        <Search size={14} className="text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in document..."
          className="flex-1 text-sm outline-none text-slate-700 placeholder:text-slate-400"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>

      {results.length > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-slate-50">
          <span className="text-xs text-slate-500">{results.length} results</span>
          <div className="flex items-center gap-1">
            <button onClick={goPrev} disabled={currentIndex <= 0} className="p-1 rounded hover:bg-slate-200 disabled:opacity-30">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-slate-600 w-12 text-center">{currentIndex + 1} / {results.length}</span>
            <button onClick={goNext} disabled={currentIndex >= results.length - 1} className="p-1 rounded hover:bg-slate-200 disabled:opacity-30">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isSearching && results.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-400">Searching...</div>
        )}
        {!isSearching && query && results.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-400">No results found</div>
        )}
        {results.map((r, i) => (
          <button
            key={`${r.pageIndex}-${i}`}
            onClick={() => goToResult(i)}
            className={`w-full text-left px-3 py-2 border-b border-slate-50 hover:bg-slate-50 transition-colors ${i === currentIndex ? 'bg-blue-50' : ''}`}
          >
            <div className="flex items-center gap-2">
              <FileText size={12} className="text-slate-400 shrink-0" />
              <span className="text-xs font-medium text-slate-600">Page {r.pageIndex + 1}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{query}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
