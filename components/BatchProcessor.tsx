import * as React from 'react';
import { Upload, X, File, Layers, Zap, ArrowRight, CheckCircle2, Package, Trash2, Download } from 'lucide-react';
import { Button } from './Button';
import { mergePdfs, compressPdf, downloadBlob, CompressionOptions } from '../utils/pdfHelpers';

interface BatchProcessorProps {
  onCancel: () => void;
}

export const BatchProcessor: React.FC<BatchProcessorProps> = ({ onCancel }) => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [mode, setMode] = React.useState<'MERGE' | 'COMPRESS'>('MERGE');
  const [progress, setProgress] = React.useState(0);
  const [status, setStatus] = React.useState<string | null>(null);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    setStatus('Starting batch process...');

    try {
      if (mode === 'MERGE') {
        const merged = await mergePdfs(files);
        downloadBlob(merged, 'batch-merged.pdf');
        setStatus('Successfully merged all files!');
        setProgress(100);
      } else if (mode === 'COMPRESS') {
        for (let i = 0; i < files.length; i++) {
          setStatus(`Compressing ${files[i].name}...`);
          const compressed = await compressPdf(files[i], { mode: 'preset', presetLevel: 'balanced' });
          downloadBlob(compressed, `compressed-${files[i].name}`);
          setProgress(((i + 1) / files.length) * 100);
        }
        setStatus('Successfully compressed all files!');
      }
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Package className="text-indigo-600" />
            Batch Workspace
          </h2>
          <p className="text-slate-500 font-medium">Process multiple documents simultaneously</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setMode('MERGE')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'MERGE' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Bulk Merge
          </button>
          <button 
            onClick={() => setMode('COMPRESS')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'COMPRESS' ? 'bg-white shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Bulk Compress
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        <div className="w-1/2 flex flex-col gap-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all bg-white"
          >
            <Upload className="text-indigo-600 mb-2" />
            <span className="font-bold text-slate-900">Drop files or click to upload</span>
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} accept="application/pdf" />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 rounded-3xl p-4 border border-slate-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Queue ({files.length} files)</h3>
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><File size={16} /></div>
                    <span className="text-sm font-bold text-slate-700 truncate">{f.name}</span>
                  </div>
                  <button onClick={() => removeFile(i)} className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {files.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                  <Package size={40} className="mb-4 opacity-20" />
                  <p className="font-bold">Queue is empty</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col">
            <h3 className="text-lg font-black text-slate-900 mb-6">Processing Settings</h3>
            
            <div className="space-y-6 flex-1">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm"><Zap size={20} /></div>
                <div>
                  <p className="font-bold text-indigo-900">{mode === 'MERGE' ? 'High Fidelity Merge' : 'Balanced Compression'}</p>
                  <p className="text-xs text-indigo-700/70 leading-relaxed">
                    {mode === 'MERGE' 
                      ? 'Combining all files into a single document while preserving interactive elements and quality.'
                      : 'Reducing file size by optimizing images and removing redundant data across all documents.'}
                  </p>
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-4 animate-fade-in">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <p className="text-sm font-bold text-indigo-600 animate-pulse">{status}</p>
                </div>
              )}

              {status && !isProcessing && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700 font-bold animate-slide-up">
                  <CheckCircle2 size={20} />
                  {status}
                </div>
              )}
            </div>

            <Button 
              className="w-full py-6 mt-auto text-lg uppercase tracking-widest font-black shadow-xl shadow-indigo-100"
              onClick={handleProcess}
              isLoading={isProcessing}
              disabled={files.length === 0}
            >
              Start Batch {mode === 'MERGE' ? 'Merge' : 'Compression'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
