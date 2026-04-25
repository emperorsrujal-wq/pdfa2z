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
  Pipette,
  RotateCw,
  PenLine,
  Pen,
  Link2,
  Circle,
  Sparkles,
  ScanText,
  Replace,
  Link,
  X,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { OCRPanel } from './OCRPanel';
import { ConversionPanel } from './ConversionPanel';
import { PageToolsPanel } from './PageToolsPanel';
import { FormBuilder } from './FormBuilder';
import { AuditLog } from './AuditLog';
import { SignaturePad } from './SignaturePad';
import { suggestFormValues } from '../services/geminiService';
import { EditElement, EditElementType, extractStyleAtPoint, getTextItems, PdfTextItem, sampleBackgroundColor } from '../utils/pdfHelpers';
import { ObjectToolbar } from './ObjectToolbar';
import { Tooltip } from './Tooltip';

interface PdfEditorCanvasProps {
  image: string;
  dimensions?: { width: number, height: number };
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
  | 'ellipse'
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
  | 'form-text-multiline'
  | 'form-radio'
  | 'form-select'
  | 'form-signature'
  | 'symbol-cross'
  | 'symbol-check'
  | 'symbol-dot'
  | 'comment'
  | 'font-picker';

const TOOLS: { mode: EditorMode; label: string; icon: React.ReactNode; tooltip: string }[] = [
  { mode: 'select',     label: 'Select',    icon: <MousePointer2 size={16} />, tooltip: 'Select and move elements' },
  { mode: 'magic-edit', label: 'Text',      icon: <Type size={16} />,          tooltip: 'Add or click text to edit it directly' },
  { mode: 'erase',      label: 'Whiteout',  icon: <Eraser size={16} />,        tooltip: 'Draw a plain white box to hide content' },
  { mode: 'smart-erase',label: 'Smart Whiteout',icon: <Eraser size={16} />,tooltip: 'Auto‑sample background color for seamless whiteout' },
  { mode: 'highlight',  label: 'Highlight', icon: <Highlighter size={16} />,   tooltip: 'Highlight text in the document' },
  { mode: 'draw',       label: 'Draw',      icon: <PenTool size={16} />,       tooltip: 'Freehand pen drawing' },
  { mode: 'rect',       label: 'Rectangle', icon: <Square size={16} />,        tooltip: 'Draw a rectangle or colored box' },
  { mode: 'ellipse',    label: 'Ellipse',   icon: <CircleIcon size={16} />,    tooltip: 'Draw a circle or elliptical shape' },
  { mode: 'line',       label: 'Line',      icon: <Minus size={16} />,         tooltip: 'Draw a straight line' },
  { mode: 'arrow',      label: 'Arrow',     icon: <ArrowRight size={16} />,    tooltip: 'Draw an arrow line' },
  { mode: 'image',      label: 'Image',     icon: <ImageIcon size={16} />,     tooltip: 'Insert an image from your device' },
  { mode: 'link',       label: 'Link',      icon: <LinkIcon size={16} />,      tooltip: 'Create a clickable web link area' },
  { mode: 'sticky-note',label: 'Sticky Note',icon: <StickyNote size={16} />, tooltip: 'Add a sticky note/comment box' },
  { mode: 'find-replace',label: 'Find & Replace',icon: <Search size={16} />, tooltip: 'Search and replace text' },
  { mode: 'ocr',         label: 'OCR',       icon: <FileSearch size={16} />,    tooltip: 'Extract text from this page' },
  { mode: 'convert',     label: 'Convert',   icon: <Download size={16} />,      tooltip: 'Convert PDF to Word/Excel/PPT' },
  { mode: 'page-tools',  label: 'Page Tools',icon: <Layout size={16} />,        tooltip: 'Crop or rotate the page' },
  { mode: 'form-builder',label: 'Forms',     icon: <CheckSquare size={16} />,   tooltip: 'Open Form Builder & AI Auto-fill' },
  { mode: 'comment',     label: 'Comment',   icon: <StickyNote size={16} />,    tooltip: 'Add a sticky comment' },
];

const SEJDA_COLORS = [
  '#000000', '#424242', '#636363', '#9c9c9c', '#cecece', '#e7e7e7', '#ffffff',
  '#ff0000', '#ff9c00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9c00ff',
  '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6',
  '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3'
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
  dimensions,
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
  const [activeColor, setActiveColor] = React.useState('#000000');
  const [activeFont, setActiveFont] = React.useState('Helvetica');
  const [activeFontSize, setActiveFontSize] = React.useState(14);

  const PRO_COLORS = [
    '#000000', '#424242', '#636363', '#9c9c9c', '#cecece', '#e7e7e7', '#ffffff',
    '#ff0000', '#ff9c00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9c00ff',
    '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9dadb',
    '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6',
    '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3'
  ];
  const [zoom, setZoom] = React.useState(1);

  const [activeElementId, setActiveElementId] = React.useState<string | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState<{ x: number; y: number }[]>([]);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = React.useState<{ x: number; y: number } | null>(null);
  const [guides, setGuides] = React.useState<{ v: number | null, h: number | null }>({ v: null, h: null });

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

  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showFindReplace, setShowFindReplace] = React.useState(false);
  const [showFormsMenu, setShowFormsMenu] = React.useState(false);
  const [showAnnotateMenu, setShowAnnotateMenu] = React.useState(false);
  const [showSignMenu, setShowSignMenu] = React.useState(false);
  const [isSigPadOpen, setIsSigPadOpen] = React.useState(false);
  const [storedSignatures, setStoredSignatures] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [replaceTerm, setReplaceTerm] = React.useState('');

