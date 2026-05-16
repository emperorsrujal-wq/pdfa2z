import * as React from 'react';
import { X, Check, Clock, AlertTriangle, Ban, Star, Stamp as StampIcon } from 'lucide-react';

interface StampPanelProps {
  onSelect: (text: string, color: string) => void;
  onClose: () => void;
}

const STAMPS = [
  { text: 'APPROVED', color: '#10B981', bg: '#D1FAE5' },
  { text: 'REJECTED', color: '#EF4444', bg: '#FEE2E2' },
  { text: 'CONFIDENTIAL', color: '#F59E0B', bg: '#FEF3C7' },
  { text: 'DRAFT', color: '#6B7280', bg: '#F3F4F6' },
  { text: 'REVIEWED', color: '#3B82F6', bg: '#DBEAFE' },
  { text: 'URGENT', color: '#DC2626', bg: '#FEE2E2' },
  { text: 'PAID', color: '#059669', bg: '#D1FAE5' },
  { text: 'COPY', color: '#8B5CF6', bg: '#EDE9FE' },
];

export const StampPanel: React.FC<StampPanelProps> = ({ onSelect, onClose }) => {
  const [customText, setCustomText] = React.useState('');
  const [customColor, setCustomColor] = React.useState('#EF4444');

  return (
    <div className="fixed inset-0 bg-black/40 z-[800] flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl p-5 w-[420px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <StampIcon size={16} className="text-blue-600" /> Stamps
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {STAMPS.map((stamp) => (
            <button
              key={stamp.text}
              onClick={() => onSelect(stamp.text, stamp.color)}
              className="flex items-center justify-center px-3 py-3 rounded-lg border-2 border-dashed hover:scale-[1.02] transition-all"
              style={{ borderColor: stamp.color, backgroundColor: stamp.bg, color: stamp.color }}
            >
              <span className="text-xs font-black tracking-widest">{stamp.text}</span>
            </button>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Custom Stamp</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="Enter stamp text..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-400"
              onKeyDown={e => { if (e.key === 'Enter' && customText.trim()) { onSelect(customText.trim(), customColor); } }}
            />
            <input
              type="color"
              value={customColor}
              onChange={e => setCustomColor(e.target.value)}
              className="w-9 h-9 rounded border border-slate-200 p-0 cursor-pointer"
            />
            <button
              onClick={() => { if (customText.trim()) onSelect(customText.trim(), customColor); }}
              disabled={!customText.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
