import * as React from 'react';
import {
  CheckCircle2, Layout, X, AlertTriangle, FileWarning, ChevronLeft,
  ChevronRight as ChevronRightIcon, ZoomIn, ZoomOut, Undo2, Redo2,
  Download, FileText, Keyboard
} from 'lucide-react';
import { PdfEditorCanvas } from './PDFEditorCanvas';
import { ToolPalette } from './pdf-editor/ToolPalette';
import { MobileToolBar } from './pdf-editor/MobileToolBar';
import { KeyboardShortcutsModal } from './pdf-editor/KeyboardShortcutsModal';
import type { EditorMode } from './pdf-editor/types';
import { pdfToImages, editPdf, EditElement, downloadBlob, getTextItems, PdfTextItem, PageDimensions, insertBlankPage, removePages, rotatePage, reorderPdf, PageOrder } from '../utils/pdfHelpers';

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface PdfEditorUIProps {
  file: File;
  onCancel: () => void;
}

const PROCESSING_STAGES = [
  'Loading PDF engine...',
  'Parsing document structure...',
  'Rendering page thumbnails...',
  'Extracting text layers...',
  'Preparing workspace...',
];

export const PdfEditorUI: React.FC<PdfEditorUIProps> = ({ file, onCancel }) => {
  const [currentFile, setCurrentFile] = React.useState<File>(file);
  const [images, setImages] = React.useState<string[]>([]);
  const [dimensions, setDimensions] = React.useState<PageDimensions[]>([]);
  const [elements, setElements] = React.useState<EditElement[]>([]);
  const [history, setHistory] = React.useState<EditElement[][]>([[]]);
  const [historyStep, setHistoryStep] = React.useState(0);
  const [activePage, setActivePage] = React.useState<number>(0);
  const [textItems, setTextItems] = React.useState<PdfTextItem[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [progressStage, setProgressStage] = React.useState(0);
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [fileSizeError, setFileSizeError] = React.useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [editorMode, setEditorMode] = React.useState<EditorMode>('select');
  const [zoom, setZoom] = React.useState(100);
  const [activeColor, setActiveColor] = React.useState('#000000');
  const [activeFontSize, setActiveFontSize] = React.useState(14);
  const [activeFontName, setActiveFontName] = React.useState('Helvetica');
  const [activeBrushSize, setActiveBrushSize] = React.useState(3);
  const [activeElementId, setActiveElementId] = React.useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = React.useState(false);
  const [rightPanelTab, setRightPanelTab] = React.useState<'pages' | 'properties'>('pages');
  const sessionKey = `pdfa2z_session_${file.name}_${file.size}`;

  // ── File Validation ───────────────────────────────────────────────
  React.useEffect(() => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setFileSizeError(`Invalid file type: "${file.name}" is not a PDF. Please upload a .pdf file.`);
    } else if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileSizeError(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
    }
  }, [file]);

  // ── Unsaved changes warning ───────────────────────────────────────
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // ── localStorage Session Restore ─────────────────────────────────
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(sessionKey);
      if (saved) {
        const parsed: EditElement[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setElements(parsed);
          setHistory([parsed]);
          setHistoryStep(0);
          setHasUnsavedChanges(true);
        }
      }
    } catch (e) {
      console.warn('Could not restore session:', e);
    }
  }, [sessionKey]);

  const saveSession = (els: EditElement[]) => {
    try {
      localStorage.setItem(sessionKey, JSON.stringify(els));
    } catch (e) {
      console.warn('Could not save session:', e);
    }
  };

  const clearSession = () => {
    try { localStorage.removeItem(sessionKey); } catch (e) { /* ignore */ }
  };

  // ── PDF Processing with progress stages ──────────────────────────
  React.useEffect(() => {
    if (fileSizeError) return;
    let mounted = true;
    let stageInterval: ReturnType<typeof setInterval>;

    const processPdf = async () => {
      setIsProcessing(true);
      setProgressStage(0);

      stageInterval = setInterval(() => {
        setProgressStage(prev => Math.min(prev + 1, PROCESSING_STAGES.length - 1));
      }, 600);

      try {
        const { images: imgs, dimensions: dims } = await pdfToImages(file);
        if (mounted) {
          setImages(imgs);
          setDimensions(dims);
          setActivePage(0);
        }
      } catch (error: unknown) {
        if (mounted) {
          const message = error instanceof Error ? error.message : 'Unknown error occurred';
          setErrorMsg(`Failed to render PDF: ${message}`);
        }
      } finally {
        clearInterval(stageInterval);
        if (mounted) setIsProcessing(false);
      }
    };
    processPdf();
    return () => {
      mounted = false;
      clearInterval(stageInterval);
    };
  }, [file, fileSizeError]);

  // ── Fetch text items for active page ─────────────────────────────
  React.useEffect(() => {
    const fetchText = async () => {
      try {
        const items = await getTextItems(currentFile, activePage);
        setTextItems(items);
      } catch (e) {
        console.warn('Could not fetch text items', e);
      }
    };
    fetchText();
  }, [currentFile, activePage]);

  // ── History Management ───────────────────────────────────────────
  const commit = (next: EditElement[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(next);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setElements(next);
    saveSession(next);
    setHasUnsavedChanges(true);
  };

  const undo = () => {
    if (historyStep > 0) {
      const prev = history[historyStep - 1];
      setElements(prev);
      setHistoryStep(historyStep - 1);
      saveSession(prev);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const next = history[historyStep + 1];
      setElements(next);
      setHistoryStep(historyStep + 1);
      saveSession(next);
    }
  };

  // ── Keyboard Shortcuts ───────────────────────────────────────────
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setShowShortcuts(prev => !prev);
        e.preventDefault();
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          if (e.shiftKey) {
            if (historyStep < history.length - 1) redo();
          } else {
            if (historyStep > 0) undo();
          }
          e.preventDefault();
        } else if (e.key === 'y') {
          if (historyStep < history.length - 1) redo();
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyStep]);

  const handleApplyAll = async (latestElements?: EditElement[]) => {
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const elementsToUse = latestElements || elements;
      const res = await editPdf(currentFile, elementsToUse);
      downloadBlob(res, `edited-${file.name}`);
      setSuccessMsg('PDF Successfully Edited and Downloaded!');
      clearSession();
      setHasUnsavedChanges(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMsg(`Failed to save edits: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInsertPage = async () => {
    try {
      const bytes = await insertBlankPage(currentFile, activePage);
      const newFile = new File([bytes.buffer as ArrayBuffer], file.name, { type: 'application/pdf' });
      setCurrentFile(newFile);
      const { images: imgs, dimensions: dims } = await pdfToImages(newFile);
      setImages(imgs);
      setDimensions(dims);
      setElements(prev => prev.map(el =>
        el.pageIndex > activePage ? { ...el, pageIndex: el.pageIndex + 1 } : el
      ));
      setActivePage(activePage + 1);
      setHasUnsavedChanges(true);
    } catch (e) {
      console.warn('Could not insert page', e);
    }
  };

  const activeElement = activeElementId ? elements.find(e => e.id === activeElementId) : null;
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleReorderPages = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newImages = [...images];
    const newDimensions = [...dimensions];
    const [movedImg] = newImages.splice(fromIndex, 1);
    const [movedDim] = newDimensions.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImg);
    newDimensions.splice(toIndex, 0, movedDim);

    // Build mapping: oldIndex -> newIndex
    const reorderedOldIndices = newImages.map((_, i) => {
      // Find which old index is now at position i
      return images.indexOf(newImages[i]);
    });
    const oldToNew: Record<number, number> = {};
    reorderedOldIndices.forEach((oldIdx, newIdx) => {
      oldToNew[oldIdx] = newIdx;
    });

    // Update element page indices
    const newElements = elements.map(el => ({
      ...el,
      pageIndex: oldToNew[el.pageIndex] ?? el.pageIndex,
    }));

    // Reorder the underlying PDF
    try {
      const order: PageOrder[] = reorderedOldIndices.map(oldIdx => ({ index: oldIdx, rotation: 0 }));
      const bytes = await reorderPdf(currentFile, order);
      const newFile = new File([bytes.buffer as ArrayBuffer], file.name, { type: 'application/pdf' });
      setCurrentFile(newFile);
    } catch (e) {
      console.warn('Could not reorder PDF pages', e);
    }

    setImages(newImages);
    setDimensions(newDimensions);
    setElements(newElements);
    setActivePage(toIndex > fromIndex ? toIndex - 1 : toIndex);
    setHasUnsavedChanges(true);
  };

  const updateActiveElement = (updates: Partial<EditElement>) => {
    if (!activeElementId) return;
    const next = elements.map(el => el.id === activeElementId ? { ...el, ...updates } : el);
    setElements(next);
    // Also sync mask position if text element is moved/resized
    if (activeElementId.startsWith('t-')) {
      const maskId = activeElementId.replace('t-', 'mask-');
      if (updates.x !== undefined || updates.y !== undefined || updates.width !== undefined || updates.height !== undefined) {
        setElements(prev => prev.map(el => {
          if (el.id !== maskId) return el;
          return { ...el, x: updates.x ?? el.x, y: updates.y ?? el.y, width: updates.width ?? el.width, height: updates.height ?? el.height };
        }));
      }
    }
    setHasUnsavedChanges(true);
  };

  const handleRotatePage = async () => {
    try {
      const bytes = await rotatePage(new Uint8Array(await currentFile.arrayBuffer()), activePage, 90);
      const newFile = new File([bytes.buffer as ArrayBuffer], file.name, { type: 'application/pdf' });
      setCurrentFile(newFile);
      const { images: imgs, dimensions: dims } = await pdfToImages(newFile);
      setImages(imgs);
      setDimensions(dims);
      setHasUnsavedChanges(true);
    } catch (e) {
      console.warn('Could not rotate page', e);
    }
  };

  const handleDeletePage = async () => {
    if (images.length <= 1) return;
    try {
      const bytes = await removePages(currentFile, [activePage + 1]);
      const newFile = new File([bytes.buffer as ArrayBuffer], file.name, { type: 'application/pdf' });
      setCurrentFile(newFile);
      const { images: imgs, dimensions: dims } = await pdfToImages(newFile);
      setImages(imgs);
      setDimensions(dims);
      setElements(prev => prev
        .filter(el => el.pageIndex !== activePage)
        .map(el => el.pageIndex > activePage ? { ...el, pageIndex: el.pageIndex - 1 } : el)
      );
      setActivePage(Math.min(activePage, imgs.length - 1));
      setHasUnsavedChanges(true);
    } catch (e) {
      console.warn('Could not delete page', e);
    }
  };

  // ── File Error Screen ─────────────────────────────────────────────
  if (fileSizeError) {
    const isTypeError = fileSizeError.includes('not a PDF');
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
          <FileWarning size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{isTypeError ? 'Invalid File Type' : 'File Too Large'}</h2>
        <p className="text-slate-500 text-center max-w-md mb-2 text-sm">{fileSizeError}</p>
        {!isTypeError && <p className="text-slate-400 text-sm text-center mb-8">Please compress your PDF or use a smaller file. You can use our <strong>Compress PDF</strong> tool first.</p>}
        <button onClick={onCancel} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all text-sm">
          Back to Tools
        </button>
      </div>
    );
  }

  // ── Processing Screen ─────────────────────────────────────────────
  if (images.length === 0 && isProcessing) {
    const progress = Math.round(((progressStage + 1) / PROCESSING_STAGES.length) * 100);
    return (
      <div className="fixed inset-0 bg-[#f8f9fb] z-[9999] flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-8">
          <Layout size={28} className="animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Preparing Your Document</h3>
        <p className="text-slate-400 font-medium text-sm mb-8">{PROCESSING_STAGES[progressStage]}</p>

        {/* Progress bar */}
        <div className="w-full max-w-sm bg-slate-200 rounded-full h-2 overflow-hidden mb-3">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 font-medium">{progress}% complete</p>

        <p className="text-xs text-slate-300 mt-6">
          File: <span className="font-medium">{file.name}</span> &nbsp;·&nbsp; {(file.size / 1024 / 1024).toFixed(1)} MB
        </p>
      </div>
    );
  }

  // ── Error Screen ──────────────────────────────────────────────────
  if (errorMsg && images.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#fefce8] z-[9999] flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mb-8 shadow-md">
          <AlertTriangle size={36} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Oops! Document Error</h2>
        <p className="text-slate-600 text-center max-w-md mb-10 leading-relaxed text-sm">
          {errorMsg}
          <span className="block mt-4 text-sm text-slate-400 italic">
            Tip: Some secured or corrupted PDFs may not open. Try another file or ensure it's not password protected.
          </span>
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => { setErrorMsg(''); setFileSizeError(''); onCancel(); }} 
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-sm active:scale-95 text-sm"
          >
            Go Back
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all active:scale-95 text-sm"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col overflow-hidden font-sans">

      {/* ── Saving Overlay ── */}
      {isSaving && (
        <div className="absolute inset-0 z-[500] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4 border border-slate-100">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="font-semibold text-slate-700">Applying Changes...</p>
            <p className="text-slate-400 text-sm">Generating your edited PDF, please wait.</p>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-50 h-14 flex items-center px-4">
        <div className="flex items-center justify-between w-full">
          {/* Left: Back + File info */}
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={onCancel} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium shrink-0">
              <ChevronLeft size={16} /> Back
            </button>
            <div className="h-5 w-px bg-slate-200 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 min-w-0">
              <FileText size={16} className="text-slate-400 shrink-0" />
              <span className="text-sm font-medium text-slate-700 truncate max-w-[200px] lg:max-w-xs">{file.name}</span>
              <span className="text-xs text-slate-400 shrink-0">{images.length} page{images.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Center: Page nav + Zoom */}
          <div className="flex items-center gap-3">
            {images.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-50 rounded-lg border border-slate-200 px-1">
                <button
                  onClick={() => setActivePage(Math.max(0, activePage - 1))}
                  disabled={activePage === 0}
                  className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-medium text-slate-600 w-12 text-center">
                  {activePage + 1} / {images.length}
                </span>
                <button
                  onClick={() => setActivePage(Math.min(images.length - 1, activePage + 1))}
                  disabled={activePage === images.length - 1}
                  className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
                >
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1 bg-slate-50 rounded-lg border border-slate-200 px-1">
              <button onClick={() => setZoom(Math.max(50, zoom - 25))} className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"><ZoomOut size={16} /></button>
              <span className="text-xs font-medium text-slate-600 w-12 text-center">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"><ZoomIn size={16} /></button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Keyboard shortcuts (?)"
              >
                <Keyboard size={16} />
              </button>
              <button
                onClick={undo}
                disabled={historyStep === 0}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={16} />
              </button>
              <button
                onClick={redo}
                disabled={historyStep >= history.length - 1}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={16} />
              </button>
            </div>
            {hasUnsavedChanges && (
              <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-1 rounded-md hidden sm:inline-block">Unsaved</span>
            )}
            <button
              onClick={() => handleApplyAll(elements)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all shadow-sm"
            >
              <Download size={16} /> Download
            </button>
          </div>
        </div>
      </header>

      {/* ── Notifications ── */}
      {successMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[300] bg-emerald-500 text-white px-5 py-2.5 rounded-xl shadow-lg font-medium flex items-center gap-2 text-sm animate-in slide-in-from-top-4">
          <CheckCircle2 size={16} /> {successMsg}
          <button onClick={() => setSuccessMsg('')} className="ml-3 opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      )}
      {errorMsg && images.length > 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[300] bg-red-500 text-white px-5 py-2.5 rounded-xl shadow-lg font-medium flex items-center gap-2 text-sm animate-in slide-in-from-top-4">
          <AlertTriangle size={16} /> {errorMsg}
          <button onClick={() => setErrorMsg('')} className="ml-3 opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      )}

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tool Palette (desktop) */}
        <div className="hidden md:block">
          <ToolPalette
            activeMode={editorMode}
            onModeChange={(m) => setEditorMode(m)}
          />
        </div>

        {/* Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#f3f3f3]">
          <div className="flex-1 overflow-hidden">
            <PdfEditorCanvas
              image={images[activePage]}
              dimensions={dimensions[activePage]}
              pageIndex={activePage}
              totalPages={images.length}
              elements={elements}
              historyStep={historyStep}
              canRedo={historyStep < history.length - 1}
              onCommit={commit}
              onUndo={undo}
              onRedo={redo}
              onSave={(_newElements: EditElement[]) => {}}
              onFinalSave={handleApplyAll}
              onCancel={onCancel}
              isEmbedded={true}
              mode={editorMode}
              onModeChange={(m) => setEditorMode(m)}
              hideChrome={true}
              zoom={zoom / 100}
              onZoomChange={(z) => setZoom(Math.round(z * 100))}
              activeColor={activeColor}
              onColorChange={setActiveColor}
              activeFontSize={activeFontSize}
              onFontSizeChange={setActiveFontSize}
              activeFontName={activeFontName}
              onFontNameChange={setActiveFontName}
              activeBrushSize={activeBrushSize}
              onBrushSizeChange={setActiveBrushSize}
              onActiveElementChange={(id) => setActiveElementId(id)}
              textItems={textItems}
              file={currentFile}
              onInsertPage={handleInsertPage}
              onDeletePage={handleDeletePage}
              setElements={setElements}
            />
          </div>
        </main>

        {/* Right: Properties / Page Thumbnails */}
        <aside className="w-64 bg-white border-l border-slate-200 flex flex-col overflow-hidden shrink-0 hidden lg:flex">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setRightPanelTab('pages')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${rightPanelTab === 'pages' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Pages
            </button>
            <button
              onClick={() => setRightPanelTab('properties')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${rightPanelTab === 'properties' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Tool Info
            </button>
          </div>

          {rightPanelTab === 'pages' ? (
            <>
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar">
                {images.map((img, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.setData('text/plain', String(i));
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={e => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      setDragOverIndex(i);
                    }}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={e => {
                      e.preventDefault();
                      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                      handleReorderPages(fromIndex, i);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => setDragOverIndex(null)}
                    onClick={() => setActivePage(i)}
                    className={`group relative w-full transition-all rounded-lg overflow-hidden border cursor-move ${
                      activePage === i ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-blue-300'
                    } ${dragOverIndex === i ? 'border-blue-500 border-dashed bg-blue-50' : ''}`}
                  >
                    <img src={img} alt={`Page ${i + 1}`} className="w-full object-cover pointer-events-none" />
                    <div className={`absolute bottom-0 left-0 right-0 text-center text-[10px] font-semibold py-0.5 ${activePage === i ? 'bg-blue-600 text-white' : 'bg-black/50 text-white'}`}>
                      {i + 1}
                    </div>
                    {elements.filter(el => el.pageIndex === i).length > 0 && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow">
                        {elements.filter(el => el.pageIndex === i).length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={handleInsertPage}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  + Insert
                </button>
                <button
                  onClick={handleRotatePage}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Rotate 90° clockwise"
                >
                  ↻ Rotate
                </button>
                <button
                  onClick={handleDeletePage}
                  disabled={images.length <= 1}
                  className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-4">
                {/* Active Tool */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Active Tool</h4>
                  <p className="text-sm font-medium text-slate-800 capitalize">{editorMode.replace(/-/g, ' ')}</p>
                </div>

                {/* Selected Element Formatting */}
                {activeElement && (
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Selected {activeElement.type}</h4>
                    <div className="flex gap-2 mb-2">
                      <button onClick={() => updateActiveElement({ isBold: !activeElement.isBold })} className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${activeElement.isBold ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>B</button>
                      <button onClick={() => updateActiveElement({ isItalic: !activeElement.isItalic })} className={`flex-1 py-1.5 rounded text-xs italic transition-colors ${activeElement.isItalic ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>I</button>
                      <button onClick={() => updateActiveElement({ isUnderline: !activeElement.isUnderline })} className={`flex-1 py-1.5 rounded text-xs underline transition-colors ${activeElement.isUnderline ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>U</button>
                    </div>
                    <div className="flex gap-1">
                      {(['left','center','right'] as const).map(a => (
                        <button key={a} onClick={() => updateActiveElement({ textAlign: a })} className={`flex-1 py-1 rounded text-[10px] uppercase transition-colors ${activeElement.textAlign === a ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{a[0]}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Color</h4>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['#000000','#333333','#666666','#999999','#CCCCCC','#FFFFFF','#EF4444','#F97316','#F59E0B','#84CC16','#10B981','#06B6D4','#3B82F6','#6366F1'].map(c => (
                      <button key={c} onClick={() => setActiveColor(c)} className={`w-6 h-6 rounded border ${activeColor === c ? 'ring-2 ring-blue-500 ring-offset-1 border-transparent' : 'border-slate-200'}`} style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="color" value={activeColor} onChange={(e) => setActiveColor(e.target.value)} className="w-8 h-8 rounded border border-slate-200 p-0 overflow-hidden cursor-pointer" />
                    <span className="text-xs text-slate-500 font-mono uppercase">{activeColor}</span>
                  </div>
                </div>

                {/* Font Size */}
                {(editorMode === 'magic-edit' || editorMode === 'text' || editorMode === 'form-text') && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Font Size</h4>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setActiveFontSize(Math.max(0.5, activeFontSize - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-bold">-</button>
                      <input type="number" min={0.5} max={200} step={0.1} value={activeFontSize} onChange={(e) => setActiveFontSize(Number(e.target.value))} className="flex-1 px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none text-center" />
                      <button onClick={() => setActiveFontSize(Math.min(200, activeFontSize + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-bold">+</button>
                    </div>
                  </div>
                )}

                {/* Font Family */}
                {(editorMode === 'magic-edit' || editorMode === 'text' || editorMode === 'form-text') && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Font</h4>
                    <select value={activeFontName} onChange={(e) => setActiveFontName(e.target.value)} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-blue-400">
                      {['Helvetica','Arial','Times-Roman','Courier','Georgia','Verdana','Palatino','Garamond','Trebuchet MS','Impact','Comic Sans MS','Bookman Old Style','Candara','Calibri','Cambria'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Brush Size */}
                {(editorMode === 'draw' || editorMode === 'highlight' || ['rect','circle','ellipse','line','arrow'].includes(editorMode)) && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Stroke Width</h4>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setActiveBrushSize(Math.max(1, activeBrushSize - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-bold">-</button>
                      <input type="number" min={1} max={50} value={activeBrushSize} onChange={(e) => setActiveBrushSize(Number(e.target.value))} className="flex-1 px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none text-center" />
                      <button onClick={() => setActiveBrushSize(Math.min(50, activeBrushSize + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-bold">+</button>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Tip</h4>
                  <p className="text-sm text-blue-800">{getToolTip(editorMode)}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Document</h4>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p><span className="text-slate-400">Pages:</span> {images.length}</p>
                    <p><span className="text-slate-400">Size:</span> {(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    <p><span className="text-slate-400">Edits:</span> {elements.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile Tool Bar */}
      <MobileToolBar activeMode={editorMode} onModeChange={(m) => setEditorMode(m)} />

      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
};

function getToolTip(mode: EditorMode): string {
  const tips: Record<string, string> = {
    select: 'Click to select, drag to move. Use handles to resize or rotate.',
    text: 'Click anywhere to add a new text box.',
    'magic-edit': 'Click existing text to edit it directly, or click empty space to add new text.',
    draw: 'Click and drag to draw freehand.',
    highlight: 'Click and drag to highlight text areas.',
    erase: 'Click and drag to cover content with white.',
    'smart-erase': 'Automatically matches background color.',
    rect: 'Click and drag to draw rectangles.',
    circle: 'Click and drag to draw circles.',
    line: 'Click and drag to draw straight lines.',
    arrow: 'Click and drag to draw arrows.',
    image: 'Click to place an image, then upload your file.',
    link: 'Draw a rectangle to create a clickable link area.',
    sign: 'Place a signature box, then draw or upload your signature.',
    'sticky-note': 'Click to add a comment note.',
    'form-text': 'Click to place a fillable text field.',
    watermark: 'Add a watermark across your document.',
    'find-replace': 'Search and replace text across the document.',
  };
  return tips[mode] || 'Select a tool to start editing.';
}
