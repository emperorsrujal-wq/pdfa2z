import * as React from 'react';
import {
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Trash2,
  FilePlus2,
  MousePointer2,
  Type,
  Eraser,
  Highlighter,
  PenTool,
  Square,
  Circle as CircleIcon,
  Minus,
  Image as ImageIcon,
  Shapes,
  Link as LinkIcon,
  CheckSquare,
  FileSignature,
} from 'lucide-react';
import { EditElement, EditElementType, extractStyleAtPoint, getTextItems, PdfTextItem } from '../utils/pdfHelpers';
import { ObjectToolbar } from './ObjectToolbar';
import { Tooltip } from './Tooltip';

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

type EditorMode =
  | 'select'
  | 'text'
  | 'draw'
  | 'erase'
  | 'rect'
  | 'circle'
  | 'line'
  | 'image'
  | 'picker'
  | 'magic-edit'
  | 'highlight'
  | 'strikeout'
  | 'underline'
  | 'link'
  | 'forms'
  | 'sign';

const TOOLS: { mode: EditorMode; label: string; icon: React.ReactNode; tooltip: string }[] = [
  { mode: 'select',     label: 'Select',    icon: <MousePointer2 size={16} />, tooltip: 'Select and move elements' },
  { mode: 'magic-edit', label: 'Text',      icon: <Type size={16} />,          tooltip: 'Add or click text to edit it directly' },
  { mode: 'erase',      label: 'Whiteout',  icon: <Eraser size={16} />,        tooltip: 'Draw a white box to hide content' },
  { mode: 'highlight',  label: 'Highlight', icon: <Highlighter size={16} />,   tooltip: 'Highlight text in the document' },
  { mode: 'draw',       label: 'Draw',      icon: <PenTool size={16} />,       tooltip: 'Freehand pen drawing' },
  { mode: 'rect',       label: 'Rectangle', icon: <Square size={16} />,        tooltip: 'Draw a rectangle or colored box' },
  { mode: 'circle',     label: 'Circle',    icon: <CircleIcon size={16} />,    tooltip: 'Draw a circle or ellipse' },
  { mode: 'line',       label: 'Line',      icon: <Minus size={16} />,         tooltip: 'Draw a straight line' },
  { mode: 'image',      label: 'Image',     icon: <ImageIcon size={16} />,     tooltip: 'Insert an image from your device' },
];

function getFontFamily(fontName?: string) {
  if (fontName === 'Times-Roman') return '"Times New Roman", Times, serif';
  if (fontName === 'Courier') return '"Courier New", Courier, monospace';
  if (fontName === 'Georgia') return 'Georgia, serif';
  if (fontName === 'Verdana') return 'Verdana, Geneva, sans-serif';
  return 'Arial, Helvetica, sans-serif';
}

