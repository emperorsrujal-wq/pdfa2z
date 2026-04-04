import * as React from 'react';
import { PenTool, CheckCircle2, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { PdfEditorCanvas } from './PdfEditorCanvas';
import { pdfToImages, editPdf, EditElement, downloadBlob } from '../utils/pdfHelpers';

interface PdfEditorUIProps {
  file: File;
  onCancel: () => void;
}

export const PdfEditorUI: React.FC<PdfEditorUIProps> = ({ file, onCancel }) => {
  const [images, setImages] = React.useState<string[]>([]);
  const [elements, setElements] = React.useState<EditElement[]>([]);
  const [activePage, setActivePage] = React.useState<number | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    const processPdf = async () => {
      setIsProcessing(true);
      try {
        const imgs = await pdfToImages(file);
        if (mounted) setImages(imgs);
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

  if (images.length === 0 && isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-600 animate-pulse">
        <ImageIcon size={48} className="mb-4 opacity-50" />
        <h3 className="text-xl font-bold">Rendering Document...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <PenTool size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Visual PDF Editor</h3>
            <p className="text-sm text-slate-500">Select a page below to add text or drawings.</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-1">
            {elements.length} Edits Total
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-medium">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl border border-green-200 font-medium">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((img, i) => {
          const pageEdits = elements.filter(el => el.pageIndex === i).length;
          return (
            <div key={i} className="relative group cursor-pointer" onClick={() => setActivePage(i)}>
              <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-slate-200 hover:border-indigo-500 transition-all shadow-lg bg-white relative">
                <img src={img} className="w-full h-full object-contain" alt={`Page ${i+1}`}/>
                
                {pageEdits > 0 && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                    {pageEdits} EDITS
                  </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                  <div className="bg-white p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all text-indigo-600">
                    <PenTool />
                  </div>
                </div>
              </div>
              <div className="text-center mt-2 font-bold text-slate-500 text-sm">Page {i + 1}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 sticky bottom-4 z-10 bg-slate-50/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl mt-8">
        <Button onClick={onCancel} className="px-6 py-4 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50">
          Cancel Tool
        </Button>
        <Button onClick={handleApplyAll} isLoading={isProcessing} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg text-lg">
          <Download size={20} className="mr-2" /> Download Edited PDF
        </Button>
      </div>

      {activePage !== null && (
        <PdfEditorCanvas
          image={images[activePage]}
          pageIndex={activePage}
          initialElements={elements.filter(el => el.pageIndex === activePage)}
          onSave={(newElements) => {
            // Replace elements for this page
            setElements(prev => [
              ...prev.filter(el => el.pageIndex !== activePage),
              ...newElements
            ]);
            setActivePage(null);
          }}
          onCancel={() => setActivePage(null)}
        />
      )}
    </div>
  );
};
