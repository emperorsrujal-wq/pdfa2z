import * as React from 'react';
import { PenTool, Loader2, Upload, FileText, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { pdfToImages, EditElement, editPdf, downloadBlob } from '../utils/pdfHelpers';
import { PdfSignCanvas } from './PdfSignCanvas';
import { SignaturePad } from './SignaturePad';

interface PdfSignUIProps {
  files: File[];
}

export const PdfSignUI: React.FC<PdfSignUIProps> = ({ files }) => {
  const [images, setImages] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  // All page elements keyed by page index
  const [pageElements, setPageElements] = React.useState<Record<number, EditElement[]>>({});
  // Saved signatures (base64 strings)
  const [savedSignatures, setSavedSignatures] = React.useState<string[]>([]);

  // Active page in the editor (null = show page thumbnails)
  const [activePage, setActivePage] = React.useState<number | null>(null);
  const [showNewSigPad, setShowNewSigPad] = React.useState(false);

  // Load PDF pages
  React.useEffect(() => {
    if (!files.length) return;
    setIsLoading(true);
    pdfToImages(files[0])
      .then(imgs => {
        setImages(imgs);
        setActivePage(0); // Go straight to editor on first page
      })
      .catch(err => setErrorMsg(`Failed to load PDF: ${err.message}`))
      .finally(() => setIsLoading(false));
  }, [files]);

  const handlePageSave = (pageIdx: number, els: EditElement[]) => {
    setPageElements(prev => ({ ...prev, [pageIdx]: els }));
  };

  const handleFinish = async () => {
    if (!files.length) return;
    setIsDownloading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const allElements = Object.values(pageElements).flat();
      const bytes = await editPdf(files[0], allElements);
      downloadBlob(bytes, `signed_${files[0].name}`);
      setSuccessMsg('✅ Signed PDF downloaded successfully!');
      setActivePage(null);
    } catch (err: any) {
      setErrorMsg(`Failed to apply signatures: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const totalEdits = Object.values(pageElements).flat().length;

  // ─── LOADING ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 py-20">
        <div className="w-16 h-16 bg-[#0061ef] rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
          <PenTool size={32} className="text-white" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black text-slate-800">Loading Document</h3>
          <p className="text-slate-500 text-sm mt-1">Preparing your document for signing...</p>
        </div>
        <Loader2 className="w-8 h-8 text-[#0061ef] animate-spin" />
      </div>
    );
  }

  // ─── SIGNING WORKSTATION ───────────────────────────────────────
  if (activePage !== null && images[activePage]) {
    return (
      <>
        {showNewSigPad && (
          <SignaturePad
            onSave={sig => {
              setSavedSignatures(prev => [...prev, sig]);
              setShowNewSigPad(false);
            }}
            onCancel={() => setShowNewSigPad(false)}
          />
        )}
        <PdfSignCanvas
          image={images[activePage]}
          pageIndex={activePage}
          totalPages={images.length}
          initialElements={pageElements[activePage] || []}
          savedSignatures={savedSignatures}
          onSave={els => handlePageSave(activePage, els)}
          onFinish={handleFinish}
          onCancel={() => setActivePage(null)}
          onPageChange={delta => {
            const next = activePage + delta;
            if (next >= 0 && next < images.length) setActivePage(next);
          }}
          onRequestNewSignature={() => {
            setSavedSignatures(prev => [...prev]); // bubble signal
            setShowNewSigPad(true);
          }}
        />
      </>
    );
  }

  // ─── OVERVIEW (after signing or no pages loaded) ───────────────
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-300">

      {/* Success / Error banners */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-xl font-semibold text-sm">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="ml-auto text-emerald-400 hover:text-emerald-600"><X size={16} /></button>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl font-semibold text-sm">
          <X size={18} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 bg-[#0061ef] rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
          <PenTool size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          {files[0]?.name || 'Your Document'}
        </h2>
        <p className="text-slate-500 text-sm mt-2 font-medium">
          {images.length} page{images.length !== 1 ? 's' : ''} · {totalEdits} signature field{totalEdits !== 1 ? 's' : ''} placed
        </p>
      </div>

      {/* Saved signatures row */}
      {savedSignatures.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Saved Signatures</p>
          <div className="flex gap-3 flex-wrap">
            {savedSignatures.map((sig, i) => (
              <div key={i} className="h-14 px-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center">
                <img src={sig} className="h-10 object-contain mix-blend-multiply" alt={`Signature ${i + 1}`} />
              </div>
            ))}
            <button
              onClick={() => setShowNewSigPad(true)}
              className="h-14 px-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-[#0061ef] hover:text-[#0061ef] transition-colors text-sm font-bold flex items-center gap-2"
            >
              + New
            </button>
          </div>
        </div>
      )}

      {/* Pages grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img, i) => {
          const edits = pageElements[i] || [];
          return (
            <button
              key={i}
              onClick={() => setActivePage(i)}
              className={`relative group text-left rounded-xl overflow-hidden border-2 transition-all bg-white shadow-sm hover:shadow-lg ${
                edits.length > 0
                  ? 'border-[#0061ef] shadow-blue-100'
                  : 'border-slate-200 hover:border-[#0061ef]/50'
              }`}
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-slate-50">
                <img src={img} className="w-full h-full object-contain" alt={`Page ${i + 1}`} />
                <div className="absolute inset-0 bg-[#0061ef]/0 group-hover:bg-[#0061ef]/8 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#0061ef] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <PenTool size={12} /> Sign
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Page {i + 1}</span>
                {edits.length > 0 && (
                  <span className="text-[10px] font-black bg-[#0061ef] text-white px-2 py-0.5 rounded-full">
                    {edits.length}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        {!savedSignatures.length && (
          <button
            onClick={() => setShowNewSigPad(true)}
            className="flex items-center gap-2 px-6 py-3 border-2 border-[#0061ef] text-[#0061ef] rounded-xl font-bold text-sm hover:bg-blue-50 transition-all"
          >
            <PenTool size={16} /> Create Signature
          </button>
        )}
        <button
          onClick={handleFinish}
          disabled={totalEdits === 0 || isDownloading}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm shadow-lg transition-all ${
            totalEdits > 0 && !isDownloading
              ? 'bg-[#0061ef] hover:bg-[#0051cc] text-white shadow-blue-500/20'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isDownloading ? (
            <><Loader2 size={16} className="animate-spin" /> Processing...</>
          ) : (
            <><CheckCircle2 size={16} /> Download Signed PDF</>
          )}
        </button>
      </div>

      {showNewSigPad && (
        <SignaturePad
          onSave={sig => {
            setSavedSignatures(prev => [...prev, sig]);
            setShowNewSigPad(false);
          }}
          onCancel={() => setShowNewSigPad(false)}
        />
      )}
    </div>
  );
};
