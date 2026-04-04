import * as React from 'react';
import { Download, Stamp, PenTool, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { pdfToImages, EditElement, editPdf } from '../utils/pdfHelpers';
import { PdfSignCanvas } from './PdfSignCanvas';
import { SignaturePad } from './SignaturePad';

interface PdfSignUIProps {
  files: File[];
}

export const PdfSignUI: React.FC<PdfSignUIProps> = ({ files }) => {
  const [images, setImages] = React.useState<string[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const [activePageIndex, setActivePageIndex] = React.useState<number | null>(null);
  const [pageElements, setPageElements] = React.useState<Record<number, EditElement[]>>({});
  
  const [savedSignatures, setSavedSignatures] = React.useState<string[]>([]);
  const [isCreatingSignature, setIsCreatingSignature] = React.useState(false);

  React.useEffect(() => {
    const loadImages = async () => {
      if (files.length > 0) {
        setIsProcessing(true);
        try {
          const imgs = await pdfToImages(files[0]);
          setImages(imgs);
          setPageElements({});
        } catch (err) {
          console.error(err);
        } finally {
          setIsProcessing(false);
        }
      }
    };
    loadImages();
  }, [files]);

  const handleSavePageElements = (pageIdx: number, elements: EditElement[]) => {
    setPageElements(prev => ({
      ...prev,
      [pageIdx]: elements
    }));
    setActivePageIndex(null);
  };

  const handleDownload = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const allElements = Object.values(pageElements).flat();
      const signedPdfBytes = await editPdf(files[0], allElements);
      
      const blob = new Blob([signedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signed_${files[0].name}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error applying signatures.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalEdits = Object.values(pageElements).flat().length;

  if (isProcessing && images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-indigo-600 animate-pulse">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h3 className="text-xl font-bold">Loading document...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in w-full pb-20">
      
      {/* Header controls */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-3xl border border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div>
           <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Stamp className="text-indigo-600" /> Sign PDF</h3>
           <p className="text-slate-600 mt-2 font-medium">Click on any page below to add signatures, dates, and text.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button 
            onClick={() => setIsCreatingSignature(true)}
            className="flex-1 md:flex-none uppercase tracking-wider font-bold shadow-indigo-200"
          >
             <PenTool size={18} className="mr-2" /> New Signature
          </Button>
          
          <Button 
            onClick={handleDownload} 
            disabled={totalEdits === 0 || isProcessing}
            isLoading={isProcessing}
            className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-600/20 uppercase tracking-widest font-black disabled:opacity-50"
          >
             <Download size={20} className="mr-2" /> Apply & Download
          </Button>
        </div>
      </div>

      {savedSignatures.length > 0 && (
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border overflow-x-auto shadow-sm">
              <span className="text-xs uppercase font-black text-slate-400 tracking-wider whitespace-nowrap">My Signatures:</span>
              {savedSignatures.map((sig, idx) => (
                  <div key={idx} className="h-10 px-2 border rounded-lg bg-slate-50 flex-shrink-0 flex items-center justify-center">
                      <img src={sig} className="h-full object-contain mix-blend-multiply" alt="Sig" />
                  </div>
              ))}
          </div>
      )}

      {/* Pages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
        {images.map((img, i) => {
          const edits = pageElements[i] || [];
          return (
            <div 
               key={i} 
               className="relative group cursor-pointer"
               onClick={() => setActivePageIndex(i)}
            >
              <div className={`aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all shadow-md bg-white ${edits.length > 0 ? 'border-indigo-500 shadow-indigo-500/20' : 'border-slate-200 hover:border-indigo-400 hover:shadow-xl'}`}>
                <img src={img} className="w-full h-full object-contain p-2" />
                
                {/* Thumbnails of edits applied */}
                {edits.map(el => (
                    <div 
                        key={el.id} 
                        className="absolute bg-indigo-500/20 border border-indigo-500/50 rounded-sm pointer-events-none"
                        style={{
                            left: `${el.x / 10}%`,
                            top: `${el.y / 10}%`,
                            width: el.type === 'image' ? (el.width ? `${el.width/10}%` : '50%') : '30%',
                            height: '10%'
                        }}
                    />
                ))}

                <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-all flex items-center justify-center backdrop-blur-[1px] opacity-0 group-hover:opacity-100">
                  <div className="bg-white px-6 py-3 rounded-full shadow-2xl font-bold text-indigo-700 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <Stamp size={18} /> Sign Page
                  </div>
                </div>

                {edits.length > 0 && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                        <CheckCircle2 size={16} />
                    </div>
                )}
              </div>
              <div className="text-center mt-3 font-bold text-slate-500 text-sm flex items-center justify-center gap-2">
                 Page {i + 1}
                 {edits.length > 0 && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-xs">{edits.length} stamps</span>}
              </div>
            </div>
          );
        })}
      </div>

      {activePageIndex !== null && (
        <PdfSignCanvas
          image={images[activePageIndex]}
          pageIndex={activePageIndex}
          initialElements={pageElements[activePageIndex] || []}
          savedSignatures={savedSignatures}
          onSave={(elements) => handleSavePageElements(activePageIndex, elements)}
          onCancel={() => setActivePageIndex(null)}
          onRequestNewSignature={() => {
              setActivePageIndex(null);
              setIsCreatingSignature(true);
          }}
        />
      )}

      {isCreatingSignature && (
          <SignaturePad
              onSave={(base64) => {
                  setSavedSignatures([...savedSignatures, base64]);
                  setIsCreatingSignature(false);
              }}
              onCancel={() => setIsCreatingSignature(false)}
          />
      )}
    </div>
  );
};
