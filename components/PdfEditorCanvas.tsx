import * as React from 'react';
import { 
  Type, 
  PenTool, 
  Eraser, 
  Check, 
  X, 
  MousePointer2, 
  Square, 
  Circle as CircleIcon, 
  Minus, 
  Image as ImageIcon,
  RotateCw,
  Undo2,
  Redo2,
  Plus,
  Zap,
  Pipette,
  Volume2,
  Mic,
  Trash2
} from 'lucide-react';
import { EditElement, EditElementType } from '../utils/pdfHelpers';
import { ObjectToolbar } from './ObjectToolbar';
import { Tooltip } from './Tooltip';
import { extractStyleAtPoint } from '../utils/pdfHelpers';

interface PdfEditorCanvasProps {
  image: string;
  pageIndex: number;
  initialElements: EditElement[];
  onSave: (elements: EditElement[]) => void;
  onCancel: () => void;
  isEmbedded?: boolean;
}

type EditorMode = 'select' | 'text' | 'draw' | 'erase' | 'rect' | 'circle' | 'line' | 'image' | 'audio' | 'picker' | 'magic-edit';

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

  // Sync internal elements when initialElements change (e.g. page switch)
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
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

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
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const x = (pos.x / 1000) * img.width;
            const y = (pos.y / 1000) * img.height;
            const pixel = ctx?.getImageData(x, y, 1, 1).data;
            if (pixel) {
              const hex = "#" + ("000000" + ((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16)).slice(-6);
              setCurrentColor(hex);
              const brightness = (pixel[0] * 299 + pixel[1] * 587 + pixel[2] * 114) / 1000;
              if (brightness < 128) setCurrentSize(32);
              else setCurrentSize(22);
              setMode('select');
            }
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
      case 'magic-edit': {
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
        const newEl: EditElement = {
          id: `audio-${Date.now()}`,
          type: 'audio',
          pageIndex,
          x: pos.x,
          y: pos.y,
          opacity: 1,
          audioData: "recording_placeholder"
        };
        const next = [...elements, newEl];
        setElements(next);
        addToHistory(next);
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
      if (mode === 'magic-edit') {
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
      if (mode === 'magic-edit' && dragStart && dragEnd) {
        const x = Math.min(dragStart.x, dragEnd.x);
        const y = Math.min(dragStart.y, dragEnd.y);
        const w = Math.abs(dragStart.x - dragEnd.x);
        const h = Math.abs(dragStart.y - dragEnd.y);

        if (w > 5 && h > 5) {
          // 1. Detect Style & BG
          const file = new File([], "doc.pdf"); // Placeholder - ideally actual file
          const style = await extractStyleAtPoint(file, pageIndex, x + w / 2, y + h / 2, image);

          // 2. Create Mask (Rect)
          const maskId = `mask-${Date.now()}`;
          const mask: EditElement = {
            id: maskId,
            type: 'rect',
            pageIndex,
            x, y, width: w, height: h,
            color: style.backgroundColor,
            opacity: 1,
            rotation: 0
          };

          // 3. Create Text (Replacer)
          const text: EditElement = {
            id: `magic-txt-${Date.now()}`,
            type: 'text',
            pageIndex,
            x, y: y + h / 2 - style.fontSize / 16 * 10,
            width: w,
            height: h,
            color: style.color,
            text: '',
            size: style.fontSize,
            opacity: 1,
            rotation: 0
          };

          const next = [...elements, mask, text];
          setElements(next);
          addToHistory(next);
          setActiveElementId(text.id);
          setMode('select');
        }
      } else if (currentPath.length > 1) {
        let newEl: EditElement;
        if (mode === 'line') {
          const p1 = currentPath[0];
          const p2 = currentPath[1];
          newEl = {
            id: `line-${Date.now()}`,
            type: 'line',
            pageIndex,
            x: p1.x,
            y: p1.y,
            width: p2.x - p1.x,
            height: p2.y - p1.y,
            color: currentColor,
            strokeWidth: strokeWidth,
            opacity: 1
          };
        } else {
          newEl = {
            id: `path-${Date.now()}`,
            type: 'path',
            pageIndex,
            x: 0, 
            y: 0,
            color: currentColor,
            strokeWidth: strokeWidth,
            path: currentPath,
            opacity: 1
          };
        }
        const next = [...elements, newEl];
        setElements(next);
        addToHistory(next);
      }
    }
    setIsDrawing(false);
    setCurrentPath([]);
    setDragStart(null);
    setDragEnd(null);
  };

  const updateElement = (id: string, updates: Partial<EditElement>) => {
    if (updates.x !== undefined && Math.abs(updates.x - 500) < 10) updates.x = 500; 
    if (updates.y !== undefined && Math.abs(updates.y - 500) < 10) updates.y = 500; 

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
        const newEl: EditElement = {
          id: `img-${Date.now()}`,
          type: 'image',
          pageIndex,
          x: 400, y: 400, width: 200, height: 150,
          imageUrl: base64,
          opacity: 1, rotation: 0
        };
        const next = [...elements, newEl];
        setElements(next);
        addToHistory(next);
        setActiveElementId(newEl.id);
        setMode('select');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`flex flex-col h-full w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex bg-slate-800/50 p-1 rounded-xl gap-1 shrink-0">
          <Tooltip content="Select and move elements around the page.">
            <button onClick={() => setMode('select')} className={`p-2.5 rounded-lg transition-all ${mode === 'select' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <MousePointer2 size={18} />
            </button>
          </Tooltip>

          <Tooltip content="Magic Edit: Drag to erase any area and immediately type its replacement.">
            <button onClick={() => setMode('magic-edit')} className={`p-2.5 rounded-lg transition-all ${mode === 'magic-edit' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <Zap size={18} className={mode === 'magic-edit' ? 'fill-white' : ''} />
            </button>
          </Tooltip>

          <Tooltip content="Add a new text block anywhere.">
            <button onClick={() => setMode('text')} className={`p-2.5 rounded-lg transition-all ${mode === 'text' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <Type size={18} />
            </button>
          </Tooltip>

          <Tooltip content="Freehand draw or annotate.">
            <button onClick={() => setMode('draw')} className={`p-2.5 rounded-lg transition-all ${mode === 'draw' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <PenTool size={18} />
            </button>
          </Tooltip>

          <Tooltip content="Insert a rectangle mask or shape.">
            <button onClick={() => setMode('rect')} className={`p-2.5 rounded-lg transition-all ${mode === 'rect' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <Square size={18} />
            </button>
          </Tooltip>

          <Tooltip content="Insert an image from your device.">
            <button 
              onClick={() => document.getElementById('img-upload')?.click()} 
              className={`p-2.5 rounded-lg transition-all text-slate-400 hover:text-white hover:bg-slate-700`}
            >
              <ImageIcon size={18} />
              <input id="img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </button>
          </Tooltip>

          <Tooltip content="Style Picker: Sample font size and color from the document.">
            <button onClick={() => setMode('picker')} className={`p-2.5 rounded-lg transition-all ${mode === 'picker' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <Pipette size={18} />
            </button>
          </Tooltip>

          <Tooltip content="Add a voice annotation to the page.">
            <button onClick={() => setMode('audio')} className={`p-2.5 rounded-lg transition-all ${mode === 'audio' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <Mic size={18} />
            </button>
          </Tooltip>

          <Tooltip content="Eraser: Click on any added element to remove it.">
            <button onClick={() => setMode('erase')} className={`p-2.5 rounded-lg transition-all ${mode === 'erase' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              <Eraser size={18} />
            </button>
          </Tooltip>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex bg-slate-800/50 p-1 rounded-xl gap-1 mr-2">
            <button onClick={undo} disabled={historyStep <= 0} className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed">
              <Undo2 size={18} />
            </button>
            <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed">
              <Redo2 size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
             <input type="color" value={currentColor} onChange={e => setCurrentColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none" />
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-500 uppercase">Size</span>
                <input 
                  type="range" min="1" max="100" 
                  value={(mode === 'draw' || mode === 'line') ? strokeWidth : currentSize} 
                  onChange={e => (mode === 'draw' || mode === 'line') ? setStrokeWidth(Number(e.target.value)) : setCurrentSize(Number(e.target.value))}
                  className="w-20 accent-indigo-500 scale-90"
                />
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0 bg-slate-100 p-4 relative overflow-hidden">
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
                  <polyline
                    key={el.id}
                    points={el.path.map(p => `${(p.x/1000)*100}%,${(p.y/1000)*100}%`).join(' ')}
                    fill="none"
                    stroke={el.color}
                    strokeWidth={el.strokeWidth ? `${el.strokeWidth/10}%` : "0.5%"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={el.opacity}
                  />
                 );
               }
               if (el.type === 'line') {
                  const elWidth = el.width || 0;
                  const elHeight = el.height || 0;
                  return (
                    <line 
                      key={el.id}
                      x1={`${el.x/10}%`} y1={`${el.y/10}%`}
                      x2={`${(el.x + elWidth)/10}%`} y2={`${(el.y + elHeight)/10}%`}
                      stroke={el.color} strokeWidth={el.strokeWidth ? `${el.strokeWidth/10}%` : "0.5%"}
                      opacity={el.opacity}
                    />
                  );
               }
               return null;
            })}
            
            {isDrawing && currentPath.length > 0 && (
              mode === 'line' ? (
                <line 
                  x1={`${currentPath[0].x/10}%`} y1={`${currentPath[0].y/10}%`}
                  x2={`${(currentPath[1]?.x || currentPath[0].x)/10}%`} y2={`${(currentPath[1]?.y || currentPath[0].y)/10}%`}
                  stroke={currentColor} strokeWidth={`${strokeWidth/10}%`}
                />
              ) : (
                <polyline
                  points={currentPath.map(p => `${(p.x/1000)*100}%,${(p.y/1000)*100}%`).join(' ')}
                  fill="none"
                  stroke={currentColor}
                  strokeWidth={`${strokeWidth/10}%`}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )
            )}

            {mode === 'magic-edit' && isDrawing && dragStart && dragEnd && (
              <rect 
                x={`${Math.min(dragStart.x, dragEnd.x) / 10}%`}
                y={`${Math.min(dragStart.y, dragEnd.y) / 10}%`}
                width={`${Math.abs(dragStart.x - dragEnd.x) / 10}%`}
                height={`${Math.abs(dragStart.y - dragEnd.y) / 10}%`}
                fill="rgba(99, 102, 241, 0.2)"
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            )}
          </svg>

          {elements.map(el => {
             if (['text', 'rect', 'circle', 'image', 'audio'].includes(el.type)) {
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
                     if (mode === 'erase') {
                        deleteElement(el.id);
                        return;
                     }
                     setActiveElementId(el.id);
                     
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
                       addToHistory([...elements]);
                     };
                     
                     window.addEventListener('pointermove', onMove);
                     window.addEventListener('pointerup', onUp);
                   }}
                 >
                   {isActive && (
                      <ObjectToolbar 
                        element={el}
                        onUpdate={updateElement}
                        onDelete={deleteElement}
                        onDuplicate={duplicateElement}
                        onBringToFront={bringToFront}
                        onSendToBack={sendToBack}
                      />
                   )}

                   {el.type === 'text' && (
                     <div className="w-full h-full min-w-[20px] min-h-[20px]">
                        {isActive ? (
                          <input 
                            autoFocus
                            type="text"
                            value={el.text || ''}
                            onChange={(e) => updateElement(el.id, { text: e.target.value })}
                            className="bg-transparent border-none outline-none w-full h-full font-bold"
                            style={{ color: el.color, fontSize: `${(el.size || 24)/8}px` }}
                          />
                        ) : (
                          <span style={{ color: el.color, fontSize: `${(el.size || 24)/8}px` }} className="font-bold whitespace-nowrap">{el.text}</span>
                        )}
                     </div>
                   )}

                   {el.type === 'rect' && (
                      <div className="w-full h-full border-2" style={{ backgroundColor: el.color, borderColor: el.color, opacity: 0.5 }} />
                   )}

                   {el.type === 'circle' && (
                      <div className="w-full h-full border-2 rounded-full" style={{ backgroundColor: el.color, borderColor: el.color, opacity: 0.5 }} />
                   )}

                   {el.type === 'image' && el.imageUrl && (
                      <img src={el.imageUrl} className="w-full h-full object-cover rounded shadow-sm" alt="Overlay" />
                   )}
                   
                   {el.type === 'audio' && (
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl animate-pulse">
                         <Volume2 size={24} />
                      </div>
                   )}

                   {isActive && (el.type !== 'text') && (
                      <div 
                        className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-600 border-2 border-white rounded-full cursor-nwse-resize transform translate-x-1/2 translate-y-1/2"
                        onPointerDown={(e) => {
                           e.stopPropagation();
                           const startX = e.clientX;
                           const startY = e.clientY;
                           const startW = el.width || 0;
                           const startH = el.height || 0;
                           
                           const onMove = (me: PointerEvent) => {
                             if (!containerRef.current) return;
                             const rect = containerRef.current.getBoundingClientRect();
                             const dw = ((me.clientX - startX) / rect.width) * 1000;
                             const dh = ((me.clientY - startY) / rect.height) * 1000;
                             updateElement(el.id, {
                               width: Math.max(20, startW + dw),
                               height: Math.max(20, startH + dh)
                             });
                           };
                           const onUp = () => {
                             window.removeEventListener('pointermove', onMove);
                             window.removeEventListener('pointerup', onUp);
                             addToHistory([...elements]);
                           };
                           window.addEventListener('pointermove', onMove);
                           window.addEventListener('pointerup', onUp);
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
