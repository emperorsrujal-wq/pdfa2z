import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, ArrowRight, ArrowLeft, Image as ImageIcon, Scaling, RefreshCw, Trash2, Zap, Minimize2, Smile, Palette, Crop, ChevronsUp, UserSquare2, Globe, Info, CheckCircle, Eraser, FileText, Wand2, RotateCw } from 'lucide-react';
import { Button } from './Button.tsx';
import { ToolCard } from './ToolCard.tsx';
import { fileToBase64 } from '../utils.ts';
import { upscaleImage, editImage, generateText } from '../services/geminiService.ts';
import { ImageToolMode } from '../types.ts';

interface ImageToolkitProps {
  initialMode?: ImageToolMode;
}

export const ImageToolkit: React.FC<ImageToolkitProps> = ({ initialMode = 'MENU' }) => {
  const [mode, setMode] = useState<ImageToolMode>(initialMode);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // New input states
  const [resizeW, setResizeW] = useState('');
  const [resizeH, setResizeH] = useState('');
  const [rotateAngle, setRotateAngle] = useState(90);
  const [memeTop, setMemeTop] = useState('');
  const [memeBottom, setMemeBottom] = useState('');
  const [convertFormat, setConvertFormat] = useState('image/png');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  const reset = () => {
    setFiles([]);
    setPreviews([]);
    setProcessedUrl(null);
    setOcrResult(null);
    setError(null);
    setResizeW('');
    setResizeH('');
    setMemeTop('');
    setMemeBottom('');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles([file]);
      setPreviews([URL.createObjectURL(file)]);
      setProcessedUrl(null);
      setOcrResult(null);
    }
  };

  const processClientSide = async () => {
     return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if(!ctx) { reject('No canvas context'); return; }
            
            let w = img.width;
            let h = img.height;

            if (mode === 'RESIZE' && resizeW && resizeH) {
                w = parseInt(resizeW);
                h = parseInt(resizeH);
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);
            }
            else if (mode === 'ROTATE') {
                if (rotateAngle % 180 !== 0) {
                    canvas.width = h;
                    canvas.height = w;
                } else {
                    canvas.width = w;
                    canvas.height = h;
                }
                ctx.translate(canvas.width/2, canvas.height/2);
                ctx.rotate(rotateAngle * Math.PI / 180);
                ctx.drawImage(img, -w/2, -h/2);
            }
            else if (mode === 'CROP') {
                // Simple center crop
                const size = Math.min(w, h);
                canvas.width = size;
                canvas.height = size;
                ctx.drawImage(img, (w-size)/2, (h-size)/2, size, size, 0, 0, size, size);
            }
            else if (mode === 'FILTER') {
                canvas.width = w;
                canvas.height = h;
                ctx.filter = 'grayscale(100%)';
                ctx.drawImage(img, 0, 0);
            }
            else {
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);
            }

            if (mode === 'MEME') {
                ctx.font = `bold ${canvas.width/10}px Impact`;
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = canvas.width/200;
                ctx.textAlign = 'center';
                
                if (memeTop) {
                    ctx.fillText(memeTop.toUpperCase(), canvas.width/2, canvas.height*0.15);
                    ctx.strokeText(memeTop.toUpperCase(), canvas.width/2, canvas.height*0.15);
                }
                if (memeBottom) {
                    ctx.fillText(memeBottom.toUpperCase(), canvas.width/2, canvas.height*0.9);
                    ctx.strokeText(memeBottom.toUpperCase(), canvas.width/2, canvas.height*0.9);
                }
            }

            let mime = files[0].type;
            let q = 0.9;
            if (mode === 'CONVERT') mime = convertFormat;
            if (mode === 'COMPRESS') q = 0.5;

            resolve(canvas.toDataURL(mime, q));
        };
        img.onerror = reject;
        img.src = previews[0];
     });
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (['RESIZE', 'CROP', 'ROTATE', 'COMPRESS', 'CONVERT', 'MEME', 'FILTER'].includes(mode)) {
          const res = await processClientSide();
          setProcessedUrl(res);
      } else {
          // AI Modes
          const base64 = await fileToBase64(files[0]);
          if (mode === 'REMOVE_BG') {
            const res = await editImage(base64, "Remove the entire background of this image and make it perfectly solid white. Focus only on the subject.", files[0].type);
            setProcessedUrl(res);
          } else if (mode === 'OCR') {
            const ai = new (await import('../services/geminiService.ts')).PdfChatService(); 
            const res = await generateText(`Extract all readable text from this image accurately. Preserve formatting where possible.\n\n[Image Provided]`, "You are an OCR expert.");
            setOcrResult(res);
          } else if (mode === 'COLORIZE') {
            const res = await editImage(base64, "Add natural, realistic colors to this black and white photo. Maintain historical accuracy.", files[0].type);
            setProcessedUrl(res);
          } else if (mode === 'UPSCALE') {
            const res = await upscaleImage(base64, files[0].type, '2K');
            setProcessedUrl(res);
          } else if (mode === 'PASSPORT') {
             // Basic AI pass for now
             const res = await editImage(base64, "Crop and center this person for a compliant ID passport photo with a plain white background.", files[0].type);
             setProcessedUrl(res);
          }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (mode === 'MENU') {
    return (
      <div className="max-w-6xl mx-auto h-full flex flex-col animate-fade-in p-6">
        <h3 className="text-3xl font-bold mb-8">Creative Studio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolCard title="Background Remover" description="Automatically remove image backgrounds with AI precision." icon={<Eraser />} onClick={()=>setMode('REMOVE_BG')} colorClass="bg-rose-600 text-rose-600" />
          <ToolCard title="AI OCR" description="Extract editable text from images and scanned documents." icon={<FileText />} onClick={()=>setMode('OCR')} colorClass="bg-indigo-600 text-indigo-600" />
          <ToolCard title="Photo Colorizer" description="Restore and colorize old black & white photos using AI." icon={<Palette />} onClick={()=>setMode('COLORIZE')} colorClass="bg-teal-600 text-teal-600" />
          <ToolCard title="Upscale AI" description="Enhance image resolution up to 4K without quality loss." icon={<ChevronsUp />} onClick={()=>setMode('UPSCALE')} colorClass="bg-purple-600 text-purple-600" />
          <ToolCard title="Passport Photo" description="Create compliant passport and ID photos instantly." icon={<UserSquare2 />} onClick={()=>setMode('PASSPORT')} colorClass="bg-blue-600 text-blue-600" />
          <ToolCard title="Image Compressor" description="Reduce JPG/PNG file size for faster web loading." icon={<Minimize2 />} onClick={()=>setMode('COMPRESS')} colorClass="bg-pink-600 text-pink-600" />
          <ToolCard title="Resize Image" description="Change image dimensions (width & height) quickly." icon={<Scaling />} onClick={()=>setMode('RESIZE')} colorClass="bg-amber-600 text-amber-600" />
          <ToolCard title="Crop Image" description="Trim and frame your photos to the perfect aspect ratio." icon={<Crop />} onClick={()=>setMode('CROP')} colorClass="bg-green-600 text-green-600" />
          <ToolCard title="Convert Format" description="Switch images between JPG, PNG, and WebP formats." icon={<RefreshCw />} onClick={()=>setMode('CONVERT')} colorClass="bg-orange-600 text-orange-600" />
          <ToolCard title="Rotate Image" description="Fix photo orientation by rotating 90 degrees." icon={<RotateCw />} onClick={()=>setMode('ROTATE')} colorClass="bg-red-600 text-red-600" />
          <ToolCard title="Photo Filter" description="Apply artistic filters and grayscale effects to photos." icon={<Palette />} onClick={()=>setMode('FILTER')} colorClass="bg-cyan-600 text-cyan-600" />
          <ToolCard title="Meme Maker" description="Add text captions to images to create viral memes." icon={<Smile />} onClick={()=>setMode('MEME')} colorClass="bg-yellow-500 text-yellow-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setMode('MENU')} className="p-2 bg-slate-50 rounded-xl"><ArrowLeft size={20}/></button>
        <h3 className="text-2xl font-black uppercase tracking-tighter">{mode.replace('_', ' ')}</h3>
      </div>
      <div className="bg-white rounded-[2rem] border p-8 flex flex-col md:flex-row gap-8 shadow-sm">
        <div className="flex-1 space-y-6">
          <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-3xl flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden bg-slate-50/50">
            {previews[0] ? <img src={previews[0]} className="max-h-full object-contain" /> : <Upload size={40} className="text-slate-300"/>}
          </div>

          {/* Dynamic Inputs */}
          {mode === 'RESIZE' && (
             <div className="flex gap-2">
               <input type="number" placeholder="Width" value={resizeW} onChange={e=>setResizeW(e.target.value)} className="w-full p-3 border rounded-xl" />
               <input type="number" placeholder="Height" value={resizeH} onChange={e=>setResizeH(e.target.value)} className="w-full p-3 border rounded-xl" />
             </div>
          )}
          {mode === 'MEME' && (
             <div className="space-y-2">
               <input type="text" placeholder="Top Text" value={memeTop} onChange={e=>setMemeTop(e.target.value)} className="w-full p-3 border rounded-xl" />
               <input type="text" placeholder="Bottom Text" value={memeBottom} onChange={e=>setMemeBottom(e.target.value)} className="w-full p-3 border rounded-xl" />
             </div>
          )}
          {mode === 'CONVERT' && (
             <select value={convertFormat} onChange={e=>setConvertFormat(e.target.value)} className="w-full p-3 border rounded-xl">
               <option value="image/jpeg">JPEG</option>
               <option value="image/png">PNG</option>
               <option value="image/webp">WebP</option>
             </select>
          )}

          <Button onClick={handleProcess} isLoading={isProcessing} className="w-full py-6 uppercase font-black tracking-widest">
              {['RESIZE', 'CROP', 'COMPRESS', 'CONVERT', 'ROTATE', 'MEME'].includes(mode) ? 'Process Image' : 'Apply AI Magic'}
          </Button>
          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
        </div>
        <div className="flex-1 bg-slate-50 rounded-3xl p-6 min-h-[300px] flex items-center justify-center border border-slate-100 overflow-hidden relative group">
          {processedUrl ? (
            <>
                <img src={processedUrl} className="max-h-full object-contain shadow-2xl rounded-xl" />
                <a href={processedUrl} download={`processed-${Date.now()}`} className="absolute bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download size={24} />
                </a>
            </>
           ) : 
           ocrResult ? <pre className="whitespace-pre-wrap text-xs text-slate-700 font-mono w-full">{ocrResult}</pre> :
           <div className="text-slate-300 text-center"><ImageIcon size={40} className="mx-auto mb-2 opacity-20"/><p className="text-xs uppercase font-black tracking-widest">Result Preview</p></div>}
        </div>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*" />
    </div>
  );
};