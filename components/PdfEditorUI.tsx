import * as React from 'react';
import {
  CheckCircle2, Layout, X, AlertTriangle, FileWarning, ChevronLeft,
  ChevronRight as ChevronRightIcon, ZoomIn, ZoomOut, Undo2, Redo2,
  Download, FileText, Keyboard
} from 'lucide-react';
import { PdfEditorCanvas } from './PDFEditorCanvas';
import { ToolPalette } from './pdf-editor/ToolPalette';
import { KeyboardShortcutsModal } from './pdf-editor/KeyboardShortcutsModal';
import type { EditorMode } from './pdf-editor/types';
import { pdfToImages, editPdf, EditElement, downloadBlob, getTextItems, PdfTextItem, PageDimensions, insertBlankPage, removePages } from '../utils/pdfHelpers';

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
        {/* Tool Palette */}
        <ToolPalette
          activeMode={editorMode}
          onModeChange={(m) => setEditorMode(m)}
        />

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
                  <button
                    key={i}
                    onClick={() => setActivePage(i)}
                    className={`group relative w-full transition-all rounded-lg overflow-hidden border ${
                      activePage === i ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <img src={img} alt={`Page ${i + 1}`} className="w-full object-cover" />
                    <div className={`absolute bottom-0 left-0 right-0 text-center text-[10px] font-semibold py-0.5 ${activePage === i ? 'bg-blue-600 text-white' : 'bg-black/50 text-white'}`}>
                      {i + 1}
                    </div>
                    {elements.filter(el => el.pageIndex === i).length > 0 && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow">
                        {elements.filter(el => el.pageIndex === i).length}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="p-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={handleInsertPage}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  + Insert Page
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
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Active Tool</h4>
                  <p className="text-sm font-medium text-slate-800 capitalize">{editorMode.replace(/-/g, ' ')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Document</h4>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p><span className="text-slate-400">Pages:</span> {images.length}</p>
                    <p><span className="text-slate-400">Size:</span> {(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    <p><span className="text-slate-400">Edits:</span> {elements.length}</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Tip</h4>
                  <p className="text-sm text-blue-800">{getToolTip(editorMode)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Shortcuts</h4>
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600">
                    <span><kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono">Ctrl+Z</kbd> Undo</span>
                    <span><kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono">Ctrl+Y</kbd> Redo</span>
                    <span><kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono">Delete</kbd> Remove</span>
                    <span><kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono">?</kbd> Shortcuts</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

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
