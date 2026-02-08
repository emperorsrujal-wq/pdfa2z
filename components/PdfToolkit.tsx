import React, { useState, useRef, useEffect } from 'react';
import { Layers, Scissors, Image as ImageIcon, Upload, Download, File as FileIcon, Trash2, ArrowRight, CheckCircle2, ArrowLeft, Zap, FileImage, RotateCw, FileX, FileText, Hash, Lock, Unlock, FileJson, FileType, Code, Stamp, EyeOff, LayoutTemplate, Wrench, Tag, FileSpreadsheet, FileCode, Sliders, Target } from 'lucide-react';
import { Button } from './Button.tsx';
import { mergePdfs, splitPdf, pdfToImages, downloadBlob, compressPdf, imagesToPdf, rotatePdf, removePages, extractTextFromPdf, addPageNumbers, protectPdf, pdfToWord, pdfToExcel, pdfToHtml, unlockPdf, watermarkPdf, grayscalePdf, flattenPdf, repairPdf, updateMetadata, CompressionOptions } from '../utils/pdfHelpers.ts';
import { ToolCard } from './ToolCard.tsx';
import { PdfToolMode } from '../types.ts';

interface PdfToolkitProps {
  initialMode?: PdfToolMode;
}

export const PdfToolkit: React.FC<PdfToolkitProps> = ({ initialMode = 'MENU' }) => {
  const [mode, setMode] = useState<PdfToolMode>(initialMode);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [resultText, setResultText] = useState<string>('');
  
  const [inputValue, setInputValue] = useState('');
  // Compression Settings
  const [compressionMode, setCompressionMode] = useState<'preset' | 'target'>('preset');
  const [compressionLevel, setCompressionLevel] = useState<'high' | 'balanced' | 'max'>('balanced');
  const [targetSizeMB, setTargetSizeMB] = useState<string>('1.0');

  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (mode === 'MERGE' || mode === 'IMG_TO_PDF' || mode === 'COMPRESS') {
        setFiles(prev => [...prev, ...newFiles]);
      } else {
        setFiles([newFiles[0]]);
      }
      setError(null);
      setSuccessMsg(null);
      setResultImages([]);
      setResultText('');
    }
    // Clear input to allow re-selecting same file if needed
    if (e.target) e.target.value = '';
  };

  const reset = () => {
    setFiles([]);
    setResultImages([]);
    setResultText('');
    setInputValue('');
    setError(null);
    setSuccessMsg(null);
    setTargetSizeMB('1.0');
    setCompressionMode('preset');
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'MERGE') {
        const res = await mergePdfs(files);
        downloadBlob(res, 'merged.pdf');
        setSuccessMsg("Merged successfully!");
      } 
      else if (mode === 'SPLIT') {
        const res = await splitPdf(files[0], inputValue);
        downloadBlob(res, `split-${files[0].name}`);
        setSuccessMsg("Split successfully!");
      }
      else if (mode === 'WATERMARK') {
        const res = await watermarkPdf(files[0], inputValue || 'PDFA2Z');
        downloadBlob(res, `watermarked-${files[0].name}`);
        setSuccessMsg("Watermark added!");
      }
      else if (mode === 'GRAYSCALE') {
        const res = await grayscalePdf(files[0]);
        downloadBlob(res, `grayscale-${files[0].name}`);
        setSuccessMsg("Converted to Grayscale!");
      }
      else if (mode === 'FLATTEN') {
        const res = await flattenPdf(files[0]);
        downloadBlob(res, `flattened-${files[0].name}`);
        setSuccessMsg("Flattened successfully!");
      }
      else if (mode === 'COMPRESS') {
        const targetBytes = parseFloat(targetSizeMB) * 1024 * 1024;
        
        const options: CompressionOptions = {
            mode: compressionMode,
            presetLevel: compressionLevel,
            targetSizeBytes: isNaN(targetBytes) ? undefined : targetBytes
        };
        
        // Process all files individually
        for (const file of files) {
          const res = await compressPdf(file, options);
          downloadBlob(res, `optimized-${file.name}`);
        }
        setSuccessMsg("Compressed successfully!");
      }
      else if (mode === 'TO_IMAGE') {
        const images = await pdfToImages(files[0]);
        setResultImages(images);
      }
      else if (mode === 'IMG_TO_PDF') {
        const res = await imagesToPdf(files);
        downloadBlob(res, 'converted.pdf');
      }
      else if (mode === 'ROTATE') {
        const res = await rotatePdf(files[0], rotationAngle);
        downloadBlob(res, `rotated-${files[0].name}`);
      }
      else if (mode === 'EXTRACT_TEXT') {
        const text = await extractTextFromPdf(files[0]);
        setResultText(text);
      }
      else if (mode === 'PAGE_NUMBERS') {
        const res = await addPageNumbers(files[0]);
        downloadBlob(res, `numbered-${files[0].name}`);
      }
      else if (mode === 'PROTECT') {
        const res = await protectPdf(files[0], inputValue);
        downloadBlob(res, `protected-${files[0].name}`);
      }
      else if (mode === 'UNLOCK') {
        const res = await unlockPdf(files[0], inputValue);
        downloadBlob(res, `unlocked-${files[0].name}`);
      }
      else if (mode === 'TO_WORD') {
        const blob = await pdfToWord(files[0]);
        downloadBlob(blob, `converted.doc`);
      }
      else if (mode === 'TO_EXCEL') {
        const blob = await pdfToExcel(files[0]);
        downloadBlob(blob, `converted.csv`);
      }
      else if (mode === 'TO_HTML') {
        const blob = await pdfToHtml(files[0]);
        downloadBlob(blob, `converted.html`);
      }
      else if (mode === 'REPAIR') {
        const res = await repairPdf(files[0]);
        downloadBlob(res, `repaired-${files[0].name}`);
        setSuccessMsg("Repaired successfully!");
      }
      else if (mode === 'METADATA') {
        const res = await updateMetadata(files[0], inputValue);
        downloadBlob(res, `metadata-${files[0].name}`);
        setSuccessMsg("Metadata updated!");
      }
      else if (mode === 'DELETE_PAGES') {
          // Expect "1, 2, 5" format in input
          const pages = inputValue.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
          if(pages.length === 0) throw new Error("Enter valid page numbers");
          const res = await removePages(files[0], pages);
          downloadBlob(res, `pages-deleted-${files[0].name}`);
          setSuccessMsg("Pages removed!");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (mode === 'MENU') {
    return (
      <div className="h-full flex flex-col animate-fade-in p-6 overflow-y-auto custom-scrollbar">
        <div className="mb-8">
           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">PDF Utilities</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ToolCard title="Merge PDF" description="Combine multiple PDF files into one single document securely." icon={<Layers />} onClick={() => setMode('MERGE')} colorClass="bg-indigo-600 text-indigo-600" />
          <ToolCard title="Split PDF" description="Extract specific pages or split a file into multiple PDFs." icon={<Scissors />} onClick={() => setMode('SPLIT')} colorClass="bg-orange-600 text-orange-600" />
          <ToolCard title="Watermark" description="Add custom text or image stamps to protect your documents." icon={<Stamp />} onClick={() => setMode('WATERMARK')} colorClass="bg-blue-600 text-blue-600" />
          <ToolCard title="Grayscale" description="Convert colorful PDFs to professional black and white." icon={<EyeOff />} onClick={() => setMode('GRAYSCALE')} colorClass="bg-slate-600 text-slate-600" />
          <ToolCard title="Flatten PDF" description="Merge layers and lock fillable forms to prevent editing." icon={<LayoutTemplate />} onClick={() => setMode('FLATTEN')} colorClass="bg-teal-600 text-teal-600" />
          <ToolCard title="Optimize" description="Compress PDF file size while maintaining visual quality." icon={<Zap />} onClick={() => setMode('COMPRESS')} colorClass="bg-emerald-600 text-emerald-600" />
          <ToolCard title="Repair PDF" description="Recover and fix corrupted or damaged PDF documents." icon={<Wrench />} onClick={() => setMode('REPAIR')} colorClass="bg-red-600 text-red-600" />
          <ToolCard title="Page Numbers" description="Insert page numbers into your document headers or footers." icon={<Hash />} onClick={() => setMode('PAGE_NUMBERS')} colorClass="bg-cyan-600 text-cyan-600" />
          <ToolCard title="Metadata" description="Edit PDF properties like title, author, and keywords." icon={<Tag />} onClick={() => setMode('METADATA')} colorClass="bg-purple-600 text-purple-600" />
          <ToolCard title="PDF to Image" description="Convert PDF pages into high-resolution JPG or PNG images." icon={<ImageIcon />} onClick={() => setMode('TO_IMAGE')} colorClass="bg-pink-600 text-pink-600" />
          <ToolCard title="Image to PDF" description="Combine photos and images into a single PDF document." icon={<FileImage />} onClick={() => setMode('IMG_TO_PDF')} colorClass="bg-violet-600 text-violet-600" />
          <ToolCard title="Rotate PDF" description="Permanently rotate PDF pages to the correct orientation." icon={<RotateCw />} onClick={() => setMode('ROTATE')} colorClass="bg-amber-600 text-amber-600" />
          <ToolCard title="Delete Pages" description="Remove unwanted pages from your PDF documents instantly." icon={<FileX />} onClick={() => setMode('DELETE_PAGES')} colorClass="bg-red-500 text-red-500" />
          <ToolCard title="Extract Text" description="Scrape and copy text content from any PDF file." icon={<FileText />} onClick={() => setMode('EXTRACT_TEXT')} colorClass="bg-lime-600 text-lime-600" />
          <ToolCard title="Unlock PDF" description="Remove passwords and security restrictions from PDFs." icon={<Unlock />} onClick={() => setMode('UNLOCK')} colorClass="bg-sky-500 text-sky-500" />
          <ToolCard title="Protect PDF" description="Encrypt your PDF with a password to prevent unauthorized access." icon={<Lock />} onClick={() => setMode('PROTECT')} colorClass="bg-indigo-800 text-indigo-800" />
          <ToolCard title="Word Export" description="Convert PDF documents to editable Microsoft Word files." icon={<FileType />} onClick={() => setMode('TO_WORD')} colorClass="bg-blue-700 text-blue-700" />
          <ToolCard title="Excel Export" description="Extract data tables from PDF to Excel spreadsheets." icon={<FileSpreadsheet />} onClick={() => setMode('TO_EXCEL')} colorClass="bg-green-700 text-green-700" />
          <ToolCard title="HTML Export" description="Convert PDF documents to web-ready HTML code." icon={<FileCode />} onClick={() => setMode('TO_HTML')} colorClass="bg-orange-700 text-orange-700" />
        </div>
      </div>
    );
  }

  const getHeader = () => {
    switch(mode) {
        case 'MERGE': return { icon: <Layers />, title: 'Merge PDF' };
        case 'SPLIT': return { icon: <Scissors />, title: 'Split PDF' };
        case 'WATERMARK': return { icon: <Stamp />, title: 'Add Watermark' };
        case 'GRAYSCALE': return { icon: <EyeOff />, title: 'Grayscale PDF' };
        case 'FLATTEN': return { icon: <LayoutTemplate />, title: 'Flatten PDF' };
        case 'REPAIR': return { icon: <Wrench />, title: 'Repair PDF' };
        case 'METADATA': return { icon: <Tag />, title: 'Edit Metadata' };
        case 'PAGE_NUMBERS': return { icon: <Hash />, title: 'Page Numbers' };
        case 'TO_EXCEL': return { icon: <FileSpreadsheet />, title: 'PDF to Excel' };
        case 'TO_HTML': return { icon: <FileCode />, title: 'PDF to HTML' };
        case 'ROTATE': return { icon: <RotateCw />, title: 'Rotate PDF' };
        case 'DELETE_PAGES': return { icon: <FileX />, title: 'Delete Pages' };
        case 'EXTRACT_TEXT': return { icon: <FileText />, title: 'Extract Text' };
        case 'IMG_TO_PDF': return { icon: <FileImage />, title: 'Image to PDF' };
        case 'COMPRESS': return { icon: <Zap />, title: 'Optimize PDF' };
        default: return { icon: <FileIcon />, title: 'PDF Tool' };
    }
  };
  const header = getHeader();

  return (
    <div className="h-full flex flex-col p-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setMode('MENU')} className="p-2 bg-slate-50 rounded-xl"><ArrowLeft size={20}/></button>
        <h3 className="text-2xl font-black flex items-center gap-3">{header.icon}{header.title}</h3>
      </div>
      <div className="flex-1 bg-slate-50 rounded-3xl p-8 flex flex-col overflow-y-auto custom-scrollbar">
        {files.length === 0 ? (
          <div onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-600 transition-all min-h-[300px]">
            <Upload size={40} className="mb-4 text-indigo-600" />
            <p className="font-black uppercase tracking-tighter">Upload your PDF</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto w-full pb-8">
            
            {/* COMPRESS MODE UI */}
            {mode === 'COMPRESS' ? (
                <div className="space-y-8 animate-fade-in">
                    <div className="space-y-2">
                        {files.map((f, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FileIcon size={20} /></div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm truncate text-slate-700">{f.name}</p>
                                        <p className="text-xs text-slate-400">{formatFileSize(f.size)}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeFile(i)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={18} /></button>
                            </div>
                        ))}
                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold text-sm hover:border-indigo-400 hover:text-indigo-600 transition-all">+ Add another PDF</button>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 block">Compression Options</label>
                        
                        {/* Mode Toggle */}
                        <div className="flex bg-white rounded-xl border border-slate-200 p-1 mb-4">
                            <button 
                                onClick={() => setCompressionMode('preset')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${compressionMode === 'preset' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center justify-center gap-2"><Sliders size={16}/> Preset Levels</div>
                            </button>
                            <button 
                                onClick={() => setCompressionMode('target')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${compressionMode === 'target' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center justify-center gap-2"><Target size={16}/> Target Size</div>
                            </button>
                        </div>

                        {/* Preset Options */}
                        {compressionMode === 'preset' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'high', label: 'High Quality', desc: 'Larger file size' },
                                    { id: 'balanced', label: 'Balanced', desc: 'Recommended' },
                                    { id: 'max', label: 'Max Compression', desc: 'Smallest file size' }
                                ].map(opt => (
                                    <div 
                                        key={opt.id}
                                        onClick={() => setCompressionLevel(opt.id as any)}
                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all select-none ${
                                            compressionLevel === opt.id 
                                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                            : 'border-slate-200 bg-white hover:border-indigo-300'
                                        }`}
                                    >
                                        <p className={`font-bold text-sm ${compressionLevel === opt.id ? 'text-white' : 'text-slate-700'}`}>{opt.label}</p>
                                        <p className={`text-xs mt-1 ${compressionLevel === opt.id ? 'text-indigo-100' : 'text-slate-400'}`}>{opt.desc}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Target Size Options */}
                        {compressionMode === 'target' && (
                            <div className="bg-white p-6 rounded-xl border border-slate-200">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Desired File Size (MB)</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="number" 
                                        value={targetSizeMB} 
                                        onChange={(e) => setTargetSizeMB(e.target.value)}
                                        step="0.1"
                                        min="0.1"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900" 
                                        placeholder="1.0"
                                    />
                                    <span className="font-bold text-slate-500">MB</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    We will attempt to compress the file to be under this size. 
                                    If the target is too small, we will apply maximum compression.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                        <button 
                          onClick={handleProcess} 
                          disabled={isProcessing}
                          className="flex-1 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? 'Processing...' : 'Process Files'}
                          {!isProcessing && <ArrowRight size={20} />}
                        </button>
                        <button onClick={reset} className="w-full sm:w-auto px-6 py-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Clear All</button>
                    </div>
                </div>
            ) : (
                <>
                {/* GENERIC UI FOR OTHER TOOLS */}
                <div className="bg-white p-4 rounded-2xl border flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                     <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FileIcon size={20} /></div>
                     <span className="font-bold text-sm truncate text-slate-700">{files[0].name}</span>
                  </div>
                  <button onClick={reset}><Trash2 size={18} className="text-slate-300 hover:text-red-500 transition-colors"/></button>
                </div>

                {(mode === 'SPLIT' || mode === 'WATERMARK' || mode === 'METADATA' || mode === 'DELETE_PAGES') && (
                <input type="text" value={inputValue} onChange={(e)=>setInputValue(e.target.value)} placeholder={
                    mode === 'SPLIT' ? "Page range (e.g. 1-3)" : 
                    mode === 'METADATA' ? "New PDF Title" : 
                    mode === 'DELETE_PAGES' ? "Pages to remove (e.g. 1, 5)" :
                    "Watermark text"
                } className="w-full bg-white border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                )}
                
                {(mode === 'PROTECT' || mode === 'UNLOCK') && (
                <input type="password" value={inputValue} onChange={(e)=>setInputValue(e.target.value)} placeholder="Enter Password" className="w-full bg-white border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                )}

                <Button onClick={handleProcess} isLoading={isProcessing} className="w-full py-6 uppercase font-black tracking-widest shadow-xl shadow-indigo-100">Process File</Button>
                </>
            )}
            
            {successMsg && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold text-center animate-fade-in flex items-center justify-center gap-2"><CheckCircle2 size={20}/> {successMsg}</div>}
            {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-center animate-fade-in">{error}</div>}
            
            {resultText && (
               <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 max-h-60 overflow-y-auto whitespace-pre-wrap font-mono text-sm shadow-inner">
                 {resultText}
               </div>
            )}
          </div>
        )}
      </div>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="application/pdf" multiple={mode === 'MERGE' || mode === 'IMG_TO_PDF' || mode === 'COMPRESS'} />
    </div>
  );
};