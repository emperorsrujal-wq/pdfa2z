import * as React from 'react';
import { PenTool, CheckCircle2, Download, Image as ImageIcon, Layout, X, Zap } from 'lucide-react';
import { Button } from './Button';
import { PdfEditorCanvas } from './PdfEditorCanvas';
import { PdfThumbnailSidebar } from './PdfThumbnailSidebar';
import { SmartRedactButton } from './SmartRedactButton';
import { pdfToImages, editPdf, EditElement, downloadBlob, getTextItems, PdfTextItem, PageDimensions } from '../utils/pdfHelpers';

interface PdfEditorUIProps {
  file: File;
  onCancel: () => void;
}

export const PdfEditorUI: React.FC<PdfEditorUIProps> = ({ file, onCancel }) => {
  const [images, setImages] = React.useState<string[]>([]);
  const [dimensions, setDimensions] = React.useState<PageDimensions[]>([]);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMsg(`Failed to save edits: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (images.length === 0 && isProcessing) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white animate-bounce shadow-xl">
           <Layout size={32} />
        </div>
        <h3 className="mt-6 text-2xl font-black text-slate-800">Processing Your Document</h3>
        <p className="text-slate-500 font-medium">Preparing the workstation...</p>
      </div>
    );
  }

  const pageEditsCount = images.reduce((acc, _, i) => {
    acc[i] = elements.filter(el => el.pageIndex === i).length;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="fixed inset-0 bg-[#f3f3f3] z-[9999] flex flex-col overflow-hidden animate-fade-in font-sans">
      {/* Sejda Style Header */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-50 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
           <h1 className="text-3xl font-bold text-[#333] mb-1">Online PDF editor</h1>
           <p className="text-slate-500 text-lg">Edit PDF files for free. Fill & sign PDF</p>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
           {successMsg && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[300] bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2 animate-in slide-in-from-top-10">
                 <CheckCircle2 size={18} /> {successMsg}
                 <button onClick={() => setSuccessMsg('')} className="ml-4 opacity-50 hover:opacity-100"><X size={14}/></button>
              </div>
           )}

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
    </div>
  );
};
