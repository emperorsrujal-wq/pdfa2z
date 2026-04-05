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
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { EditElement, EditElementType, extractStyleAtPoint, getTextItems, PdfTextItem } from '../utils/pdfHelpers';
import { ObjectToolbar } from './ObjectToolbar';
import { Tooltip } from './Tooltip';
import { FloatingToolbar } from './FloatingToolbar';
import { PageControls } from './PageControls';

interface PdfEditorCanvasProps {
  image: string;
  pageIndex: number;
  initialElements: EditElement[];
  onSave: (elements: EditElement[]) => void;
  onFinalSave?: (elements: EditElement[]) => void;
  onCancel: () => void;
  isEmbedded?: boolean;
  textItems?: PdfTextItem[];
}

type EditorMode = 'select' | 'text' | 'draw' | 'erase' | 'rect' | 'circle' | 'line' | 'image' | 'audio' | 'picker' | 'magic-edit' | 'highlight' | 'strikeout' | 'underline' | 'link' | 'forms' | 'sign';

export const PdfEditorCanvas: React.FC<PdfEditorCanvasProps> = ({
  image,
  pageIndex,
  initialElements,
  onSave,
  onFinalSave,
  onCancel,
  isEmbedded = false,
  textItems = []
}) => {
  const [elements, setElements] = React.useState<EditElement[]>(initialElements);
  const [history, setHistory] = React.useState<EditElement[][]>([initialElements]);
  const [historyStep, setHistoryStep] = React.useState(0);

  const [mode, setMode] = React.useState<EditorMode>('magic-edit');
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
    // Ideally fetch textItems here if we had the File object
    // For now, we'll assume the parent provides them or we trigger extraction
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

  const handlePointerDown = async (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);

    switch (mode) {
      case 'picker': {
        const style = await extractStyleAtPoint(new File([], "p.pdf"), pageIndex, pos.x, pos.y, image);
        if (activeElementId) {
           updateElement(activeElementId, { color: style.backgroundColor });
           setMode('select');
        }
        return;
      }
      case 'magic-edit': {
        // Direct click-to-edit detection
        const clickedItem = textItems.find(item => 
          pos.x >= item.x && pos.x <= item.x + item.width &&
          pos.y >= item.y && pos.y <= item.y + item.height
        );
        
        if (clickedItem) {
          const mask: EditElement = { id: `mask-${Date.now()}`, type: 'rect', pageIndex, x: clickedItem.x, y: clickedItem.y, width: clickedItem.width, height: clickedItem.height, color: '#FFFFFF', opacity: 1 };
          const text: EditElement = { id: `magic-txt-${Date.now()}`, type: 'text', pageIndex, x: clickedItem.x, y: clickedItem.y, width: clickedItem.width, height: clickedItem.height, color: '#000000', text: clickedItem.str, size: clickedItem.fontSize, opacity: 1 };
          const next = [...elements, mask, text]; setElements(next); addToHistory(next); setActiveElementId(text.id);
          return;
        }
        // If no text item clicked, fall back to drag selection
        setIsDrawing(true);
        setDragStart(pos);
        setDragEnd(pos);
        break;
      }
      case 'text': {
        const newEl: EditElement = { id: `txt-${Date.now()}`, type: 'text', pageIndex, x: pos.x, y: pos.y, color: currentColor, text: '', size: currentSize, opacity: 1, rotation: 0 };
        const next = [...elements, newEl]; setElements(next); addToHistory(next); setActiveElementId(newEl.id); setMode('select');
        break;
      }
      case 'draw':
      case 'line': {
        setIsDrawing(true);
        setCurrentPath([pos]);
        break;
      }
      case 'highlight':
      case 'strikeout':
      case 'underline': {
        setIsDrawing(true);
        setDragStart(pos);
        setDragEnd(pos);
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
      if (['magic-edit', 'highlight', 'strikeout', 'underline', 'rect', 'circle'].includes(mode)) {
        setDragEnd(pos);
      } else if (mode === 'line') {
        setCurrentPath([currentPath[0], pos]);
      } else {
        setCurrentPath(prev => [...prev, pos]);
      }
    }
  };

  const handlePointerUp = async () => {
    if (mode === 'picker') return;
    if (isDrawing) {
      if (['magic-edit', 'highlight', 'strikeout', 'underline'].includes(mode) && dragStart && dragEnd) {
        const x = Math.min(dragStart.x, dragEnd.x);
        const y = Math.min(dragStart.y, dragEnd.y);
        const w = Math.abs(dragStart.x - dragEnd.x);
        const h = Math.abs(dragStart.y - dragEnd.y);

        if (w > 2 && h > 2) {
          if (mode === 'magic-edit') {
            const next: EditElement[] = [...elements, 
              { id: `mask-${Date.now()}`, type: 'rect' as EditElementType, pageIndex, x, y, width: w, height: h, color: '#FFFFFF', opacity: 1 },
              { id: `magic-txt-${Date.now()}`, type: 'text' as EditElementType, pageIndex, x, y, width: w, height: h, color: '#000000', text: '', size: 14, opacity: 1 }
            ];
            setElements(next); addToHistory(next); setMode('select');
          } else {
            const typeValue = mode as any; // Cast to bypass strict union check if needed, but safer to check
            if (['highlight', 'strikeout', 'underline'].includes(typeValue)) {
              const newEl: EditElement = { id: `${typeValue}-${Date.now()}`, type: typeValue as EditElementType, pageIndex, x, y, width: w, height: h, color: typeValue === 'highlight' ? '#fbff00' : '#000000', opacity: typeValue === 'highlight' ? 0.35 : 1 };
              const next = [...elements, newEl]; setElements(next); addToHistory(next); setMode('select');
            }
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
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-[#f8fafc] relative overflow-hidden select-none items-center pt-8">
      
      <div className="flex flex-col items-center w-full sticky top-0 z-[200] pb-4 bg-[#f8fafc]/80 backdrop-blur-sm">
        <FloatingToolbar 
          mode={mode} 
          setMode={setMode} 
          onImageUpload={() => document.getElementById('img-upload')?.click()} 
          undo={undo}
        />

        {mode === 'erase' && (
          <div className="w-full max-w-lg mt-2 bg-black text-white text-center py-2 px-4 rounded text-xs font-medium shadow-lg animate-in slide-in-from-top-2">
            Whiteout hides but will not completely remove underlying text or images. Not suitable for redacting sensitive data.
          </div>
        )}
        
        <PageControls 
          pageNumber={pageIndex + 1}
          onDelete={() => {}}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onUndo={undo}
          onRedo={redo}
          onInsertPage={() => {}}
        />
      </div>

      <input id="img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      <div className="flex-1 flex items-start justify-center min-h-0 p-4 pb-32 overflow-y-auto w-full">
        <div
          ref={containerRef}
          className={`relative bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] rounded-sm max-h-full aspect-[1/1.414] overflow-hidden select-none touch-none ${
            mode === 'text' ? 'cursor-text' : 
            mode === 'picker' ? 'cursor-crosshair' :
            (mode === 'draw' || mode === 'line') ? 'cursor-crosshair' : 'cursor-default'
          }`}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <img src={image} className="w-full h-full object-contain pointer-events-none text-transparent" alt="PDF Page" />
          
          {mode === 'picker' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold shadow-2xl z-[500] pointer-events-none border border-white/20">
               Select a color from the document
            </div>
          )}
          
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

            {isDrawing && dragStart && dragEnd && (
              <rect x={`${Math.min(dragStart.x, dragEnd.x) / 10}%`} y={`${Math.min(dragStart.y, dragEnd.y) / 10}%`} width={`${Math.abs(dragStart.x - dragEnd.x) / 10}%`} height={`${Math.abs(dragStart.y - dragEnd.y) / 10}%`} fill={mode === 'highlight' ? 'rgba(251, 255, 0, 0.3)' : 'rgba(59, 130, 246, 0.2)'} stroke={mode === 'highlight' ? '#fbff00' : '#3b82f6'} strokeWidth="1" strokeDasharray="4 4" />
            )}
          </svg>

          {elements.map(el => {
             if (['text', 'rect', 'circle', 'image', 'audio', 'highlight', 'strikeout', 'underline', 'form-check', 'form-text'].includes(el.type)) {
               const isActive = activeElementId === el.id;
               return (
                 <div
                   key={el.id}
                   className={`absolute ${isActive ? 'z-50' : ''}`}
                   style={{
                     left: `${el.x / 10}%`,
                     top: `${el.y / 10}%`,
                     width: el.width ? `${el.width / 10}%` : 'auto',
                     height: el.height ? `${el.height / 10}%` : 'auto',
                     transform: `rotate(${el.rotation || 0}deg)`,
                     transformOrigin: 'top left',
                     cursor: mode === 'select' ? 'move' : 'default',
                     opacity: el.opacity,
                     zIndex: isActive ? 100 : undefined
                   }}
                   onPointerDown={(e) => {
                     if (mode !== 'select') return;
                     e.stopPropagation();
                     setActiveElementId(el.id);
                     const startX = (e as React.MouseEvent).clientX; const startY = (e as React.MouseEvent).clientY;
                     const startElX = el.x; const startElY = el.y;
                     const onMove = (me: PointerEvent) => {
                       if (!containerRef.current) return;
                       const r = containerRef.current.getBoundingClientRect();
                       updateElement(el.id, { x: Math.max(0, Math.min(1000, startElX + ((me.clientX - startX) / r.width) * 1000)), y: Math.max(0, Math.min(1000, startElY + ((me.clientY - startY) / r.height) * 1000)) });
                     };
                     const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); addToHistory([...elements]); };
                     window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                   }}
                 >
                   {isActive && (
                      <ObjectToolbar element={el} onUpdate={updateElement} onDelete={deleteElement} onDuplicate={()=>{}} setMode={setMode} />
                   )}

                   {isActive && (
                      <>
                        <div className="absolute inset-0 border-2 border-dashed border-[#3b82f6] pointer-events-none" />
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-[#3b82f6]" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-[#3b82f6]" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-[#3b82f6]" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-[#3b82f6]" />
                      </>
                   )}

                   {el.type === 'text' && (
                      <div className="w-full h-full min-w-[20px] min-h-[20px] outline-none">
                        {isActive ? (
                          <input 
                            autoFocus 
                            type="text" 
                            value={el.text || ''} 
                            onChange={(e) => updateElement(el.id, { text: e.target.value })} 
                            className="bg-transparent border-none outline-none w-full h-full" 
                            style={{ 
                              color: el.color, 
                              fontSize: `${(el.size || 24)/10}vw`,
                              fontFamily: el.fontName === 'Times-Roman' ? '"Times New Roman", serif' : 
                                          el.fontName === 'Courier' ? '"Courier New", monospace' : 
                                          el.fontName === 'Georgia' ? 'Georgia, serif' : 
                                          el.fontName === 'Verdana' ? 'Verdana, sans-serif' : 
                                          'Arial, Helvetica, sans-serif',
                              fontWeight: el.isBold ? 'bold' : 'normal',
                              fontStyle: el.isItalic ? 'italic' : 'normal'
                            }} 
                          />
                        ) : (
                          <span 
                            style={{ 
                              color: el.color, 
                              fontSize: `${(el.size || 24)/10}vw`,
                              fontFamily: el.fontName === 'Times-Roman' ? '"Times New Roman", serif' : 
                                          el.fontName === 'Courier' ? '"Courier New", monospace' : 
                                          el.fontName === 'Georgia' ? 'Georgia, serif' : 
                                          el.fontName === 'Verdana' ? 'Verdana, sans-serif' : 
                                          'Arial, Helvetica, sans-serif',
                              fontWeight: el.isBold ? 'bold' : 'normal',
                              fontStyle: el.isItalic ? 'italic' : 'normal'
                            }} 
                            className="whitespace-nowrap"
                          >
                            {el.text}
                          </span>
                        )}
                      </div>
                   )}

                   {el.type === 'rect' && <div className="w-full h-full" style={{ backgroundColor: el.color }} />}
                   {el.type === 'highlight' && <div className="w-full h-full" style={{ backgroundColor: el.color, opacity: 0.35 }} />}
                   {el.type === 'strikeout' && <div className="w-full h-[2px] bg-current absolute top-1/2 -translate-y-1/2" style={{ color: el.color }} />}
                   {el.type === 'underline' && <div className="w-full h-[2px] bg-current absolute bottom-0" style={{ color: el.color }} />}
                   {el.type === 'form-check' && <div className="w-full h-full border-2 border-slate-900 rounded bg-white" onClick={() => updateElement(el.id, { isChecked: !el.isChecked })}>{el.isChecked && "✓"}</div>}
                   {el.type === 'image' && el.imageUrl && <img src={el.imageUrl} className="w-full h-full object-cover" alt="overlay" />}
                 </div>
               );
             }
             return null;
          })}
        </div>
      </div>

      {/* Sejda Style Apply Changes Button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[250]">
        <button 
          onClick={() => onFinalSave ? onFinalSave(elements) : onSave(elements)}
          className="flex items-center gap-3 px-12 py-4 bg-[#10b981] hover:bg-[#059669] text-white rounded font-bold text-xl transition-all shadow-[0_15px_35px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:translate-y-0"
        >
          <span>Apply changes</span>
          <CheckCircle2 size={24} />
        </button>
      </div>
    </div>
  );
};
