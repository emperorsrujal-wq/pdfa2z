import * as React from 'react';
import { 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  RotateCw, 
  Type, 
  Palette,
  Layers,
  ChevronDown,
  Volume2
} from 'lucide-react';
import { Tooltip } from './Tooltip';
import { EditElement } from '../utils/pdfHelpers';

interface ObjectToolbarProps {
  element: EditElement;
  onUpdate: (id: string, updates: Partial<EditElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (element: EditElement) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
}

export const ObjectToolbar: React.FC<ObjectToolbarProps> = ({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <div className="absolute -top-16 left-0 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-white/10 text-white z-[200] animate-in slide-in-from-top-4 duration-300">
      {/* Basic Controls */}
      <div className="flex bg-white/5 rounded-xl p-1 gap-1">
        <Tooltip content="Delete this element forever.">
          <button 
            onClick={() => onDelete(element.id)}
            className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>
        </Tooltip>
        
        <Tooltip content="Duplicate this element with all its settings.">
          <button 
            onClick={() => onDuplicate(element)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <Copy size={16} />
          </button>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Styling Controls */}
      <div className="flex bg-white/5 rounded-xl p-1 gap-1">
        {(element.type === 'text' || element.type === 'rect' || element.type === 'circle' || element.type === 'line' || element.type === 'path') && (
          <div className="relative">
            <Tooltip content="Change the color of this element.">
              <button 
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all flex items-center gap-2"
              >
                <div 
                  className="w-4 h-4 rounded-full border border-white/20" 
                  style={{ backgroundColor: element.color || '#000000' }}
                />
                <ChevronDown size={12} />
              </button>
            </Tooltip>
            
            {showColorPicker && (
              <div className="absolute top-12 left-0 bg-slate-800 p-3 rounded-xl shadow-2xl border border-white/10 flex flex-wrap gap-2 w-32">
                {['#000000', '#FFFFFF', '#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'].map(c => (
                  <button
                    key={c}
                    className="w-6 h-6 rounded-full border-2 border-transparent hover:border-white transition-all shadow-sm"
                    style={{ backgroundColor: c }}
                    onClick={() => {
                      onUpdate(element.id, { color: c });
                      setShowColorPicker(false);
                    }}
                  />
                ))}
                <input 
                  type="color" 
                  value={element.color || '#000000'}
                  onChange={(e) => onUpdate(element.id, { color: e.target.value })}
                  className="w-full h-8 cursor-pointer mt-1 rounded bg-transparent"
                />
              </div>
            )}
          </div>
        )}

        {element.type === 'text' && (
          <div className="flex items-center gap-2 px-2 bg-white/5 rounded-lg">
            <span className="text-[10px] font-black opacity-50 uppercase tracking-tighter">px</span>
            <input 
              type="number"
              value={element.size || 24}
              onChange={(e) => onUpdate(element.id, { size: parseInt(e.target.value) })}
              className="w-12 bg-transparent text-sm font-bold outline-none"
            />
          </div>
        )}

        {element.type !== 'image' && element.type !== 'audio' && (
          <div className="flex items-center gap-2 px-2 bg-white/5 rounded-lg border border-white/5 group">
             <span className="text-[10px] font-black opacity-50 uppercase cursor-help" title="Opacity">%</span>
             <input 
              type="range" min="0" max="1" step="0.1"
              value={element.opacity !== undefined ? element.opacity : 1}
              onChange={(e) => onUpdate(element.id, { opacity: parseFloat(e.target.value) })}
              className="w-16 accent-indigo-500 scale-75 origin-left"
             />
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Layout & Transform */}
      <div className="flex bg-white/5 rounded-xl p-1 gap-1">
        <Tooltip content="Bring this element to the very top.">
          <button 
            onClick={() => onBringToFront(element.id)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <ArrowUp size={16} />
          </button>
        </Tooltip>

        <Tooltip content="Send this element to the very bottom.">
          <button 
            onClick={() => onSendToBack(element.id)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <ArrowDown size={16} />
          </button>
        </Tooltip>

        <Tooltip content="Rotate this element by 45 degrees.">
          <button 
            onClick={() => onUpdate(element.id, { rotation: ((element.rotation || 0) + 45) % 360 })}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <RotateCw size={16} />
          </button>
        </Tooltip>
      </div>

      {element.type === 'audio' && (
        <div className="px-3 py-1.5 flex items-center gap-2 bg-indigo-600/50 rounded-xl text-xs font-bold font-mono">
          <Volume2 size={14} className="animate-pulse" /> AUDIO CLIP
        </div>
      )}
    </div>
  );
};
