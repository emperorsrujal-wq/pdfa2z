import * as React from 'react';
import {
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Undo2,
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
  Pipette,
  RotateCw,
  PenLine,
  Pen,
  Link2,
  Circle,
  X,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { ConversionPanel } from './ConversionPanel';
import { PageToolsPanel } from './PageToolsPanel';
import { FormBuilder } from './FormBuilder';
import { AuditLog } from './AuditLog';
import { SignaturePad } from './SignaturePad';
import { suggestFormValues } from '../services/geminiService';
import { EditElement, PageDimensions, pdfToImages, insertBlankPage, removePages, editPdf, downloadBlob, sampleBackgroundColor, getTextItems, findTextPositions, RedactionArea, performOCR, extractStyleAtPoint, PdfTextItem } from '../utils/pdfHelpers';
import { ObjectToolbar } from './ObjectToolbar';
import { Tooltip } from './Tooltip';
import { FindReplace } from './FindReplace';
import { OCRPanel } from './OCRPanel';

interface PdfEditorCanvasProps {
  image: string;
  dimensions?: { width: number, height: number };
  pageIndex: number;
  totalPages?: number;
  elements: EditElement[];
  historyStep: number;
  canRedo: boolean;
  onCommit: (elements: EditElement[]) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: (elements: EditElement[]) => void;
  onFinalSave?: (elements: EditElement[]) => void;
  onCancel: () => void;
  isEmbedded?: boolean;
  initialMode?: EditorMode;
  mode?: EditorMode;
  onModeChange?: (mode: EditorMode) => void;
  hideChrome?: boolean;
  zoom?: number;
  onZoomChange?: (z: number) => void;
  activeColor?: string;
  onColorChange?: (c: string) => void;
  activeFontSize?: number;
  onFontSizeChange?: (s: number) => void;
  activeFontName?: string;
  onFontNameChange?: (f: string) => void;
  activeBrushSize?: number;
  onBrushSizeChange?: (b: number) => void;
  onActiveElementChange?: (id: string | null, element?: EditElement) => void;
  textItems?: PdfTextItem[];
  file: File;
  docId?: string;
  onInsertPage?: () => void;
  onDeletePage?: () => void;
  setElements: React.Dispatch<React.SetStateAction<EditElement[]>>;
  onPageChange?: (pageIndex: number) => void;
  visibleTypes?: Record<string, boolean>;
  showGrid?: boolean;
  showRulers?: boolean;
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
  | 'font-picker'
  | 'watermark'
  | 'stamp'
  | 'measure'
  | 'squiggly';

const CONTEXT_FONTS = [
  { name: 'Helvetica', value: 'Helvetica' },
  { name: 'Arial', value: 'Arial' },
  { name: 'Times New Roman', value: 'Times-Roman' },
  { name: 'Courier New', value: 'Courier' },
  { name: 'Georgia', value: 'Georgia' },
  { name: 'Verdana', value: 'Verdana' },
  { name: 'Palatino', value: 'Palatino' },
  { name: 'Book Antiqua', value: 'Palatino' },
  { name: 'Garamond', value: 'Garamond' },
  { name: 'Trebuchet MS', value: 'Trebuchet MS' },
  { name: 'Impact', value: 'Impact' },
  { name: 'Comic Sans MS', value: 'Comic Sans MS' },
  { name: 'Bookman Old Style', value: 'Bookman Old Style' },
  { name: 'Candara', value: 'Candara' },
  { name: 'Calibri', value: 'Calibri' },
  { name: 'Cambria', value: 'Cambria' },
  { name: 'Segoe UI', value: 'Segoe UI' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
  { name: 'Lato', value: 'Lato' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Merriweather', value: 'Merriweather' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro' },
  { name: 'Playfair Display', value: 'Playfair Display' },
  { name: 'Fira Sans', value: 'Fira Sans' },
  { name: 'Noto Sans', value: 'Noto Sans' },
  { name: 'PT Serif', value: 'PT Serif' },
  { name: 'Ubuntu', value: 'Ubuntu' },
  { name: 'Oswald', value: 'Oswald' },
  { name: 'Nunito', value: 'Nunito' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Inter', value: 'Inter' },
  { name: 'Libre Baskerville', value: 'Libre Baskerville' },
  { name: 'Cormorant Garamond', value: 'Cormorant Garamond' },
  { name: 'DM Sans', value: 'DM Sans' },
  { name: 'Work Sans', value: 'Work Sans' },
];

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

const HIGHLIGHT_COLORS = ['#FFE600', '#00FF00', '#FFB6C1', '#ADD8E6'];

const PRO_COLORS = [
  '#000000', '#424242', '#636363', '#9c9c9c', '#cecece', '#e7e7e7', '#ffffff',
  '#ff0000', '#ff9c00', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9c00ff',
  '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9dadb',
  '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6',
  '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3'
];

const BASIC_SHAPES = [
  { id: 'rect',    label: 'Rectangle',       icon: <Square size={15} /> },
  { id: 'ellipse', label: 'Circle / Ellipse', icon: <CircleIcon size={15} /> },
] as const;

const LINE_SHAPES = [
  { id: 'line',  label: 'Line',  icon: <Minus size={15} /> },
  { id: 'arrow', label: 'Arrow', icon: <ArrowRight size={15} /> },
] as const;

function getFontFamily(fontName?: string) {
  if (!fontName) return 'Inter, "Segoe UI", Roboto, Helvetica, sans-serif';
  const map: Record<string, string> = {
    'Times-Roman': '"Times New Roman", Times, serif',
    'Helvetica': 'Inter, "Segoe UI", Roboto, Helvetica, sans-serif',
    'Courier': '"JetBrains Mono", "Courier New", Courier, monospace',
    'Courier New': '"JetBrains Mono", "Courier New", Courier, monospace',
    'Georgia': 'Georgia, serif',
    'Verdana': 'Verdana, Geneva, sans-serif',
    'Arial': 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    'Palatino': '"Palatino Linotype", "Book Antiqua", Palatino, serif',
    'Book Antiqua': '"Palatino Linotype", "Book Antiqua", Palatino, serif',
    'Garamond': 'Garamond, "EB Garamond", serif',
    'Trebuchet MS': '"Trebuchet MS", Helvetica, sans-serif',
    'Impact': 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
    'Comic Sans MS': '"Comic Sans MS", "Comic Sans", cursive, sans-serif',
    'Bookman Old Style': '"Bookman Old Style", "Book Antiqua", serif',
    'Candara': 'Candara, Calibri, Segoe, sans-serif',
    'Calibri': 'Calibri, Candara, Segoe, sans-serif',
    'Cambria': 'Cambria, Georgia, serif',
    'Segoe UI': '"Segoe UI", Tahoma, Geneva, sans-serif',
    'Roboto': 'Roboto, "Helvetica Neue", sans-serif',
    'Open Sans': '"Open Sans", sans-serif',
    'Lato': 'Lato, sans-serif',
    'Montserrat': 'Montserrat, sans-serif',
    'Merriweather': 'Merriweather, Georgia, serif',
    'Source Sans Pro': '"Source Sans Pro", sans-serif',
    'Playfair Display': '"Playfair Display", Georgia, serif',
    'Fira Sans': '"Fira Sans", sans-serif',
    'Noto Sans': '"Noto Sans", sans-serif',
    'PT Serif': '"PT Serif", Georgia, serif',
    'Ubuntu': 'Ubuntu, sans-serif',
    'Oswald': 'Oswald, sans-serif',
    'Nunito': 'Nunito, sans-serif',
    'Poppins': 'Poppins, sans-serif',
    'Inter': 'Inter, "Segoe UI", Roboto, Helvetica, sans-serif',
    'Libre Baskerville': '"Libre Baskerville", Georgia, serif',
    'Cormorant Garamond': '"Cormorant Garamond", Garamond, serif',
    'DM Sans': '"DM Sans", sans-serif',
    'Work Sans': '"Work Sans", sans-serif',
  };
  return map[fontName] || 'Inter, "Segoe UI", Roboto, Helvetica, sans-serif';
}

export const PdfEditorCanvas: React.FC<PdfEditorCanvasProps> = ({
  image,
  dimensions,
  pageIndex,
  totalPages = 1,
  elements,
  historyStep,
  canRedo,
  onCommit,
  onUndo,
  onRedo,
  onSave,
  onFinalSave,
  onCancel: _onCancel,
  isEmbedded: _isEmbedded,
  initialMode,
  mode: externalMode,
  onModeChange,
  hideChrome,
  zoom: externalZoom,
  onZoomChange,
  activeColor: externalColor,
  onColorChange,
  activeFontSize: externalFontSize,
  onFontSizeChange,
  activeFontName: externalFontName,
  onFontNameChange,
  activeBrushSize: externalBrushSize,
  onBrushSizeChange,
  textItems = [],
  file,
  docId,
  onInsertPage,
  onDeletePage,
  setElements,
  onActiveElementChange,
  onPageChange,
  visibleTypes = {},
  showGrid = false,
  showRulers = false,
}) => {
  const [internalMode, setInternalMode] = React.useState<EditorMode>(initialMode || 'magic-edit');
  const mode = externalMode ?? internalMode;
  const setMode = (m: EditorMode) => {
    setInternalMode(m);
    onModeChange?.(m);
  };

  // Auto-trigger modals when hideChrome is active and user selects certain tools
  React.useEffect(() => {
    if (!hideChrome) return;
    if (mode === 'image') {
      document.getElementById('img-upload')?.click();
      setMode('select');
    }
    if (mode === 'sign') {
      setIsSigPadOpen(true);
      setMode('select');
    }
    if (mode === 'watermark') {
      setShowWatermarkPanel(true);
      setMode('select');
    }
  }, [mode, hideChrome]);

  const [internalColor, setInternalColor] = React.useState('#000000');
  const activeColor = externalColor ?? internalColor;
  const setActiveColor = (c: string) => { setInternalColor(c); onColorChange?.(c); };

  const [internalFontSize, setInternalFontSize] = React.useState<number>(14);
  const activeFontSize = externalFontSize ?? internalFontSize;
  const setActiveFontSize = (s: number) => { setInternalFontSize(s); onFontSizeChange?.(s); };

  const [internalFontName, setInternalFontName] = React.useState('Helvetica');
  const activeFontName = externalFontName ?? internalFontName;
  const setActiveFontName = (f: string) => { setInternalFontName(f); onFontNameChange?.(f); };

  const [internalBrushSize, setInternalBrushSize] = React.useState(3);
  const activeBrushSize = externalBrushSize ?? internalBrushSize;
  const setActiveBrushSize = (b: number) => { setInternalBrushSize(b); onBrushSizeChange?.(b); };

  const [activeHighlightOpacity, setActiveHighlightOpacity] = React.useState(0.4);
  const [activeBorderColor, setActiveBorderColor] = React.useState('#000000');
  const [activeBorderWidth, setActiveBorderWidth] = React.useState(0);
  const [internalZoom, setInternalZoom] = React.useState(1);
  const zoom = externalZoom ?? internalZoom;
  const setZoom = (z: number | ((prev: number) => number)) => {
    if (typeof z === 'function') {
      setInternalZoom(prev => {
        const next = z(prev);
        onZoomChange?.(next);
        return next;
      });
    } else {
      setInternalZoom(z);
      onZoomChange?.(z);
    }
  };

  const [activeElementId, setActiveElementIdState] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const setActiveElementId = React.useCallback((id: string | null) => {
    setActiveElementIdState(id);
    const el = id ? elementsRef.current.find(e => e.id === id) : undefined;
    onActiveElementChange?.(id, el);
  }, [onActiveElementChange]);

  // Commit pending text edit when selection changes
  React.useEffect(() => {
    const editing = editingTextRef.current;
    if (editing && activeElementId !== editing.id) {
      const currentEl = elementsRef.current.find(e => e.id === editing.id);
      if (currentEl && currentEl.text !== editing.initialText) {
        onCommit(elementsRef.current);
        onSave(elementsRef.current);
      }
      editingTextRef.current = null;
    }
  }, [activeElementId, onCommit, onSave]);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState<{ x: number; y: number }[]>([]);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = React.useState<{ x: number; y: number } | null>(null);
  const [guides, setGuides] = React.useState<{ v: number | null, h: number | null }>({ v: null, h: null });
  const [measureStart, setMeasureStart] = React.useState<{ x: number; y: number } | null>(null);
  const [measureEnd, setMeasureEnd] = React.useState<{ x: number; y: number } | null>(null);
  const [measureResult, setMeasureResult] = React.useState<string | null>(null);

  // Tier 2 Modal States
  const [showOcr, setShowOcr] = React.useState(false);
  const [showConvert, setShowConvert] = React.useState(false);
  const [showPageTools, setShowPageTools] = React.useState(false);
  const [showFormBuilder, setShowFormBuilder] = React.useState(false);
  const [isAiFilling, setIsAiFilling] = React.useState(false);

  // Tier 3 Collaboration States
  const [comments, setComments] = React.useState<any[]>([]);

  // Tier 3 Audit States
  const [showAudit, setShowAudit] = React.useState(false);
  const [auditEntries, setAuditEntries] = React.useState<any[]>([]);

  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showFormsMenu, setShowFormsMenu] = React.useState(false);
  const [showAnnotateMenu, setShowAnnotateMenu] = React.useState(false);
  const [showSignMenu, setShowSignMenu] = React.useState(false);
  const [showShapesMenu, setShowShapesMenu] = React.useState(false);
  const [isSigPadOpen, setIsSigPadOpen] = React.useState(false);
  const [storedSignatures, setStoredSignatures] = React.useState<string[]>([]);

  // Feature states
  const [showAnnotations, setShowAnnotations] = React.useState(true);
  const [smartEraseBg, setSmartEraseBg] = React.useState<string>('#FFFFFF');
  const [pendingLinkArea, setPendingLinkArea] = React.useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [pendingLinkUrl, setPendingLinkUrl] = React.useState('https://');
  const [showWatermarkPanel, setShowWatermarkPanel] = React.useState(false);
  const [watermarkText, setWatermarkText] = React.useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = React.useState(0.25);
  const [watermarkColor, setWatermarkColor] = React.useState('#c0c0c0');

  const containerRef = React.useRef<HTMLDivElement>(null);
  const pageRef = React.useRef<HTMLDivElement>(null);

  // Scale factor: converts PDF points → screen pixels (accounts for zoom)
  const ptToPx = React.useMemo(() => {
    const pdfW = dimensions?.width || 595;
    return (794 / pdfW) * zoom;
  }, [dimensions, zoom]);

  // Always-current elements ref — used in drag/resize/rotate onUp to avoid stale closure revert
  const elementsRef = React.useRef(elements);
  React.useEffect(() => { elementsRef.current = elements; }, [elements]);

  const closeAllMenus = () => {
    setShowFormsMenu(false);
    setShowAnnotateMenu(false);
    setShowSignMenu(false);
    setShowShapesMenu(false);
  };

  const commit = (next: EditElement[]) => {
    onCommit(next);

    const prevCount = elements.length;
    const nextCount = next.length;
    if (nextCount > prevCount) {
      const added = next[next.length - 1];
      addAuditEntry(`Added ${added.type}`, `Positioned at ${Math.round(added.x)},${Math.round(added.y)}`);
    } else if (nextCount < prevCount) {
      addAuditEntry(`Deleted element`, `Removed element from page ${pageIndex + 1}`);
    }

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

  const undo = () => onUndo();
  const redo = () => onRedo();

  // Track text being edited locally to avoid history spam on every keystroke
  const editingTextRef = React.useRef<{ id: string; initialText: string } | null>(null);

  const updateElement = (id: string, updates: Partial<EditElement>) => {
    const next = elements.map(el => (el.id === id ? { ...el, ...updates } : el));
    commit(next);
    onSave(next);
  };

  const updateElementNoHistory = (id: string, updates: Partial<EditElement>) => {
    setElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } : el)));
  };

  const commitUpdate = (id: string, updates: Partial<EditElement>) => {
    const next = elements.map(el => (el.id === id ? { ...el, ...updates } : el));

    if (updates.x !== undefined || updates.y !== undefined || updates.width !== undefined || updates.height !== undefined || updates.size !== undefined) {
      const el = elements.find(e => e.id === id);
      if (el?.type === 'text' && el.id.startsWith('t-')) {
        const maskId = el.id.replace('t-', 'mask-');
        const maskIndex = next.findIndex(e => e.id === maskId);
        if (maskIndex !== -1) {
          next[maskIndex] = {
            ...next[maskIndex],
            x: updates.x ?? next[maskIndex].x,
            y: updates.y ?? next[maskIndex].y,
            width: updates.width ?? next[maskIndex].width,
            height: updates.height ?? next[maskIndex].height,
          };
        }
      }
    }

    commit(next);
    onSave(next);
  };

  const deleteElement = (id: string) => {
    let next = elements.filter(el => el.id !== id);
    // Also delete associated mask for magic-edit text elements
    if (id.startsWith('t-')) {
      const maskId = id.replace('t-', 'mask-');
      next = next.filter(el => el.id !== maskId);
    }
    commit(next);
    setActiveElementId(null);
    setSelectedIds([]);
  };

  const deleteSelected = () => {
    let next = elements.filter(el => !selectedIds.includes(el.id));
    // Also delete associated masks for selected magic-edit text elements
    selectedIds.forEach(id => {
      if (id.startsWith('t-')) {
        const maskId = id.replace('t-', 'mask-');
        next = next.filter(el => el.id !== maskId);
      }
    });
    commit(next);
    setActiveElementId(null);
    setSelectedIds([]);
  };



  const duplicateElement = (element: EditElement) => {
    const newId = `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duplicated: EditElement = {
      ...element,
      id: newId,
      x: Math.min(element.x + 10, 990),
      y: Math.min(element.y + 10, 990),
    };
    const next = [...elements, duplicated];
    commit(next);
    setActiveElementId(newId);
  };

  const bringToFront = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    const others = elements.filter(el => el.id !== id);
    const next = [...others, element];
    commit(next);
  };

  const sendToBack = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    const others = elements.filter(el => el.id !== id);
    const next = [element, ...others];
    commit(next);
  };


  React.useEffect(() => {
    if (!docId) return;

    const mPromise = import('../services/collaborationService');

    let unsubState: () => void;
    let unsubComments: () => void;

    mPromise.then(m => {
      unsubState = m.syncDocumentState(docId, (state) => {
        setElements(state.elements);
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

  const confirmLink = () => {
    if (!pendingLinkArea) return;
    const url = pendingLinkUrl.trim();
    if (!url || url === 'https://') return;
    const { x, y, w, h } = pendingLinkArea;
    const newEl: EditElement = { id: `link-${Date.now()}`, type: 'link', pageIndex, x, y, width: w, height: h, linkUrl: url, opacity: 1 };
    commit([...elements, newEl]);
    setActiveElementId(newEl.id);
    setMode('select');
    setPendingLinkArea(null);
    setPendingLinkUrl('https://');
  };

  const applyWatermark = () => {
    const wm: EditElement = {
      id: `wm-${Date.now()}`, type: 'text', pageIndex,
      x: 150, y: 440, width: 700, height: 120,
      color: watermarkColor, text: watermarkText,
      size: 80, opacity: watermarkOpacity, rotation: -35, fontName: 'Helvetica',
    };
    commit([...elements, wm]);
    setShowWatermarkPanel(false);
    setMode('select');
  };

  const getPageRotationDeg = () => {
    const rotEl = elements.find(e => e.id === '__page_rotation__');
    return rotEl?.rotation || 0;
  };

  // ── Sync tool settings to active element ────────────────────────────────────
  // When the user changes color/font/size in the right panel, apply it to the selected element
  React.useEffect(() => {
    if (!activeElementId) return;
    const el = elements.find(e => e.id === activeElementId);
    if (!el) return;
    if (el.color === activeColor) return;
    // Apply color to elements that support it
    if (['rect', 'circle', 'ellipse'].includes(el.type)) {
      updateElement(activeElementId, { color: activeColor, bgColor: activeColor });
    } else if (['text', 'highlight', 'strikeout', 'underline', 'path', 'line', 'arrow'].includes(el.type)) {
      updateElement(activeElementId, { color: activeColor });
    }
  }, [activeColor, activeElementId]);

  React.useEffect(() => {
    if (!activeElementId) return;
    const el = elements.find(e => e.id === activeElementId);
    if (!el) return;
    if (el.type === 'text' && el.size !== activeFontSize) {
      updateElement(activeElementId, { size: activeFontSize });
    }
  }, [activeFontSize, activeElementId]);

  React.useEffect(() => {
    if (!activeElementId) return;
    const el = elements.find(e => e.id === activeElementId);
    if (!el) return;
    if (el.type === 'text' && el.fontName !== activeFontName) {
      updateElement(activeElementId, { fontName: activeFontName });
    }
  }, [activeFontName, activeElementId]);

  React.useEffect(() => {
    if (!activeElementId) return;
    const el = elements.find(e => e.id === activeElementId);
    if (!el) return;
    if ((el.type === 'path' || el.type === 'line' || el.type === 'arrow') && el.strokeWidth !== activeBrushSize) {
      updateElement(activeElementId, { strokeWidth: activeBrushSize });
    }
  }, [activeBrushSize, activeElementId]);

  // Auto-focus text input/textarea when a text element becomes active
  React.useEffect(() => {
    if (activeElementId && activeElementId.startsWith('t-')) {
      const timer = setTimeout(() => {
        const el = document.querySelector(`[data-element-id="${activeElementId}"] textarea, [data-element-id="${activeElementId}"] input`) as HTMLTextAreaElement | HTMLInputElement;
        if (el) {
          el.focus();
          if ('select' in el) el.select();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeElementId]);

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
    // Clicking canvas while something is selected → deselect first.
    // For point-click creation modes (text, form fields, symbols), continue so the new element is
    // placed in the same click rather than requiring a second click.
    if (activeElementId) {
      setActiveElementId(null);
      const pointClickModes: EditorMode[] = [
        'select', 'magic-edit', 'text', 'sticky-note', 'comment',
        'symbol-cross', 'symbol-check', 'symbol-dot',
        'form-radio', 'form-text', 'form-check', 'form-select', 'form-text-multiline', 'form-signature',
        'picker', 'font-picker',
      ];
      if (!pointClickModes.includes(mode)) return;
    }
    if (mode === 'select') {
      // Start box selection drag — clear any existing selection first
      setSelectedIds([]);
      setIsDrawing(true);
      setDragStart(pos);
      setDragEnd(pos);
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
      const sampledColor = style.backgroundColor || '#FFFFFF';
      if (activeElementId) {
        const activeEl = elements.find(e => e.id === activeElementId);
        if (mode === 'picker') {
          if (activeEl?.type === 'rect' || activeEl?.type === 'ellipse' || activeEl?.type === 'circle') {
            updateElement(activeElementId, { color: sampledColor, bgColor: sampledColor });
          } else {
            updateElement(activeElementId, { color: sampledColor });
          }
        } else {
          updateElement(activeElementId, { fontName: style.fontName, size: style.fontSize });
        }
      } else {
        setActiveColor(sampledColor);
      }
      setMode('select');
      return;
    }
    if (mode === 'erase') {
      setIsDrawing(true);
      setDragStart(pos);
      setDragEnd(pos);
      return;
    }
    if (mode === 'smart-erase') {
      setIsDrawing(true);
      setDragStart(pos);
      setDragEnd(pos);
      // Sample the actual background color at the click point
      sampleBackgroundColor(image, (pos.x / 1000) * 794, (pos.y / 1000) * 1123)
        .then(color => setSmartEraseBg(color))
        .catch(() => setSmartEraseBg('#FFFFFF'));
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

      if (clicked) {
        // Create immediately with defaults; update background color asynchronously
        const now = Date.now();
        const maskId = `mask-${now}`;
        const textId = `t-${now}`;
        const mask: EditElement = { id: maskId, type: 'rect', pageIndex, x: clicked.x, y: clicked.y, width: clicked.width, height: clicked.height, color: '#FFFFFF', opacity: 1 };
        const text: EditElement = { id: textId, type: 'text', pageIndex, x: clicked.x, y: clicked.y, width: clicked.width, height: clicked.height, color: activeColor, text: clicked.str, size: clicked.fontSize, fontName: activeFontName, opacity: 1 };
        const next = [...elements, mask, text];
        commit(next);
        setActiveElementId(textId);
        // Fire-and-forget: update mask color with sampled background
        extractStyleAtPoint(file, pageIndex, pos.x, pos.y, image)
          .then(style => {
            const bg = style.backgroundColor || '#FFFFFF';
            setElements(prev => prev.map(el => el.id === maskId ? { ...el, color: bg } : el));
          })
          .catch(() => {});
        return;
      }
      const newEl: EditElement = { id: `t-${Date.now()}`, type: 'text', pageIndex, x: pos.x, y: pos.y, width: 200, height: 30, color: activeColor, text: '', size: activeFontSize, fontName: activeFontName, opacity: 1 };
      commit([...elements, newEl]);
      setActiveElementId(newEl.id);
      return;
    }
      if (mode === 'text') {
        const newEl: EditElement = { id: `t-${Date.now()}`, type: 'text', pageIndex, x: pos.x, y: pos.y, width: 200, height: 30, color: activeColor, text: '', size: activeFontSize, fontName: activeFontName, opacity: 1 };
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
        // Comment creates a draggable sticky note (works without collaboration service)
        const newEl: EditElement = { id: `note-${Date.now()}`, type: 'sticky-note', pageIndex, x: pos.x, y: pos.y, width: 150, height: 100, color: '#000000', bgColor: '#FEF08A', text: '', size: 12, opacity: 1 };
        commit([...elements, newEl]);
        setActiveElementId(newEl.id);
        setMode('select');
        return;
      }
      if (mode === 'symbol-cross' || mode === 'symbol-check' || mode === 'symbol-dot') {
        const sym = mode === 'symbol-cross' ? '✕' : mode === 'symbol-check' ? '✓' : '•';
        const sz = mode === 'symbol-dot' ? 16 : 20;
        const newEl: EditElement = { id: `sym-${Date.now()}`, type: 'text', pageIndex, x: pos.x, y: pos.y, width: 30, height: 30, color: activeColor, text: sym, size: sz, opacity: 1 };
        commit([...elements, newEl]);
        setActiveElementId(newEl.id);
        return;
      }
      if (mode === 'form-radio') {
        const newEl: EditElement = { id: `radio-${Date.now()}`, type: 'form-radio', pageIndex, x: pos.x, y: pos.y, width: 30, height: 30, color: '#000000', opacity: 1 };
        commit([...elements, newEl]);
        setActiveElementId(newEl.id);
        setMode('select');
        return;
      }
      if (mode === 'form-text-multiline') {
        const newEl: EditElement = { id: `ta-${Date.now()}`, type: 'form-textarea', pageIndex, x: pos.x, y: pos.y, width: 200, height: 80, color: '#000000', opacity: 1 };
        commit([...elements, newEl]);
        setActiveElementId(newEl.id);
        setMode('select');
        return;
      }
      if (mode === 'form-signature') {
        const newEl: EditElement = { id: `sigbox-${Date.now()}`, type: 'signature', pageIndex, x: pos.x, y: pos.y, width: 200, height: 60, color: '#475569', opacity: 1 };
        commit([...elements, newEl]);
        setActiveElementId(newEl.id);
        setMode('select');
        return;
      }
      if (mode === 'form-text') {
        const newEl: EditElement = { id: `ft-${Date.now()}`, type: 'form-text', pageIndex, x: pos.x, y: pos.y, width: 180, height: 30, color: '#000000', opacity: 1 };
        commit([...elements, newEl]);
        setActiveElementId(newEl.id);
        setMode('select');
        return;
      }
      if (mode === 'form-check') {
        const newEl: EditElement = { id: `fc-${Date.now()}`, type: 'form-check', pageIndex, x: pos.x, y: pos.y, width: 20, height: 20, color: '#000000', opacity: 1 };
        commit([...elements, newEl]);
        setActiveElementId(newEl.id);
        setMode('select');
        return;
      }
      if (mode === 'form-select') {
        const newEl: EditElement = { id: `fs-${Date.now()}`, type: 'form-select', pageIndex, x: pos.x, y: pos.y, width: 180, height: 30, color: '#000000', opacity: 1 };
        commit([...elements, newEl]);
        setActiveElementId(newEl.id);
        setMode('select');
        return;
      }
      if (mode === 'sign') return;
      if (mode === 'measure') {
        setMeasureStart(pos);
        setMeasureEnd(pos);
        setMeasureResult(null);
        setIsDrawing(true);
        return;
      }
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
    if (mode === 'measure') {
      setMeasureEnd(pos);
      if (measureStart) {
        const dx = ((pos.x - measureStart.x) / 1000) * (dimensions?.width || 595);
        const dy = ((pos.y - measureStart.y) / 1000) * (dimensions?.height || 842);
        const dist = Math.sqrt(dx * dx + dy * dy);
        setMeasureResult(`${dist.toFixed(1)} pt`);
      }
      return;
    }
    if (mode === 'draw') setCurrentPath(prev => [...prev, pos]);
    else if (mode === 'line' || mode === 'arrow') setCurrentPath([dragStart!, pos]);
  };

  const handlePointerUp = () => {
    if (mode === 'measure') {
      setIsDrawing(false);
      return;
    }
    if (!isDrawing || !dragStart || !dragEnd) {
      setIsDrawing(false);
      return;
    }
    const x = Math.min(dragStart.x, dragEnd.x);
    const y = Math.min(dragStart.y, dragEnd.y);
    const w = Math.abs(dragStart.x - dragEnd.x);
    const h = Math.abs(dragStart.y - dragEnd.y);

    if (mode === 'select') {
      // Box selection: if drag was significant, select intersecting elements
      if (w > 5 && h > 5) {
        const intersecting = elements.filter(el => {
          if (el.pageIndex !== pageIndex) return false;
          const ex = el.x, ey = el.y, ew = el.width || 0, eh = el.height || 0;
          return ex < x + w && ex + ew > x && ey < y + h && ey + eh > y;
        });
        const ids = intersecting.map(el => el.id);
        if (ids.length > 0) {
          setSelectedIds(ids);
          setActiveElementId(ids[0]);
        } else {
          setSelectedIds([]);
          setActiveElementId(null);
        }
      } else {
        // Small drag = click, deselect
        setSelectedIds([]);
        setActiveElementId(null);
      }
      setIsDrawing(false);
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    if (mode === 'draw' && currentPath.length > 1) {
      const newEl: EditElement = { id: `path-${Date.now()}`, type: 'path', pageIndex, x: 0, y: 0, color: activeColor, strokeWidth: activeBrushSize, path: currentPath, opacity: 1 };
      commit([...elements, newEl]);
    } else if ((mode === 'line' || mode === 'arrow') && currentPath.length === 2) {
      const [p1, p2] = currentPath;
      const newEl: EditElement = { id: `line-${Date.now()}`, type: mode as any, pageIndex, x: p1.x, y: p1.y, width: p2.x - p1.x, height: p2.y - p1.y, color: activeColor, strokeWidth: activeBrushSize, opacity: 1 };
      commit([...elements, newEl]);
    } else if (w > 3 && h > 3) {
      let newEl: EditElement | null = null;
      if (mode === 'erase' || mode === 'rect' || mode === 'smart-erase') {
        let bg = mode === 'smart-erase' ? smartEraseBg : activeColor;
        const fillColor = mode === 'smart-erase' ? smartEraseBg : activeColor;
        newEl = { id: `rect-${Date.now()}`, type: 'rect', pageIndex, x, y, width: w, height: h, color: fillColor, bgColor: bg, borderColor: (mode === 'rect' ? activeBorderColor : undefined), borderWidth: (mode === 'rect' ? activeBorderWidth : undefined), opacity: 1, isWhiteout: mode === 'erase' || mode === 'smart-erase' };
      } else if (mode === 'circle') {
        newEl = { id: `circle-${Date.now()}`, type: 'circle', pageIndex, x, y, width: w, height: h, color: activeColor, opacity: 1 };
      } else if (mode === 'highlight') {
        newEl = { id: `hl-${Date.now()}`, type: 'highlight', pageIndex, x, y, width: w, height: h, color: activeColor, opacity: activeHighlightOpacity };
      } else if (mode === 'strikeout') {
        newEl = { id: `st-${Date.now()}`, type: 'strikeout', pageIndex, x, y, width: w, height: h, color: activeColor, opacity: 1 };
      } else if (mode === 'underline') {
        newEl = { id: `ul-${Date.now()}`, type: 'underline', pageIndex, x, y, width: w, height: h, color: activeColor, opacity: 1 };
      } else if (mode === 'squiggly') {
        newEl = { id: `sq-${Date.now()}`, type: 'squiggly', pageIndex, x, y, width: w, height: h, color: activeColor, opacity: 1 };
      } else if (mode === 'ellipse') {
        newEl = { id: `ellipse-${Date.now()}`, type: 'ellipse', pageIndex, x, y, width: w, height: h, color: activeColor, borderColor: activeBorderColor, borderWidth: activeBorderWidth, opacity: 1 };
      } else if (mode === 'link') {
        // Show inline link input modal instead of prompt()
        setPendingLinkArea({ x, y, w, h });
        setPendingLinkUrl('https://');
        setMode('select');
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
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const max_size = 1200;
        if (width > max_size || height > max_size) {
          if (width > height) {
            height *= max_size / width;
            width = max_size;
          } else {
            width *= max_size / height;
            height = max_size;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', 0.85);

        const aspect = width / height;
        const defaultWidth = 250;
        const defaultHeight = defaultWidth / aspect;

        const newEl: EditElement = { id: `img-${Date.now()}`, type: 'image', pageIndex, x: 300, y: 300, width: defaultWidth, height: defaultHeight, imageUrl: base64, opacity: 1 };
        commit([...elements, newEl]);
        setActiveElementId(newEl.id);
        setMode('select');
      };
      img.src = re.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const zoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const zoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));

  const handleFind = async (search: string) => {
    if (!file) return [];
    const arrayBuffer = await file.arrayBuffer();
    const allResults: RedactionArea[] = [];
    for (let i = 0; i < totalPages; i++) {
      const pageResults = await findTextPositions(new Uint8Array(arrayBuffer), i, [search]);
      allResults.push(...pageResults);
    }
    return allResults;
  };

  const handleReplace = async (search: string, replacement: string, all: boolean) => {
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const allAreas: RedactionArea[] = [];
    for (let i = 0; i < totalPages; i++) {
      const pageAreas = await findTextPositions(new Uint8Array(arrayBuffer), i, [search]);
      allAreas.push(...pageAreas);
    }
    
    if (allAreas.length === 0) return;

    const newElements = [...elements];
    const targets = all ? allAreas : [allAreas[0]];
    targets.forEach((area, i) => {
      const maskId = `mask-replace-${Date.now()}-${i}`;
      const textId = `t-replace-${Date.now()}-${i}`;
      
      newElements.push({
        id: maskId,
        type: 'rect',
        pageIndex: area.pageIndex,
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height,
        color: '#FFFFFF',
        bgColor: '#FFFFFF',
        opacity: 1
      });

      newElements.push({
        id: textId,
        type: 'text',
        pageIndex: area.pageIndex,
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height,
        text: replacement,
        size: Math.round(area.height * 1.5),
        color: '#000000',
        fontName: 'Helvetica'
      });
    });

    commit(newElements);
    addAuditEntry(`Replaced "${search}" with "${replacement}"`, `Modified ${targets.length} occurrences`);
  };

  // Clipboard for copy/paste
  const clipboardRef = React.useRef<EditElement[] | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      // Delete / Backspace — remove all selected elements
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        deleteSelected();
        return;
      }

      // Arrow keys — nudge all selected elements
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && selectedIds.length > 0) {
        e.preventDefault();
        const shift = e.shiftKey ? 10 : 1;
        let dx = 0, dy = 0;
        if (e.key === 'ArrowLeft') dx = -shift;
        if (e.key === 'ArrowRight') dx = shift;
        if (e.key === 'ArrowUp') dy = -shift;
        if (e.key === 'ArrowDown') dy = shift;
        const next = elements.map(el => {
          if (!selectedIds.includes(el.id)) return el;
          return { ...el, x: (el.x || 0) + dx, y: (el.y || 0) + dy };
        });
        commit(next);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl+D duplicate selected
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedIds.length > 0) {
        e.preventDefault();
        const toDuplicate = elements.filter(el => selectedIds.includes(el.id));
        const duplicated = toDuplicate.map(el => ({
          ...el,
          id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: Math.min(el.x + 10, 990),
          y: Math.min(el.y + 10, 990),
        }));
        const next = [...elements, ...duplicated];
        commit(next);
        const newIds = duplicated.map(d => d.id);
        setSelectedIds(newIds);
        setActiveElementId(newIds[0] || null);
        return;
      }

      // Ctrl+C copy selected
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedIds.length > 0) {
        e.preventDefault();
        clipboardRef.current = elements.filter(el => selectedIds.includes(el.id));
        return;
      }

      // Ctrl+V paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboardRef.current) {
        e.preventDefault();
        const toPaste = clipboardRef.current.map(el => ({
          ...el,
          id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: Math.min(el.x + 20, 990),
          y: Math.min(el.y + 20, 990),
        }));
        const next = [...elements, ...toPaste];
        commit(next);
        const newIds = toPaste.map(p => p.id);
        setSelectedIds(newIds);
        setActiveElementId(newIds[0] || null);
        return;
      }

      if (e.key === 'Escape') {
        setActiveElementId(null);
        setSelectedIds([]);
        setMode('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeElementId, selectedIds, elements, commit, undo, redo, updateElement, duplicateElement, deleteSelected]);

  const arrowElements = React.useMemo(
    () => elements.filter(el => el.type === 'arrow'),
    [elements]
  );

  const textLayerDivs = React.useMemo(
    () => textItems.map((item, idx) => (
      <div
        key={`vtl-${idx}`}
        className={`absolute whitespace-nowrap text-transparent selection:bg-blue-500/30 selection:text-transparent ${mode === 'magic-edit' ? 'hover:bg-blue-500/10 hover:outline hover:outline-1 hover:outline-blue-400 cursor-text' : 'cursor-text'}`}
        style={{
          left: `${item.x / 10}%`,
          top: `${item.y / 10}%`,
          width: `${item.width / 10}%`,
          height: `${item.height / 10}%`,
          fontSize: `${(item.fontSize / 1000) * 100}%`,
          userSelect: 'text',
          transform: `rotate(${(item as any).rotation || 0}deg)`,
          transformOrigin: 'top left',
        }}
        onPointerDown={(e) => {
          if (mode === 'magic-edit') {
            e.stopPropagation();
            const now = Date.now();
            const maskId = `mask-${now}`;
            const textId = `t-${now}`;
            const mask: EditElement = { id: maskId, type: 'rect', pageIndex, x: item.x, y: item.y, width: item.width, height: item.height, color: '#FFFFFF', opacity: 1 };
            const text: EditElement = { id: textId, type: 'text', pageIndex, x: item.x, y: item.y, width: item.width, height: item.height, color: activeColor, text: item.str, size: item.fontSize, fontName: activeFontName, opacity: 1 };
            const next = [...elements, mask, text];
            commit(next);
            setActiveElementId(textId);
            extractStyleAtPoint(file, pageIndex, item.x, item.y, image)
              .then(style => {
                const bg = style.backgroundColor || '#FFFFFF';
                setElements(prev => prev.map(el => el.id === maskId ? { ...el, color: bg } : el));
              })
              .catch(() => {});
          }
        }}
      >
        {item.str}
      </div>
    )),
    [textItems, mode, elements, pageIndex, activeColor, file, image]
  );

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

  return (
    <div className="flex flex-col h-full w-full bg-[#f3f3f3] overflow-hidden relative" onClick={() => { setActiveElementId(null); closeAllMenus(); }}>
      {mode === 'find-replace' && (
        <FindReplace
          onFind={handleFind}
          onReplace={handleReplace}
          onJumpToPage={(page) => onPageChange?.(page)}
          onClose={() => setMode('select')}
        />
      )}
      {mode === 'ocr' && (
        <OCRPanel
          imageSrc={image}
          onClose={() => setMode('select')}
          onApply={(text) => {
            const newEl: EditElement = { id: `t-ocr-${Date.now()}`, type: 'text', pageIndex, x: 200, y: 200, width: 400, height: 200, text, size: 12, color: '#000000', fontName: 'Helvetica' };
            commit([...elements, newEl]);
            setMode('select');
          }}
        />
      )}
      {!hideChrome && (
      <>
      {/* ─── CENTRIC TOOLBAR (Sejda style) ─────────────────── */}
      <div className="shrink-0 flex items-center bg-white border-b border-slate-200 shadow-sm z-[150] py-2 px-2 overflow-x-auto">
        <div className="flex bg-[#e7e7e7] p-1 rounded-lg border border-slate-300 shadow-sm mx-auto flex-shrink-0">
          {[
            { mode: 'select', icon: <MousePointer2 size={18} />, label: 'Select', tooltip: 'Select, move and resize elements' },
            { mode: 'magic-edit', icon: <Type size={18} />, label: 'Text', tooltip: 'Add or edit text' },
            { mode: 'link', icon: <Link2 size={18} />, label: 'Links', tooltip: 'Add clickable links' },
            { mode: 'form-builder', icon: <CheckSquare size={18} />, label: 'Forms', tooltip: 'Create fillable forms' },
            { mode: 'image', icon: <ImageIcon size={18} />, label: 'Images', tooltip: 'Insert images' },
            { mode: 'sign', icon: <FileSignature size={18} />, label: 'Sign', tooltip: 'Sign the document' },
            { mode: 'erase', icon: <Square size={18} />, label: 'Whiteout', tooltip: 'Cover content' },
            { mode: 'draw', icon: <PenLine size={18} />, label: 'Annotate', tooltip: 'Highlight and draw' },
            { mode: 'rect', icon: <Shapes size={18} />, label: 'Shapes', tooltip: 'Add rectangles and circles' },
            { mode: 'watermark', icon: <Pen size={18} />, label: 'Watermark', tooltip: 'Add a watermark' },
            { mode: 'find-replace', icon: <Search size={18} />, label: 'Replace', tooltip: 'Find and replace text' },
            { mode: 'undo', icon: <Undo2 size={18} />, label: 'Undo', tooltip: 'Undo last action (Ctrl+Z)' },
            { mode: 'redo', icon: <RotateCw size={18} />, label: 'Redo', tooltip: 'Redo last action (Ctrl+Y)' },
          ].map((t) => (
            <div key={t.mode || t.label} className="relative">
              <Tooltip content={t.tooltip || t.label}>
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (t.mode === 'undo') undo();
                    else if (t.mode === 'redo') redo();
                    else if (t.mode === 'find-replace') setMode('find-replace');
                    else if (t.mode === 'image') document.getElementById('img-upload')?.click();
                    else if (t.mode === 'watermark') {
                      setShowWatermarkPanel(true);
                    }
                    else if (t.mode === 'form-builder') { closeAllMenus(); setShowFormsMenu(!showFormsMenu); }
                    else if (t.mode === 'draw') { closeAllMenus(); setShowAnnotateMenu(!showAnnotateMenu); }
                    else if (t.mode === 'sign') { closeAllMenus(); setShowSignMenu(!showSignMenu); }
                    else if (t.mode === 'rect') { closeAllMenus(); setShowShapesMenu(!showShapesMenu); }
                    else {
                      if (t.mode === 'erase') { /* keep activeColor */ }
                      setMode(t.mode as EditorMode);
                    }
                  }}
                  disabled={(t.mode === 'undo' && historyStep === 0) || (t.mode === 'redo' && !canRedo)}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${t.mode === 'undo' ? 'opacity-100' : ''} ${mode === t.mode || (t.mode === 'form-builder' && showFormsMenu) || (t.mode === 'draw' && showAnnotateMenu) || (t.mode === 'sign' && showSignMenu) || (t.mode === 'rect' && (showShapesMenu || ['rect','circle','ellipse','line','arrow'].includes(mode))) ? 'bg-white text-[#333] shadow-sm' : 'text-slate-600 hover:bg-white/50 hover:text-[#333]'} disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  <span className={mode === t.mode ? 'text-[#2196f3]' : 'text-[#333]'}>{t.icon}</span>
                  <span className={`text-sm font-medium ${mode === t.mode ? 'text-[#333]' : 'text-slate-600'}`}>{t.label}</span>
                  {['Forms', 'Images', 'Sign', 'Shapes', 'Links', 'Annotate'].includes(t.label) && <ChevronDown size={12} className="opacity-50 ml-1" />}
                </button>
              </Tooltip>

              {/* ─── FORMS DROPDOWN MENU ─────────────────── */}
              {t.mode === 'form-builder' && showFormsMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[400px] bg-white border border-slate-200 shadow-2xl rounded-sm z-[200] overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Add Text and Symbols</h4>
                    <div className="flex items-center gap-8 px-4">
                       <button onClick={() => { setMode('form-text'); setShowFormsMenu(false); }} className="text-2xl font-serif text-slate-700 hover:text-[#2196f3] transition-colors" title="I-Beam Text">IA</button>
                       <button onClick={() => { setMode('symbol-cross'); setShowFormsMenu(false); }} className="text-xl text-slate-700 hover:text-[#2196f3] transition-colors"><X size={20} /></button>
                       <button onClick={() => { setMode('symbol-check'); setShowFormsMenu(false); }} className="text-xl text-slate-700 hover:text-[#2196f3] transition-colors"><CheckCircle2 size={20} /></button>
                       <button onClick={() => { setMode('symbol-dot'); setShowFormsMenu(false); }} className="text-xl text-slate-700 hover:text-[#2196f3] transition-colors"><Circle size={10} fill="currentColor" /></button>
                    </div>
                  </div>

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

                  <div className="p-4 border-b border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Change Existing Form Fields</h4>
                    <div className="flex flex-col gap-3">
                       <button onClick={() => { setMode('select'); setShowFormsMenu(false); }} className="flex items-center gap-3 text-sm text-slate-700 hover:text-[#2196f3]">
                         <Pipette size={14} /> Select &amp; Edit fields
                       </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── ANNOTATE DROPDOWN MENU ─────────────────── */}
              {t.mode === 'draw' && showAnnotateMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[320px] bg-white border border-slate-200 shadow-2xl rounded-sm z-[200] overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 px-4 border-b border-slate-100 bg-white hover:bg-slate-50 cursor-pointer flex items-center gap-2"
                    onClick={() => { setShowAnnotations(v => !v); setShowAnnotateMenu(false); }}>
                    <CheckSquare size={14} className={showAnnotations ? 'text-[#2196f3]' : 'text-slate-400'} />
                    <span className="text-sm font-medium text-slate-700">{showAnnotations ? 'Hide annotations' : 'Show annotations'}</span>
                  </div>

                  <div className="p-3 px-4 border-b border-slate-100">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Text</h4>
                    <div className="flex flex-col gap-3">
                       {[
                         { id: 'strikeout', label: 'Strike out', icon: <Minus size={16} />, colors: ['#f44336', '#2196f3', '#ffeb3b'] },
                         { id: 'highlight', label: 'Highlight', icon: <Highlighter size={16} />, colors: ['#ffeb3b', '#f44336', '#2196f3', '#4caf50', '#000000'] },
                         { id: 'underline', label: 'Underline', icon: <Minus size={16} className="mt-2" />, colors: ['#ffeb3b', '#f44336', '#2196f3', '#4caf50', '#000000'] },
                         { id: 'squiggly', label: 'Squiggly', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12c2-2 4 2 6 0s4 2 6 0 4 2 6 0"/></svg>, colors: ['#f44336', '#2196f3', '#ffeb3b', '#4caf50', '#000000'] },
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

              {/* ─── SHAPES DROPDOWN MENU ─────────────────── */}
              {t.mode === 'rect' && showShapesMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[220px] bg-white border border-slate-200 shadow-2xl rounded-sm z-[200] overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 px-4 border-b border-slate-100">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Basic Shapes</h4>
                    <div className="flex flex-col gap-2">
                      {BASIC_SHAPES.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setMode(s.id as EditorMode); setShowShapesMenu(false); }}
                          className={`flex items-center gap-3 text-sm px-2 py-1.5 rounded hover:bg-slate-50 transition-colors ${mode === s.id ? 'text-[#2196f3] bg-blue-50' : 'text-slate-600'}`}
                        >
                          <span className="opacity-70">{s.icon}</span>
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 px-4">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Lines</h4>
                    <div className="flex flex-col gap-2">
                      {LINE_SHAPES.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setMode(s.id as EditorMode); setShowShapesMenu(false); }}
                          className={`flex items-center gap-3 text-sm px-2 py-1.5 rounded hover:bg-slate-50 transition-colors ${mode === s.id ? 'text-[#2196f3] bg-blue-50' : 'text-slate-600'}`}
                        >
                          <span className="opacity-70">{s.icon}</span>
                          <span>{s.label}</span>
                        </button>
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
                        <div key={i} className="group relative border border-slate-100 hover:border-[#2196f3] p-2 rounded cursor-pointer transition-all" onClick={() => {
                          const newEl: EditElement = { id: `sig-${Date.now()}`, type: 'image', pageIndex, x: 300, y: 400, width: 200, height: 100, imageUrl: sig, opacity: 1 };
                          commit([...elements, newEl]);
                          setActiveElementId(newEl.id);
                          setMode('select');
                          setShowSignMenu(false);
                        }}>
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
      </>
      )}


      {!hideChrome && (
      <>
      {/* ─── TOOL PROPERTIES BAR ─────────────────────── */}
      {(['magic-edit','text','draw','highlight','strikeout','underline','erase','smart-erase','rect','ellipse','line','arrow'] as EditorMode[]).includes(mode) && (
        <div className="shrink-0 flex items-center gap-3 bg-[#fafafa] border-b border-slate-200 px-4 py-1.5 overflow-x-auto text-xs select-none" onClick={e => e.stopPropagation()}>

          {/* TEXT / MAGIC-EDIT */}
          {(mode === 'magic-edit' || mode === 'text') && (<>
            <span className="text-slate-400 font-semibold shrink-0">Font</span>
            <select
              value={activeFontName}
              onChange={e => setActiveFontName(e.target.value)}
              onClick={e => e.stopPropagation()}
              className="h-7 text-xs border border-slate-200 rounded px-1.5 bg-white text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
            >
              {CONTEXT_FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
            </select>
            <div className="w-px h-4 bg-slate-200 shrink-0" />
            <span className="text-slate-400 font-semibold shrink-0">Size</span>
            <input
              type="number" step="0.5" min={1} max={200} value={activeFontSize}
              onClick={e => e.stopPropagation()}
              onChange={e => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v > 0) setActiveFontSize(Math.min(200, v));
              }}
              className="w-14 h-7 text-xs border border-slate-200 rounded px-1.5 text-center outline-none focus:border-blue-400 font-bold"
            />
            <span className="text-slate-400">pt</span>
            <div className="w-px h-4 bg-slate-200 shrink-0" />
            <span className="text-slate-400 font-semibold shrink-0">Color</span>
            <label className="relative cursor-pointer flex items-center gap-1.5" title="Text color">
              <input type="color" value={activeColor} onChange={e => setActiveColor(e.target.value)} className="sr-only" />
              <div className="w-6 h-6 rounded border-2 border-slate-300 hover:border-blue-400 transition-colors shadow-sm" style={{ backgroundColor: activeColor }} />
              <span className="text-slate-500" style={{ color: activeColor }}>{activeColor}</span>
            </label>
          </>)}

          {/* DRAW */}
          {mode === 'draw' && (<>
            <span className="text-slate-400 font-semibold shrink-0">Color</span>
            <label className="cursor-pointer flex items-center gap-1.5" title="Pen color">
              <input type="color" value={activeColor} onChange={e => setActiveColor(e.target.value)} className="sr-only" />
              <div className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-blue-400 shadow-sm transition-colors" style={{ backgroundColor: activeColor }} />
              <span className="text-slate-500">{activeColor}</span>
            </label>
            <div className="w-px h-4 bg-slate-200 shrink-0" />
            <span className="text-slate-400 font-semibold shrink-0">Brush Size</span>
            <input
              type="range" min={1} max={20} value={activeBrushSize}
              onChange={e => setActiveBrushSize(Number(e.target.value))}
              className="w-28 accent-blue-500 cursor-pointer"
            />
            <span className="font-bold text-slate-600 w-8 shrink-0">{activeBrushSize}px</span>
          </>)}

          {/* HIGHLIGHT / STRIKEOUT / UNDERLINE / SQUIGGLY */}
          {(mode === 'highlight' || mode === 'strikeout' || mode === 'underline' || mode === 'squiggly') && (<>
            <span className="text-slate-400 font-semibold shrink-0">Color</span>
            {(mode === 'highlight'
              ? ['#FFE600','#00E676','#FF80AB','#40C4FF','#FF6D00','#E040FB']
              : mode === 'strikeout'
              ? ['#EF4444','#F97316','#000000','#6366F1','#14B8A6']
              : ['#3B82F6','#EF4444','#10B981','#8B5CF6','#000000']
            ).map(c => (
              <button key={c} onClick={() => setActiveColor(c)}
                className={`w-5 h-5 rounded border-2 transition-all ${activeColor === c ? 'border-blue-500 scale-110 shadow' : 'border-slate-300 hover:border-blue-400'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <label className="cursor-pointer flex items-center" title="Custom color">
              <input type="color" value={activeColor} onChange={e => setActiveColor(e.target.value)} className="sr-only" />
              <div className="w-5 h-5 rounded border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-400 hover:border-blue-400 transition-colors text-[11px] font-bold">+</div>
            </label>
            {mode === 'highlight' && (<>
              <div className="w-px h-4 bg-slate-200 shrink-0" />
              <span className="text-slate-400 font-semibold shrink-0">Opacity</span>
              <input
                type="range" min={10} max={80} step={5} value={Math.round(activeHighlightOpacity * 100)}
                onChange={e => setActiveHighlightOpacity(Number(e.target.value) / 100)}
                className="w-24 accent-blue-500 cursor-pointer"
              />
              <span className="font-bold text-slate-600 w-8 shrink-0">{Math.round(activeHighlightOpacity * 100)}%</span>
            </>)}
          </>)}

          {/* ERASE */}
          {mode === 'erase' && (<>
            <span className="text-slate-400 font-semibold shrink-0">Fill Color</span>
            <button onClick={() => setActiveColor('#FFFFFF')}
              className={`px-2.5 h-6 rounded text-[11px] font-bold border transition-colors ${activeColor === '#FFFFFF' ? 'bg-blue-100 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-blue-300'}`}>
              White
            </button>
            <label className="cursor-pointer flex items-center gap-1.5" title="Custom whiteout color">
              <input type="color" value={activeColor} onChange={e => setActiveColor(e.target.value)} className="sr-only" />
              <div className="w-6 h-6 rounded border-2 border-slate-300 hover:border-blue-400 transition-colors" style={{ backgroundColor: activeColor }} />
              <span className="text-slate-400">Custom</span>
            </label>
          </>)}

          {/* SMART-ERASE */}
          {mode === 'smart-erase' && (
            <span className="text-slate-500 italic">Drag to draw — background color is sampled automatically</span>
          )}

          {/* RECT / ELLIPSE */}
          {(mode === 'rect' || mode === 'ellipse') && (<>
            <span className="text-slate-400 font-semibold shrink-0">Fill</span>
            <label className="cursor-pointer flex items-center gap-1.5" title="Fill color">
              <input type="color" value={activeColor} onChange={e => setActiveColor(e.target.value)} className="sr-only" />
              <div className="w-6 h-6 rounded border-2 border-slate-300 hover:border-blue-400 transition-colors" style={{ backgroundColor: activeColor }} />
              <span className="text-slate-500">{activeColor}</span>
            </label>
            <div className="w-px h-4 bg-slate-200 shrink-0" />
            <span className="text-slate-400 font-semibold shrink-0">Border</span>
            <label className="cursor-pointer flex items-center gap-1.5" title="Border color">
              <input type="color" value={activeBorderColor} onChange={e => setActiveBorderColor(e.target.value)} className="sr-only" />
              <div className="w-6 h-6 rounded border-2 border-slate-300 hover:border-blue-400 transition-colors" style={{ backgroundColor: activeBorderColor }} />
            </label>
            <input
              type="number" min={0} max={20} value={activeBorderWidth}
              onClick={e => e.stopPropagation()}
              onChange={e => setActiveBorderWidth(Math.max(0, Math.min(20, Number(e.target.value))))}
              className="w-12 h-7 text-xs border border-slate-200 rounded px-1.5 text-center outline-none focus:border-blue-400 font-bold"
            />
            <span className="text-slate-400">px</span>
          </>)}

          {/* LINE / ARROW */}
          {(mode === 'line' || mode === 'arrow') && (<>
            <span className="text-slate-400 font-semibold shrink-0">Color</span>
            <label className="cursor-pointer flex items-center gap-1.5" title="Line color">
              <input type="color" value={activeColor} onChange={e => setActiveColor(e.target.value)} className="sr-only" />
              <div className="w-6 h-6 rounded border-2 border-slate-300 hover:border-blue-400 transition-colors" style={{ backgroundColor: activeColor }} />
              <span className="text-slate-500">{activeColor}</span>
            </label>
            <div className="w-px h-4 bg-slate-200 shrink-0" />
            <span className="text-slate-400 font-semibold shrink-0">Width</span>
            <input
              type="range" min={1} max={20} value={activeBrushSize}
              onChange={e => setActiveBrushSize(Number(e.target.value))}
              className="w-24 accent-blue-500 cursor-pointer"
            />
            <span className="font-bold text-slate-600 w-8 shrink-0">{activeBrushSize}px</span>
          </>)}

        </div>
      )}
      </>
      )}

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
           <button onClick={zoomOut} className="p-1 hover:bg-slate-200 rounded" title="Zoom out"><ZoomOut size={16} /></button>
           <button onClick={zoomIn} className="p-1 hover:bg-slate-200 rounded" title="Zoom in"><ZoomIn size={16} /></button>
           <button onClick={undo} disabled={historyStep === 0} className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
           <button onClick={redo} disabled={!canRedo} className="p-1 hover:bg-slate-200 rounded disabled:opacity-30 disabled:cursor-not-allowed" title="Redo (Ctrl+Y)"><RotateCw size={16} /></button>
           <div className="w-px h-4 bg-slate-300" />
           <span className="text-xs text-slate-400 font-medium">{pageIndex + 1} / {totalPages}</span>
           <div className="w-px h-4 bg-slate-300" />
           <button
             onClick={() => onInsertPage?.()}
             className="flex items-center gap-2 px-3 py-1 bg-[#4096ff] text-white rounded text-xs font-bold hover:bg-[#1677ff] transition-all"
             title="Insert blank page after this page"
           >
             <FilePlus2 size={14} /> Insert page
           </button>
           <button
             onClick={() => onDeletePage?.()}
             disabled={totalPages <= 1}
             className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded text-xs font-bold hover:bg-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
             title="Delete this page"
           >
             <Trash2 size={14} /> Delete page
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
            className={`relative bg-white animate-fade-in touch-none ${
              ['draw', 'line', 'erase', 'smart-erase', 'rect', 'circle', 'ellipse', 'highlight', 'strikeout', 'underline', 'arrow', 'link', 'measure'].includes(mode) ? 'select-none cursor-crosshair' :
              mode === 'text' || mode === 'magic-edit' ? 'cursor-text' :
              mode === 'sticky-note' || mode === 'comment' ? 'cursor-copy' :
              mode === 'picker' || mode === 'font-picker' ? 'select-none cursor-crosshair' :
              mode === 'select' ? 'cursor-default' : 'select-none cursor-default'
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

            {/* Grid overlay */}
            {showGrid && (
              <div
                className="absolute inset-0 pointer-events-none z-[1]"
                style={{
                  backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: `${(50 / zoom)}px ${(50 / zoom)}px`,
                  opacity: 0.4,
                }}
              />
            )}

            {/* Rulers */}
            {showRulers && (
              <>
                <div className="absolute -top-5 left-0 right-0 h-5 bg-slate-100 border-b border-slate-300 z-[5] pointer-events-none flex items-end overflow-hidden">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="absolute bottom-0 border-l border-slate-400" style={{ left: `${i * 5}%`, height: i % 2 === 0 ? '12px' : '6px' }}>
                      {i % 2 === 0 && <span className="absolute -top-3 left-0.5 text-[8px] text-slate-500">{i * 50}</span>}
                    </div>
                  ))}
                </div>
                <div className="absolute top-0 -left-5 bottom-0 w-5 bg-slate-100 border-r border-slate-300 z-[5] pointer-events-none flex flex-col items-end overflow-hidden">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="absolute right-0 border-t border-slate-400" style={{ top: `${i * 5}%`, width: i % 2 === 0 ? '12px' : '6px' }}>
                      {i % 2 === 0 && <span className="absolute top-0.5 right-3 text-[8px] text-slate-500">{i * 50}</span>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Measure result tooltip */}
            {mode === 'measure' && measureResult && measureEnd && (
              <div
                className="absolute z-[60] bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none"
                style={{ left: `${measureEnd.x / 10}%`, top: `${measureEnd.y / 10}%`, transform: 'translate(-50%, -120%)' }}
              >
                {measureResult}
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

            {textLayerDivs.length > 0 && (
              <div
                className="absolute inset-0 z-[2]"
                style={{ pointerEvents: (mode === 'select' || mode === 'magic-edit') ? 'auto' : 'none' }}
              >
                {textLayerDivs}
              </div>
            )}

            {/* SVG overlay (paths, lines, draw preview) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                {arrowElements.map(el => (
                  <marker key={`arrow-${el.id}`} id={`arrowhead-${el.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill={el.color} />
                  </marker>
                ))}
                <marker id="preview-arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={activeColor} />
                </marker>
              </defs>
              {elements.map(el => {
                if (el.type === 'path' && el.path) {
                  const pts = el.path.map(p => `${(p.x / 1000) * 100}%,${(p.y / 1000) * 100}%`).join(' ');
                  return <polyline key={el.id} points={pts} fill="none" stroke={el.color} strokeWidth={el.strokeWidth ? `${el.strokeWidth / 10}%` : '0.3%'} strokeLinecap="round" strokeLinejoin="round" opacity={el.opacity} />;
                }
                if (el.type === 'line') {
                  return <line key={el.id} x1={`${el.x / 10}%`} y1={`${el.y / 10}%`} x2={`${(el.x + (el.width || 0)) / 10}%`} y2={`${(el.y + (el.height || 0)) / 10}%`} stroke={el.color} strokeWidth={el.strokeWidth ? `${el.strokeWidth / 10}%` : '0.3%'} opacity={el.opacity} />;
                }
                if (el.type === 'arrow') {
                  return <line key={el.id} x1={`${el.x / 10}%`} y1={`${el.y / 10}%`} x2={`${(el.x + (el.width || 0)) / 10}%`} y2={`${(el.y + (el.height || 0)) / 10}%`} stroke={el.color} strokeWidth={el.strokeWidth ? `${el.strokeWidth / 10}%` : '0.3%'} opacity={el.opacity} markerEnd={`url(#arrowhead-${el.id})`} />;
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
              {isDrawing && (mode === 'line' || mode === 'arrow') && currentPath.length === 2 && (
                <line
                  x1={`${currentPath[0].x / 10}%`} y1={`${currentPath[0].y / 10}%`}
                  x2={`${currentPath[1].x / 10}%`} y2={`${currentPath[1].y / 10}%`}
                  stroke={activeColor} strokeWidth={`${activeBrushSize / 10}%`}
                  markerEnd={mode === 'arrow' ? 'url(#preview-arrowhead)' : undefined}
                />
              )}

              {/* Drag rectangle preview */}
              {selectionRect && (!['draw', 'line'].includes(mode) || mode === 'select') && (
                <rect
                  x={`${selectionRect.x / 10}%`} y={`${selectionRect.y / 10}%`}
                  width={`${selectionRect.w / 10}%`} height={`${selectionRect.h / 10}%`}
                  fill={mode === 'select' ? 'rgba(59,130,246,0.1)' : (fillColor[mode] || 'rgba(59,130,246,0.15)')}
                  stroke={mode === 'select' ? '#3b82f6' : (mode === 'erase' ? '#94a3b8' : '#3b82f6')}
                  strokeWidth="1" strokeDasharray="4 4"
                />
              )}

              {/* Measure preview */}
              {mode === 'measure' && measureStart && measureEnd && (
                <>
                  <line
                    x1={`${measureStart.x / 10}%`} y1={`${measureStart.y / 10}%`}
                    x2={`${measureEnd.x / 10}%`} y2={`${measureEnd.y / 10}%`}
                    stroke="#EF4444" strokeWidth="0.2%" strokeDasharray="4 2"
                  />
                  <circle cx={`${measureStart.x / 10}%`} cy={`${measureStart.y / 10}%`} r="3" fill="#EF4444" />
                  <circle cx={`${measureEnd.x / 10}%`} cy={`${measureEnd.y / 10}%`} r="3" fill="#EF4444" />
                </>
              )}
            </svg>

            {/* DOM elements (text, rect, image, etc.) */}
            {elements.map(el => {
              const ANNOTATION_TYPES = ['highlight', 'strikeout', 'underline', 'sticky-note', 'path'];
              if (!showAnnotations && ANNOTATION_TYPES.includes(el.type)) return null;
              if (!['text', 'rect', 'circle', 'ellipse', 'image', 'highlight', 'strikeout', 'underline', 'form-check', 'form-text', 'form-select', 'sticky-note', 'form-radio', 'form-textarea', 'signature', 'link'].includes(el.type)) return null;
              // Layer visibility filtering
              const layerMap: Record<string, string[]> = {
                text: ['text'],
                image: ['image'],
                shape: ['rect', 'circle', 'ellipse', 'line', 'arrow', 'path'],
                annotate: ['highlight', 'strikeout', 'underline', 'squiggly'],
                form: ['form-text', 'form-check', 'form-radio', 'form-select', 'form-textarea', 'form-signature'],
                link: ['link'],
                note: ['sticky-note', 'comment'],
              };
              const layerKey = Object.keys(layerMap).find(k => layerMap[k].includes(el.type));
              if (layerKey && visibleTypes[layerKey] === false) return null;
              const isActive = activeElementId === el.id;

              return (
                <div
                  key={el.id}
                  data-element-id={el.id}
                  className="absolute"
                  style={{
                    left: `${el.x / 10}%`,
                    top: `${el.y / 10}%`,
                    width: el.width ? `${el.width / 10}%` : 'auto',
                    height: el.height ? `${el.height / 10}%` : 'auto',
                    transform: `rotate(${el.rotation || 0}deg)`,
                    transformOrigin: 'top left',
                    opacity: el.opacity,
                    zIndex: isActive ? 50 : 10,
                    cursor: mode === 'select' ? 'move' : 'default',
                    minWidth: 40,
                    minHeight: 20,
                  }}
                  onPointerDown={ev => {
                    // Allow selection from the matching tool mode, not just 'select'
                    const isSelectable =
                      mode === 'select' ||
                      (mode === 'erase' && el.type === 'rect') ||
                      ((mode === 'magic-edit' || mode === 'text') && el.type === 'text');
                    if (!isSelectable) return;
                    ev.stopPropagation();

                    // Ctrl/Cmd+Click toggles selection immediately
                    if ((ev.ctrlKey || ev.metaKey) && mode === 'select') {
                      setSelectedIds(prev => {
                        if (prev.includes(el.id)) return prev.filter(id => id !== el.id);
                        return [...prev, el.id];
                      });
                      setActiveElementId(el.id);
                      return; // No drag on Ctrl+Click
                    }

                    if (mode !== 'select') {
                      setActiveElementId(el.id);
                      return; // No drag in tool modes
                    }

                    const startX = ev.clientX, startY = ev.clientY;
                    const elId = el.id;
                    // Capture selection state BEFORE any changes for group drag
                    const wasSelected = selectedIds.includes(elId);
                    const idsToMove = wasSelected ? [...selectedIds] : [elId];
                    const startPositions = idsToMove.map(id => {
                      const e = elements.find(item => item.id === id);
                      return { id, x: e?.x || 0, y: e?.y || 0, w: e?.width || 0, h: e?.height || 0 };
                    });

                    let hasMoved = false;
                    const DRAG_THRESHOLD = 3;

                    const onMove = (me: PointerEvent) => {
                      if (!hasMoved) {
                        const dist = Math.hypot(me.clientX - startX, me.clientY - startY);
                        if (dist < DRAG_THRESHOLD) return;
                        hasMoved = true;
                      }
                      if (!pageRef.current) return;
                      const r = pageRef.current.getBoundingClientRect();
                      const dx = ((me.clientX - startX) / r.width) * 1000;
                      const dy = ((me.clientY - startY) / r.height) * 1000;

                      let guideV: number | null = null;
                      let guideH: number | null = null;
                      const SNAP_THRESHOLD = 5;

                      setElements(prev => prev.map(e => {
                        const startPos = startPositions.find(p => p.id === e.id);
                        if (!startPos) return e;
                        let newX = startPos.x + dx;
                        let newY = startPos.y + dy;
                        if (e.id === elId) {
                          if (Math.abs((newX + startPos.w / 2) - 500) < SNAP_THRESHOLD) {
                            newX = 500 - startPos.w / 2;
                            guideV = 500;
                          }
                          if (Math.abs((newY + startPos.h / 2) - 500) < SNAP_THRESHOLD) {
                            newY = 500 - startPos.h / 2;
                            guideH = 500;
                          }
                        }
                        return { ...e, x: Math.max(0, Math.min(1000 - startPos.w, newX)), y: Math.max(0, Math.min(1000 - startPos.h, newY)) };
                      }));
                      setGuides({ v: guideV, h: guideH });
                    };
                    const onUp = () => {
                      window.removeEventListener('pointermove', onMove);
                      window.removeEventListener('pointerup', onUp);
                      setGuides({ v: null, h: null });
                      if (!hasMoved) {
                        // It was a click, not a drag — update selection
                        setSelectedIds([elId]);
                        setActiveElementId(elId);
                      } else {
                        onCommit(elementsRef.current);
                      }
                    };
                    window.addEventListener('pointermove', onMove);
                    window.addEventListener('pointerup', onUp);
                  }}
                  onDoubleClick={ev => {
                    if (el.type === 'text') {
                      ev.stopPropagation();
                      setActiveElementId(el.id);
                    }
                  }}
                  onClick={ev => {
                    ev.stopPropagation();
                    const isSelectable =
                      mode === 'select' ||
                      (mode === 'erase' && el.type === 'rect') ||
                      ((mode === 'magic-edit' || mode === 'text') && el.type === 'text');
                    if (isSelectable) {
                      setSelectedIds([el.id]);
                      setActiveElementId(el.id);
                    }
                  }}
                >
                  {/* Magic Edit Overlay (Targeting feedback — only on text elements) */}
                  {mode === 'magic-edit' && el.type === 'text' && (
                    <div className="absolute inset-0 border-2 border-indigo-400 border-dashed animate-pulse pointer-events-none" />
                  )}
                  {/* Selection border — active primary selection */}
                  {isActive && (
                    <div className="absolute inset-0 border-2 border-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.2)] pointer-events-none rounded-sm" />
                  )}
                  {/* Multi-select indicator — other selected elements */}
                  {!isActive && selectedIds.includes(el.id) && (
                    <div className="absolute inset-0 border-2 border-blue-300 pointer-events-none rounded-sm" />
                  )}

                  {/* Resize / rotate handles — only available in select mode */}
                  {isActive && mode === 'select' && (
                    <>
                      {/* Rotation Handle */}
                      <div 
                        className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center group/rot"
                        onPointerDown={ev => {
                          ev.stopPropagation();
                          const rect = ev.currentTarget.parentElement?.getBoundingClientRect();
                          if (!rect) return;
                          const cx = rect.left + rect.width / 2;
                          const cy = rect.top + rect.height / 2;
                          const rotElId = el.id;
                          const onMove = (me: PointerEvent) => {
                            const angle = Math.round(Math.atan2(me.clientY - cy, me.clientX - cx) * (180 / Math.PI) + 90);
                            setElements(prev => prev.map(e => e.id === rotElId ? { ...e, rotation: angle } : e));
                          };
                          const onUp = () => {
                            window.removeEventListener('pointermove', onMove);
                            window.removeEventListener('pointerup', onUp);
                            onCommit(elementsRef.current);
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
                             const startElY = el.y, startH = el.height || 0, rElId = el.id;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dy = ((me.clientY - startY) / r.height) * 1000;
                               const ny = Math.min(startElY + startH - 10, startElY + dy);
                               const nh = Math.max(10, startH - dy);
                               setElements(prev => prev.map(e => e.id === rElId ? { ...e, y: ny, height: nh } : e));
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); onCommit(elementsRef.current); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />
                      
                      {/* Resize Handles - Bottom Side */}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-s-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startY = ev.clientY;
                             const startH = el.height || 0, rElId = el.id;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dy = ((me.clientY - startY) / r.height) * 1000;
                               const nh = Math.max(10, startH + dy);
                               setElements(prev => prev.map(e => e.id === rElId ? { ...e, height: nh } : e));
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); onCommit(elementsRef.current); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />

                      {/* Resize Handles - Left Side */}
                      <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-w-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startX = ev.clientX;
                             const startElX = el.x, startW = el.width || 0, rElId = el.id;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dx = ((me.clientX - startX) / r.width) * 1000;
                               const nx = Math.min(startElX + startW - 10, startElX + dx);
                               const nw = Math.max(10, startW - dx);
                               setElements(prev => prev.map(e => e.id === rElId ? { ...e, x: nx, width: nw } : e));
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); onCommit(elementsRef.current); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />

                      {/* Resize Handles - Right Side */}
                      <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-e-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startX = ev.clientX;
                             const startW = el.width || 0, rElId = el.id;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dx = ((me.clientX - startX) / r.width) * 1000;
                               const nw = Math.max(10, startW + dx);
                               setElements(prev => prev.map(e => e.id === rElId ? { ...e, width: nw } : e));
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); onCommit(elementsRef.current); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />

                      {/* Corner Handles - NW */}
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-nw-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startX = ev.clientX, startY = ev.clientY;
                             const startElX = el.x, startElY = el.y, startW = el.width || 0, startH = el.height || 0, rElId = el.id;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dx = ((me.clientX - startX) / r.width) * 1000;
                               const dy = ((me.clientY - startY) / r.height) * 1000;
                               const nx = Math.min(startElX + startW - 10, startElX + dx);
                               const ny = Math.min(startElY + startH - 10, startElY + dy);
                               setElements(prev => prev.map(e => e.id === rElId ? { ...e, x: nx, y: ny, width: Math.max(10, startW - dx), height: Math.max(10, startH - dy) } : e));
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); onCommit(elementsRef.current); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />

                      {/* Corner Handles - NE */}
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-ne-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startX = ev.clientX, startY = ev.clientY;
                             const startElY = el.y, startW = el.width || 0, startH = el.height || 0, rElId = el.id;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dx = ((me.clientX - startX) / r.width) * 1000;
                               const dy = ((me.clientY - startY) / r.height) * 1000;
                               const ny = Math.min(startElY + startH - 10, startElY + dy);
                               setElements(prev => prev.map(e => e.id === rElId ? { ...e, y: ny, width: Math.max(10, startW + dx), height: Math.max(10, startH - dy) } : e));
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); onCommit(elementsRef.current); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />

                      {/* Corner Handles - SW */}
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-sw-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startX = ev.clientX, startY = ev.clientY;
                             const startElX = el.x, startW = el.width || 0, startH = el.height || 0, rElId = el.id;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dx = ((me.clientX - startX) / r.width) * 1000;
                               const dy = ((me.clientY - startY) / r.height) * 1000;
                               const nx = Math.min(startElX + startW - 10, startElX + dx);
                               setElements(prev => prev.map(e => e.id === rElId ? { ...e, x: nx, width: Math.max(10, startW - dx), height: Math.max(10, startH + dy) } : e));
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); onCommit(elementsRef.current); };
                             window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
                           }}
                      />

                      {/* Corner Handles - SE */}
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#3b82f6] rounded-sm cursor-se-resize hover:scale-125 transition-transform"
                           onPointerDown={ev => {
                             ev.stopPropagation();
                             const startX = ev.clientX, startY = ev.clientY;
                             const startW = el.width || 0, startH = el.height || 0, rElId = el.id;
                             const onMove = (me: PointerEvent) => {
                               if (!pageRef.current) return;
                               const r = pageRef.current.getBoundingClientRect();
                               const dw = ((me.clientX - startX) / r.width) * 1000;
                               const dh = ((me.clientY - startY) / r.height) * 1000;
                               setElements(prev => prev.map(e => e.id === rElId ? { ...e, width: Math.max(10, startW + dw), height: Math.max(10, startH + dh) } : e));
                             };
                             const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); onCommit(elementsRef.current); };
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
                  {el.type === 'squiggly' && (
                    <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none">
                      <path
                        d={Array.from({ length: Math.ceil((el.width || 100) / 10) }).map((_, i) => `M ${i * 10} ${(el.height || 10) / 2} Q ${i * 10 + 5} ${(el.height || 10) / 2 + 4} ${i * 10 + 10} ${(el.height || 10) / 2}`).join(' ')}
                        fill="none"
                        stroke={el.color || '#EF4444'}
                        strokeWidth="2"
                      />
                    </svg>
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
                  {el.type === 'form-radio' && (
                    <div
                      className="w-full h-full border-2 border-slate-700 rounded-full bg-white flex items-center justify-center cursor-pointer select-none"
                      onClick={ev => { ev.stopPropagation(); updateElement(el.id, { isChecked: !el.isChecked }); }}
                    >
                      {el.isChecked && <div className="w-1/2 h-1/2 bg-slate-700 rounded-full" />}
                    </div>
                  )}
                  {el.type === 'form-textarea' && (
                    <div className="w-full h-full flex items-start p-1 bg-white border border-slate-300 rounded shadow-inner">
                      <textarea
                        value={el.text || ''}
                        placeholder="Multiline text…"
                        onChange={ev => updateElement(el.id, { text: ev.target.value })}
                        onClick={ev => ev.stopPropagation()}
                        onPointerDown={ev => ev.stopPropagation()}
                        className="w-full h-full bg-transparent border-none outline-none p-0 m-0 text-slate-800 resize-none"
                        style={{ fontSize: `${(el.size || 12) * ptToPx}px` }}
                      />
                    </div>
                  )}
                  {el.type === 'signature' && (
                    <div className="w-full h-full border-2 border-dashed border-slate-400 rounded bg-sky-50/30 flex flex-col items-center justify-center pointer-events-none">
                      <FileSignature size={14} className="text-slate-300" />
                      <span className="text-[9px] text-slate-400 mt-0.5 font-medium">Sign here</span>
                    </div>
                  )}
                  {el.type === 'link' && (
                    <div className="w-full h-full border border-dashed border-blue-400 bg-blue-500/10 flex items-center justify-center gap-1 group" title={el.linkUrl || 'Link'}>
                      <LinkIcon size={10} className="text-blue-400 opacity-70 shrink-0" />
                      {el.linkUrl && <span className="text-[8px] text-blue-400 opacity-0 group-hover:opacity-100 truncate max-w-[80%] transition-opacity">{el.linkUrl}</span>}
                    </div>
                  )}
                  {el.type === 'text' && (() => {
                    const textStyle: React.CSSProperties = {
                      color: el.color || '#000',
                      fontSize: `${(el.size || 14) * ptToPx}px`,
                      fontFamily: getFontFamily(el.fontName),
                      fontWeight: el.isBold ? 'bold' : 'normal',
                      fontStyle: el.isItalic ? 'italic' : 'normal',
                      textDecoration: [el.isUnderline ? 'underline' : '', el.isStrikeout ? 'line-through' : ''].filter(Boolean).join(' ') || 'none',
                      textAlign: (el.textAlign || 'left') as React.CSSProperties['textAlign'],
                      lineHeight: 1.3,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    };
                    return (
                      <div className="w-full h-full">
                        {isActive ? (
                          <textarea
                            autoFocus
                            value={el.text || ''}
                            placeholder="Type your text"
                            onFocus={() => {
                              editingTextRef.current = { id: el.id, initialText: el.text || '' };
                            }}
                            onInput={ev => {
                              const ta = ev.currentTarget;
                              const value = ta.value;
                              // Measure and auto-grow in single state update
                              ta.style.height = 'auto';
                              const pixelHeight = ta.scrollHeight;
                              let newHeight = el.height || 30;
                              if (pageRef.current) {
                                const containerHeight = pageRef.current.getBoundingClientRect().height;
                                newHeight = Math.max(30, (pixelHeight / containerHeight) * 1000);
                              }
                              setElements(prev => prev.map(item => item.id === el.id ? { ...item, text: value, height: newHeight } : item));
                            }}
                            onBlur={() => {
                              const editing = editingTextRef.current;
                              if (editing && editing.id === el.id) {
                                const currentEl = elementsRef.current.find(e => e.id === el.id);
                                if (currentEl && currentEl.text !== editing.initialText) {
                                  onCommit(elementsRef.current);
                                  onSave(elementsRef.current);
                                }
                              }
                              editingTextRef.current = null;
                            }}
                            onKeyDown={ev => {
                              if (ev.key === 'Escape') {
                                ev.preventDefault();
                                ev.stopPropagation();
                                setActiveElementId(null);
                                setSelectedIds([]);
                              }
                            }}
                            onClick={ev => ev.stopPropagation()}
                            onPointerDown={ev => ev.stopPropagation()}
                            className="w-full bg-transparent border-none outline-none p-0 m-0 resize-none overflow-hidden"
                            style={{ ...textStyle, height: '100%', minHeight: '100%' }}
                          />
                        ) : (
                          <div
                            className="w-full h-full cursor-pointer"
                            style={{ ...textStyle, pointerEvents: 'auto' }}
                            onClick={ev => {
                              ev.stopPropagation();
                              setSelectedIds([el.id]);
                              setActiveElementId(el.id);
                            }}
                          >
                            {el.text || <span className="text-slate-300/60 italic text-xs select-none">Text...</span>}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>

          {/* ── Page-level floating toolbar (outside element wrappers) ── */}
          {(() => {
            const activeEl = activeElementId ? elements.find(e => e.id === activeElementId) : null;
            if (!activeEl) return null;
            const isNearTop = activeEl.y < 80;
            const toolbarY = isNearTop ? activeEl.y + (activeEl.height || 30) + 15 : activeEl.y - 55;
            return (
              <div
                className="absolute z-[500] pointer-events-none"
                style={{
                  left: `${(activeEl.x / 1000) * 100}%`,
                  top: `${(toolbarY / 1000) * 100}%`,
                }}
              >
                <div className="pointer-events-auto" style={{ transform: 'translateX(-50%)' }}>
                  <ObjectToolbar
                    element={activeEl}
                    onUpdate={commitUpdate}
                    onDelete={deleteElement}
                    onDuplicate={duplicateElement}
                    onBringToFront={bringToFront}
                    onSendToBack={sendToBack}
                    setMode={setMode}
                  />
                </div>
              </div>
            );
          })()}
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

      {!hideChrome && (
      <>
      {/* ─── MINIMAL TOOL SETTINGS BAR ────────────────────── */}
      {mode !== 'select' && !activeElementId && (
        <div className="flex items-center gap-3 px-4 py-1.5 bg-white border-t border-slate-100 z-50 overflow-x-auto custom-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{mode.replace(/-/g, ' ')}</span>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5">
            {(mode === 'highlight' ? HIGHLIGHT_COLORS : PRO_COLORS).slice(0, 7).map(c => (
              <button key={c}
                onClick={e => { e.stopPropagation(); setActiveColor(c); }}
                className={`w-5 h-5 rounded-full border-2 transition-all ${activeColor === c ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-110'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          {['draw', 'line', 'arrow'].includes(mode) && (
            <>
              <div className="h-3 w-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-500">{activeBrushSize}px</span>
            </>
          )}
        </div>
      )}

      {/* ─── LINK INPUT MODAL ──────────────────────────────── */}
      {pendingLinkArea && (
        <div className="fixed inset-0 bg-black/50 z-[800] flex items-center justify-center" onClick={() => setPendingLinkArea(null)}>
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-700 mb-1">Add Hyperlink</h3>
            <p className="text-xs text-slate-400 mb-3">Draw the link area on the PDF, then enter the destination URL.</p>
            <input
              type="url"
              value={pendingLinkUrl}
              onChange={e => setPendingLinkUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 mb-4"
              onKeyDown={e => { if (e.key === 'Enter') confirmLink(); if (e.key === 'Escape') setPendingLinkArea(null); }}
            />
            <div className="flex gap-2">
              <button onClick={confirmLink} className="flex-1 py-2 bg-[#2196f3] text-white rounded-lg text-sm font-bold hover:bg-[#1976d2] transition-colors">Add Link</button>
              <button onClick={() => setPendingLinkArea(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── WATERMARK PANEL ──────────────────────────────── */}
      {showWatermarkPanel && (
        <div className="fixed inset-0 bg-black/50 z-[800] flex items-center justify-center" onClick={() => setShowWatermarkPanel(false)}>
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-700 mb-4">Add Watermark</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Watermark Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={e => setWatermarkText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL, DRAFT"
                  autoFocus
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {['#c0c0c0', '#ff000040', '#0000ff40', '#00800040', '#00000060'].map(c => (
                    <button key={c} onClick={() => setWatermarkColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${watermarkColor === c ? 'border-indigo-600 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                <input type="range" min="5" max="80" value={Math.round(watermarkOpacity * 100)}
                  onChange={e => setWatermarkOpacity(parseInt(e.target.value) / 100)}
                  className="w-full accent-indigo-600" />
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center text-sm font-bold italic" style={{ color: watermarkColor, opacity: watermarkOpacity * 3, transform: 'rotate(-15deg)', fontSize: 20 }}>
                {watermarkText || 'Preview'}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={applyWatermark} className="flex-1 py-2 bg-[#2196f3] text-white rounded-lg text-sm font-bold hover:bg-[#1976d2] transition-colors">Apply Watermark</button>
              <button onClick={() => setShowWatermarkPanel(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
      </>
      )}

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
            const currentRot = getPageRotationDeg();
            const newRot = (((currentRot + angle) % 360) + 360) % 360;
            const filtered = elements.filter(e => e.id !== '__page_rotation__');
            const rotEl: EditElement = { id: '__page_rotation__', type: 'page-rotation', pageIndex, x: 0, y: 0, rotation: newRot };
            commit(newRot !== 0 ? [...filtered, rotEl] : filtered);
            setShowPageTools(false);
          }}
          onCrop={(_rect) => {
            // Crop not yet supported in canvas overlay mode
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
            } catch (e) {
              console.error("AI form fill failed:", e);
            } finally {
              setIsAiFilling(false);
              setShowFormBuilder(false);
            }
          }}
          isFilling={isAiFilling}
        />
      )}

      {!hideChrome && (
      <>
      {/* Sejda Style Apply Bar */}
      <div className="shrink-0 bg-[#f3f3f3] border-t border-slate-200 py-6 flex justify-center sticky bottom-0 z-[200]">
        <button
          onClick={() => onFinalSave?.(elements)}
          className="flex items-center gap-3 px-8 py-3 bg-[#11b67a] hover:bg-[#0da26a] text-white rounded-md text-xl font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-95"
        >
          Apply changes <ChevronRight size={24} />
        </button>
      </div>
      </>
      )}
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
            commit([...elements, newEl]);
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
