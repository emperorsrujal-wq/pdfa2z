import * as React from 'react';
import { X, FileText, FileSpreadsheet, Presentation, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { convertPdfToDocx, convertPdfToExcel, convertPdfToPptx, downloadBlob } from '../utils/pdfHelpers';

interface ConversionPanelProps {
  text: string;
  onClose: () => void;
  fileName: string;
}

type Format = 'docx' | 'xlsx' | 'pptx';

export const ConversionPanel: React.FC<ConversionPanelProps> = ({ text, onClose, fileName }) => {
  const [selectedFormat, setSelectedFormat] = React.useState<Format>('docx');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  const formats: { id: Format, label: string, icon: any, color: string, ext: string }[] = [
    { id: 'docx', label: 'Microsoft Word', icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', ext: '.docx' },
    { id: 'xlsx', label: 'Microsoft Excel', icon: FileSpreadsheet, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', ext: '.xlsx' },
    { id: 'pptx', label: 'Microsoft PowerPoint', icon: Presentation, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', ext: '.pptx' },
  ];

  const handleConvert = async () => {
    setIsProcessing(true);
    setError('');
    setSuccess(false);

    try {
      let blob: Blob;
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      
      switch (selectedFormat) {
        case 'docx':
          blob = await convertPdfToDocx(text);
          downloadBlob(blob, `${baseName}.docx`);
          break;
        case 'xlsx':
          blob = await convertPdfToExcel(text);
          downloadBlob(blob, `${baseName}.xlsx`);
          break;
        case 'pptx':
          blob = await convertPdfToPptx(text);
          downloadBlob(blob, `${baseName}.pptx`);
          break;
        default:
          throw new Error('Unsupported format');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Conversion failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Download size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Export & Convert</h2>
              <p className="text-xs text-slate-500 font-medium">Transform your PDF into editable office formats</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Format Selection */}
          <div className="grid grid-cols-1 gap-3">
            {formats.map((f) => {
              const Icon = f.icon;
              const isActive = selectedFormat === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                    isActive 
                      ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${f.color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-black ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                      {f.label}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">Convert to standard {f.ext} file</p>
                  </div>
                  {isActive && (
                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                      <CheckCircle2 size={14} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Status Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm font-bold">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-sm font-bold animate-in bounce-in">
              <CheckCircle2 size={18} />
              Conversion successful! Your file has been downloaded.
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 text-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Download size={24} />
                <span>Start Conversion</span>
              </>
            )}
          </button>
        </div>

        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-950 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Powered by PDFA2Z Universal Conversion Engine
          </p>
        </div>
      </div>
    </div>
  );
};