export const PdfEditorCanvas: React.FC<PdfEditorCanvasProps> = ({
  image,
  pageIndex,
  initialElements,
  onSave,
  onFinalSave,
  onCancel,
  isEmbedded = false,
  textItems = [],
}) => {
  const [elements, setElements] = React.useState<EditElement[]>(initialElements);
  const [history, setHistory] = React.useState<EditElement[][]>([initialElements]);
  const [historyStep, setHistoryStep] = React.useState(0);

  const [mode, setMode] = React.useState<EditorMode>('magic-edit');
  const [currentColor, setCurrentColor] = React.useState('#000000');
  const [currentSize, setCurrentSize] = React.useState(14);
  const [strokeWidth] = React.useState(3);
  const [zoom, setZoom] = React.useState(1);

  const [activeElementId, setActiveElementId] = React.useState<string | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState<{ x: number; y: number }[]>([]);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = React.useState<{ x: number; y: number } | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setElements(initialElements);
    setHistory([initialElements]);
    setHistoryStep(0);
  }, [initialElements, pageIndex]);

  const commit = (next: EditElement[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(next);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setElements(next);
    onSave(next);
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

  const updateElement = (id: string, updates: Partial<EditElement>) => {
    const next = elements.map(el => (el.id === id ? { ...el, ...updates } : el));
    setElements(next);
    onSave(next);
  };

  const deleteElement = (id: string) => {
    const next = elements.filter(el => el.id !== id);
    commit(next);
    setActiveElementId(null);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = Math.max(0, Math.min(1000, ((clientX - rect.left) / rect.width) * 1000));
    const y = Math.max(0, Math.min(1000, ((clientY - rect.top) / rect.height) * 1000));
    return { x, y };
  };

  const handlePointerDown = async (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    if (mode === 'select') {
      setActiveElementId(null);
      return;
    }
    if (mode === 'picker') {
      const style = await extractStyleAtPoint(new File([], 'p.pdf'), pageIndex, pos.x, pos.y, image);
      if (activeElementId) {
        updateElement(activeElementId, { color: style.backgroundColor });
        setMode('select');
      }
      return;
    }
    if (mode === 'image') {
      document.getElementById('img-upload')?.click();
      return;
    }
    if (mode === 'magic-edit') {
      const clicked = textItems.find(
        item => pos.x >= item.x && pos.x <= item.x + item.width && pos.y >= item.y && pos.y <= item.y + item.height
      );
      if (clicked) {
        const mask: EditElement = { id: `mask-${Date.now()}`, type: 'rect', pageIndex, x: clicked.x, y: clicked.y, width: clicked.width, height: clicked.height, color: '#FFFFFF', opacity: 1 };
        const text: EditElement = { id: `t-${Date.now()}`, type: 'text', pageIndex, x: clicked.x, y: clicked.y, width: clicked.width, height: clicked.height, color: '#000000', text: clicked.str, size: clicked.fontSize, opacity: 1 };
        const next = [...elements, mask, text];
        commit(next);
        setActiveElementId(text.id);
        return;
      }
      // Fall through: add blank text
      const newEl: EditElement = { id: `t-${Date.now()}`, type: 'text', pageIndex, x: pos.x, y: pos.y, width: 200, height: 30, color: currentColor, text: '', size: currentSize, opacity: 1 };
      commit([...elements, newEl]);
      setActiveElementId(newEl.id);
      return;
    }
    if (mode === 'text') {
      const newEl: EditElement = { id: `t-${Date.now()}`, type: 'text', pageIndex, x: pos.x, y: pos.y, width: 200, height: 30, color: currentColor, text: '', size: currentSize, opacity: 1 };
      commit([...elements, newEl]);
      setActiveElementId(newEl.id);
      setMode('select');
      return;
    }
    // All drag-draw modes
    setIsDrawing(true);
    setDragStart(pos);
    setDragEnd(pos);
    if (mode === 'draw') setCurrentPath([pos]);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    setDragEnd(pos);
    if (mode === 'draw') setCurrentPath(prev => [...prev, pos]);
    else if (mode === 'line') setCurrentPath([dragStart!, pos]);
  };

  const handlePointerUp = () => {
    if (!isDrawing || !dragStart || !dragEnd) {
      setIsDrawing(false);
      return;
    }
    const x = Math.min(dragStart.x, dragEnd.x);
    const y = Math.min(dragStart.y, dragEnd.y);
    const w = Math.abs(dragStart.x - dragEnd.x);
    const h = Math.abs(dragStart.y - dragEnd.y);

    if (mode === 'draw' && currentPath.length > 1) {
      const newEl: EditElement = { id: `path-${Date.now()}`, type: 'path', pageIndex, x: 0, y: 0, color: currentColor, strokeWidth, path: currentPath, opacity: 1 };
      commit([...elements, newEl]);
    } else if (mode === 'line' && currentPath.length === 2) {
      const [p1, p2] = currentPath;
      const newEl: EditElement = { id: `line-${Date.now()}`, type: 'line', pageIndex, x: p1.x, y: p1.y, width: p2.x - p1.x, height: p2.y - p1.y, color: currentColor, strokeWidth, opacity: 1 };
      commit([...elements, newEl]);
    } else if (w > 3 && h > 3) {
      let newEl: EditElement | null = null;
      if (mode === 'erase' || mode === 'rect') {
        newEl = { id: `rect-${Date.now()}`, type: 'rect', pageIndex, x, y, width: w, height: h, color: mode === 'erase' ? '#FFFFFF' : currentColor, opacity: 1 };
      } else if (mode === 'circle') {
        newEl = { id: `circle-${Date.now()}`, type: 'circle', pageIndex, x, y, width: w, height: h, color: currentColor, opacity: 1 };
      } else if (mode === 'highlight') {
        newEl = { id: `hl-${Date.now()}`, type: 'highlight', pageIndex, x, y, width: w, height: h, color: '#FFE600', opacity: 0.4 };
      } else if (mode === 'strikeout') {
        newEl = { id: `st-${Date.now()}`, type: 'strikeout', pageIndex, x, y, width: w, height: h, color: '#EF4444', opacity: 1 };
      } else if (mode === 'underline') {
        newEl = { id: `ul-${Date.now()}`, type: 'underline', pageIndex, x, y, width: w, height: h, color: '#3B82F6', opacity: 1 };
      }
      if (newEl) {
        commit([...elements, newEl]);
        setActiveElementId(newEl.id);
        setMode('select');
      }
    }
    setIsDrawing(false);
    setCurrentPath([]);
    setDragStart(null);
    setDragEnd(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = re => {
      const base64 = re.target?.result as string;
      const newEl: EditElement = { id: `img-${Date.now()}`, type: 'image', pageIndex, x: 300, y: 300, width: 250, height: 180, imageUrl: base64, opacity: 1 };
      commit([...elements, newEl]);
      setActiveElementId(newEl.id);
      setMode('select');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const zoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const zoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));

  const selectionRect =
    isDrawing && dragStart && dragEnd
      ? {
          x: Math.min(dragStart.x, dragEnd.x),
          y: Math.min(dragStart.y, dragEnd.y),
          w: Math.abs(dragStart.x - dragEnd.x),
          h: Math.abs(dragStart.y - dragEnd.y),
        }
      : null;

  const fillColor: Record<string, string> = {
    highlight: 'rgba(255, 230, 0, 0.35)',
    strikeout: 'rgba(239, 68, 68, 0.3)',
    underline: 'rgba(59, 130, 246, 0.3)',
    erase: 'rgba(255,255,255,0.6)',
    rect: currentColor.replace('#', 'rgba(') /* fallback */,
    circle: 'rgba(59,130,246,0.2)',
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f1f5f9] overflow-hidden" onClick={() => setActiveElementId(null)}>

      {/* ─── TOP TOOLBAR ─────────────────────────────────── */}
      <div className="shrink-0 flex flex-col items-center gap-2 py-3 bg-white border-b border-slate-200 shadow-sm z-[100]">

        {/* Main tool bar */}
        <div className="flex items-center gap-0.5 bg-[#f0f7ff] border border-[#c7dff7] px-1 py-0.5 rounded-lg shadow-sm">
          {TOOLS.map(t => (
            <Tooltip key={t.mode} content={t.tooltip}>
              <button
                onClick={(e) => { e.stopPropagation(); if (t.mode === 'image') { document.getElementById('img-upload')?.click(); } else { setMode(t.mode); } }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold transition-all ${
                  mode === t.mode
                    ? 'bg-[#0061ef] text-white shadow-md'
                    : 'text-[#374151] hover:bg-[#dbeafe] hover:text-[#1d4ed8]'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Whiteout warning */}
        {mode === 'erase' && (
          <div className="text-[11px] font-medium text-white bg-slate-800 rounded px-4 py-1.5 shadow-md animate-in fade-in duration-200">
            Whiteout hides but will <strong>not</strong> completely remove underlying text. Not suitable for secure redaction.
          </div>
        )}

        {/* Page / zoom controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm divide-x divide-slate-200">
            <Tooltip content="Undo last action">
              <button onClick={(e) => { e.stopPropagation(); undo(); }} className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 transition-colors flex items-center gap-1 text-[12px] font-medium">
                <Undo2 size={14} /> Undo
              </button>
            </Tooltip>
            <Tooltip content="Redo action">
              <button onClick={(e) => { e.stopPropagation(); redo(); }} className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 transition-colors flex items-center gap-1 text-[12px] font-medium">
                <Redo2 size={14} /> Redo
              </button>
            </Tooltip>
            <Tooltip content="Zoom out">
              <button onClick={(e) => { e.stopPropagation(); zoomOut(); }} className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 transition-colors">
                <ZoomOut size={16} />
              </button>
            </Tooltip>
            <span className="px-3 py-1.5 text-[12px] font-bold text-slate-700 min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Tooltip content="Zoom in">
              <button onClick={(e) => { e.stopPropagation(); zoomIn(); }} className="px-3 py-1.5 hover:bg-slate-50 text-slate-600 transition-colors">
                <ZoomIn size={16} />
              </button>
            </Tooltip>
          </div>

          <div className="text-[11px] font-bold text-slate-400 bg-white border border-slate-100 px-3 py-1.5 rounded-lg">
            Page {pageIndex + 1}
          </div>
        </div>
      </div>

      {/* ─── SCROLLABLE CANVAS AREA ─────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px' }}
      >
        {/* The PDF page */}
        <div
          style={{
            position: 'relative',
            width: '794px',         // A4 width in px at 96dpi
            flexShrink: 0,
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            marginBottom: `${(zoom - 1) * 1123}px`, // compensate scale collapse
          }}
        >
          <div
            ref={containerRef}
            className={`relative bg-white shadow-2xl select-none touch-none ${
              mode === 'text' || mode === 'magic-edit' ? 'cursor-text' :
              mode === 'picker' ? 'cursor-crosshair' :
              ['draw', 'line', 'erase', 'rect', 'circle', 'highlight', 'strikeout', 'underline'].includes(mode) ? 'cursor-crosshair' :
              mode === 'select' ? 'cursor-default' : 'cursor-default'
            }`}
            style={{ aspectRatio: '1 / 1.414', width: '100%' }}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            onClick={e => e.stopPropagation()}
          >
            {/* PDF page image */}
            <img
              src={image}
              draggable={false}
              className="absolute inset-0 w-full h-full object-fill pointer-events-none"
              alt="PDF Page"
            />

            {/* Picker overlay */}
            {mode === 'picker' && (
              <div className="absolute inset-0 flex items-center justify-center z-[500] bg-black/10 pointer-events-none">
                <div className="bg-slate-900 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl">
                  🎨 Click to sample a color from the document
                </div>
              </div>
            )}

            {/* SVG overlay (paths, lines, draw preview) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              {elements.map(el => {
                if (el.type === 'path' && el.path) {
                  const pts = el.path.map(p => `${(p.x / 1000) * 100}%,${(p.y / 1000) * 100}%`).join(' ');
                  return <polyline key={el.id} points={pts} fill="none" stroke={el.color} strokeWidth={el.strokeWidth ? `${el.strokeWidth / 10}%` : '0.3%'} strokeLinecap="round" strokeLinejoin="round" opacity={el.opacity} />;
                }
                if (el.type === 'line') {
                  return <line key={el.id} x1={`${el.x / 10}%`} y1={`${el.y / 10}%`} x2={`${(el.x + (el.width || 0)) / 10}%`} y2={`${(el.y + (el.height || 0)) / 10}%`} stroke={el.color} strokeWidth={el.strokeWidth ? `${el.strokeWidth / 10}%` : '0.3%'} opacity={el.opacity} />;
                }
                return null;
              })}

              {/* Live draw preview */}
              {isDrawing && mode === 'draw' && currentPath.length > 1 && (
                <polyline
                  points={currentPath.map(p => `${(p.x / 1000) * 100}%,${(p.y / 1000) * 100}%`).join(' ')}
                  fill="none" stroke={currentColor} strokeWidth={`${strokeWidth / 10}%`} strokeLinecap="round" strokeLinejoin="round"
                />
              )}
              {isDrawing && mode === 'line' && currentPath.length === 2 && (
                <line
                  x1={`${currentPath[0].x / 10}%`} y1={`${currentPath[0].y / 10}%`}
                  x2={`${currentPath[1].x / 10}%`} y2={`${currentPath[1].y / 10}%`}
                  stroke={currentColor} strokeWidth={`${strokeWidth / 10}%`}
                />
              )}

              {/* Drag rectangle preview */}
              {selectionRect && !['draw', 'line'].includes(mode) && (
                <rect
                  x={`${selectionRect.x / 10}%`} y={`${selectionRect.y / 10}%`}
                  width={`${selectionRect.w / 10}%`} height={`${selectionRect.h / 10}%`}
                  fill={fillColor[mode] || 'rgba(59,130,246,0.15)'}
                  stroke={mode === 'erase' ? '#94a3b8' : '#3b82f6'}
                  strokeWidth="1" strokeDasharray="4 4"
                />
              )}
            </svg>

            {/* DOM elements (text, rect, image, etc.) */}
            {elements.map(el => {
              if (!['text', 'rect', 'circle', 'image', 'highlight', 'strikeout', 'underline', 'form-check'].includes(el.type)) return null;
              const isActive = activeElementId === el.id;

              return (
                <div
                  key={el.id}
                  className="absolute"
                  style={{
                    left: `${el.x / 10}%`,
                    top: `${el.y / 10}%`,
                    width: el.width ? `${el.width / 10}%` : 'auto',
                    height: el.height ? `${el.height / 10}%` : 'auto',
                    transform: `rotate(${el.rotation || 0}deg)`,
                    transformOrigin: 'top left',
                    opacity: el.opacity,
                    zIndex: isActive ? 50 : 1,
                    cursor: mode === 'select' ? 'move' : 'default',
                    minWidth: 20,
                    minHeight: 10,
                  }}
                  onPointerDown={ev => {
                    if (mode !== 'select') return;
                    ev.stopPropagation();
                    setActiveElementId(el.id);
                    const startX = ev.clientX, startY = ev.clientY;
                    const startElX = el.x, startElY = el.y;
                    const onMove = (me: PointerEvent) => {
                      if (!containerRef.current) return;
                      const r = containerRef.current.getBoundingClientRect();
                      const nx = Math.max(0, Math.min(1000, startElX + ((me.clientX - startX) / r.width) * 1000));
                      const ny = Math.max(0, Math.min(1000, startElY + ((me.clientY - startY) / r.height) * 1000));
                      updateElement(el.id, { x: nx, y: ny });
                    };
                    const onUp = () => {
                      window.removeEventListener('pointermove', onMove);
                      window.removeEventListener('pointerup', onUp);
                      commit([...elements]);
                    };
                    window.addEventListener('pointermove', onMove);
                    window.addEventListener('pointerup', onUp);
                  }}
                  onClick={ev => ev.stopPropagation()}
                >
                  {/* Object property bar */}
                  {isActive && (
                    <ObjectToolbar element={el} onUpdate={updateElement} onDelete={deleteElement} onDuplicate={() => {}} setMode={setMode} />
                  )}

                  {/* Selection handles */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 border-2 border-dashed border-[#3b82f6] pointer-events-none rounded-sm" />
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm" />
                    </>
                  )}

                  {/* --- Element Content --- */}
                  {el.type === 'rect' && (
                    <div className="w-full h-full" style={{ backgroundColor: el.color }} />
                  )}
                  {el.type === 'circle' && (
                    <div className="w-full h-full rounded-full" style={{ backgroundColor: el.color }} />
                  )}
                  {el.type === 'highlight' && (
                    <div className="w-full h-full" style={{ backgroundColor: el.color, opacity: 0.4 }} />
                  )}
                  {el.type === 'strikeout' && (
                    <div className="w-full flex items-center">
                      <div className="w-full h-[2px]" style={{ backgroundColor: el.color }} />
                    </div>
                  )}
                  {el.type === 'underline' && (
                    <div className="w-full flex items-end h-full pb-0">
                      <div className="w-full h-[2px]" style={{ backgroundColor: el.color }} />
                    </div>
                  )}
                  {el.type === 'image' && el.imageUrl && (
                    <img src={el.imageUrl} className="w-full h-full object-cover" draggable={false} alt="inserted" />
                  )}
                  {el.type === 'form-check' && (
                    <div
                      className="w-full h-full border-2 border-slate-700 bg-white flex items-center justify-center text-slate-900 font-bold cursor-pointer"
                      onClick={ev => { ev.stopPropagation(); updateElement(el.id, { isChecked: !el.isChecked }); }}
                    >
                      {el.isChecked ? '✓' : ''}
                    </div>
                  )}
                  {el.type === 'text' && (
                    <div className="w-full h-full flex items-start">
                      <input
                        type="text"
                        value={el.text || ''}
                        placeholder="Type here..."
                        onChange={ev => updateElement(el.id, { text: ev.target.value })}
                        onClick={ev => ev.stopPropagation()}
                        className="w-full bg-transparent border-none outline-none p-0 m-0"
                        style={{
                          color: el.color || '#000',
                          fontSize: `${((el.size || 14) / 794) * 100}%`,
                          fontFamily: getFontFamily(el.fontName),
                          fontWeight: el.isBold ? 'bold' : 'normal',
                          fontStyle: el.isItalic ? 'italic' : 'normal',
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── HIDDEN IMAGE UPLOAD ─────────────────────────── */}
      <input id="img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

      {/* ─── APPLY CHANGES BUTTON ────────────────────────── */}
      <div className="shrink-0 flex justify-center py-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => (onFinalSave ? onFinalSave(elements) : onSave(elements))}
          className="flex items-center gap-3 px-14 py-3.5 bg-[#10b981] hover:bg-[#059669] active:scale-95 text-white rounded-lg font-bold text-base transition-all shadow-lg shadow-emerald-500/30"
        >
          <CheckCircle2 size={20} />
          Apply changes
        </button>
      </div>
    </div>
  );
};
