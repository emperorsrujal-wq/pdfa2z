import * as React from 'react';
import {
  PenTool, Download, X, ChevronLeft, ChevronRight,
  Layers, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { PdfEditorCanvas } from './PdfEditorCanvas';
import { PdfThumbnailSidebar } from './PdfThumbnailSidebar';
import { pdfToImages, editPdf, EditElement, downloadBlob, getTextItems, PdfTextItem, PageDimensions } from '../utils/pdfHelpers';

interface PdfEditorUIProps {
  file: File;
  onCancel: () => void;
}

// ── Toast types ──────────────────────────────────────────
type ToastType = 'success' | 'error';
interface ToastItem { id: number; type: ToastType; message: string }

// ── Mini Toast System ────────────────────────────────────
const ToastContainer: React.FC<{ toasts: ToastItem[]; onDismiss: (id: number) => void }> = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
    {toasts.map(toast => (
      <div
        key={toast.id}
        className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm animate-toast-in cursor-pointer ${
          toast.type === 'success'
            ? 'bg-emerald-500 text-white shadow-emerald-500/30'
            : 'bg-red-500 text-white shadow-red-500/30'
        }`}
        onClick={() => onDismiss(toast.id)}
      >
        {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        {toast.message}
      </div>
    ))}
  </div>
);

export const PdfEditorUI: React.FC<PdfEditorUIProps> = ({ file, onCancel }) => {
  const [images, setImages] = React.useState<string[]>([]);
  const [dimensions, setDimensions] = React.useState<PageDimensions[]>([]);
  const [elements, setElements] = React.useState<EditElement[]>([]);
  const [activePage, setActivePage] = React.useState<number>(0);
  const [textItems, setTextItems] = React.useState<PdfTextItem[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const showToast = React.useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Load PDF pages ────────────────────────────────────
  React.useEffect(() => {
    let mounted = true;
    const processPdf = async () => {
      setIsProcessing(true);
      try {
        const { images: imgs, dimensions: dims } = await pdfToImages(file);
        if (mounted) {
          setImages(imgs);
          setDimensions(dims);
          setActivePage(0);
        }
      } catch (error: unknown) {
        if (mounted) {
          const msg = error instanceof Error ? error.message : 'Unknown error occurred';
          showToast('error', `Failed to render PDF: ${msg}`);
        }
      } finally {
        if (mounted) setIsProcessing(false);
      }
    };
    processPdf();
    return () => { mounted = false; };
  }, [file]);

  // ── Fetch text items for active page ─────────────────
  React.useEffect(() => {
    const fetchText = async () => {
      try {
        const items = await getTextItems(file, activePage);
        setTextItems(items);
      } catch (e) {
        console.warn('Could not fetch text items', e);
      }
    };
    fetchText();
  }, [file, activePage]);

  // ── Save & Download ───────────────────────────────────
  const handleApplyAll = async (latestElements?: EditElement[]) => {
    setIsSaving(true);
    try {
      const elementsToUse = latestElements || elements;
      const res = await editPdf(file, elementsToUse);
      downloadBlob(res, `edited-${file.name}`);
      showToast('success', 'PDF saved and downloaded successfully!');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error occurred';
      showToast('error', `Failed to save: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Loading Screen ────────────────────────────────────
  if (images.length === 0 && isProcessing) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center editor-bg">
        {/* Animated logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse">
            <Layers size={36} className="text-white" />
          </div>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-500 blur-xl opacity-30 animate-pulse" />
        </div>
        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Processing Document</h3>
        <p className="text-slate-500 font-medium text-sm mb-8">Rendering pages for the workspace...</p>
        <div className="flex gap-1.5">
          {[0, 0.15, 0.3].map((delay, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const totalEdits = elements.length;
  const pageEditsCount = images.reduce((acc, _, i) => {
    acc[i] = elements.filter(el => el.pageIndex === i).length;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden font-sans editor-bg">

      {/* ── Premium Dark Header ──────────────────────────── */}
      <header
        className="shrink-0 z-50 flex items-center justify-between px-5 h-14"
        style={{ background: 'var(--editor-toolbar)', borderBottom: '1px solid var(--editor-border)' }}
      >
        {/* Left: Logo + File info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <PenTool size={14} className="text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-white text-sm tracking-tighter">PDF Editor</span>
              <span className="text-[9px] font-black text-blue-400/70 bg-blue-400/10 px-1.5 py-0.5 rounded-full border border-blue-400/20 uppercase tracking-widest">PRO</span>
            </div>
          </div>

          <div className="w-px h-4 bg-white/8" />

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-slate-400 truncate max-w-[180px]">{file.name}</span>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{images.length} page{images.length !== 1 ? 's' : ''}</span>
          </div>

          {totalEdits > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-blue-400">{totalEdits} edit{totalEdits !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Center: Page navigation */}
        {images.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePage(p => Math.max(0, p - 1))}
              disabled={activePage === 0}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-400 min-w-[70px] text-center tabular-nums">
              Page <span className="text-white">{activePage + 1}</span> / {images.length}
            </span>
            <button
              onClick={() => setActivePage(p => Math.min(images.length - 1, p + 1))}
              disabled={activePage === images.length - 1}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 text-[11px] font-bold transition-all"
          >
            <X size={14} /> Close
          </button>

          <button
            onClick={() => handleApplyAll()}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-blue-500/25 text-[11px] font-black transition-all active:scale-95"
          >
            {isSaving ? (
              <><Loader2 size={14} className="animate-spin" /> Saving...</>
            ) : (
              <><Download size={14} /> Save & Download</>
            )}
          </button>
        </div>
      </header>

      {/* ── Main Workspace ───────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <PdfThumbnailSidebar
          images={images}
          activeIndex={activePage}
          onSelect={setActivePage}
          pageEdits={pageEditsCount}
        />

        {/* Editor Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <PdfEditorCanvas
            image={images[activePage]}
            dimensions={dimensions[activePage]}
            pageIndex={activePage}
            initialElements={elements.filter(el => el.pageIndex === activePage)}
            onSave={(newElements) => {
              const otherPages = elements.filter(el => el.pageIndex !== activePage);
              setElements([...otherPages, ...newElements]);
            }}
            onFinalSave={handleApplyAll}
            onCancel={onCancel}
            isEmbedded={true}
            textItems={textItems}
            file={file}
          />
        </main>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
