import * as React from 'react';
import { Type, PenTool, Eraser, Check, X, MousePointer2, Trash2, Maximize } from 'lucide-react';
import { EditElement, EditElementType } from '../utils/pdfHelpers';

interface PdfEditorCanvasProps {
  image: string;
  pageIndex: number;
  initialElements: EditElement[];
  onSave: (elements: EditElement[]) => void;
  onCancel: () => void;
}

export const PdfEditorCanvas: React.FC<PdfEditorCanvasProps> = ({
  image,
  pageIndex,
  initialElements,
  onSave,
  onCancel
}) => {
  const [elements, setElements] = React.useState<EditElement[]>(initialElements);
  const [mode, setMode] = React.useState<'select' | 'text' | 'draw' | 'erase'>('select');
  const [currentColor, setCurrentColor] = React.useState('#000000');
  const [currentSize, setCurrentSize] = React.useState(24);
  const [strokeWidth, setStrokeWidth] = React.useState(5);

  const [activeElementId, setActiveElementId] = React.useState<string | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState<{ x: number, y: number }[]>([]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    // Normalizing to 0-1000
    const x = Math.max(0, Math.min(1000, ((clientX - rect.left) / rect.width) * 1000));
    const y = Math.max(0, Math.min(1000, ((clientY - rect.top) / rect.height) * 1000));
    return { x, y };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode === 'text') {
      const pos = getPos(e);
      const newEl: EditElement = {
        id: Date.now().toString(),
        type: 'text',
        pageIndex,
        x: pos.x,
        y: pos.y,
        color: currentColor,
        text: 'New Text',
        size: currentSize
      };
      setElements([...elements, newEl]);
      setActiveElementId(newEl.id);
      setMode('select');
      return;
    }

    if (mode === 'draw') {
      const pos = getPos(e);
      setIsDrawing(true);
      setCurrentPath([pos]);
      return;
    }

    if (mode === 'select') {
      // Background click
      setActiveElementId(null);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDrawing && mode === 'draw') {
      const pos = getPos(e);
      setCurrentPath(prev => [...prev, pos]);
    }
  };

  const handlePointerUp = () => {
    if (isDrawing && mode === 'draw' && currentPath.length > 1) {
      const newEl: EditElement = {
        id: Date.now().toString(),
        type: 'path',
        pageIndex,
        x: 0, 
        y: 0,
        color: currentColor,
        strokeWidth: strokeWidth,
        path: currentPath
      };
      setElements([...elements, newEl]);
    }
    setIsDrawing(false);
    setCurrentPath([]);
  };

  const updateElement = (id: string, updates: Partial<EditElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setActiveElementId(null);
  };

  // Erase mode handling
  const handleEraseClick = (id: string) => {
    if (mode === 'erase') {
      deleteElement(id);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 text-white max-w-6xl mx-auto w-full">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Type className="text-indigo-400" />
            Edit Page {pageIndex + 1}
          </h2>
          <p className="text-slate-400 text-sm font-medium">Add text, draw, and customize elements.</p>
        </div>

        {/* Toolbar */}
        <div className="flex bg-slate-800 p-2 rounded-2xl gap-2 shadow-xl border border-slate-700 overflow-x-auto">
          <button onClick={() => setMode('select')} className={`p-3 rounded-xl transition-all ${mode === 'select' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Select">
            <MousePointer2 size={20} />
          </button>
          <button onClick={() => setMode('text')} className={`p-3 rounded-xl transition-all ${mode === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Add Text">
            <Type size={20} />
          </button>
          <button onClick={() => setMode('draw')} className={`p-3 rounded-xl transition-all ${mode === 'draw' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Draw">
            <PenTool size={20} />
          </button>
          <button onClick={() => setMode('erase')} className={`p-3 rounded-xl transition-all ${mode === 'erase' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`} title="Eraser">
            <Eraser size={20} />
          </button>

          <div className="w-px h-8 bg-slate-700 self-center mx-2" />

          {/* Color Picker */}
          <input 
            type="color" 
            value={currentColor} 
            onChange={e => setCurrentColor(e.target.value)}
            className="w-10 h-10 rounded-xl cursor-pointer bg-slate-800 border-2 border-slate-700 self-center"
            title="Color"
          />

          <div className="w-px h-8 bg-slate-700 self-center mx-2" />
          
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-bold text-slate-400">Size/Thickness</span>
            <input 
              type="range" min="1" max="100" 
              value={mode === 'draw' ? strokeWidth : currentSize} 
              onChange={e => mode === 'draw' ? setStrokeWidth(Number(e.target.value)) : setCurrentSize(Number(e.target.value))}
              className="w-24 accent-indigo-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all flex items-center gap-2">
            <X size={18} /> Cancel
          </button>
          <button onClick={() => onSave(elements)} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
            <Check size={18} /> Apply Edits
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <div
          ref={containerRef}
          className={`relative bg-white shadow-2xl rounded-sm max-h-full aspect-[1/1.414] overflow-hidden ${
            mode === 'text' ? 'cursor-text' : 
            mode === 'draw' ? 'cursor-crosshair' : 
            mode === 'erase' ? 'cursor-alias' : 'cursor-default'
          }`}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <img src={image} className="w-full h-full object-contain pointer-events-none select-none" alt="PDF Page" />
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Render saved paths */}
            {elements.filter(el => el.type === 'path').map(el => (
              <polyline
                key={el.id}
                points={(el.path || []).map(p => `${(p.x/1000)*100}%,${(p.y/1000)*100}%`).join(' ')}
                fill="none"
                stroke={el.color}
                strokeWidth={el.strokeWidth ? `${el.strokeWidth/10}%` : "0.5%"}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={mode === 'erase' ? 'pointer-events-auto cursor-alias hover:opacity-50 transition-opacity' : ''}
                onClick={mode === 'erase' ? (e) => { e.stopPropagation(); handleEraseClick(el.id); } : undefined}
              />
            ))}
            
            {/* Render current drawing path */}
            {isDrawing && mode === 'draw' && currentPath.length > 0 && (
              <polyline
                points={currentPath.map(p => `${(p.x/1000)*100}%,${(p.y/1000)*100}%`).join(' ')}
                fill="none"
                stroke={currentColor}
                strokeWidth={`${strokeWidth/10}%`}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>

          {/* Render Text Elements */}
          {elements.filter(el => el.type === 'text').map(el => (
            <div
              key={el.id}
              className={`absolute -translate-y-full ${activeElementId === el.id ? 'ring-2 ring-indigo-500 rounded p-1 bg-indigo-50/50' : ''}`}
              style={{
                left: `${el.x / 10}%`,
                top: `${el.y / 10}%`,
                color: el.color,
                fontSize: `${(el.size || 24)/10}vw`, // Responsive font size mapping
                whiteSpace: 'nowrap',
                maxWidth: '100%',
                cursor: mode === 'select' ? 'move' : mode === 'erase' ? 'alias' : 'default',
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (mode === 'erase') {
                  handleEraseClick(el.id);
                } else if (mode === 'select') {
                  setActiveElementId(el.id);
                }
              }}
              onPointerDown={(e) => {
                if (mode !== 'select') return;
                e.stopPropagation();
                setActiveElementId(el.id);
                // Basic Drag Handling
                const startX = e.clientX;
                const startY = e.clientY;
                const startElX = el.x;
                const startElY = el.y;

                const onMove = (moveEvent: PointerEvent) => {
                  if (!containerRef.current) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  const dx = ((moveEvent.clientX - startX) / rect.width) * 1000;
                  const dy = ((moveEvent.clientY - startY) / rect.height) * 1000;
                  updateElement(el.id, {
                    x: Math.max(0, Math.min(1000, startElX + dx)),
                    y: Math.max(0, Math.min(1000, startElY + dy))
                  });
                };
                
                const onUp = () => {
                  window.removeEventListener('pointermove', onMove);
                  window.removeEventListener('pointerup', onUp);
                };
                
                window.addEventListener('pointermove', onMove);
                window.addEventListener('pointerup', onUp);
              }}
            >
              {activeElementId === el.id ? (
                <>
                  <input 
                    autoFocus
                    type="text"
                    value={el.text || ''}
                    onChange={(e) => updateElement(el.id, { text: e.target.value })}
                    className="bg-transparent border-none outline-none font-inherit text-inherit w-auto min-w-[20px] max-w-full"
                    style={{ color: 'inherit' }}
                  />
                  <button 
                    onClick={() => deleteElement(el.id)}
                    className="absolute -top-6 -right-6 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors pointer-events-auto"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              ) : (
                <span className="pointer-events-none select-none">{el.text}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
