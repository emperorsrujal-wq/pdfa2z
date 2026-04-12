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
  Search,
  StickyNote,
  ArrowRight,
  FileSearch,
  Download,
  Layout,
  ChevronDown,
  History as HistoryIcon,
  User as UserIcon,
  Package,
} from 'lucide-react';
import { OCRPanel } from './OCRPanel';
import { ConversionPanel } from './ConversionPanel';
import { PageToolsPanel } from './PageToolsPanel';
import { FormBuilder } from './FormBuilder';
import { AuditLog } from './AuditLog';
import { suggestFormValues } from '../services/geminiService';
import { EditElement, EditElementType, extractStyleAtPoint, getTextItems, PdfTextItem, sampleBackgroundColor } from '../utils/pdfHelpers';
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
  file: File;
  docId?: string;
}

type EditorMode =
  | 'select'
  | 'text'
  | 'draw'
  | 'erase'
  | 'smart-erase'
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'image'
  | 'picker'
  | 'magic-edit'
  | 'highlight'
  | 'strikeout'
  | 'underline'
  | 'link'
  | 'forms'
  | 'sign'
  | 'sticky-note'
  | 'find-replace'
  | 'ocr'
  | 'convert'
  | 'page-tools'
  | 'form-builder'
  | 'form-check'
  | 'form-text'
  | 'form-select'
  | 'comment';

const TOOLS: { mode: EditorMode; label: string; icon: React.ReactNode; tooltip: string }[] = [
  { mode: 'select',     label: 'Select',    icon: <MousePointer2 size={16} />, tooltip: 'Select and move elements' },
  { mode: 'magic-edit', label: 'Text',      icon: <Type size={16} />,          tooltip: 'Add or click text to edit it directly' },
  { mode: 'erase',      label: 'Whiteout',  icon: <Eraser size={16} />,        tooltip: 'Draw a plain white box to hide content' },
  { mode: 'smart-erase',label: 'Smart Whiteout',icon: <Eraser size={16} />,tooltip: 'Auto‑sample background color for seamless whiteout' },
  { mode: 'highlight',  label: 'Highlight', icon: <Highlighter size={16} />,   tooltip: 'Highlight text in the document' },
  { mode: 'draw',       label: 'Draw',      icon: <PenTool size={16} />,       tooltip: 'Freehand pen drawing' },
  { mode: 'rect',       label: 'Rectangle', icon: <Square size={16} />,        tooltip: 'Draw a rectangle or colored box' },
  { mode: 'circle',     label: 'Circle',    icon: <CircleIcon size={16} />,    tooltip: 'Draw a circle or ellipse' },
  { mode: 'line',       label: 'Line',      icon: <Minus size={16} />,         tooltip: 'Draw a straight line' },
  { mode: 'arrow',      label: 'Arrow',     icon: <ArrowRight size={16} />,    tooltip: 'Draw an arrow line' },
  { mode: 'image',      label: 'Image',     icon: <ImageIcon size={16} />,     tooltip: 'Insert an image from your device' },
  { mode: 'sticky-note',label: 'Sticky Note',icon: <StickyNote size={16} />, tooltip: 'Add a sticky note/comment box' },
  { mode: 'find-replace',label: 'Find & Replace',icon: <Search size={16} />, tooltip: 'Search and replace text' },
  { mode: 'ocr',         label: 'OCR',       icon: <FileSearch size={16} />,    tooltip: 'Extract text from this page' },
  { mode: 'convert',     label: 'Convert',   icon: <Download size={16} />,      tooltip: 'Convert PDF to Word/Excel/PPT' },
  { mode: 'page-tools',  label: 'Page Tools',icon: <Layout size={16} />,        tooltip: 'Crop or rotate the page' },
  { mode: 'form-builder',label: 'Forms',     icon: <CheckSquare size={16} />,   tooltip: 'Open Form Builder & AI Auto-fill' },
  { mode: 'comment',     label: 'Comment',   icon: <StickyNote size={16} />,    tooltip: 'Add a sticky comment' },
];

