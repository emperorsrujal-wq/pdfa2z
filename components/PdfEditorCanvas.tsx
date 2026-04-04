import * as React from 'react';
import { 
  Type, 
  PenTool, 
  Eraser, 
  MousePointer2, 
  Square, 
  Circle as CircleIcon, 
  Minus, 
  Image as ImageIcon,
  RotateCw,
  Undo2,
  Redo2,
  Zap,
  Pipette,
  Mic,
  Volume2,
  Trash2
} from 'lucide-react';
import { EditElement, EditElementType, extractStyleAtPoint } from '../utils/pdfHelpers';
import { ObjectToolbar } from './ObjectToolbar';
import { Tooltip } from './Tooltip';
import { FloatingToolbar } from './FloatingToolbar';

interface PdfEditorCanvasProps {
  image: string;
  pageIndex: number;
  initialElements: EditElement[];
  onSave: (elements: EditElement[]) => void;
  onCancel: () => void;
  isEmbedded?: boolean;
}

type EditorMode = 'select' | 'text' | 'draw' | 'erase' | 'rect' | 'circle' | 'line' | 'image' | 'audio' | 'picker' | 'magic-edit' | 'highlight' | 'strikeout' | 'underline' | 'link' | 'forms' | 'sign';

export const PdfEditorCanvas: React.FC<PdfEditorCanvasProps> = ({
  image,
  pageIndex,
  initialElements,
  onSave,
  onCancel,
  isEmbedded = false
}) => {
  const [elements, setElements] = React.useState<EditElement[]>(initialElements);
  const [history, setHistory] = React.useState<EditElement[][]>([initialElements]);
  const [historyStep, setHistoryStep] = React.useState(0);

  const [mode, setMode] = React.useState<EditorMode>('select');
  const [currentColor, setCurrentColor] = React.useState('#000000');
  const [currentSize, setCurrentSize] = React.useState(24);
  const [strokeWidth, setStrokeWidth] = React.useState(5);

  const [activeElementId, setActiveElementId] = React.useState<string | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState<{ x: number, y: number }[]>([]);
  const [dragStart, setDragStart] = React.useState<{ x: number, y: number } | null>(null);
  const [dragEnd, setDragEnd] = React.useState<{ x: number, y: number } | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setElements(initialElements);
    setHistory([initialElements]);
    setHistoryStep(0);
  }, [initialElements, pageIndex]);

  const addToHistory = (newElements: EditElement[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    onSave(newElements);
  };

  const undo = () => {
    if (historyStep > 0) {
      const prev = history[historyStep - 1];
      setElements(prev);
      setHistoryStep(historyStep - 1);
      onSave(prev);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const next = history[historyStep + 1];
      setElements(next);
      setHistoryStep(historyStep + 1);
      onSave(next);
    }
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = Math.max(0, Math.min(1000, ((clientX - rect.left) / rect.width) * 1000));
    const y = Math.max(0, Math.min(1000, ((clientY - rect.top) / rect.height) * 1000));
    return { x, y };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);

    switch (mode) {
      case 'picker': {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = image;
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const pixel = ctx?.getImageData((pos.x / 1000) * img.width, (pos.y / 1000) * img.height, 1, 1).data;
          if (pixel) {
            const hex = "#" + ("000000" + ((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16)).slice(-6);
            setCurrentColor(hex);
            setMode('select');
          }
        };
        break;
      }
      case 'text': {
        const newEl: EditElement = {
          id: `txt-${Date.now()}`,
          type: 'text',
          pageIndex,
          x: pos.x,
          y: pos.y,
          color: currentColor,
          text: 'New Text',
          size: currentSize,
          opacity: 1,
          rotation: 0
        };
        const next = [...elements, newEl];
        setElements(next);
        addToHistory(next);
        setActiveElementId(newEl.id);
        setMode('select');
        break;
      }
      case 'rect':
      case 'circle': {
        const newEl: EditElement = {
          id: `${mode}-${Date.now()}`,
          type: mode,
          pageIndex,
          x: pos.x,
          y: pos.y,
          width: 100,
          height: 100,
          color: currentColor,
          opacity: 0.5,
          rotation: 0
        };
        const next = [...elements, newEl];
        setElements(next);
        addToHistory(next);
        setActiveElementId(newEl.id);
        setMode('select');
        break;
      }
      case 'magic-edit':
      case 'highlight':
      case 'strikeout':
      case 'underline': {
        setIsDrawing(true);
        setDragStart(pos);
        setDragEnd(pos);
        break;
      }
      case 'draw':
      case 'line': {
        setIsDrawing(true);
        setCurrentPath([pos]);
        break;
      }
      case 'audio': {
        const newEl: EditElement = { id: `audio-${Date.now()}`, type: 'audio', pageIndex, x: pos.x, y: pos.y, opacity: 1, audioData: "recording_placeholder" };
        const next = [...elements, newEl]; setElements(next); addToHistory(next); setMode('select');
        break;
      }
      case 'forms': {
        const newEl: EditElement = {
          id: `form-${Date.now()}`,
          type: 'form-check',
          pageIndex,
          x: pos.x,
          y: pos.y,
          width: 30,
          height: 30,
          isChecked: false,
          color: '#000000',
          opacity: 1
        };
        const next = [...elements, newEl];
        setElements(next);
        addToHistory(next);
        setActiveElementId(newEl.id);
        setMode('select');
        break;
      }
      case 'select': {
        setActiveElementId(null);
        break;
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDrawing) {
      const pos = getPos(e);
      if (['magic-edit', 'highlight', 'strikeout', 'underline'].includes(mode)) {
        setDragEnd(pos);
      } else if (mode === 'line') {
        setCurrentPath([currentPath[0], pos]);
      } else {
        setCurrentPath(prev => [...prev, pos]);
      }
    }
  };

  const handlePointerUp = async () => {
    if (isDrawing) {
      if (['magic-edit', 'highlight', 'strikeout', 'underline'].includes(mode) && dragStart && dragEnd) {
        const x = Math.min(dragStart.x, dragEnd.x);
        const y = Math.min(dragStart.y, dragEnd.y);
        const w = Math.abs(dragStart.x - dragEnd.x);
        const h = Math.abs(dragStart.y - dragEnd.y);

        if (w > 2 && h > 2) {
          if (mode === 'magic-edit') {
            const file = new File([], "doc.pdf");
            const style = await extractStyleAtPoint(file, pageIndex, x + w / 2, y + h / 2, image);
            const mask: EditElement = { id: `mask-${Date.now()}`, type: 'rect', pageIndex, x, y, width: w, height: h, color: style.backgroundColor, opacity: 1 };
            const text: EditElement = { id: `magic-txt-${Date.now()}`, type: 'text', pageIndex, x, y: y + h / 2 - style.fontSize / 16 * 10, width: w, height: h, color: style.color, text: '', size: style.fontSize, opacity: 1 };
            const next = [...elements, mask, text]; setElements(next); addToHistory(next); setActiveElementId(text.id); setMode('select');
          } else {
            const type = mode as EditElementType;
            const newEl: EditElement = { id: `${type}-${Date.now()}`, type, pageIndex, x, y, width: w, height: h, color: type === 'highlight' ? '#fbff00' : '#000000', opacity: type === 'highlight' ? 0.35 : 1 };
            const next = [...elements, newEl]; setElements(next); addToHistory(next); setMode('select');
          }
        }
      } else if (currentPath.length > 1) {
        let newEl: EditElement;
        if (mode === 'line') {
          const p1 = currentPath[0]; const p2 = currentPath[1];
          newEl = { id: `line-${Date.now()}`, type: 'line', pageIndex, x: p1.x, y: p1.y, width: p2.x - p1.x, height: p2.y - p1.y, color: currentColor, strokeWidth: strokeWidth, opacity: 1 };
        } else {
          newEl = { id: `path-${Date.now()}`, type: 'path', pageIndex, x: 0, y: 0, color: currentColor, strokeWidth: strokeWidth, path: currentPath, opacity: 1 };
        }
        const next = [...elements, newEl]; setElements(next); addToHistory(next);
      }
    }
    setIsDrawing(false); setCurrentPath([]); setDragStart(null); setDragEnd(null);
  };

  const updateElement = (id: string, updates: Partial<EditElement>) => {
    const next = elements.map(el => el.id === id ? { ...el, ...updates } : el);
    setElements(next);
    onSave(next);
  };

  const deleteElement = (id: string) => {
    const next = elements.filter(el => el.id !== id);
    setElements(next);
    addToHistory(next);
    setActiveElementId(null);
  };

  const duplicateElement = (el: EditElement) => {
    const newEl = { ...el, id: `${el.id}-copy`, x: el.x + 20, y: el.y + 20 };
    const next = [...elements, newEl];
    setElements(next);
    addToHistory(next);
    setActiveElementId(newEl.id);
  };

  const bringToFront = (id: string) => {
     const idx = elements.findIndex(el => el.id === id);
     if (idx === -1) return;
     const newElements = [...elements];
     const [el] = newElements.splice(idx, 1);
     newElements.push(el);
     setElements(newElements);
     addToHistory(newElements);
  };

  const sendToBack = (id: string) => {
     const idx = elements.findIndex(el => el.id === id);
     if (idx === -1) return;
     const newElements = [...elements];
     const [el] = newElements.splice(idx, 1);
     newElements.unshift(el);
     setElements(newElements);
     addToHistory(newElements);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const base64 = re.target?.result as string;
        const newEl: EditElement = { id: `img-${Date.now()}`, type: 'image', pageIndex, x: 400, y: 400, width: 200, height: 150, imageUrl: base64, opacity: 1, rotation: 0 };
        const next = [...elements, newEl]; setElements(next); addToHistory(next); setActiveElementId(newEl.id); setMode('select');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-slate-50 relative overflow-hidden select-none">
      <FloatingToolbar 
        mode={mode} 
        setMode={setMode} 
        onImageUpload={() => document.getElementById('img-upload')?.click()} 
      />
      <input id="img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      <div className="flex-1 flex items-start justify-center min-h-0 p-8 overflow-y-auto">
        <div
          ref={containerRef}
          className={`relative bg-white shadow-2xl rounded-sm max-h-full aspect-[1/1.414] overflow-hidden select-none touch-none ${
            mode === 'text' ? 'cursor-text' : 
            (mode === 'draw' || mode === 'line') ? 'cursor-crosshair' : 
            mode === 'erase' ? 'cursor-alias' : 'cursor-default'
          }`}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <img src={image} className="w-full h-full object-contain pointer-events-none text-transparent" alt="PDF Page" />
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {elements.map(el => {
               if (el.type === 'path' && el.path) {
                 return (
                  <polyline key={el.id} points={el.path.map(p => `${(p.x/1000)*100}%,${(p.y/1000)*100}%`).join(' ')} fill="none" stroke={el.color} strokeWidth={el.strokeWidth ? `${el.strokeWidth/10}%` : "0.5%"} strokeLinecap="round" strokeLinejoin="round" opacity={el.opacity} />
                 );
               }
               if (el.type === 'line') {
                  return (
                    <line key={el.id} x1={`${el.x/10}%`} y1={`${el.y/10}%`} x2={`${(el.x + (el.width || 0))/10}%`} y2={`${(el.y + (el.height || 0))/10}%`} stroke={el.color} strokeWidth={el.strokeWidth ? `${el.strokeWidth/10}%` : "0.5%"} opacity={el.opacity} />
                  );
               }
               return null;
            })}
            
            {isDrawing && currentPath.length > 0 && (
              mode === 'line' ? (
                <line x1={`${currentPath[0].x/10}%`} y1={`${currentPath[0].y/10}%`} x2={`${(currentPath[1]?.x || currentPath[0].x)/10}%`} y2={`${(currentPath[1]?.y || currentPath[0].y)/10}%`} stroke={currentColor} strokeWidth={`${strokeWidth/10}%`} />
              ) : (
                <polyline points={currentPath.map(p => `${(p.x/1000)*100}%,${(p.y/1000)*100}%`).join(' ')} fill="none" stroke={currentColor} strokeWidth={`${strokeWidth/10}%`} strokeLinecap="round" strokeLinejoin="round" />
              )
            )}

            {['magic-edit', 'highlight', 'strikeout', 'underline'].includes(mode) && isDrawing && dragStart && dragEnd && (
              <rect x={`${Math.min(dragStart.x, dragEnd.x) / 10}%`} y={`${Math.min(dragStart.y, dragEnd.y) / 10}%`} width={`${Math.abs(dragStart.x - dragEnd.x) / 10}%`} height={`${Math.abs(dragStart.y - dragEnd.y) / 10}%`} fill={mode === 'highlight' ? 'rgba(251, 255, 0, 0.3)' : 'rgba(99, 102, 241, 0.2)'} stroke={mode === 'highlight' ? '#fbff00' : '#6366f1'} strokeWidth="1" strokeDasharray="4 4" />
            )}
          </svg>

          {elements.map(el => {
             if (['text', 'rect', 'circle', 'image', 'audio', 'highlight', 'strikeout', 'underline'].includes(el.type)) {
               const isActive = activeElementId === el.id;
               return (
                 <div
                   key={el.id}
                   className={`absolute ${isActive ? 'ring-2 ring-indigo-500 z-50 shadow-2xl bg-white/5' : ''} ${mode === 'erase' ? 'hover:bg-red-500/20' : ''}`}
                   style={{
                     left: `${el.x / 10}%`,
                     top: `${el.y / 10}%`,
                     width: el.width ? `${el.width / 10}%` : 'auto',
                     height: el.height ? `${el.height / 10}%` : 'auto',
                     transform: `rotate(${el.rotation || 0}deg)`,
                     transformOrigin: 'top left',
                     cursor: mode === 'select' ? 'move' : mode === 'erase' ? 'alias' : 'default',
                     opacity: el.opacity,
                     zIndex: isActive ? 100 : undefined
                   }}
                   onPointerDown={(e) => {
                     if (mode !== 'select' && mode !== 'erase') return;
                     e.stopPropagation();
                     if (mode === 'erase') { deleteElement(el.id); return; }
                     setActiveElementId(el.id);
                     const startX = (e as React.MouseEvent).clientX; const startY = (e as React.MouseEvent).clientY;
                     const startElX = el.x; const startElY = el.y;
                     const onMove = (moveEvent: PointerEvent) => {
                       if (!containerRef.current) return;
                       const rect = containerRef.current.getBoundingClientRect();
                       const dx = ((moveEvent.clientX - startX) / rect.width) * 1000;
                       const dy = ((moveEvent.clientY - startY) / rect.height) * 1000;
                       updateElement(el.id, { x: Math.max(0, Math.min(1000, startElX + dx)), y: Math.max(0, Math.min(1000, startElY + dy)) });
                     };
                     const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); addToHistory([...elements]); };
                     window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                   }}
                 >
                   {isActive && (
                      <ObjectToolbar element={el} onUpdate={updateElement} onDelete={deleteElement} onDuplicate={duplicateElement} onBringToFront={bringToFront} onSendToBack={sendToBack} />
                   )}

                   {el.type === 'text' && (
                     <div className="w-full h-full min-w-[20px] min-h-[20px]">
                        {isActive ? (
                          <input autoFocus type="text" value={el.text || ''} onChange={(e) => updateElement(el.id, { text: e.target.value })} className="bg-transparent border-none outline-none w-full h-full font-bold" style={{ color: el.color, fontSize: `${(el.size || 24)/8}px` }} />
                        ) : (
                          <span style={{ color: el.color, fontSize: `${(el.size || 24)/8}px` }} className="font-bold whitespace-nowrap">{el.text}</span>
                        )}
                     </div>
                   )}

                   {el.type === 'rect' && <div className="w-full h-full" style={{ backgroundColor: el.color }} />}
                   {el.type === 'highlight' && <div className="w-full h-full" style={{ backgroundColor: el.color, opacity: 0.35 }} />}
                   {el.type === 'strikeout' && <div className="w-full h-[2px] bg-current absolute top-1/2 -translate-y-1/2" style={{ color: el.color }} />}
                   {el.type === 'underline' && <div className="w-full h-[2px] bg-current absolute bottom-0" style={{ color: el.color }} />}
                   {el.type === 'circle' && <div className="w-full h-full rounded-full" style={{ backgroundColor: el.color }} />}
                   {el.type === 'form-check' && (
                      <div 
                        className={`w-full h-full border-2 border-slate-900 rounded flex items-center justify-center bg-white cursor-pointer hover:bg-slate-50`}
                        onClick={() => updateElement(el.id, { isChecked: !el.isChecked })}
                      >
                         {el.isChecked && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-4/5 h-4/5 text-indigo-600">
                               <polyline points="20 6 9 17 4 12" />
                            </svg>
                         )}
                      </div>
                   )}

                   {el.type === 'form-text' && (
                      <textarea 
                         className="w-full h-full border-2 border-slate-300 rounded p-1 text-[10px] resize-none focus:border-indigo-500 outline-none"
                         placeholder="Form Text Area..."
                         value={el.text || ''}
                         onChange={(e) => updateElement(el.id, { text: e.target.value })}
                      />
                   )}
                   {el.type === 'audio' && <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl animate-pulse"><Volume2 size={24} /></div>}

                   {isActive && (el.type !== 'text') && (
                      <div 
                        className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-600 border-2 border-white rounded-full cursor-nwse-resize transform translate-x-1/2 translate-y-1/2"
                        onPointerDown={(e) => {
                           e.stopPropagation();
                           const startX = (e as React.MouseEvent).clientX; const startY = (e as React.MouseEvent).clientY;
                           const startW = el.width || 0; const startH = el.height || 0;
                           const onMove = (me: PointerEvent) => {
                             if (!containerRef.current) return;
                             const rect = containerRef.current.getBoundingClientRect();
                             const dw = ((me.clientX - startX) / rect.width) * 1000; const dh = ((me.clientY - startY) / rect.height) * 1000;
                             updateElement(el.id, { width: Math.max(20, startW + dw), height: Math.max(20, startH + dh) });
                           };
                           const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); addToHistory([...elements]); };
                           window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                        }}
                      />
                   )}
                 </div>
               );
             }
             return null;
          })}
        </div>
      </div>
    </div>
  );
};
