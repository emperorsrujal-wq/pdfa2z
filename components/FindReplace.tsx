import * as React from 'react';
import { X, Search, Replace, Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface FindReplaceProps {
  onFind: (search: string) => Promise<any[]>;
  onReplace: (search: string, replacement: string, all: boolean) => Promise<void>;
  onClose: () => void;
}

export const FindReplace: React.FC<FindReplaceProps> = ({ onFind, onReplace, onClose }) => {
  const [search, setSearch] = React.useState('');
  const [replacement, setReplacement] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [isReplacing, setIsReplacing] = React.useState(false);
  const [results, setResults] = React.useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleSearch = async () => {
    if (!search) return;
    setIsSearching(true);
    try {
      const found = await onFind(search);
      setResults(found);
      setCurrentIndex(0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReplace = async (all: boolean) => {
    if (!search || !replacement) return;
    setIsReplacing(true);
    try {
      await onReplace(search, replacement, all);
      if (!all) {
        // Move to next result if single replace
        handleSearch();
      } else {
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReplacing(false);
    }
  };

  return (
    <div className="fixed top-24 right-8 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[600] overflow-hidden animate-in slide-in-from-right-4 duration-300">
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-indigo-500" />
          <h3 className="font-black text-slate-900 dark:text-white text-sm">Find & Replace</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <X size={18} className="text-slate-400" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Find Text</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Text to search..."
              className="w-full pl-3 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-1.5 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Replace With</label>
          <input
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="New text..."
            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {results.length > 0 && (
          <div className="flex items-center justify-between px-1 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <span className="text-[11px] font-bold text-indigo-600 px-2">
              {results.length} occurrences found
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} className="p-1 hover:bg-white rounded text-indigo-600"><ChevronLeft size={14} /></button>
              <span className="text-[10px] font-black text-indigo-400">{currentIndex + 1} / {results.length}</span>
              <button onClick={() => setCurrentIndex(i => Math.min(results.length - 1, i + 1))} className="p-1 hover:bg-white rounded text-indigo-600"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => handleReplace(false)}
            disabled={isReplacing || results.length === 0}
            className="py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-black hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            Replace
          </button>
          <button
            onClick={() => handleReplace(true)}
            disabled={isReplacing || results.length === 0}
            className="py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isReplacing ? <Loader2 size={14} className="animate-spin" /> : <Replace size={14} />}
            Replace All
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles size={10} className="text-amber-400" />
          Smart Text Layering Active
        </p>
      </div>
    </div>
  );
};