  const containerRef = React.useRef<HTMLDivElement>(null);
  const pageRef = React.useRef<HTMLDivElement>(null);
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
    if (!pageRef.current) return { x: 0, y: 0 };
    const rect = pageRef.current.getBoundingClientRect();
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
    if (mode === 'picker' || mode === 'font-picker') {
      const style = await extractStyleAtPoint(file, pageIndex, pos.x, pos.y, image);
      if (activeElementId) {
        if (mode === 'picker') {
          updateElement(activeElementId, { color: style.backgroundColor });
        } else {
          updateElement(activeElementId, { 
            fontName: style.fontName, 
            size: style.fontSize 
          });
        }
        setMode('select');
      }
      return;
    }
    if (mode === 'erase') {
      setActiveColor('#FFFFFF');
      setIsDrawing(true);
      setDragStart(pos);
      setDragEnd(pos);
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
      let fontColor = activeColor;
      
      try {
        const style = await extractStyleAtPoint(new File([], 'p.pdf'), pageIndex, pos.x, pos.y, image);
        bgColor = style.backgroundColor || '#FFFFFF';
        bgColor = style.backgroundColor || '#FFFFFF';
        fontColor = style.color || activeColor;
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
      const newEl: EditElement = { id: `t-${Date.now()}`, type: 'text', pageIndex, x: pos.x, y: pos.y, width: 200, height: 30, color: fontColor, text: '', size: activeFontSize, opacity: 1 };
      commit([...elements, newEl]);
      setActiveElementId(newEl.id);
      return;
    }
      if (mode === 'text') {
        const newEl: EditElement = { id: `t-${Date.now()}`, type: 'text', pageIndex, x: pos.x, y: pos.y, width: 200, height: 30, color: activeColor, text: '', size: activeFontSize, opacity: 1 };
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
      const newEl: EditElement = { id: `path-${Date.now()}`, type: 'path', pageIndex, x: 0, y: 0, color: activeColor, strokeWidth: 3, path: currentPath, opacity: 1 };
      commit([...elements, newEl]);
    } else if (mode === 'line' && currentPath.length === 2) {
      const [p1, p2] = currentPath;
      const newEl: EditElement = { id: `line-${Date.now()}`, type: 'line', pageIndex, x: p1.x, y: p1.y, width: p2.x - p1.x, height: p2.y - p1.y, color: activeColor, strokeWidth: 3, opacity: 1 };
      commit([...elements, newEl]);
    } else if (w > 3 && h > 3) {
      let newEl: EditElement | null = null;
      if (mode === 'erase' || mode === 'rect' || mode === 'smart-erase') {
        let bg = activeColor;
        if (mode === 'erase') bg = '#FFFFFF'; // Force standard white for common use
        else if (mode === 'smart-erase') {
          const temp = (window as any)._smartBg;
          bg = temp?.bgColor || '#FFFFFF';
        }
        newEl = { id: `rect-${Date.now()}`, type: 'rect', pageIndex, x, y, width: w, height: h, color: mode === 'erase' ? '#FFFFFF' : activeColor, bgColor: bg, opacity: 1 };
      } else if (mode === 'circle') {
        newEl = { id: `circle-${Date.now()}`, type: 'circle', pageIndex, x, y, width: w, height: h, color: activeColor, opacity: 1 };
      } else if (mode === 'highlight') {
        newEl = { id: `hl-${Date.now()}`, type: 'highlight', pageIndex, x, y, width: w, height: h, color: '#FFE600', opacity: 0.4 };
      } else if (mode === 'strikeout') {
        newEl = { id: `st-${Date.now()}`, type: 'strikeout', pageIndex, x, y, width: w, height: h, color: '#EF4444', opacity: 1 };
      } else if (mode === 'underline') {
        newEl = { id: `ul-${Date.now()}`, type: 'underline', pageIndex, x, y, width: w, height: h, color: '#3B82F6', opacity: 1 };
      } else if (mode === 'ellipse') {
        newEl = { id: `ellipse-${Date.now()}`, type: 'ellipse', pageIndex, x, y, width: w, height: h, color: activeColor, opacity: 1 };
      } else if (mode === 'link') {
        const url = prompt("Enter link URL (e.g., https://example.com):");
        if (url) {
          newEl = { id: `link-${Date.now()}`, type: 'link', pageIndex, x, y, width: w, height: h, linkUrl: url, opacity: 1 };
        }
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

  // --- Phase 2: Power-User Keyboard Shortcuts ---
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (activeElementId) {
        const el = elements.find(item => item.id === activeElementId);
        if (!el) return;

        // Delete / Backspace
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          const next = elements.filter(item => item.id !== activeElementId);
          commit(next);
          setActiveElementId(null);
        }

        // Arrow Keys (Nudging)
        const shift = e.shiftKey ? 10 : 1;
        let dx = 0, dy = 0;
        if (e.key === 'ArrowLeft') dx = -shift;
        if (e.key === 'ArrowRight') dx = shift;
        if (e.key === 'ArrowUp') dy = -shift;
        if (e.key === 'ArrowDown') dy = shift;

        if (dx !== 0 || dy !== 0) {
          e.preventDefault();
          updateElement(activeElementId, {
            x: (el.x || 0) + dx,
            y: (el.y || 0) + dy
          });
          // Note: we don't commit on every 1px nudge to avoid history spam, 
          // but we could add a throttle or commit on 'keyup'
        }
      }

      // Undo (Ctrl+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }

      // Escape (Clear Selection)
      if (e.key === 'Escape') {
        setActiveElementId(null);
        setMode('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeElementId, elements, commit, undo, updateElement]);

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
    erase: activeColor,
    rect: activeColor,
    ellipse: 'rgba(79, 70, 229, 0.15)',
    link: 'rgba(59, 130, 246, 0.2)',
  };

  const handleFindReplace = () => {
    if (!searchTerm || !textItems) return;
    
    const nextElements = [...elements];
    let count = 0;
    
    // Find matches in textItems
    textItems.forEach(item => {
      if (item.str.toLowerCase().includes(searchTerm.toLowerCase())) {
        // Create mask (whiteout)
        const mask: EditElement = { 
          id: `fr-mask-${Date.now()}-${count}`, 
          type: 'rect', 
          pageIndex, 
          x: item.x, 
          y: item.y, 
          width: item.width, 
          height: item.height, 
          color: '#FFFFFF',
          opacity: 1 
        };
        
        // Create new text
        const newText: EditElement = { 
          id: `fr-text-${Date.now()}-${count}`, 
          type: 'text', 
          pageIndex, 
          x: item.x, 
          y: item.y, 
          width: item.width, 
          height: item.height, 
          color: activeColor, 
          text: replaceTerm, 
          size: item.fontSize, 
          opacity: 1 
        };
        
        nextElements.push(mask, newText);
        count++;
      }
    });
    
    if (count > 0) {
      commit(nextElements);
      alert(`Replaced ${count} occurrences.`);
    } else {
      alert("No matches found.");
    }
    setShowFindReplace(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f3f3f3] overflow-hidden select-none relative" onClick={() => setActiveElementId(null)}>
      {/* ─── WHITEOUT WARNING BANNER ─────────────────── */}
      {mode === 'erase' && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[200] max-w-2xl w-full px-4 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-black text-white px-8 py-3 rounded shadow-2xl text-center border border-white/20 backdrop-blur-md">
            <p className="text-sm font-medium leading-relaxed">
              Whiteout hides but will not completely remove underlying text or images. 
              <span className="block opacity-80 text-xs mt-1 italic font-normal">Not suitable for redacting sensitive data.</span>
            </p>
          </div>
        </div>
      )}

      {/* ─── CENTRIC TOOLBAR (Sejda style) ─────────────────── */}
      <div className="shrink-0 flex items-center justify-center bg-white border-b border-slate-200 shadow-sm z-[150] py-4">
        <div className="flex bg-[#e7e7e7] p-1 rounded-lg border border-slate-300 shadow-sm">
          {[
            { mode: 'magic-edit', icon: <Type size={18} />, label: 'Text' },
            { mode: 'link', icon: <Link2 size={18} />, label: 'Links' },
            { mode: 'form-builder', icon: <CheckSquare size={18} />, label: 'Forms' },
            { mode: 'image', icon: <ImageIcon size={18} />, label: 'Images' },
            { mode: 'sign', icon: <FileSignature size={18} />, label: 'Sign' },
            { mode: 'erase', icon: <Square size={18} />, label: 'Whiteout' },
            { mode: 'draw', icon: <PenLine size={18} />, label: 'Annotate' },
            { mode: 'rect', icon: <Shapes size={18} />, label: 'Shapes' },
            { mode: 'undo', icon: <Undo2 size={18} />, label: 'Undo' },
          ].map((t) => (
            <div key={t.mode || t.label} className="relative">
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (t.mode === 'undo') undo();
                  else if (t.mode === 'image') document.getElementById('img-upload')?.click();
                  else if (t.mode === 'form-builder') { setShowFormsMenu(!showFormsMenu); setShowAnnotateMenu(false); setShowSignMenu(false); }
                  else if (t.mode === 'draw') { setShowAnnotateMenu(!showAnnotateMenu); setShowFormsMenu(false); setShowSignMenu(false); }
                  else if (t.mode === 'sign') { setShowSignMenu(!showSignMenu); setShowFormsMenu(false); setShowAnnotateMenu(false); }
                  else setMode(t.mode as EditorMode); 
                }}
                disabled={t.mode === 'undo' && historyStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${t.mode === 'undo' ? 'opacity-100' : ''} ${mode === t.mode || (t.mode === 'form-builder' && showFormsMenu) || (t.mode === 'draw' && showAnnotateMenu) || (t.mode === 'sign' && showSignMenu) ? 'bg-white text-[#333] shadow-sm' : 'text-slate-600 hover:bg-white/50 hover:text-[#333]'} disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <span className={mode === t.mode ? 'text-[#2196f3]' : 'text-[#333]'}>{t.icon}</span>
                <span className={`text-sm font-medium ${mode === t.mode ? 'text-[#333]' : 'text-slate-600'}`}>{t.label}</span>
                {['Forms', 'Images', 'Sign', 'Shapes', 'Links', 'Annotate'].includes(t.label) && <ChevronDown size={12} className="opacity-50 ml-1" />}
              </button>

              {/* ─── FORMS DROPDOWN MENU ─────────────────── */}
              {t.mode === 'form-builder' && showFormsMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[400px] bg-white border border-slate-200 shadow-2xl rounded-sm z-[200] overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
                  {/* Section 1 */}
                  <div className="p-4 border-b border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Add Text and Symbols</h4>
                    <div className="flex items-center gap-8 px-4">
                       <button onClick={() => { setMode('form-text'); setShowFormsMenu(false); }} className="text-2xl font-serif text-slate-700 hover:text-[#2196f3] transition-colors" title="I-Beam Text">IA</button>
                       <button onClick={() => { setMode('symbol-cross'); setShowFormsMenu(false); }} className="text-xl text-slate-700 hover:text-[#2196f3] transition-colors"><X size={20} /></button>
                       <button onClick={() => { setMode('symbol-check'); setShowFormsMenu(false); }} className="text-xl text-slate-700 hover:text-[#2196f3] transition-colors"><CheckCircle2 size={20} /></button>
                       <button onClick={() => { setMode('symbol-dot'); setShowFormsMenu(false); }} className="text-xl text-slate-700 hover:text-[#2196f3] transition-colors"><Circle size={10} fill="currentColor" /></button>
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Add New Form Fields</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                       {[
                         { m: 'form-text', label: 'Text', icon: 'TI' },
                         { m: 'form-radio', label: 'Radio button', icon: <Circle size={14} /> },
                         { m: 'form-text-multiline', label: 'Text multiline', icon: 'TT' },
                         { m: 'form-check', label: 'Checkbox', icon: <CheckSquare size={14} /> },
                         { m: 'form-select', label: 'Drop-down list', icon: <Layout size={14} /> },
                         { m: 'form-signature', label: 'Signature box', icon: <FileSignature size={14} /> },
                       ].map(field => (
                         <button 
                           key={field.m} 
                           onClick={() => { setMode(field.m as EditorMode); setShowFormsMenu(false); }}
                           className="flex items-center gap-3 text-sm text-slate-700 hover:text-[#2196f3] transition-colors group"
                         >
                           <span className="w-6 h-6 flex items-center justify-center border border-slate-300 rounded-sm text-[10px] font-bold group-hover:border-[#2196f3]">{field.icon}</span>
                           <span>{field.label}</span>
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* Section 3 */}
                  <div className="p-4 border-b border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Change Existing Form Fields</h4>
                    <div className="flex flex-col gap-3">
                       <button className="flex items-center gap-3 text-sm text-slate-700 hover:text-[#2196f3]">
                         <Pipette size={14} /> Form Edit mode
                       </button>
                       <button className="flex items-center gap-3 text-sm text-slate-700 hover:text-[#2196f3]">
                         <RotateCw size={14} className="rotate-90" /> Change tab order
                       </button>
                    </div>
                  </div>

                  {/* Section 4 */}
                  <div className="p-4 bg-slate-50/50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Share Publicly with Others</h4>
                    <button className="flex items-center gap-3 text-sm text-slate-700 hover:text-[#2196f3] font-medium w-full">
                       <div className="p-1 px-2 border border-slate-300 rounded-sm"><UserIcon size={14} /></div>
                       Publish for others to fill & sign
                    </button>
                  </div>
                </div>
              )}

              {/* ─── ANNOTATE DROPDOWN MENU ─────────────────── */}
              {t.mode === 'draw' && showAnnotateMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[320px] bg-white border border-slate-200 shadow-2xl rounded-sm z-[200] overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
                  {/* Header / Toggle */}
                  <div className="p-3 px-4 border-b border-slate-100 bg-white hover:bg-slate-50 cursor-pointer flex items-center gap-2">
                    <CheckSquare size={14} className="text-[#2196f3]" />
                    <span className="text-sm font-medium text-slate-700">Show annotations</span>
                  </div>

                  {/* TEXT Section */}
                  <div className="p-3 px-4 border-b border-slate-100">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Text</h4>
                    <div className="flex flex-col gap-3">
                       {[
                         { id: 'strikeout', label: 'Strike out', icon: <Minus size={16} />, colors: ['#f44336', '#2196f3', '#ffeb3b'] },
                         { id: 'highlight', label: 'Highlight', icon: <Highlighter size={16} />, colors: ['#ffeb3b', '#f44336', '#2196f3', '#4caf50', '#000000'] },
                         { id: 'underline', label: 'Underline', icon: <Minus size={16} className="mt-2" />, colors: ['#ffeb3b', '#f44336', '#2196f3', '#4caf50', '#000000'] },
                       ].map(tool => (
                         <div key={tool.id} className="flex items-center justify-between group">
                            <button 
                              onClick={() => { setMode(tool.id as EditorMode); setActiveColor(tool.colors[0]); setShowAnnotateMenu(false); }}
                              className="flex items-center gap-3 text-sm text-slate-600 hover:text-[#2196f3] transition-colors"
                            >
                              <span className="opacity-60">{tool.icon}</span>
                              <span>{tool.label}</span>
                            </button>
                            <div className="flex items-center gap-1.5">
                               {tool.colors.map(c => (
                                 <button 
                                   key={c} 
                                   onClick={() => { setMode(tool.id as EditorMode); setActiveColor(c); setShowAnnotateMenu(false); }}
                                   style={{ backgroundColor: c }}
                                   className="w-3.5 h-3.5 rounded-full border border-slate-200 hover:scale-125 transition-transform shadow-sm"
                                 />
                               ))}
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* FREEHAND Section */}
                  <div className="p-3 px-4">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Freehand</h4>
                    <div className="flex flex-col gap-3">
                       {[
                         { id: 'highlight', label: 'Highlight', icon: <Highlighter size={16} />, colors: ['#ffeb3b', '#f44336', '#2196f3', '#4caf50', '#000000'] },
                         { id: 'draw', label: 'Draw', icon: <PenLine size={16} />, colors: ['#ffeb3b', '#f44336', '#2196f3', '#4caf50', '#000000'] },
                       ].map(tool => (
                         <div key={tool.id} className="flex items-center justify-between group">
                            <button 
                              onClick={() => { setMode(tool.id as EditorMode); setActiveColor(tool.colors[0]); setShowAnnotateMenu(false); }}
                              className="flex items-center gap-3 text-sm text-slate-600 hover:text-[#2196f3] transition-colors"
                            >
                              <span className="opacity-60">{tool.icon}</span>
                              <span>{tool.label}</span>
                            </button>
                            <div className="flex items-center gap-1.5">
                               {tool.colors.map(c => (
                                 <button 
                                   key={c} 
                                   onClick={() => { setMode(tool.id as EditorMode); setActiveColor(c); setShowAnnotateMenu(false); }}
                                   style={{ backgroundColor: c }}
                                   className="w-3.5 h-3.5 rounded-full border border-slate-200 hover:scale-125 transition-transform shadow-sm"
                                 />
                               ))}
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── SIGN DROPDOWN MENU ─────────────────── */}
              {t.mode === 'sign' && showSignMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[280px] bg-white border border-slate-200 shadow-2xl rounded-sm z-[200] p-4 text-center animate-in fade-in zoom-in-95 duration-200">
                  {storedSignatures.length > 0 ? (
                    <div className="space-y-4">
                      {storedSignatures.map((sig, i) => (
                        <div key={i} className="group relative border border-slate-100 hover:border-[#2196f3] p-2 rounded cursor-pointer transition-all" onClick={() => { setMode('sign'); setShowSignMenu(false); }}>
                           <img src={sig} alt="Signature" className="max-h-16 mx-auto" />
                           <button 
                             onClick={(e) => { e.stopPropagation(); setStoredSignatures(prev => prev.filter((_, idx) => idx !== i)); }}
                             className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 bg-white rounded-full shadow-sm"
                           >
                             <X size={14} />
                           </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 px-2 border-2 border-dashed border-slate-200 rounded mb-4">
                        <FileSignature size={32} className="mx-auto text-slate-200" />
                        <p className="text-xs text-slate-400 mt-2">No signatures saved</p>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => {
                        setIsSigPadOpen(true);
                        setShowSignMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#2196f3] text-[#2196f3] rounded hover:bg-blue-50 transition-colors font-medium text-sm"
                  >
                    <Plus size={16} /> New Signature
                  </button>
                </div>
              )}
            </div>
          ))}
          
        </div>
      </div>

      <div className="bg-[#f3f3f3] flex flex-col items-center py-4 border-b border-slate-200 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); setShowFindReplace(!showFindReplace); }}
          className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-300 rounded shadow-sm text-sm font-medium text-[#333] hover:bg-slate-50 transition-all ml-40 self-start"
        >
          <Search size={14} /> Find & Replace
        </button>
      </div>

      {/* ─── SCROLLABLE CANVAS AREA ─────────────────────── */}
      <div 
        className={`flex-1 overflow-auto bg-[#f3f3f3] p-12 custom-scrollbar ${(mode === 'picker' || mode === 'font-picker') ? 'cursor-crosshair' : ''}`}
        ref={containerRef}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px 100px 20px' }}
      >
        {/* Floating Page Controls */}
        <div className="flex items-center gap-3 mb-4 bg-white/80 backdrop-blur border border-slate-300 rounded shadow-md px-3 py-1.5 text-[#333]">
           <span className="text-sm font-bold mr-2">{pageIndex + 1}</span>
           <div className="w-px h-4 bg-slate-300" />
           <button onClick={() => {}} className="p-1 hover:bg-slate-200 rounded" title="Delete Page"><Trash2 size={16} /></button>
           <button onClick={zoomOut} className="p-1 hover:bg-slate-200 rounded"><ZoomOut size={16} /></button>
           <button onClick={zoomIn} className="p-1 hover:bg-slate-200 rounded"><ZoomIn size={16} /></button>
           <button onClick={() => {}} className="p-1 hover:bg-slate-200 rounded"><Undo2 size={16} /></button>
           <button onClick={() => {}} className="p-1 hover:bg-slate-200 rounded"><RotateCw size={16} /></button>
           <div className="w-px h-4 bg-slate-300" />
           <button className="flex items-center gap-2 px-3 py-1 bg-[#4096ff] text-white rounded text-xs font-bold hover:bg-[#1677ff] transition-all">
             <FilePlus2 size={14} /> Insert page here
           </button>
        </div>
        {/* The PDF page — width scales naturally so coordinate math stays correct */}
        <div
          className="sejda-shadow-large"
          style={{
            position: 'relative',
            width: `${794 * zoom}px`,
            flexShrink: 0,
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <div
            className={`relative bg-white animate-fade-in select-none touch-none ${
              mode === 'text' || mode === 'magic-edit' ? 'cursor-text' :
              mode === 'picker' ? 'cursor-crosshair' :
              ['draw', 'line', 'erase', 'rect', 'circle', 'highlight', 'strikeout', 'underline'].includes(mode) ? 'cursor-crosshair' :
              mode === 'select' ? 'cursor-default' : 'cursor-default'
            }`}
            style={{ 
              aspectRatio: dimensions ? `${dimensions.width} / ${dimensions.height}` : '1 / 1.414', 
              width: '100%',
              backgroundImage: `url(${image})`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat'
            }}
            ref={pageRef}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            onClick={e => e.stopPropagation()}
          >

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
                  fill="none" stroke={activeColor} strokeWidth="0.3%" strokeLinecap="round" strokeLinejoin="round"
                />
              )}
              {isDrawing && mode === 'line' && currentPath.length === 2 && (
                <line
                  x1={`${currentPath[0].x / 10}%`} y1={`${currentPath[0].y / 10}%`}
                  x2={`${currentPath[1].x / 10}%`} y2={`${currentPath[1].y / 10}%`}
                  stroke={activeColor} strokeWidth="0.3%"
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
                    const startXPos = el.x, startYPos = el.y;
                    const onMove = (me: PointerEvent) => {
                      if (!pageRef.current) return;
                      const r = pageRef.current.getBoundingClientRect();
                      const dx = ((me.clientX - startX) / r.width) * 1000;
                      const dy = ((me.clientY - startY) / r.height) * 1000;
                      
                      let newX = startXPos + dx;
                      let newY = startYPos + dy;
                      const w = el.width || 0;
                      const h = el.height || 0;

                      // Smart Guides & Snapping (Page Center = 500)
                      let guideV: number | null = null;
                      let guideH: number | null = null;
                      const SNAP_THRESHOLD = 5;

                      if (Math.abs((newX + w / 2) - 500) < SNAP_THRESHOLD) {
                        newX = 500 - w / 2;
                        guideV = 500;
                      }
                      if (Math.abs((newY + h / 2) - 500) < SNAP_THRESHOLD) {
                        newY = 500 - h / 2;
                        guideH = 500;
                      }
                      
                      setGuides({ v: guideV, h: guideH });

                      // Movement Boundaries
                      newX = Math.max(0, Math.min(1000 - w, newX));
                      newY = Math.max(0, Math.min(1000 - h, newY));

                      updateElement(el.id, { x: newX, y: newY });
                    };
                    const onUp = () => {
                      setGuides({ v: null, h: null });
                      window.removeEventListener('pointermove', onMove);
                      window.removeEventListener('pointerup', onUp);
                      commit([...elements]);
                    };
                    window.addEventListener('pointermove', onMove);
                    window.addEventListener('pointerup', onUp);
                  }}
                  onClick={ev => ev.stopPropagation()}
                >
                  {/* Magic Edit Overlay (Targeting feedback) */}
                  {mode === 'magic-edit' && (
                    <div className="absolute inset-0 border-2 border-indigo-400 border-dashed animate-pulse pointer-events-none" />
                  )}
                  {/* Object property bar */}
                  {isActive && (
                    <ObjectToolbar element={el} onUpdate={updateElement} onDelete={deleteElement} onDuplicate={duplicateElement} onBringToFront={bringToFront} onSendToBack={sendToBack} setMode={setMode} />
                  )}

                  {/* Selection handles */}
                  {isActive && mode === 'select' && (
                    <>
                      <div className="absolute inset-0 border-2 border-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.2)] pointer-events-none rounded-sm" />
                      
                      {/* Rotation Handle */}
                      <div 
                        className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center group/rot"
                        onPointerDown={ev => {
                          ev.stopPropagation();
                          const rect = ev.currentTarget.parentElement?.getBoundingClientRect();
                          if (!rect) return;
                          const cx = rect.left + rect.width / 2;
                          const cy = rect.top + rect.height / 2;
                          const onMove = (me: PointerEvent) => {
                            const angle = Math.atan2(me.clientY - cy, me.clientX - cx) * (180 / Math.PI) + 90;
                            updateElement(el.id, { rotation: Math.round(angle) });
                          };
                          const onUp = () => {
                            window.removeEventListener('pointermove', onMove);
                            window.removeEventListener('pointerup', onUp);
                            commit([...elements]);
                          };
                          window.addEventListener('pointermove', onMove);
                          window.addEventListener('pointerup', onUp);
                        }}
                      >
                        <div className="w-[1px] h-4 bg-[#3b82f6]" />
                        <div className="w-5 h-5 bg-white border-2 border-[#3b82f6] rounded-full shadow-lg flex items-center justify-center cursor-alias hover:scale-110 transition-transform">
                          <RotateCw size={10} className="text-[#3b82f6]" />
                        </div>
                      </div>

                      {/* Resize Handles - Top Side */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-n-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startY = ev.clientY;
                             const startElY = el.y, startH = el.height || 0;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dy = ((me.clientY - startY) / r.height) * 1000;
                               updateElement(el.id, { y: Math.min(startElY + startH - 10, startElY + dy), height: Math.max(10, startH - dy) });
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); commit([...elements]); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />
                      
                      {/* Resize Handles - Bottom Side */}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-s-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startY = ev.clientY;
                             const startH = el.height || 0;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dy = ((me.clientY - startY) / r.height) * 1000;
                               updateElement(el.id, { height: Math.max(10, startH + dy) });
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); commit([...elements]); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />

                      {/* Resize Handles - Left Side */}
                      <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-w-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startX = ev.clientX;
                             const startElX = el.x, startW = el.width || 0;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dx = ((me.clientX - startX) / r.width) * 1000;
                               updateElement(el.id, { x: Math.min(startElX + startW - 10, startElX + dx), width: Math.max(10, startW - dx) });
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); commit([...elements]); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />

                      {/* Resize Handles - Right Side */}
                      <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-e-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startX = ev.clientX;
                             const startW = el.width || 0;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dx = ((me.clientX - startX) / r.width) * 1000;
                               updateElement(el.id, { width: Math.max(10, startW + dx) });
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); commit([...elements]); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />

                      {/* Corner Handles - NW */}
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-nw-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startX = ev.clientX, startY = ev.clientY;
                             const startElX = el.x, startElY = el.y, startW = el.width || 0, startH = el.height || 0;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dx = ((me.clientX - startX) / r.width) * 1000;
                               const dy = ((me.clientY - startY) / r.height) * 1000;
                               updateElement(el.id, { 
                                 x: Math.min(startElX + startW - 10, startElX + dx), 
                                 y: Math.min(startElY + startH - 10, startElY + dy),
                                 width: Math.max(10, startW - dx),
                                 height: Math.max(10, startH - dy)
                               });
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); commit([...elements]); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />

                      {/* Corner Handles - NE */}
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-ne-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startX = ev.clientX, startY = ev.clientY;
                             const startElY = el.y, startW = el.width || 0, startH = el.height || 0;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dx = ((me.clientX - startX) / r.width) * 1000;
                               const dy = ((me.clientY - startY) / r.height) * 1000;
                               updateElement(el.id, { 
                                 y: Math.min(startElY + startH - 10, startElY + dy),
                                 width: Math.max(10, startW + dx),
                                 height: Math.max(10, startH - dy)
                               });
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); commit([...elements]); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />

                      {/* Corner Handles - SW */}
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-sw-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startX = ev.clientX, startY = ev.clientY;
                             const startElX = el.x, startW = el.width || 0, startH = el.height || 0;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dx = ((me.clientX - startX) / r.width) * 1000;
                               const dy = ((me.clientY - startY) / r.height) * 1000;
                               updateElement(el.id, { 
                                 x: Math.min(startElX + startW - 10, startElX + dx), 
                                 width: Math.max(10, startW - dx),
                                 height: Math.max(10, startH + dy)
                               });
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); commit([...elements]); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />

                      {/* Corner Handles - SE */}
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-se-resize hover:scale-125 transition-transform" 
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startX = ev.clientX, startY = ev.clientY;
                             const startW = el.width || 0, startH = el.height || 0;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dw = ((me.clientX - startX) / r.width) * 1000;
                               const dh = ((me.clientY - startY) / r.height) * 1000;
                               updateElement(el.id, { width: Math.max(10, startW + dw), height: Math.max(10, startH + dh) });
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); commit([...elements]); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />
                    </>
                  )}

                  {/* --- Element Content --- */}
                  {el.type === 'rect' && (
                    <div className="w-full h-full" style={{ 
                      backgroundColor: el.bgColor || el.color, 
                      border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#000000'}` : 'none' 
                    }} />
                  )}
                  {(el.type === 'circle' || el.type === 'ellipse') && (
                    <div className="w-full h-full rounded-full" style={{ 
                      backgroundColor: el.bgColor || el.color,
                      border: el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor || '#000000'}` : 'none'
                    }} />
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
                  {el.type === 'link' && (
                    <div className="w-full h-full border border-dashed border-blue-400 bg-blue-500/10 flex items-center justify-center">
                       <LinkIcon size={12} className="text-blue-500 opacity-50" />
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
                        placeholder="Type your text"
                        autoFocus={isActive && el.text === ''}
                        onChange={ev => updateElement(el.id, { text: ev.target.value })}
                        onClick={ev => ev.stopPropagation()}
                        className="w-full bg-transparent border-none outline-none p-0 m-0"
                        style={{
                          color: el.color || '#000',
                          fontSize: `${((el.size || 14) / 1000) * 100}%`,
                          fontFamily: getFontFamily(el.fontName),
                          fontWeight: el.isBold ? 'bold' : 'normal',
                          fontStyle: el.isItalic ? 'italic' : 'normal',
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart Alignment Guides Overlay */}
        {guides.v !== null && (
          <div 
            className="absolute top-0 bottom-0 border-l border-dashed border-indigo-400 z-40 pointer-events-none opacity-60" 
            style={{ left: `${(guides.v / 1000) * 100}%` }}
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[8px] px-1 rounded font-bold">CENTER</div>
          </div>
        )}
        {guides.h !== null && (
          <div 
            className="absolute left-0 right-0 border-t border-dashed border-indigo-400 z-40 pointer-events-none opacity-60" 
            style={{ top: `${(guides.h / 1000) * 100}%` }}
          >
             <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-indigo-500 text-white text-[8px] px-1 rounded font-bold [writing-mode:vertical-lr]">CENTER</div>
          </div>
        )}

        {/* --- Contextual Tool Options Bar (Professional additions) --- */}
        {mode !== 'select' && !activeElementId && (
          <div className="flex items-center gap-6 px-8 py-3 bg-white border-t border-slate-200 animate-in slide-in-from-top-1 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-50 overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                <Layout size={14} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Tool Settings</span>
              <div className="h-4 w-px bg-slate-200 mx-2" />
            </div>
            
            {/* Sampling Tool (Eye Dropper) */}
            <button
               onClick={() => setMode('picker')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all shrink-0 ${mode === 'picker' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'}`}
            >
               <Pipette size={14} />
               <span className="text-[10px] font-bold">Pick from Document</span>
            </button>

            {/* Common Color Selector (Grid) */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{mode === 'erase' ? 'Whiteout Fill' : 'Color'}</span>
              <div className="grid grid-cols-7 gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-inner">
                {PRO_COLORS.map(c => (
                  <button 
                    key={c}
                    onClick={() => setActiveColor(c)}
                    className={`w-4 h-4 rounded-sm border transition-all ${activeColor === c ? 'border-indigo-600 scale-125 z-10 shadow-sm' : 'border-slate-300/50 hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Typography Logic for Text Tools */}
            {(['text', 'magic-edit'] as EditorMode[]).includes(mode) && (
              <div className="flex items-center gap-4 animate-in fade-in transition-all shrink-0">
                 <div className="h-6 w-px bg-slate-200" />
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Size</span>
                    <select 
                      value={activeFontSize}
                      onChange={e => setActiveFontSize(parseInt(e.target.value))}
                      className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-[11px] font-black text-indigo-600 outline-none hover:border-indigo-400 transition-all cursor-pointer shadow-sm"
                    >
                      {[8, 10, 12, 14, 16, 18, 24, 30, 36, 48, 64, 72].map(s => <option key={s} value={s}>{s}px</option>)}
                    </select>
                 </div>
              </div>
            )}

            {mode === 'erase' && (
              <div className="flex items-center gap-3 animate-in fade-in transition-all shrink-0">
                <div className="h-6 w-px bg-slate-200" />
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-tight">Eraser Active</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── HIDDEN IMAGE UPLOAD ─────────────────────────── */}
      <input id="img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />


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
            const newEl: EditElement = { id: `ocr-${Date.now()}`, type: 'text', pageIndex, x: 100, y: 100, width: 800, height: 400, color: activeColor, text, size: 12, opacity: 1 };
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

      {/* Find & Replace Modal */}
      {showFindReplace && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-lg">Find & Replace</h3>
              <button 
                onClick={() => setShowFindReplace(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-all"
              >
                <Trash2 size={18} className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Find Text</label>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="e.g. Contract"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Replace With</label>
                <input 
                  type="text" 
                  value={replaceTerm}
                  onChange={e => setReplaceTerm(e.target.value)}
                  placeholder="e.g. Agreement"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setShowFindReplace(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[11px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFindReplace}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest text-[11px]"
                >
                  Replace All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sejda Style Apply Bar */}
      <div className="shrink-0 bg-[#f3f3f3] border-t border-slate-200 py-6 flex justify-center sticky bottom-0 z-[200]">
        <button
          onClick={() => onFinalSave?.(elements)}
          className="flex items-center gap-3 px-8 py-3 bg-[#11b67a] hover:bg-[#0da26a] text-white rounded-md text-xl font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-95"
        >
          Apply changes <ChevronRight size={24} />
        </button>
      </div>
      {/* ─── NEW SIGNATURE PAD MODAL ─────────────────── */}
      {isSigPadOpen && (
        <SignaturePad 
          onSave={(base64: string, shouldSave: boolean) => {
            if (shouldSave) {
              setStoredSignatures(prev => [...prev, base64]);
            }
            // Add signature as an element at center of current view
            const newEl: EditElement = {
              id: `sig-${Date.now()}`,
              type: 'image',
              pageIndex,
              x: 400,
              y: 400,
              width: 200,
              height: 100,
              imageUrl: base64,
              opacity: 1
            };
            setElements([...elements, newEl]);
            setActiveElementId(newEl.id);
            setMode('select');
            setIsSigPadOpen(false);
          }}
          onCancel={() => setIsSigPadOpen(false)}
        />
      )}
    </div>
  );
};
