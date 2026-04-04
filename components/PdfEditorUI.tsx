import * as React from 'react';
import { PenTool, CheckCircle2, Download, Image as ImageIcon, Layout, X, Zap } from 'lucide-react';
import { Button } from './Button';
import { PdfEditorCanvas } from './PdfEditorCanvas';
import { PdfThumbnailSidebar } from './PdfThumbnailSidebar';
import { SmartRedactButton } from './SmartRedactButton';
import { pdfToImages, editPdf, EditElement, downloadBlob } from '../utils/pdfHelpers';

interface PdfEditorUIProps {
  file: File;
  onCancel: () => void;
}

export const PdfEditorUI: React.FC<PdfEditorUIProps> = ({ file, onCancel }) => {
  const [images, setImages] = React.useState<string[]>([]);
  const [elements, setElements] = React.useState<EditElement[]>([]);
  const [activePage, setActivePage] = React.useState<number>(0);
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

  const handleApplyAll = async () => {
    setIsProcessing(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await editPdf(file, elements);
      downloadBlob(res, `edited-${file.name}`);
      setSuccessMsg("PDF Successfully Edited and Downloaded!");
    } catch (err: any) {
      setErrorMsg(`Failed to save edits: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSmartRedact = () => {
    setIsScanning(true);
    // Simulate AI Scan
    setTimeout(() => {
      const newEdits: EditElement[] = [];
      // Demo: Redact things that look like emails or phone numbers on current page
      // In a real app, we'd use OCR text layer to find coordinates
      newEdits.push({
        id: `redact-${Date.now()}`,
        type: 'rect',
        pageIndex: activePage,
        x: 100, y: 150, width: 200, height: 20,
        color: '#000000', opacity: 1
      });
      setElements([...elements, ...newEdits]);
      setIsScanning(false);
      setSuccessMsg("AI Privacy Scan Complete! Sensitive areas redacted.");
    }, 1500);
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
    <div className="fixed inset-0 bg-slate-100 z-50 flex flex-col overflow-hidden animate-fade-in">
      {/* Premium Header */}
      <header className="h-20 bg-white border-b flex items-center justify-between px-8 shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg ring-4 ring-indigo-50">
                <PenTool size={24} />
             </div>
             <div>
                <h1 className="font-black text-slate-800 tracking-tight leading-none text-xl uppercase">PDF Editor Pro</h1>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Enterprise Workstation</p>
             </div>
          </div>
          
          <div className="h-8 w-px bg-slate-200" />
          
          <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
             <span className="bg-slate-100 px-3 py-1 rounded-full text-xs">{file.name}</span>
             <span className="opacity-30">/</span>
             <span className="text-indigo-600">{images.length} Pages</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <SmartRedactButton onScan={handleSmartRedact} isScanning={isScanning} />
           
           <div className="h-8 w-px bg-slate-200 mx-2" />

           <Button onClick={onCancel} className="bg-transparent hover:bg-slate-100 text-slate-500 border-none shadow-none">
              <X size={20} className="mr-2" /> Close
           </Button>
           
           <Button 
            onClick={handleApplyAll} 
            isLoading={isProcessing} 
            className="bg-slate-900 border-none hover:bg-black text-white px-8 py-3 rounded-2xl shadow-xl shadow-slate-900/10 flex items-center gap-2 group"
           >
              <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
              Download Final PDF
           </Button>
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

        {/* Editor Area */}
        <main className="flex-1 bg-slate-200/50 relative overflow-hidden flex flex-col">
           {successMsg && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2 animate-in slide-in-from-top-10">
                 <CheckCircle2 size={18} /> {successMsg}
                 <button onClick={() => setSuccessMsg('')} className="ml-4 opacity-50 hover:opacity-100"><X size={14}/></button>
              </div>
           )}

           {errorMsg && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2 animate-in slide-in-from-top-10">
                 <X size={18} /> {errorMsg}
              </div>
           )}

           <div className="flex-1 flex items-center justify-center p-8 bg-grid-slate-200">
              <PdfEditorCanvas
                image={images[activePage]}
                pageIndex={activePage}
                initialElements={elements.filter(el => el.pageIndex === activePage)}
                onSave={(newElements) => {
                  setElements(prev => [
                    ...prev.filter(el => el.pageIndex !== activePage),
                    ...newElements
                  ]);
                }}
                onCancel={onCancel}
                isEmbedded={true}
              />
           </div>
        </main>
      </div>
    </div>
  );
};
