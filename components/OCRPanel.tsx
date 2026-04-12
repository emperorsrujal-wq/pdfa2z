import * as React from 'react';
import { X, Loader2, Copy, CheckCircle2, FileSearch } from 'lucide-react';
import { performOCR } from '../utils/pdfHelpers';

interface OCRPanelProps {
  imageSrc: string;
  onClose: () => void;
  onApply?: (text: string) => void;
}

export const OCRPanel: React.FC<OCRPanelProps> = ({ imageSrc, onClose, onApply }) => {
  const [isProcessing, setIsProcessing] = React.useState(true);
  const [extractedText, setExtractedText] = React.useState('');
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const runOCR = async () => {
      try {
        const text = await performOCR(imageSrc);
        setExtractedText(text);
      } catch (err: any) {
        setError(err.message || 'OCR failed to process the image.');
      } finally {
        setIsProcessing(false);
      }
    };
    runOCR();
  }, [imageSrc]);

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[600] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileSearch size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Smart OCR Scanner</h2>
              <p className="text-xs text-slate-500 font-medium">Extracting editable text from page...</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-100 dark:border-slate-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
              </div>
              <h3 className="mt-8 text-lg font-black text-slate-800 dark:text-white">Analyzing Content</h3>
              <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">
                Our AI is scanning the document for characters and text structures. This may take a few seconds...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-center">
              <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative group">
                <textarea
                  readOnly
                  value={extractedText}
                  className="w-full h-96 p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-200 text-sm font-mono leading-relaxed focus:outline-none scrollbar-thin overflow-y-auto"
                  placeholder="Extracted text will appear here..."
                />
                <button
                  onClick={handleCopy}
                  className="absolute top-4 right-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-indigo-500 dark:hover:border-indigo-400 transition-all flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {copySuccess ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {copySuccess ? 'Copied' : 'Copy Text'}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
                  <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                    <strong>Tip:</strong> OCR is highly accurate but may occasionally miss special characters or complex layouts. Always review the extracted text.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-black text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-xl transition-all"
          >
            Cancel
          </button>
          {!isProcessing && !error && (
            <button
              onClick={() => onApply?.(extractedText)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Apply as Text Overlay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
