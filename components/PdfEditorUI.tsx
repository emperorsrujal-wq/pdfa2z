import * as React from 'react';
import { CheckCircle2, Layout, X, AlertTriangle, FileWarning, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { PdfEditorCanvas } from './PdfEditorCanvas';
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
        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-6">
          <FileWarning size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">{isTypeError ? 'Invalid File Type' : 'File Too Large'}</h2>
        <p className="text-slate-500 text-center max-w-md mb-2">{fileSizeError}</p>
        {!isTypeError && <p className="text-slate-400 text-sm text-center mb-8">Please compress your PDF or use a smaller file. You can use our <strong>Compress PDF</strong> tool first.</p>}
        <button onClick={onCancel} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
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
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-200 mb-8">
          <Layout size={36} className="animate-pulse" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-2">Preparing Your Document</h3>
        <p className="text-slate-400 font-medium text-sm mb-8">{PROCESSING_STAGES[progressStage]}</p>

        {/* Progress bar */}
        <div className="w-full max-w-sm bg-slate-200 rounded-full h-2 overflow-hidden mb-3">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 font-bold">{progress}% complete</p>

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
        <div className="w-24 h-24 bg-amber-100 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-amber-200/50">
          <AlertTriangle size={48} className="text-amber-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Oops! Document Error</h2>
        <p className="text-slate-600 text-center max-w-md mb-10 leading-relaxed font-medium">
          {errorMsg}
          <span className="block mt-4 text-sm text-slate-400 font-normal italic">
            Tip: Some secured or corrupted PDFs may not open. Try another file or ensure it's not password protected.
          </span>
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => { setErrorMsg(''); setFileSizeError(''); onCancel(); }} 
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Go Back
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="px-10 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-black hover:bg-slate-50 transition-all active:scale-95"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#f3f3f3] z-[9999] flex flex-col overflow-hidden font-sans">

      {/* ── Saving Overlay ── */}
      {isSaving && (
        <div className="absolute inset-0 z-[500] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 border border-slate-100">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="font-black text-slate-700 text-lg">Applying Changes...</p>
            <p className="text-slate-400 text-sm">Generating your edited PDF, please wait.</p>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onCancel} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-bold">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="text-center">
            <h1 className="text-xl font-black text-[#333]">Online PDF Editor</h1>
            <p className="text-slate-400 text-xs">
              {file.name} &nbsp;·&nbsp; {images.length} page{images.length !== 1 ? 's' : ''} &nbsp;·&nbsp; {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">● Unsaved</span>
            )}
            <button
              onClick={() => handleApplyAll(elements)}
              className="flex items-center gap-2 px-5 py-2 bg-[#11b67a] hover:bg-[#0da26a] text-white rounded-lg font-bold text-sm transition-all"
            >
              Apply changes <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Notifications ── */}
      {successMsg && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[300] bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle2 size={18} /> {successMsg}
          <button onClick={() => setSuccessMsg('')} className="ml-4 opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      )}
      {errorMsg && images.length > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[300] bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2 animate-in slide-in-from-top-4">
          <AlertTriangle size={18} /> {errorMsg}
          <button onClick={() => setErrorMsg('')} className="ml-4 opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      )}

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Page Thumbnail Sidebar */}
        {images.length > 1 && (
          <aside className="w-28 bg-white border-r border-slate-200 flex flex-col overflow-y-auto py-4 gap-3 items-center shrink-0 custom-scrollbar">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActivePage(i)}
                className={`group relative w-20 shrink-0 transition-all ${activePage === i ? 'ring-2 ring-blue-500 shadow-lg' : 'ring-1 ring-slate-200 hover:ring-blue-300'} rounded overflow-hidden`}
              >
                <img src={img} alt={`Page ${i + 1}`} className="w-full object-cover" />
                <div className={`absolute bottom-0 left-0 right-0 text-center text-[9px] font-black py-0.5 ${activePage === i ? 'bg-blue-600 text-white' : 'bg-black/50 text-white'}`}>
                  {i + 1}
                </div>
                {/* Edit count badge */}
                {elements.filter(el => el.pageIndex === i).length > 0 && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow">
                    {elements.filter(el => el.pageIndex === i).length}
                  </div>
                )}
              </button>
            ))}
          </aside>
        )}

        {/* Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
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
            onSave={(newElements) => {
              // This is now handled by commit() mostly, but kept for compatibility
              // if PdfEditorCanvas still manages some local temp state
            }}
            onFinalSave={handleApplyAll}
            onCancel={onCancel}
            isEmbedded={true}
            textItems={textItems}
            file={currentFile}
            onInsertPage={handleInsertPage}
            onDeletePage={handleDeletePage}
          />
        </main>
      </div>
    </div>
  );
};
