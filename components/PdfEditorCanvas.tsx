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
  AlignLeft,
  AlignCenter,
  AlignRight,
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
  HelpCircle,
  Keyboard,
  X,
} from 'lucide-react';
import { OCRPanel } from './OCRPanel';
import { ConversionPanel } from './ConversionPanel';
import { PageToolsPanel } from './PageToolsPanel';
import { FormBuilder } from './FormBuilder';
import { AuditLog } from './AuditLog';
import { suggestFormValues } from '../services/geminiService';
import { EditElement, EditElementType, extractStyleAtPoint, getTextItems, PdfTextItem, sampleBackgroundColor, EditorMode } from '../utils/pdfHelpers';
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
  // Master control props
  mode?: EditorMode;
  setMode?: (m: EditorMode) => void;
  activeColor?: string;
  setActiveColor?: (c: string) => void;
  whiteoutColor?: string;
  setWhiteoutColor?: (c: string) => void;
  activeFont?: string;
  activeFontSize?: number;
  isBold?: boolean;
  isItalic?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  zoom?: number;
  searchTerm?: string;
  showGrid?: boolean;
  setShowGrid?: (s: boolean) => void;
}



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

export const PdfEditorCanvas = React.forwardRef<any, PdfEditorCanvasProps>((props, ref) => {
  const {
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
    mode: propMode,
    setMode: propSetMode,
    activeColor: propActiveColor,
    setActiveColor: propSetActiveColor,
    whiteoutColor: propWhiteoutColor,
    setWhiteoutColor: propSetWhiteoutColor,
    activeFont: propActiveFont,
    activeFontSize: propActiveFontSize,
    isBold: propIsBold,
    isItalic: propIsItalic,
    textAlign: propTextAlign,
    zoom: propZoom,
    searchTerm: propSearchTerm,
    showGrid: propShowGrid,
    setShowGrid: propSetShowGrid,
  } = props;
  const [elements, setElements] = React.useState<EditElement[]>(initialElements);
  const [history, setHistory] = React.useState<EditElement[][]>([initialElements]);
  const [historyStep, setHistoryStep] = React.useState(0);

  React.useImperativeHandle(ref, () => ({
    undo,
    redo,
    canUndo: historyStep > 0,
    canRedo: historyStep < history.length - 1
  }));

  // Internal fallbacks if not controlled
  const [internalMode, setInternalMode] = React.useState<EditorMode>('magic-edit');
  const [internalActiveColor, setInternalActiveColor] = React.useState('#000000');
  const [internalActiveFont, setInternalActiveFont] = React.useState('Helvetica');
  const [internalActiveFontSize, setInternalActiveFontSize] = React.useState(14);
  const [internalIsBold, setInternalIsBold] = React.useState(false);
  const [internalIsItalic, setInternalIsItalic] = React.useState(false);
  const [internalIsUnderline, setInternalIsUnderline] = React.useState(false);
  const [internalTextAlign, setInternalTextAlign] = React.useState<'left' | 'center' | 'right'>('left');
  const [internalZoom, setInternalZoom] = React.useState(1);
  const [internalWhiteoutColor, setInternalWhiteoutColor] = React.useState('#FFFFFF');
  const [internalSearchTerm, setInternalSearchTerm] = React.useState("");

  // Unified derived state
  const mode = propMode || internalMode;
  const setMode = propSetMode || setInternalMode;
  const activeColor = propActiveColor || internalActiveColor;
  const setActiveColor = propSetActiveColor || setInternalActiveColor;
  const activeFont = propActiveFont || internalActiveFont;
  const activeFontSize = propActiveFontSize || internalActiveFontSize;
  const isBold = propIsBold ?? internalIsBold;
  const isItalic = propIsItalic ?? internalIsItalic;
  const textAlign = propTextAlign || internalTextAlign;
  const zoom = propZoom ?? internalZoom;
  const whiteoutColor = propWhiteoutColor || internalWhiteoutColor;
  const setWhiteoutColor = propSetWhiteoutColor || setInternalWhiteoutColor;
  const searchTerm = propSearchTerm ?? internalSearchTerm;

  const setZoom = (z: number | ((prev: number) => number)) => {
    const val = typeof z === 'function' ? z(zoom) : z;
    setInternalZoom(val);
  };
  const setSearchTerm = (s: string) => {
    setInternalSearchTerm(s);
  };

  // Setters that handle both controlled and uncontrolled scenarios
  const setModeLocal = (m: EditorMode) => { setMode(m); if (propSetMode) propSetMode(m); };
  const setActiveColorLocal = (c: string) => { setActiveColor(c); if (propSetActiveColor) propSetActiveColor(c); };

  // Use refs to avoid stale closures in event listeners
  const elementsRef = React.useRef(elements);
  const historyStepRef = React.useRef(historyStep);
  const historyRef = React.useRef(history);

  React.useEffect(() => { elementsRef.current = elements; }, [elements]);
  React.useEffect(() => { historyStepRef.current = historyStep; }, [historyStep]);
  React.useEffect(() => { historyRef.current = history; }, [history]);

  const commit = (next: EditElement[]) => {
    const newHistory = historyRef.current.slice(0, historyStepRef.current + 1);
    const updatedHistory = [...newHistory, next];
    
    setHistory(updatedHistory);
    setHistoryStep(updatedHistory.length - 1);
    setElements(next);
    onSave(next);

    addAuditEntry(`Modified page ${pageIndex + 1}`, `${next.length} elements`);

    if (docId) {
      import('../services/collaborationService').then(m => m.updateSharedState(docId, next));
    }
  };

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
  const [replaceTerm, setReplaceTerm] = React.useState('');

  const PRO_COLORS = [
    '#000000', '#424242', '#636363', '#9c9c9c', '#cecece', '#e7e7e7', '#ffffff',
    '#ff0000', '#ff9c00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9c00ff',
    '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9dadb',
    '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6',
    '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3'
  ];

  // Sync state with selected element
  React.useEffect(() => {
    const el = elements.find(e => e.id === activeElementId);
    if (el && el.type === 'text') {
      // Note: in controlled mode, we should ideally inform the parent, but for now we just sync local view
      if (propSetMode) { /* Handle element selection sync to toolbar if needed */ }
    }
  }, [activeElementId, elements]);

  const handleBoldToggle = () => {
    const next = !isBold;
    if (activeElementId) updateElement(activeElementId, { isBold: next });
  };
  const handleItalicToggle = () => {
    const next = !isItalic;
    if (activeElementId) updateElement(activeElementId, { isItalic: next });
  };
  const handleTextAlign = (align: 'left' | 'center' | 'right') => {
    if (activeElementId) updateElement(activeElementId, { textAlign: align });
  };
  const handleFontSize = (size: number) => {
    if (activeElementId) updateElement(activeElementId, { size });
  };
  const handleFontFamily = (font: string) => {
    if (activeElementId) updateElement(activeElementId, { fontName: font });
  };


  // Inline modals replacing prompt()
  const [linkModal, setLinkModal] = React.useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [linkUrl, setLinkUrl] = React.useState('https://');
  const [commentModal, setCommentModal] = React.useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = React.useState('');

  // Toast notifications replacing alert()
  const [toasts, setToasts] = React.useState<{ id: number; type: 'success' | 'error' | 'info'; msg: string }[]>([]);
  const showToast = React.useCallback((type: 'success' | 'error' | 'info', msg: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Keyboard shortcuts overlay
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  const [showWhiteoutPicker, setShowWhiteoutPicker] = React.useState(false);
  const [hexInput, setHexInput] = React.useState('#000000');
  const [pickerHoverColor, setPickerHoverColor] = React.useState(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const pageRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setElements(initialElements);
    setHistory([initialElements]);
    setHistoryStep(0);
  }, [initialElements, pageIndex]);

  // Commit already refactored above

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
    setElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } : el)));
    // We don't onSave here to avoid heavy operations during dragging
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

  // ── Unified keyboard handler (single registration) ──
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

      // Ctrl+Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); undo(); return;
      }
      // Ctrl+Shift+Z: Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); redo(); return;
      }
      // Ctrl+D: Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && activeElementId) {
        e.preventDefault();
        const el = elements.find(item => item.id === activeElementId);
        if (el) duplicateElement(el);
        return;
      }
      // Delete / Backspace: delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeElementId) {
        e.preventDefault();
        deleteElement(activeElementId);
        return;
      }
      // Escape: deselect / switch to select mode
      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveElementId(null);
        setMode('select');
        return;
      }
      // ?: show shortcuts help
      if (e.key === '?') {
        setShowShortcuts(s => !s);
        return;
      }
      // Arrow keys: nudge selected element
      if (activeElementId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const el = elements.find(item => item.id === activeElementId);
        if (el) {
          const step = e.shiftKey ? 20 : 2;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
          updateElement(activeElementId, { x: Math.max(0, Math.min(1000, el.x + dx)), y: Math.max(0, Math.min(1000, el.y + dy)) });
        }
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeElementId, elements, historyStep, mode]);

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
      try {
        const style = await extractStyleAtPoint(file, pageIndex, pos.x, pos.y, image);
        if (mode === 'picker') {
          const sampledColor = style.color || style.backgroundColor || '#000000';
          setActiveColor(sampledColor);
          setHexInput(sampledColor);
          setPickerHoverColor(null);
          if (activeElementId) {
            updateElement(activeElementId, { color: sampledColor });
          }
          showToast('success', 'Color sampled from document');
        } else {
          if (activeElementId) {
            updateElement(activeElementId, {
              fontName: style.fontName,
              size: style.fontSize
            });
          }
        }
      } catch(e) {
        showToast('error', 'Could not sample color at that point');
      }
      setMode('select');
      return;
    }
    if (mode === 'erase') {
      // Use whiteoutColor (user-chosen, defaults to white)
      setActiveColor(whiteoutColor);
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
      
      // Auto-sample color logic for better masking — use actual file prop (bug fix)
      let bgColor = '#FFFFFF';
      let fontColor = activeColor;
      let fontToUse = 'Helvetica';
      let isBoldDetected = false;
      let isItalicDetected = false;
      
      try {
        const style = await extractStyleAtPoint(file, pageIndex, pos.x, pos.y, image);
        bgColor = style.backgroundColor || '#FFFFFF';
        fontColor = style.color || activeColor;
        
        const fName = style.fontName.toLowerCase();
        isBoldDetected = fName.includes('bold');
        isItalicDetected = fName.includes('italic') || fName.includes('oblique');
        
        if (fName.includes('times')) fontToUse = 'Times-Roman';
        else if (fName.includes('courier')) fontToUse = 'Courier';
        else fontToUse = 'Helvetica';
      } catch (e) {
        console.warn('Color sampling failed, using defaults', e);
      }

      if (clicked) {
        const mask: EditElement = { 
          id: `mask-${Date.now()}`, 
          type: 'rect', 
          pageIndex, 
          x: clicked.x, 
          y: clicked.y, 
          width: clicked.width, 
          height: clicked.height, 
          color: bgColor, 
          opacity: 1 
        };
        const text: EditElement = { 
          id: `t-${Date.now()}`, 
          type: 'text', 
          pageIndex, 
          x: clicked.x, 
          y: clicked.y, 
          width: clicked.width, 
          height: clicked.height, 
          color: fontColor, 
          text: clicked.str, 
          size: clicked.fontSize, 
          fontName: fontToUse,
          isBold: isBoldDetected,
          isItalic: isItalicDetected,
          opacity: 1 
        };
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
        // Show inline comment modal instead of prompt()
        setCommentModal({ x: pos.x, y: pos.y });
        setCommentText('');
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
        // Show inline link modal instead of prompt()
        setLinkModal({ x, y, w, h });
        setLinkUrl('https://');
        setIsDrawing(false);
        setCurrentPath([]);
        setDragStart(null);
        setDragEnd(null);
        return;
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
    const base = Date.now();
    
    textItems.forEach((item, idx) => {
      if (item.str.toLowerCase().includes(searchTerm.toLowerCase())) {
        // Fixed: unique IDs using base timestamp + index to prevent collisions
        const mask: EditElement = { 
          id: `fr-mask-${base}-${idx}`, 
          type: 'rect', 
          pageIndex, 
          x: item.x, y: item.y, 
          width: item.width, height: item.height, 
          color: '#FFFFFF', opacity: 1 
        };
        const newText: EditElement = { 
          id: `fr-text-${base}-${idx}`, 
          type: 'text', 
          pageIndex, 
          x: item.x, y: item.y, 
          width: item.width, height: item.height, 
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
      showToast('success', `Replaced ${count} occurrence${count !== 1 ? 's' : ''}`);
    } else {
      showToast('info', 'No matches found');
    }
    setShowFindReplace(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 overflow-hidden select-none" onClick={() => setActiveElementId(null)}>
      {/* Dynamic Context Hint (Conditional) */}
      <div className="shrink-0">
        {mode === 'erase' && (
          <div className="px-6 py-1.5 bg-amber-500/10 border-t border-amber-500/10 flex items-center gap-2 animate-in slide-in-from-top-1 duration-300">
             <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Whiteout covers content but does NOT permanently redact underlying data.</span>
          </div>
        )}
      </div>

      {/* ─── SCROLLABLE CANVAS AREA ─────────────────────── */}
      <div 
        className={`flex-1 overflow-auto bg-[#141414] canvas-grid editor-scrollbar ${(mode === 'picker' || mode === 'font-picker') ? 'cursor-crosshair' : ''}`}
        ref={containerRef}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 40px' }}
      >
        {/* The PDF page — width scales naturally so coordinate math stays correct */}
        <div
          style={{
            position: 'relative',
            width: `${794 * zoom}px`,
            flexShrink: 0,
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8), 0 25px 50px -12px rgba(0,0,0,0.6)',
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: '#fff'
          }}
        >
          <div
            className={`relative bg-white shadow-2xl animate-fade-in select-none touch-none ${
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
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={e => e.stopPropagation()}
          >
            {/* Search Highlighting Overlay */}
            {searchTerm.length > 2 && textItems && textItems.map((item, idx) => {
              if (item.str.toLowerCase().includes(searchTerm.toLowerCase())) {
                return (
                  <div
                    key={`search-hl-${idx}`}
                    className="absolute bg-yellow-400/40 mix-blend-multiply rounded-sm pointer-events-none z-10 animate-pulse"
                    style={{
                      left: `${item.x / 10}%`,
                      top: `${item.y / 10}%`,
                      width: `${item.width / 10}%`,
                      height: `${item.height / 10}%`
                    }}
                  />
                );
              }
              return null;
            })}

            {/* Layout Grid Overlay */}
            {(propShowGrid ?? false) && (
              <div className="absolute inset-0 pointer-events-none z-[5]" style={{
                backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
            )}

            {/* Picker overlay */}
            {mode === 'picker' && (
              <div className="absolute inset-0 z-[500] pointer-events-none" style={{cursor:'crosshair'}}>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur text-white text-[11px] font-bold px-5 py-3 rounded-2xl shadow-2xl border border-white/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <path d="M2 13.5V21h7.5"/><path d="M14 13V7l3-3 3 3-3 3-4 0z"/><path d="M2 21l5.5-5.5M7.5 21l-5.5-5.5"/>
                  </svg>
                  Click anywhere on the document to sample that color
                  {pickerHoverColor && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full border border-white/30" style={{backgroundColor: pickerHoverColor}} />
                      <span className="font-mono text-slate-300">{pickerHoverColor}</span>
                    </span>
                  )}
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
                    zIndex: isActive ? 2000 : 100,
                    cursor: (mode === 'select' || isActive) ? 'move' : 'pointer',
                    minWidth: 20,
                    minHeight: 10,
                    pointerEvents: 'auto',
                  }}
                  onPointerDown={ev => {
                    // Prevent page-level drawing if we click an element
                    ev.stopPropagation();
                    setActiveElementId(el.id);
                    if (mode !== 'select') setMode('select');

                    const target = ev.currentTarget as HTMLDivElement;
                    const startX = ev.clientX, startY = ev.clientY;
                    const startXPos = el.x, startYPos = el.y;
                    let lastX = startXPos, lastY = startYPos;

                    const onMove = (me: PointerEvent) => {
                      if (!pageRef.current) return;
                      const r = pageRef.current.getBoundingClientRect();
                      const dx = ((me.clientX - startX) / r.width) * 1000;
                      const dy = ((me.clientY - startY) / r.height) * 1000;
                      let newX = startXPos + dx, newY = startYPos + dy;
                      const w = el.width || 0, h = el.height || 0;
                      let guideV: number | null = null, guideH: number | null = null;
                      if (Math.abs((newX + w / 2) - 500) < 5) { newX = 500 - w / 2; guideV = 500; }
                      if (Math.abs((newY + h / 2) - 500) < 5) { newY = 500 - h / 2; guideH = 500; }
                      newX = Math.max(0, Math.min(1000 - w, newX));
                      newY = Math.max(0, Math.min(1000 - h, newY));
                      lastX = newX; lastY = newY;
                      target.style.left = `${newX / 10}%`;
                      target.style.top = `${newY / 10}%`;
                      setGuides({ v: guideV, h: guideH });
                    };

                    const onUp = () => {
                      setGuides({ v: null, h: null });
                      window.removeEventListener('pointermove', onMove);
                      window.removeEventListener('pointerup', onUp);
                      
                      const currentElements = elementsRef.current;
                      const next = currentElements.map(e => e.id === el.id ? { ...e, x: lastX, y: lastY } : e);
                      commit(next);
                    };
                    window.addEventListener('pointermove', onMove);
                    window.addEventListener('pointerup', onUp);
                  }}
                >
                  {/* Floating Contextual Toolbar */}
                  {isActive && (
                    <div 
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 studio-glass px-3 py-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-2.5 z-[2000] animate-in fade-in slide-in-from-bottom-2 duration-300 border border-white/10"
                      onClick={e => e.stopPropagation()}
                      onPointerDown={e => e.stopPropagation()}
                    >
                      {el.type === 'text' && (
                        <>
                          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                            <button onClick={() => updateElement(el.id, { isBold: !el.isBold })} className={`w-8 h-8 rounded-md flex items-center justify-center font-black transition-all ${el.isBold ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>B</button>
                            <button onClick={() => updateElement(el.id, { isItalic: !el.isItalic })} className={`w-8 h-8 rounded-md flex items-center justify-center italic font-bold transition-all border-l border-white/5 ${el.isItalic ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>I</button>
                          </div>
                          <div className="w-px h-5 bg-white/10" />
                        </>
                      )}
                      <div className="flex items-center gap-1.5">
                        {['#000000', '#FFFFFF', '#EF4444', '#3B82F6', '#10B981', '#F59E0B'].map(c => (
                          <button 
                            key={c}
                            onClick={() => updateElement(el.id, { color: c, bgColor: c })}
                            className={`w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125 shadow-sm ${(el.color === c || el.bgColor === c) ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#1a1a1a] scale-110' : ''}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>

                      <div className="w-px h-5 bg-white/10" />

                      {/* Layer Controls */}
                      <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                        <button onClick={() => bringToFront(el.id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white" title="Bring to Front">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 13V2l8 4-8 4"/><path d="M20 18l-8 4-8-4"/><path d="M20 12l-8 4-8-4"/></svg>
                        </button>
                        <button onClick={() => sendToBack(el.id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white border-l border-white/5" title="Send to Back">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l8 4-8 4-8-4 8-4z"/><path d="M20 12l-8 4-8-4"/><path d="M20 18l-8 4-8-4"/></svg>
                        </button>
                      </div>

                      <div className="w-px h-5 bg-white/10" />

                      <div className="flex items-center gap-1">
                        <button onClick={() => duplicateElement(el)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-white/5 rounded-md transition-all" title="Duplicate">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </button>
                        <button onClick={() => deleteElement(el.id)} className="w-8 h-8 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 rounded-md transition-all" title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Selection Visuals */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] pointer-events-none rounded-sm animate-pulse z-50" />
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing z-[60]"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const rect = pageRef.current?.getBoundingClientRect();
                             if (!rect) return;
                             const centerX = (el.x / 1000) * rect.width + ((el.width || 0) / 2000) * rect.width;
                             const centerY = (el.y / 1000) * rect.height + ((el.height || 0) / 2000) * rect.height;
                             const onMove = (me: PointerEvent) => {
                               const dx = me.clientX - (rect.left + centerX), dy = me.clientY - (rect.top + centerY);
                               const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
                               updateElement(el.id, { rotation: angle });
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); commit([...elements]); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      >
                         <div className="w-5 h-5 bg-white border-2 border-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                           <RotateCw size={10} className="text-indigo-600" />
                         </div>
                         <div className="w-[2px] h-5 bg-indigo-500/50" />
                      </div>
                      {['nw', 'ne', 'sw', 'se'].map(pos => (
                        <div 
                          key={pos}
                          className="absolute w-2.5 h-2.5 bg-white border-2 border-indigo-600 rounded-full shadow-md z-[60] hover:scale-150 transition-transform"
                          style={{
                            top: pos.includes('n') ? '-4px' : 'auto',
                            bottom: pos.includes('s') ? '-4px' : 'auto',
                            left: pos.includes('w') ? '-4px' : 'auto',
                            right: pos.includes('e') ? '-4px' : 'auto',
                            cursor: `${pos}-resize`
                          }}
                          onPointerDown={ev => {
                            ev.stopPropagation();
                            const startX = ev.clientX, startY = ev.clientY;
                            const startX_el = el.x, startY_el = el.y, startW = el.width || 0, startH = el.height || 0;
                            const onMove = (me: PointerEvent) => {
                              if (!pageRef.current) return;
                              const r = pageRef.current.getBoundingClientRect();
                              const dx = ((me.clientX - startX) / r.width) * 1000, dy = ((me.clientY - startY) / r.height) * 1000;
                              let nextX = startX_el, nextY = startY_el, nextW = startW, nextH = startH;
                              if (pos.includes('n')) { nextY = startY_el + dy; nextH = startH - dy; }
                              if (pos.includes('s')) { nextH = startH + dy; }
                              if (pos.includes('w')) { nextX = startX_el + dx; nextW = startW - dx; }
                              if (pos.includes('e')) { nextW = startW + dx; }
                              updateElement(el.id, { x: nextX, y: nextY, width: Math.max(5, nextW), height: Math.max(5, nextH) });
                            };
                            const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); commit([...elements]); };
                            window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                          }}
                        />
                      ))}
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
                        placeholder="Type here..."
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
                <X size={18} className="text-slate-400" />
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

      {/* ── Inline Link Modal ─────────────────────────── */}
      {linkModal && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={() => setLinkModal(null)}>
          <div className="w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-slate-800 text-lg mb-1">Add Hyperlink</h3>
            <p className="text-slate-400 text-xs mb-4">The link will be applied to the drawn area.</p>
            <input
              type="url"
              autoFocus
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (linkUrl && linkModal) {
                    const newEl: EditElement = { id: `link-${Date.now()}`, type: 'link', pageIndex, x: linkModal.x, y: linkModal.y, width: linkModal.w, height: linkModal.h, linkUrl, opacity: 1 };
                    commit([...elements, newEl]);
                    setActiveElementId(newEl.id);
                    setMode('select');
                  }
                  setLinkModal(null);
                }
              }}
            />
            <div className="flex gap-3">
              <button onClick={() => setLinkModal(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
              <button
                onClick={() => {
                  if (linkUrl && linkModal) {
                    const newEl: EditElement = { id: `link-${Date.now()}`, type: 'link', pageIndex, x: linkModal.x, y: linkModal.y, width: linkModal.w, height: linkModal.h, linkUrl, opacity: 1 };
                    commit([...elements, newEl]);
                    setActiveElementId(newEl.id);
                    setMode('select');
                  }
                  setLinkModal(null);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Inline Comment Modal ─────────────────────── */}
      {commentModal && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={() => setCommentModal(null)}>
          <div className="w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-slate-800 text-lg mb-4">Add Comment</h3>
            <textarea
              autoFocus
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Type your comment..."
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setCommentModal(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">Cancel</button>
              <button
                onClick={() => {
                  if (commentText.trim() && docId) {
                    import('../services/collaborationService').then(m => m.addComment(docId, { text: commentText, x: commentModal!.x, y: commentModal!.y, pageIndex }));
                  }
                  setCommentModal(null);
                  setMode('select');
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Keyboard Shortcuts Overlay ───────────────── */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
          <div className="w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-7 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-slate-800 text-xl">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['Ctrl + Z', 'Undo'],
                ['Ctrl + Y', 'Redo'],
                ['Ctrl + D', 'Duplicate selected'],
                ['Delete', 'Delete selected'],
                ['Escape', 'Deselect / Select mode'],
                ['Arrow Keys', 'Nudge element (2px)'],
                ['Shift + Arrows', 'Nudge element (20px)'],
                ['?', 'Show this help'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 text-xs">{desc}</span>
                  <span className="kbd">{key}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 mt-4">Click anywhere to close</p>
          </div>
        </div>
      )}

      {/* ── Toast Notifications ──────────────────────── */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[900] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm animate-toast-in ${
              toast.type === 'success' ? 'bg-emerald-500 text-white' :
              toast.type === 'error'   ? 'bg-red-500 text-white' :
                                         'bg-slate-800 text-white'
            }`}
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          >
            {toast.type === 'success' && <CheckCircle2 size={16} />}
            {toast.type === 'error' && <X size={16} />}
            {toast.type === 'info' && <Search size={16} />}
            {toast.msg}
          </div>
        ))}
      </div>
    </div>
  );
});
