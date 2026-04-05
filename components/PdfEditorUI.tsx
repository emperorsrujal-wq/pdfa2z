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
    setIsScanning(true);
    // Simulate AI Scan
    setTimeout(() => {
      const newEdits: EditElement[] = [];
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
      <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-md">
                <PenTool size={20} />
             </div>
             <div>
                <h1 className="font-black text-slate-800 tracking-tight leading-none text-lg uppercase">PDF Editor Pro</h1>
             </div>
          </div>
          
          <div className="h-6 w-px bg-slate-200" />
          
          <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
             <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-[11px] truncate max-w-[150px]">{file.name}</span>
             <span className="text-indigo-600 text-xs">{images.length} Pages</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Smart Redact hidden for now to match Sejda simplicity */}
           {/* <SmartRedactButton onScan={handleSmartRedact} isScanning={isScanning} /> */}
           
           <div className="flex items-center gap-2">
              <Button onClick={onCancel} className="bg-transparent hover:bg-slate-50 text-slate-500 border-none shadow-none text-xs font-bold">
                 <X size={16} className="mr-1" /> Close
              </Button>
              
              <Button 
                onClick={() => handleApplyAll()} 
                isLoading={isProcessing} 
                className="bg-emerald-600 border-none hover:bg-emerald-700 text-white px-6 py-2 rounded-lg shadow-lg shadow-emerald-200 flex items-center gap-2 text-xs font-bold"
              >
                 <Download size={16} />
                 Download
              </Button>
           </div>
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
           />
        </main>
      </div>
    </div>
  );
};
