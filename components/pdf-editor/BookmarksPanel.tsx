import * as React from 'react';
import { Bookmark, ChevronRight, ChevronDown } from 'lucide-react';
import type { BookmarkItem } from './types';

interface BookmarksPanelProps {
  bookmarks: BookmarkItem[];
  onJumpToPage: (pageIndex: number) => void;
}

const BookmarkNode: React.FC<{
  item: BookmarkItem;
  depth: number;
  onJump: (page: number) => void;
}> = ({ item, depth, onJump }) => {
  const [expanded, setExpanded] = React.useState(true);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <button
        onClick={() => onJump(item.page)}
        className="w-full flex items-center gap-1.5 px-3 py-1.5 text-left hover:bg-slate-50 transition-colors group"
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-0.5 rounded hover:bg-slate-200 text-slate-400"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-[18px]" />
        )}
        <Bookmark size={12} className="text-slate-400 shrink-0 group-hover:text-blue-500" />
        <span className="text-xs text-slate-700 truncate flex-1">{item.title}</span>
        <span className="text-[10px] text-slate-400 shrink-0">{item.page + 1}</span>
      </button>
      {hasChildren && expanded && (
        <div>
          {item.children!.map((child, i) => (
            <BookmarkNode key={i} item={child} depth={depth + 1} onJump={onJump} />
          ))}
        </div>
      )}
    </div>
  );
};

export const BookmarksPanel: React.FC<BookmarksPanelProps> = ({ bookmarks, onJumpToPage }) => {
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Bookmark size={24} className="text-slate-300 mb-2" />
        <p className="text-xs text-slate-400">No bookmarks in this document</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {bookmarks.map((item, i) => (
        <BookmarkNode key={i} item={item} depth={0} onJump={onJumpToPage} />
      ))}
    </div>
  );
};
