import * as React from 'react';
import { PenTool, CheckCircle2, Download, Image as ImageIcon, Layout, X, Zap } from 'lucide-react';
import { Button } from './Button';
import { PdfEditorCanvas } from './PdfEditorCanvas';
import { PdfThumbnailSidebar } from './PdfThumbnailSidebar';
import { SmartRedactButton } from './SmartRedactButton';
import { pdfToImages, editPdf, EditElement, downloadBlob, getTextItems, PdfTextItem } from '../utils/pdfHelpers';

interface PdfEditorUIProps {
  file: File;
  onCancel: () => void;
}

export const PdfEditorUI: React.FC<PdfEditorUIProps> = ({ file, onCancel }) => {
  const [images, setImages] = React.useState<string[]>([]);
  const [elements, setElements] = React.useState<EditElement[]>([]);
  const [activePage, setActivePage] = React.useState<number>(0);
  const [textItems, setTextItems] = React.useState<PdfTextItem[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    const processPdf = async () => {
      setIsProcessing(true);
      try {
        const imgs = await pdfToImages(file);
        if (mounted) {
          setImages(imgs);
          setActivePage(0);
        }
      } catch (err: any) {
        if (mounted) setErrorMsg(`Failed to render PDF: ${err.message}`);
      } finally {
        if (mounted) setIsProcessing(false);
      }
    };
    processPdf();
    return () => { mounted = false; };
  }, [file]);

  // Fetch text items for the active page to enable 'Direct Edit'
  React.useEffect(() => {
    const fetchText = async () => {
      try {
        const items = await getTextItems(file, activePage);
        setTextItems(items);
      } catch (e) {
        console.warn("Could not fetch text items", e);
      }
    };
    fetchText();
  }, [file, activePage]);

  const handleApplyAll = async (latestElements?: EditElement[]) => {
    setIsProcessing(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const elementsToUse = latestElements || elements;
      const res = await editPdf(file, elementsToUse);
      downloadBlob(res, `edited-${file.name}`);
      setSuccessMsg("PDF Successfully Edited and Downloaded!");
    } catch (err: any) {
      setErrorMsg(`Failed to save edits: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSmartRedact = () => {
    // Smart Redact Guide - shows user tips for manually redacting sensitive content
    setIsScanning(true);
    setTimeout(() => {
      setSuccessMsg("💡 Redaction Tips:\n1. Use Whiteout tool for quick coverage\n2. Select areas containing SSN, credit cards, addresses\n3. Remember: Redaction should be permanent (black boxes work best)\n4. Use Rectangle tool for precise redaction");
      setIsScanning(false);
    }, 800);
  };

  if (images.length === 0 && isProcessing) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white animate-bounce shadow-xl">
           <Layout size={32} />
        </div>
        <h3 className="mt-6 text-2xl font-black text-slate-800">Processing Your Document</h3>
        <p className="text-slate-500 font-medium">Preparing the high-fidelity workstation...</p>
      </div>
    );
  }

  const pageEditsCount = images.reduce((acc, _, i) => {
    acc[i] = elements.filter(el => el.pageIndex === i).length;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="fixed inset-0 bg-[#060910] z-[60] flex flex-col overflow-hidden animate-fade-in font-sans">
      {/* Premium Slim Header */}
      <header className="h-14 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 shadow-2xl shrink-0 z-50">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
             <div className="p-1.5 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                <PenTool size={16} />
             </div>
             <h1 className="font-black text-white tracking-tighter text-base">PDF EDITOR <span className="text-indigo-400">PRO</span></h1>
          </div>
          
          <div className="h-4 w-px bg-white/10" />
          
          <div className="flex items-center gap-2.5">
             <span className="bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 text-[10px] font-bold text-slate-400 truncate max-w-[120px]">{file.name}</span>
             <span className="text-indigo-500/80 text-[10px] font-black uppercase tracking-widest">{images.length} Pages</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button 
              onClick={onCancel} 
              className="px-3 py-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all text-[11px] font-bold flex items-center gap-2"
            >
               <X size={14} /> Close
            </button>
            
            <button
              onClick={() => handleApplyAll()}
              disabled={isProcessing}
              className="group bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg shadow-lg shadow-indigo-600/20 flex items-center gap-2 text-[11px] font-black transition-all active:scale-95"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>SAVE & DOWNLOAD</span>
                </>
              )}
            </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <PdfThumbnailSidebar 
          images={images} 
          activeIndex={activePage} 
          onSelect={setActivePage}
          pageEdits={pageEditsCount}
        />

        {/* Editor Area — flex-1 + overflow-hidden so Canvas manages its own scroll */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
           {successMsg && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[300] bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2 animate-in slide-in-from-top-10">
                 <CheckCircle2 size={18} /> {successMsg}
                 <button onClick={() => setSuccessMsg('')} className="ml-4 opacity-50 hover:opacity-100"><X size={14}/></button>
              </div>
           )}

           <PdfEditorCanvas
             image={images[activePage]}
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
    </div>
  );
};
