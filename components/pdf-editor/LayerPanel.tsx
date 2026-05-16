import * as React from 'react';
import { Eye, EyeOff, Type, Image as ImageIcon, Shapes, MessageSquare, Link2, CheckSquare, StickyNote } from 'lucide-react';
import type { EditElement } from '../../utils/pdfHelpers';

interface LayerPanelProps {
  elements: EditElement[];
  visibleTypes: Record<string, boolean>;
  onToggleType: (type: string) => void;
}

const LAYER_GROUPS = [
  { id: 'text', label: 'Text', icon: <Type size={13} />, match: ['text'] },
  { id: 'image', label: 'Images', icon: <ImageIcon size={13} />, match: ['image'] },
  { id: 'shape', label: 'Shapes', icon: <Shapes size={13} />, match: ['rect', 'circle', 'ellipse', 'line', 'arrow', 'path'] },
  { id: 'annotate', label: 'Annotations', icon: <MessageSquare size={13} />, match: ['highlight', 'strikeout', 'underline', 'squiggly'] },
  { id: 'form', label: 'Form Fields', icon: <CheckSquare size={13} />, match: ['form-text', 'form-check', 'form-radio', 'form-select', 'form-textarea', 'form-signature'] },
  { id: 'link', label: 'Links', icon: <Link2 size={13} />, match: ['link'] },
  { id: 'note', label: 'Comments', icon: <StickyNote size={13} />, match: ['sticky-note', 'comment'] },
];

export const LayerPanel: React.FC<LayerPanelProps> = ({ elements, visibleTypes, onToggleType }) => {
  const counts = React.useMemo(() => {
    const c: Record<string, number> = {};
    LAYER_GROUPS.forEach(g => {
      c[g.id] = elements.filter(e => g.match.includes(e.type)).length;
    });
    return c;
  }, [elements]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
      {LAYER_GROUPS.map(group => (
        <button
          key={group.id}
          onClick={() => onToggleType(group.id)}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left mb-0.5"
        >
          {visibleTypes[group.id] !== false ? (
            <Eye size={13} className="text-blue-500 shrink-0" />
          ) : (
            <EyeOff size={13} className="text-slate-300 shrink-0" />
          )}
          <span className="text-slate-400 shrink-0">{group.icon}</span>
          <span className={`text-xs font-medium flex-1 ${visibleTypes[group.id] !== false ? 'text-slate-700' : 'text-slate-400'}`}>
            {group.label}
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{counts[group.id] || 0}</span>
        </button>
      ))}
    </div>
  );
};
