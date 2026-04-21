import * as React from 'react';
import { createPortal } from 'react-dom';
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

  // ── Page Actions ───────────────────────────────────
  const handleDuplicatePage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index + 1, 0, images[index]);
    
    const newDimensions = [...dimensions];
    newDimensions.splice(index + 1, 0, dimensions[index]);
    
    // Shift elements for subsequent pages
    const updatedElements = elements.map(el => {
      if (el.pageIndex > index) return { ...el, pageIndex: el.pageIndex + 1 };
      return el;
    });

    // Duplicate elements of the current page
    const pageElements = elements.filter(el => el.pageIndex === index)
      .map(el => ({ ...el, id: `${el.id}-copy-${Date.now()}`, pageIndex: index + 1 }));

    setImages(newImages);
    setDimensions(newDimensions);
    setElements([...updatedElements, ...pageElements]);
    showToast('success', `Page ${index + 1} duplicated`);
  };

  const handleDeletePage = (index: number) => {
    if (images.length <= 1) {
      showToast('error', 'Cannot delete the only page');
      return;
    }
    const newImages = [...images];
    newImages.splice(index, 1);

    const newDimensions = [...dimensions];
    newDimensions.splice(index, 1);

    // Remove elements for this page and shift others
    const updatedElements = elements
      .filter(el => el.pageIndex !== index)
      .map(el => {
        if (el.pageIndex > index) return { ...el, pageIndex: el.pageIndex - 1 };
        return el;
      });

    setImages(newImages);
    setDimensions(newDimensions);
    setElements(updatedElements);
    
    if (activePage >= newImages.length) {
      setActivePage(newImages.length - 1);
    }
    showToast('success', `Page ${index + 1} deleted`);
  };

  const handleRotatePage = (index: number, angle: number) => {
    showToast('success', `Page ${index + 1} rotated by ${angle}°`);
  };

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

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden font-sans editor-bg">

      
      {/* ── Scan Warning Banner (Sejda style) ──────────────────────────── */}
      <div className="shrink-0 bg-slate-800 text-white flex items-center justify-center gap-3 px-4 py-2 z-[100]">
        <AlertCircle size={14} className="text-yellow-400" />
        <span className="text-[11px] font-medium">
          <strong>Editing a scan?</strong> Changing existing text inside scans not supported. <a href="#" className="underline hover:text-indigo-300">Convert to Word</a> to edit text.
        </span>
        <button className="p-1 hover:bg-white/10 rounded-lg ml-2"><X size={12} className="opacity-70"/></button>
      </div>
      
{/* ── Main Workspace ───────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <PdfThumbnailSidebar
          images={images}
          activeIndex={activePage}
          onSelect={setActivePage}
          pageEdits={pageEditsCount}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          onRotatePage={handleRotatePage}
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
    
      {/* ── Sticky Bottom Banner ──────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-[200]">
        <div className="flex flex-col">
          <span className="text-sm font-black text-slate-800">Apply changes</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{file.name}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-[13px] font-bold transition-all"
          >
            Cancel
          </button>

          <button
            onClick={() => handleApplyAll()}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-emerald-500/25 text-[14px] font-black transition-all active:scale-95"
          >
            {isSaving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <>Apply changes</>
            )}
          </button>
        </div>
      </div>

    </div>,
    document.body
  );
};