function getFontFamily(fontName?: string) {
  if (fontName === 'Times-Roman') return '"Times New Roman", Times, serif';
  if (fontName === 'Helvetica') return 'Inter, "Segoe UI", Roboto, Helvetica, sans-serif';
  if (fontName === 'Courier') return '"JetBrains Mono", "Courier New", Courier, monospace';
  if (fontName === 'Georgia') return 'Georgia, serif';
  if (fontName === 'Verdana') return 'Verdana, Geneva, sans-serif';
  return 'Inter, "Segoe UI", Roboto, Helvetica, sans-serif';
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
  file,
  docId,
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

  // Tier 2 Modal States
  const [showOcr, setShowOcr] = React.useState(false);
  const [showConvert, setShowConvert] = React.useState(false);
  const [showPageTools, setShowPageTools] = React.useState(false);
  const [showFormBuilder, setShowFormBuilder] = React.useState(false);
  const [isAiFilling, setIsAiFilling] = React.useState(false);

  // Tier 3 Collaboration States
  const [comments, setComments] = React.useState<any[]>([]);
  const [activeUsers, setActiveUsers] = React.useState<string[]>([]);
  const [isLive, setIsLive] = React.useState(false);

  // Tier 3 Audit States
  const [showAudit, setShowAudit] = React.useState(false);
  const [auditEntries, setAuditEntries] = React.useState<any[]>([]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setElements(initialElements);
    setHistory([initialElements]);
    setHistoryStep(0);
  }, [initialElements, pageIndex]);

  const commit = (next: EditElement[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    const prevCount = elements.length;
    const nextCount = next.length;

    newHistory.push(next);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setElements(next);
    onSave(next);

    // Audit Entry
    if (nextCount > prevCount) {
      const added = next[next.length - 1];
      addAuditEntry(`Added ${added.type}`, `Positioned at ${Math.round(added.x)},${Math.round(added.y)}`);
    } else if (nextCount < prevCount) {
      addAuditEntry(`Deleted element`, `Removed element from page ${pageIndex + 1}`);
    }

    // Tier 3: Sync to Firebase if collaborating
    if (docId) {
      import('../services/collaborationService').then(m => m.updateSharedState(docId, next));
    }
  };

  const addAuditEntry = (action: string, details?: string) => {
    const entry = {
      id: `audit-${Date.now()}`,
      action,
      user: 'You',
      timestamp: new Date(),
      details
    };
    setAuditEntries(prev => [...prev, entry]);
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

  const duplicateElement = (element: EditElement) => {
    const newId = `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duplicated: EditElement = {
      ...element,
      id: newId,
      // Offset by 10px (relative to 1000-unit canvas)
      x: Math.min(element.x + 10, 990),
      y: Math.min(element.y + 10, 990),
    };
    const next = [...elements, duplicated];
    commit(next);
    setActiveElementId(newId);
  };

  // Layer ordering functions
  const bringToFront = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    const others = elements.filter(el => el.id !== id);
    const next = [...others, element]; // Move to end (front)
    commit(next);
  };

  const sendToBack = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    const others = elements.filter(el => el.id !== id);
    const next = [element, ...others]; // Move to start (back)
    commit(next);
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z / Cmd+Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      // Ctrl+Shift+Z / Cmd+Shift+Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }
      // Ctrl+D / Cmd+D: Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && activeElementId) {
        e.preventDefault();
        const element = elements.find(el => el.id === activeElementId);
        if (element) duplicateElement(element);
        return;
      }
      // Delete: Delete selected element
      if (e.key === 'Delete' && activeElementId) {
        e.preventDefault();
        deleteElement(activeElementId);
        return;
      }
      // Escape: Deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveElementId(null);
        return;
      }
      // Arrow keys: Move selected element (5px increments)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && activeElementId) {
        e.preventDefault();
        const element = elements.find(el => el.id === activeElementId);
        if (element) {
          let newX = element.x;
          let newY = element.y;
          const step = e.shiftKey ? 20 : 5; // Shift for larger moves
          if (e.key === 'ArrowUp') newY = Math.max(0, newY - step);
          if (e.key === 'ArrowDown') newY = Math.min(1000, newY + step);
          if (e.key === 'ArrowLeft') newX = Math.max(0, newX - step);
          if (e.key === 'ArrowRight') newX = Math.min(1000, newX + step);
          updateElement(activeElementId, { x: newX, y: newY });
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeElementId, elements, historyStep]);

  // Tier 3: Collaboration Sync
  React.useEffect(() => {
    if (!docId) return;

    setIsLive(true);
    const mPromise = import('../services/collaborationService');
    
    let unsubState: () => void;
    let unsubComments: () => void;

    mPromise.then(m => {
      unsubState = m.syncDocumentState(docId, (state) => {
        // Only update if the timestamp is newer or we don't have local state
        setElements(state.elements);
        setActiveUsers(state.activeUsers);
      });

      unsubComments = m.listenForComments(docId, (newComments) => {
        setComments(newComments);
      });
    });

    return () => {
      unsubState?.();
      unsubComments?.();
    };
  }, [docId]);

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
    if (mode === 'ocr') {
      setShowOcr(true);
      setMode('select');
      return;
    }
    if (mode === 'convert') {
      setShowConvert(true);
      setMode('select');
      return;
    }
    if (mode === 'page-tools') {
      setShowPageTools(true);
      setMode('select');
      return;
    }
    if (mode === 'form-builder') {
      setShowFormBuilder(true);
      setMode('select');
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
    if (mode === 'smart-erase') {
      // Sample background color at the click point for future rectangle creation
      const bg = await sampleBackgroundColor(image, Math.round(pos.x), Math.round(pos.y));
      // Store sampled bg in a temporary state (reuse activeElementId if needed)
      // We'll apply it when the rectangle is finalized in handlePointerUp
      setActiveElementId('smart-bg-' + Date.now()); // placeholder id
      // Store bg in a hidden element to carry forward
      const tempEl: any = { bgColor: bg };
      // Attach to a ref (simple approach: use a global variable)
      (window as any)._smartBg = tempEl;
      setMode('erase'); // switch to erase mode for drawing
      return;
    }
    if (mode === 'image') {
      document.getElementById('img-upload')?.click();
      return;
    }
    if (mode === 'magic-edit') {
      const clicked = textItems?.find(
        item => pos.x >= item.x && pos.x <= item.x + item.width && pos.y >= item.y && pos.y <= item.y + item.height
      );
      
      // Auto-sample color logic for better masking
      let bgColor = '#FFFFFF';
      let fontColor = currentColor;
      
      try {
        const style = await extractStyleAtPoint(new File([], 'p.pdf'), pageIndex, pos.x, pos.y, image);
        bgColor = style.backgroundColor || '#FFFFFF';
        fontColor = style.color || currentColor;
      } catch (e) {
        console.warn("Color sampling failed, using defaults", e);
      }

      if (clicked) {
        const mask: EditElement = { id: `mask-${Date.now()}`, type: 'rect', pageIndex, x: clicked.x, y: clicked.y, width: clicked.width, height: clicked.height, color: bgColor, opacity: 1 };
        const text: EditElement = { id: `t-${Date.now()}`, type: 'text', pageIndex, x: clicked.x, y: clicked.y, width: clicked.width, height: clicked.height, color: fontColor, text: clicked.str, size: clicked.fontSize, opacity: 1 };
        const next = [...elements, mask, text];
        commit(next);
        setActiveElementId(text.id);
        return;
      }
      // Fall through: add blank text
      const newEl: EditElement = { id: `t-${Date.now()}`, type: 'text', pageIndex, x: pos.x, y: pos.y, width: 200, height: 30, color: fontColor, text: '', size: currentSize, opacity: 1 };
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
      if (mode === 'sticky-note') {
        const newEl: EditElement = { id: `note-${Date.now()}`, type: 'sticky-note', pageIndex, x: pos.x, y: pos.y, width: 150, height: 100, color: '#000000', bgColor: '#FEF08A', text: 'New Note', size: 12, opacity: 1 };
        commit([...elements, newEl]);
        setActiveElementId(newEl.id);
        setMode('select');
        return;
      }
      if (mode === 'comment') {
        const text = prompt("Enter your comment:");
        if (text && docId) {
          import('../services/collaborationService').then(m => m.addComment(docId, {
            text, x: pos.x, y: pos.y, pageIndex
          }));
        }
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
      if (mode === 'erase' || mode === 'rect' || mode === 'smart-erase') {
        let bg = '#FFFFFF';
        if (mode === 'smart-erase') {
          // Retrieve sampled background from temporary storage
          const temp = (window as any)._smartBg;
          bg = temp?.bgColor || '#FFFFFF';
        }
        newEl = { id: `rect-${Date.now()}`, type: 'rect', pageIndex, x, y, width: w, height: h, color: mode === 'erase' ? '#FFFFFF' : currentColor, bgColor: bg, opacity: 1 };
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
    <div className="flex flex-col h-full w-full bg-[#060910] overflow-hidden select-none" onClick={() => setActiveElementId(null)}>

      {/* Collaboration Status */}
      {isLive && (
        <div className="shrink-0 flex items-center justify-between px-6 py-2 bg-indigo-600/10 border-b border-indigo-500/20 backdrop-blur-sm z-[150]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2 py-0.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Collaboration</span>
            </div>
            <div className="h-4 w-[1px] bg-indigo-500/20" />
            <div className="flex -space-x-2">
              {activeUsers.map((user, i) => (
                <div key={user + i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-indigo-400 capitalize" title={user}>
                  {user[0]}
                </div>
              ))}
              {activeUsers.length === 0 && (
                <span className="text-[10px] text-slate-500 font-bold ml-2 italic">Waiting for collaborators...</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
             <span className="bg-slate-800/50 px-2 py-0.5 rounded border border-white/5 uppercase tracking-tighter">Doc ID: {docId}</span>
          </div>
        </div>
      )}

      {/* ─── TOP TOOLBAR (Premium Dark) ─────────────────── */}
      <div className="shrink-0 flex flex-col items-center gap-2 py-4 bg-[#0f172a]/40 backdrop-blur-xl border-b border-white/5 shadow-2xl z-[100]">

        {/* Main tool bar */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl shadow-inner">
          {TOOLS.map(t => (
            <Tooltip key={t.mode} content={t.tooltip}>
              <button
                onClick={(e) => { e.stopPropagation(); if (t.mode === 'image') { document.getElementById('img-upload')?.click(); } else { setMode(t.mode); } }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-300 ${
                  mode === t.mode
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 scale-105'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t.icon}
                <span className="hidden lg:inline">{t.label}</span>
              </button>
            </Tooltip>
          ))}
        </div>

        {/* Whiteout / Mode Warnings */}
        {mode === 'erase' && (
          <div className="text-[11px] font-bold text-amber-200 bg-amber-900/30 border border-amber-500/20 rounded-full px-5 py-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
            ✨ Whiteout hides content but does not securely redact.
          </div>
        )}

        {/* Page / zoom controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-inner divide-x divide-white/5">
            <Tooltip content="Undo last action">
              <button onClick={(e) => { e.stopPropagation(); undo(); }} className="px-3 py-2 hover:bg-white/5 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-[11px] font-black uppercase tracking-tight">
                <Undo2 size={14} /> Undo
              </button>
            </Tooltip>
            <Tooltip content="Redo action">
              <button onClick={(e) => { e.stopPropagation(); redo(); }} className="px-3 py-2 hover:bg-white/5 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-[11px] font-black uppercase tracking-tight">
                <Redo2 size={14} /> Redo
              </button>
            </Tooltip>
            
            <div className="flex items-center px-1 border-r border-white/5">
              <Tooltip content="Document Audit Log">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowAudit(!showAudit); }} 
                  className={`p-2 rounded-lg transition-all ${showAudit ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                  <HistoryIcon size={16} />
                </button>
              </Tooltip>
            </div>

            <div className="flex items-center px-1">
              <button onClick={(e) => { e.stopPropagation(); zoomOut(); }} className="p-2 hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                <ZoomOut size={16} />
              </button>
              <span className="px-2 text-[11px] font-black text-indigo-400 min-w-[50px] text-center tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={(e) => { e.stopPropagation(); zoomIn(); }} className="p-2 hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          <div className="text-[11px] font-black text-slate-500 bg-white/5 border border-white/5 px-4 py-2 rounded-xl uppercase tracking-widest">
            Page {pageIndex + 1}
          </div>
        </div>
      </div>

      {/* ─── SCROLLABLE CANVAS AREA ─────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto custom-scrollbar"
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 20px' }}
      >
        {/* The PDF page — width scales naturally so coordinate math stays correct */}
        <div
          style={{
            position: 'relative',
            width: `${794 * zoom}px`,
            flexShrink: 0,
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5), 0 18px 36px -18px rgba(0,0,0,0.5)',
            borderRadius: '4px',
            overflow: 'hidden'
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

            {/* Comments (Tier 3) */}
            {comments.filter(c => c.pageIndex === pageIndex).map(comment => (
              <div 
                key={comment.id}
                className="absolute z-[400] group"
                style={{ left: `${comment.x / 10}%`, top: `${comment.y / 10}%` }}
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white ring-4 ring-indigo-500/20 cursor-help transition-transform hover:scale-110">
                    <StickyNote size={14} />
                  </div>
                  <div className="absolute left-10 top-0 w-48 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                    <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">{comment.userName}</p>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}

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
              if (!['text', 'rect', 'circle', 'image', 'highlight', 'strikeout', 'underline', 'form-check', 'form-text', 'form-select', 'sticky-note'].includes(el.type)) return null;
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
                    <ObjectToolbar element={el} onUpdate={updateElement} onDelete={deleteElement} onDuplicate={duplicateElement} onBringToFront={bringToFront} onSendToBack={sendToBack} setMode={setMode} />
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
                  {el.type === 'form-text' && (
                    <div className="w-full h-full flex items-start p-1 bg-white border border-slate-300 rounded shadow-inner">
                      <input
                        type="text"
                        value={el.text || ''}
                        placeholder="Form Text Area..."
                        onChange={ev => updateElement(el.id, { text: ev.target.value })}
                        onClick={ev => ev.stopPropagation()}
                        className="w-full bg-transparent border-none outline-none p-0 m-0 text-sm text-slate-800"
                      />
                    </div>
                  )}
                  {el.type === 'form-select' && (
                    <div className="w-full h-full flex items-center p-1 bg-white border border-slate-300 rounded shadow-inner relative">
                      <select
                        value={el.text || ''}
                        onChange={ev => updateElement(el.id, { text: ev.target.value })}
                        onClick={ev => ev.stopPropagation()}
                        className="w-full bg-transparent border-none outline-none p-0 m-0 text-xs text-slate-800 appearance-none pr-4"
                      >
                        <option value="">Select...</option>
                        {el.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  )}
                  {el.type === 'sticky-note' && (
                    <div 
                      className="w-full h-full p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-lg shadow-xl flex flex-col gap-1"
                      style={{ backgroundColor: el.bgColor }}
                    >
                      <div className="flex justify-between items-center opacity-40">
                         <StickyNote size={10} />
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      </div>
                      <textarea
                        value={el.text || ''}
                        onChange={ev => updateElement(el.id, { text: ev.target.value })}
                        onClick={ev => ev.stopPropagation()}
                        className="w-full flex-1 bg-transparent border-none outline-none p-0 m-0 text-[10px] leading-tight text-slate-800 dark:text-slate-200 resize-none font-medium"
                        placeholder="Type a note..."
                      />
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
      <div className="shrink-0 flex justify-center py-6 bg-[#0f172a]/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.4)] z-[200]">
        <button
          onClick={() => (onFinalSave ? onFinalSave(elements) : onSave(elements))}
          className="group relative flex items-center gap-3 px-20 py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-[#060910] rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-emerald-500/20"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          <CheckCircle2 size={20} className="relative z-10" />
          <span className="relative z-10">Save & Apply Changes</span>
        </button>
      </div>

      {/* Audit Log Panel */}
      {showAudit && (
        <AuditLog 
          entries={auditEntries} 
          onClose={() => setShowAudit(false)} 
        />
      )}

      {/* Tier 2 Modals */}
      {showOcr && (
        <OCRPanel 
          imageSrc={image} 
          onClose={() => setShowOcr(false)} 
          onApply={(text) => {
            const newEl: EditElement = { id: `ocr-${Date.now()}`, type: 'text', pageIndex, x: 100, y: 100, width: 800, height: 400, color: currentColor, text, size: 12, opacity: 1 };
            commit([...elements, newEl]);
            setShowOcr(false);
          }}
        />
      )}
      {showConvert && (
        <ConversionPanel 
          text={elements.filter(el => el.type === 'text').map(el => el.text).join('\n')} 
          fileName={file.name}
          onClose={() => setShowConvert(false)} 
        />
      )}
      {showPageTools && (
        <PageToolsPanel 
          onClose={() => setShowPageTools(false)}
          onRotate={(angle) => {
            alert(`Rotating page ${pageIndex + 1} by ${angle} degrees (Simulation)`);
            setShowPageTools(false);
          }}
          onCrop={(rect) => {
            alert(`Cropping target: ${JSON.stringify(rect)} (Simulation)`);
            setShowPageTools(false);
          }}
        />
      )}
      {showFormBuilder && (
        <FormBuilder
          onClose={() => setShowFormBuilder(false)}
          onAddField={(type) => {
            const newEl: EditElement = { id: `form-${Date.now()}`, type, pageIndex, x: 500, y: 500, width: 200, height: 40, color: '#000000', opacity: 1 };
            commit([...elements, newEl]);
            setActiveElementId(newEl.id);
            setShowFormBuilder(false);
          }}
          onAutoFill={async () => {
            setIsAiFilling(true);
            try {
              const text = textItems?.map(i => i.str).join(' ') || "";
              const formFields = elements
                .filter(el => el.type.startsWith('form-'))
                .map(el => ({ id: el.id, label: el.text || 'field', type: el.type }));
              
              const suggestions = await suggestFormValues(text, formFields);
              const next = elements.map(el => {
                if (suggestions[el.id]) {
                  return { ...el, text: suggestions[el.id] };
                }
                return el;
              });
              commit(next);
              alert("AI suggested values applied to form fields!");
            } catch (e) {
              alert("AI filling failed. Please check your API key.");
            } finally {
              setIsAiFilling(false);
              setShowFormBuilder(false);
            }
          }}
          isFilling={isAiFilling}
        />
      )}
    </div>
  );
};
