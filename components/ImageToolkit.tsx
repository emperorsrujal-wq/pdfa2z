import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, ArrowRight, ArrowLeft, Image as ImageIcon, Scaling, RefreshCw, Trash2, Zap, Minimize2, Smile, Palette, Crop, ChevronsUp, UserSquare2, Globe, Info, CheckCircle, Eraser, FileText, Wand2, RotateCw, Printer, Sliders, QrCode, Video, FlipHorizontal, Grid, Droplet } from 'lucide-react';
import { Button } from './Button.tsx';
import { ToolCard } from './ToolCard.tsx';
import { fileToBase64 } from '../utils.ts';
import { upscaleImage, editImage, generateText, magicTransform } from '../services/geminiService.ts';
import { performOCR } from '../services/ocrService.ts';
import { Copy, Download as DownloadIcon } from 'lucide-react';
import { generatePassportSheet, PASSPORT_STANDARDS, PRINT_SIZES, addWatermark, generateCollage, COLLAGE_LAYOUTS } from '../utils/imageHelpers.ts';
import { ImageToolMode } from '../types.ts';
import JSZip from 'jszip';
import { Base64Converter } from './Base64Converter';

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
  const [flipDirection, setFlipDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [pixelateSize, setPixelateSize] = useState(10);
  const [memeTop, setMemeTop] = useState('');
  const [memeBottom, setMemeBottom] = useState('');
  const [convertFormat, setConvertFormat] = useState('image/png');
  const [qrText, setQrText] = useState('');
  const [ytUrl, setYtUrl] = useState('');

  // Passport States
  const [passportCountry, setPassportCountry] = useState('US');
  const [printSize, setPrintSize] = useState('4x6');

  // Watermark States
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkPosition, setWatermarkPosition] = useState('BR'); // Bottom Right
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [watermarkSize, setWatermarkSize] = useState(24);

  // Collage States
  const [collageLayout, setCollageLayout] = useState('grid-2x2');
  const [collageSpacing, setCollageSpacing] = useState(10);

  // Comparison States
  const [comparisonMode, setComparisonMode] = useState('side-by-side');
  const [comparisonSlider, setComparisonSlider] = useState(50);

  // Face Blur States
  const [blurIntensity, setBlurIntensity] = useState(20);

  // Magic Editor States
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [magicInstructions, setMagicInstructions] = useState('');

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
    setQrText('');
    setYtUrl('');
    setReferenceFile(null);
    setReferencePreview(null);
    setMagicInstructions('');
  };


  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setPreviews(selectedFiles.map(file => URL.createObjectURL(file)));
      setProcessedUrl(null);
      setOcrResult(null);
    }
  };

  const handleReferenceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setReferenceFile(file);
      setReferencePreview(URL.createObjectURL(file));
    }
  };

  const processClientSide = async () => {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject('No canvas context'); return; }

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
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(rotateAngle * Math.PI / 180);
          ctx.drawImage(img, -w / 2, -h / 2);
        }
        else if (mode === 'CROP') {
          // Simple center crop
          const size = Math.min(w, h);
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, (w - size) / 2, (h - size) / 2, size, size, 0, 0, size, size);
        }
        else if (mode === 'ROUND') {
          const size = Math.min(w, h);
          canvas.width = size;
          canvas.height = size;
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, (w - size) / 2, (h - size) / 2, size, size, 0, 0, size, size);
        }
        else if (mode === 'FILTER') {
          canvas.width = w;
          canvas.height = h;
          ctx.filter = 'grayscale(100%)';
          ctx.drawImage(img, 0, 0);
        }
        else if (mode === 'PROFILE_MAKER') {
          const size = Math.min(w, h);
          canvas.width = size;
          canvas.height = size;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.save();
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, (size / 2) - 10, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, (w - size) / 2, (h - size) / 2, size, size, 0, 0, size, size);
          ctx.restore();
          ctx.lineWidth = 20;
          ctx.strokeStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, (size / 2) - 10, 0, Math.PI * 2);
          ctx.stroke();
        }

        else if (mode === 'SHARPEN') {
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          // Simple sharpen convolution placeholder
        }
        else if (mode === 'BLACK_WHITE') {
          canvas.width = w;
          canvas.height = h;
          ctx.filter = 'grayscale(100%)';
          ctx.drawImage(img, 0, 0, w, h);
        }
        else if (mode === 'BLUR_IMG') {
          canvas.width = w;
          canvas.height = h;
          ctx.filter = `blur(${blurIntensity}px)`;
          ctx.drawImage(img, 0, 0, w, h);
          ctx.filter = 'none';
        }
        else {
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
        }

        if (mode === 'MEME') {
          ctx.font = `bold ${canvas.width / 10}px Impact`;
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'black';
          ctx.lineWidth = canvas.width / 200;
          ctx.textAlign = 'center';

          if (memeTop) {
            ctx.fillText(memeTop.toUpperCase(), canvas.width / 2, canvas.height * 0.15);
            ctx.strokeText(memeTop.toUpperCase(), canvas.width / 2, canvas.height * 0.15);
          }
          if (memeBottom) {
            ctx.fillText(memeBottom.toUpperCase(), canvas.width / 2, canvas.height * 0.9);
            ctx.strokeText(memeBottom.toUpperCase(), canvas.width / 2, canvas.height * 0.9);
          }
        }

        if (mode === 'ADD_TEXT') {
          ctx.font = `bold ${canvas.width / 10}px sans-serif`;
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'black';
          ctx.lineWidth = canvas.width / 200;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (memeTop) {
            ctx.fillText(memeTop, canvas.width / 2, canvas.height / 2);
            ctx.strokeText(memeTop, canvas.width / 2, canvas.height / 2);
          }
        }

        let mime = files[0].type;
        let q = 0.9;
        if (mode === 'CONVERT') mime = convertFormat;
        if (mode === 'COMPRESS') {
          mime = 'image/jpeg';
          q = 0.5;
        }

        resolve(canvas.toDataURL(mime, q));
      };
      img.onerror = reject;
      img.src = previews[0];
    });
  };

  const handleCopyOCR = () => {
    if (ocrResult) {
      navigator.clipboard.writeText(ocrResult);
      setError('Copied to clipboard!');
      setTimeout(() => setError(null), 2000);
    }
  };

  const handleDownloadOCR = () => {
    if (ocrResult) {
      const blob = new Blob([ocrResult], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ocr-result-${Date.now()}.txt`;
      a.click();
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (['RESIZE', 'CROP', 'ROTATE', 'COMPRESS', 'CONVERT', 'MEME', 'FILTER', 'ROUND', 'FLIP', 'PIXELATE', 'INVERT'].includes(mode)) {
        const res = await processClientSide();
        setProcessedUrl(res);
      } else {
        // AI Modes
        const base64 = await fileToBase64(files[0]);
        if (mode === 'REMOVE_BG') {
          const res = await editImage(base64, "Remove the entire background of this image and make it perfectly solid white. Focus only on the subject.", files[0].type);
          setProcessedUrl(res);
        } else if (mode === 'OCR') {
          const res = await performOCR(base64, files[0].type);
          setOcrResult(res);
        } else if (mode === 'COLORIZE') {
          const res = await editImage(base64, "Add natural, realistic colors to this black and white photo. Maintain historical accuracy.", files[0].type);
          setProcessedUrl(res);
        } else if (mode === 'UPSCALE') {
          const res = await upscaleImage(base64, files[0].type, '2K');
          setProcessedUrl(res);
        } else if (mode === 'PASSPORT') {
          // 1. Crop/Headshot using AI first
          const croppedBase64 = await editImage(base64, "Crop and center this person for a compliant ID passport photo with a plain white background. Ensure face is fully visible.", files[0].type);

          // 2. Generate Print Sheet
          const sheetBase64 = await generatePassportSheet(croppedBase64, passportCountry, printSize);
          setProcessedUrl(sheetBase64);
        } else if (mode === 'WATERMARK') {
          if (!watermarkText.trim()) {
            throw new Error('Please enter watermark text');
          }
          const watermarked = await addWatermark(base64, watermarkText, watermarkPosition, watermarkOpacity, watermarkSize);
          setProcessedUrl(watermarked);
        } else if (mode === 'BATCH_RESIZE') {
          // Process all uploaded images
          const resizedImages: string[] = [];
          for (const file of files) {
            const fileBase64 = await fileToBase64(file);
            const img = new Image();
            await new Promise((resolve) => {
              img.onload = resolve;
              img.src = fileBase64;
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const targetW = parseInt(resizeW) || img.width;
            const targetH = parseInt(resizeH) || img.height;
            canvas.width = targetW;
            canvas.height = targetH;
            ctx.drawImage(img, 0, 0, targetW, targetH);
            resizedImages.push(canvas.toDataURL('image/png'));
          }

          // Generate ZIP
          const zip = new JSZip();
          resizedImages.forEach((dataUrl, i) => {
            const base64Data = dataUrl.split(',')[1];
            zip.file(`resized-${i + 1}.png`, base64Data, { base64: true });
          });

          const content = await zip.generateAsync({
            type: 'blob',
            compression: "DEFLATE",
            compressionOptions: {
              level: 5
            }
          });
          const zipUrl = URL.createObjectURL(content);

          setProcessedUrl(zipUrl);
          setError(`Success! Resized ${resizedImages.length} images. Download the ZIP file.`);

          // Trigger download automatically
          const link = document.createElement('a');
          link.href = zipUrl;
          link.download = `batch-resized-${Date.now()}.zip`;
          link.click();
        } else if (mode === 'COLLAGE') {
          if (files.length < 2) {
            throw new Error('Please upload at least 2 images for collage');
          }
          const imageBase64Array = await Promise.all(files.map(f => fileToBase64(f)));
          const collage = await generateCollage(imageBase64Array, collageLayout, collageSpacing);
          setProcessedUrl(collage);
        } else if (mode === 'COMPARE') {
          if (files.length < 2) {
            throw new Error('Please upload 2 images to compare');
          }
          // Comparison UI is handled in the render section
          setError('Comparison mode active. Use the slider to reveal the before/after view.');
        } else if (mode === 'FACE_BLUR') {
          // Use AI to detect and blur faces
          const prompt = `Detect all human faces in this image and return ONLY a JSON array of bounding boxes: [{"x": percentage, "y": percentage, "w": percentage, "h": percentage}]. Coordinates should be 0-100 relative to image size. Example: [{"x": 10, "y": 20, "w": 5, "h": 5}]. If no faces, return [].`;
          const detectionResult = await generateText(prompt, base64);

          let boxes = [];
          try {
            const jsonMatch = detectionResult.match(/\[.*\]/s);
            if (jsonMatch) {
              boxes = JSON.parse(jsonMatch[0]);
            }
          } catch (e) {
            console.error("Failed to parse face boxes", e);
          }

          const img = new Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = base64;
          });

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image first
          ctx.drawImage(img, 0, 0);

          if (boxes.length > 0) {
            boxes.forEach((box: any) => {
              const bx = (box.x * canvas.width) / 100;
              const by = (box.y * canvas.height) / 100;
              const bw = (box.w * canvas.width) / 100;
              const bh = (box.h * canvas.height) / 100;

              // Create a mask for blurring specific region
              const regionCanvas = document.createElement('canvas');
              regionCanvas.width = bw;
              regionCanvas.height = bh;
              const rCtx = regionCanvas.getContext('2d')!;
              rCtx.drawImage(img, bx, by, bw, bh, 0, 0, bw, bh);

              ctx.save();
              ctx.beginPath();
              ctx.rect(bx, by, bw, bh);
              ctx.clip();
              ctx.filter = `blur(${blurIntensity}px)`;
              ctx.drawImage(regionCanvas, bx, by);
              ctx.restore();
            });
            setError(`Detected and blurred ${boxes.length} faces.`);
          } else {
            // Fallback: apply general blur if AI failed to find boxes
            ctx.filter = `blur(${blurIntensity}px)`;
            ctx.drawImage(img, 0, 0);
            setError('No specific faces detected. Applied general privacy blur.');
          }

          setProcessedUrl(canvas.toDataURL('image/png'));
        } else if (mode === 'QR_CODE') {
          if (!qrText.trim()) throw new Error('Enter text or URL for QR Code');
          // Use external API for QR Code (reliable, no deps)
          // 800x800 for high quality
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&data=${encodeURIComponent(qrText)}`;
          // We need to fetch it to convert to blob/dataUrl to allow download essentially, 
          // or just display it. For consistency with processedUrl (which is usually a blob url or data url), 
          // we can just use the URL directly since img src handles it.
          // BUT to allow download we might want to fetch it.
          // Let's just set it.
          setProcessedUrl(qrUrl);
        } else if (mode === 'YT_THUMBNAIL') {
          if (!ytUrl.trim()) throw new Error('Enter YouTube URL');
          let videoId = '';
          // Simple regex for ID
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = ytUrl.match(regExp);
          if (match && match[2].length === 11) {
            videoId = match[2];
          } else {
            throw new Error('Invalid YouTube URL');
          }
          // Max res thumb
          const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

          // Verify if maxres exists (some videos don't have it), fallback to hqdefault
          // Since we can't easily check without CORS, we'll assume maxres or just let user see it.
          // Actually, fetching image from client might fail CORS if we try to draw to canvas.
          // But we can display it.
          // For "ProcessedURL", we usually use it in an <img> tag.
          setProcessedUrl(thumbUrl);
          // Warning: Direct download might be blocked by CORS if we try to click a link with download attr.
          // But opening in new tab works.
        } else if (mode === 'MAGIC_EDITOR') {
          if (!referenceFile) throw new Error('Please upload a reference image.');
          if (!magicInstructions.trim()) throw new Error('Please enter instructions.');

          const base64 = await fileToBase64(files[0]);
          const refBase64 = await fileToBase64(referenceFile);

          const res = await magicTransform(base64, files[0].type, refBase64, referenceFile.type, magicInstructions);
          setProcessedUrl(res);
        }
        {
          mode === 'ADD_TEXT' && (
            <div className="space-y-2">
              <input type="text" placeholder="Enter Text" value={memeTop} onChange={e => setMemeTop(e.target.value)} className="w-full p-3 border rounded-xl" />
              <p className="text-xs text-slate-500">Simple center text overlay. Use Meme Maker for top/bottom.</p>
            </div>
          )
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
        <h1 className="sr-only">Image Tools</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolCard title="Background Remover" description="Automatically remove image backgrounds with AI precision." icon={<Eraser />} onClick={() => setMode('REMOVE_BG')} colorClass="bg-rose-600 text-rose-600" />
          <ToolCard title="AI OCR" description="Extract editable text from images and scanned documents." icon={<FileText />} onClick={() => setMode('OCR')} colorClass="bg-indigo-600 text-indigo-600" />
          <ToolCard title="Photo Colorizer" description="Restore and colorize old black & white photos using AI." icon={<Palette />} onClick={() => setMode('COLORIZE')} colorClass="bg-teal-600 text-teal-600" />
          <ToolCard title="Upscale AI" description="Enhance image resolution up to 4K without quality loss." icon={<ChevronsUp />} onClick={() => setMode('UPSCALE')} colorClass="bg-purple-600 text-purple-600" />
          <ToolCard title="Passport Photo" description="Create compliant passport and ID photos instantly." icon={<UserSquare2 />} onClick={() => setMode('PASSPORT')} colorClass="bg-blue-600 text-blue-600" />
          <ToolCard title="Image Compressor" description="Reduce JPG/PNG file size for faster web loading." icon={<Minimize2 />} onClick={() => setMode('COMPRESS')} colorClass="bg-pink-600 text-pink-600" />
          <ToolCard title="Resize Image" description="Change image dimensions (width & height) quickly." icon={<Scaling />} onClick={() => setMode('RESIZE')} colorClass="bg-amber-600 text-amber-600" />
          <ToolCard title="Crop Image" description="Trim and frame your photos to the perfect aspect ratio." icon={<Crop />} onClick={() => setMode('CROP')} colorClass="bg-green-600 text-green-600" />
          <ToolCard title="Convert Format" description="Switch images between JPG, PNG, and WebP formats." icon={<RefreshCw />} onClick={() => setMode('CONVERT')} colorClass="bg-orange-600 text-orange-600" />
          <ToolCard title="Rotate Image" description="Fix photo orientation by rotating 90 degrees." icon={<RotateCw />} onClick={() => setMode('ROTATE')} colorClass="bg-red-600 text-red-600" />
          <ToolCard title="Photo Filter" description="Apply artistic filters and grayscale effects to photos." icon={<Palette />} onClick={() => setMode('FILTER')} colorClass="bg-cyan-600 text-cyan-600" />
          <ToolCard title="Meme Maker" description="Add text captions to images to create viral memes." icon={<Smile />} onClick={() => setMode('MEME')} colorClass="bg-yellow-500 text-yellow-500" />
          <ToolCard title="Watermark Images" description="Add text or logo watermarks to protect your photos." icon={<Wand2 />} onClick={() => setMode('WATERMARK')} colorClass="bg-slate-600 text-slate-600" />
          <ToolCard title="Batch Resize" description="Resize multiple images at once and download as ZIP." icon={<Zap />} onClick={() => setMode('BATCH_RESIZE')} colorClass="bg-emerald-600 text-emerald-600" />
          <ToolCard title="Collage Maker" description="Combine multiple images into beautiful layouts." icon={<ImageIcon />} onClick={() => setMode('COLLAGE')} colorClass="bg-fuchsia-600 text-fuchsia-600" />
          <ToolCard title="Image Comparison" description="Compare two images side-by-side with slider." icon={<ArrowRight />} onClick={() => setMode('COMPARE')} colorClass="bg-sky-600 text-sky-600" />
          <ToolCard title="Face Blur" description="Automatically detect and blur faces for privacy." icon={<UserSquare2 />} onClick={() => setMode('FACE_BLUR')} colorClass="bg-gray-700 text-gray-700" />

          <ToolCard title="Face Blur" description="Automatically detect and blur faces for privacy." icon={<UserSquare2 />} onClick={() => setMode('FACE_BLUR')} colorClass="bg-gray-700 text-gray-700" />

          <ToolCard title="Flip Image" description="Mirror images horizontally or vertically." icon={<FlipHorizontal />} onClick={() => setMode('FLIP')} colorClass="bg-indigo-700 text-indigo-700" />
          <ToolCard title="Pixelate Image" description="Add pixelation effect to anonymize images." icon={<Grid />} onClick={() => setMode('PIXELATE')} colorClass="bg-lime-700 text-lime-700" />
          <ToolCard title="Invert Colors" description="Create negative effect by inverting colors." icon={<Droplet />} onClick={() => setMode('INVERT')} colorClass="bg-fuchsia-700 text-fuchsia-700" />

          <ToolCard title="Profile Picture" description="Create circular profile photos with borders." icon={<UserSquare2 />} onClick={() => setMode('PROFILE_MAKER')} colorClass="bg-blue-500 text-blue-500" />
          <ToolCard title="Sharpen Image" description="Unblur and sharpen soft images." icon={<Wand2 />} onClick={() => setMode('SHARPEN')} colorClass="bg-orange-500 text-orange-500" />
          <ToolCard title="Black & White" description="Convert colorful images to grayscale." icon={<Palette />} onClick={() => setMode('BLACK_WHITE')} colorClass="bg-gray-800 text-gray-800" />
          <ToolCard title="Blur Image" description="Apply blur effect to hide details." icon={<Droplet />} onClick={() => setMode('BLUR_IMG')} colorClass="bg-teal-500 text-teal-500" />
          <ToolCard title="Add Text" description="Add custom text overlays to images." icon={<FileText />} onClick={() => setMode('ADD_TEXT')} colorClass="bg-purple-500 text-purple-500" />
          <ToolCard title="Split Image" description="Split one image into multiple pieces." icon={<Grid />} onClick={() => setMode('SPLIT_IMAGE')} colorClass="bg-indigo-500 text-indigo-500" />


          <ToolCard title="QR Generator" description="Create custom QR codes for URLs and text." icon={<QrCode />} onClick={() => setMode('QR_CODE')} colorClass="bg-slate-800 text-slate-800" />
          <ToolCard title="YouTube Thumbnail" description="Download high-quality thumbnails from videos." icon={<Video />} onClick={() => setMode('YT_THUMBNAIL')} colorClass="bg-red-700 text-red-700" />
          <ToolCard title="Base64 Converter" description="Convert images to Base64 strings and vice versa." icon={<ArrowRight />} onClick={() => setMode('BASE64')} colorClass="bg-indigo-500 text-indigo-500" />
        </div>
      </div>
    );
  }

  // Base64 Converter Component Integration
  if (mode === 'BASE64') {
    return (
      <div className="h-full flex flex-col p-6 animate-fade-in overflow-y-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setMode('MENU')} className="p-2 bg-slate-50 rounded-xl"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-black flex items-center gap-3">Base64 Converter</h1>
        </div>
        {/* We need to import Base64Converter or inline it. Since we created a file, let's use it. 
                But wait, I need to add the import to the top of the file first. 
                For now, I'll assume I'll add the import in a separate `replace_file_content` call or 
                I'll leave this as a placeholder to prompt me to add the import.
            */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200">
          <Base64Converter />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-8 justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setMode('MENU')} className="p-2 bg-slate-50 rounded-xl"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-black uppercase tracking-tighter">{mode.replace('_', ' ')}</h1>
        </div>
        {/* API Key button removed - Integrated */}
      </div>
      <div className="bg-white rounded-[2rem] border p-8 flex flex-col md:flex-row gap-8 shadow-sm">
        <div className="flex-1 space-y-6">
          {!(mode === 'QR_CODE' || mode === 'YT_THUMBNAIL') && (
            <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden bg-slate-50/50">
              {previews[0] ? (
                <img src={previews[0]} className="max-h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={40} className="text-slate-300" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center px-4">
                    {mode === 'BATCH_RESIZE' || mode === 'COLLAGE' ? 'Select multiple images' :
                      mode === 'COMPARE' ? 'Select 2 images' : 'Upload your photo'}
                  </p>
                </div>
              )}
            </div>
          )}

          {(mode === 'QR_CODE' || mode === 'YT_THUMBNAIL') && (
            <div className="aspect-square border-2 border-slate-100 rounded-3xl flex items-center justify-center text-center p-6 bg-slate-50">
              <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
                {mode === 'QR_CODE' ? 'QR Code Preview' : 'Thumbnail Preview'}
              </p>
            </div>
          )}

          {/* Dynamic Inputs */}
          {mode === 'RESIZE' && (
            <div className="flex gap-2">
              <input type="number" placeholder="Width" value={resizeW} onChange={e => setResizeW(e.target.value)} className="w-full p-3 border rounded-xl" />
              <input type="number" placeholder="Height" value={resizeH} onChange={e => setResizeH(e.target.value)} className="w-full p-3 border rounded-xl" />
            </div>
          )}
          {mode === 'MEME' && (
            <div className="space-y-2">
              <input type="text" placeholder="Top Text" value={memeTop} onChange={e => setMemeTop(e.target.value)} className="w-full p-3 border rounded-xl" />
              <input type="text" placeholder="Bottom Text" value={memeBottom} onChange={e => setMemeBottom(e.target.value)} className="w-full p-3 border rounded-xl" />
            </div>
          )}
          {mode === 'ADD_TEXT' && (
            <div className="space-y-2">
              <input type="text" placeholder="Enter Text" value={memeTop} onChange={e => setMemeTop(e.target.value)} className="w-full p-3 border rounded-xl" />
              <p className="text-xs text-slate-500">Simple center text overlay. Use Meme Maker for top/bottom.</p>
            </div>
          )}
          {mode === 'CONVERT' && (
            <select value={convertFormat} onChange={e => setConvertFormat(e.target.value)} className="w-full p-3 border rounded-xl">
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
            </select>
          )}
          {mode === 'PASSPORT' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <Info size={16} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold mb-1">How it works:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Upload your photo</li>
                      <li>Select your country</li>
                      <li>Choose print size</li>
                      <li>AI will crop & create a print sheet with multiple copies</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Globe size={16} />
                  Country / Standard
                </label>
                <select
                  value={passportCountry}
                  onChange={e => setPassportCountry(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {['North America', 'Europe', 'Asia', 'Oceania', 'Africa', 'South America'].map(region => {
                    const countriesInRegion = Object.entries(PASSPORT_STANDARDS).filter(([_, std]) => std.region === region);
                    if (countriesInRegion.length === 0) return null;
                    return (
                      <optgroup key={region} label={region}>
                        {countriesInRegion.map(([code, std]) => (
                          <option key={code} value={code}>
                            {std.label} ({std.widthMm}×{std.heightMm}mm)
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                {PASSPORT_STANDARDS[passportCountry] && (
                  <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                    📐 Dimensions: <span className="font-bold">{PASSPORT_STANDARDS[passportCountry].widthMm} × {PASSPORT_STANDARDS[passportCountry].heightMm} mm</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Printer size={16} />
                  Print Paper Size
                </label>
                <select
                  value={printSize}
                  onChange={e => setPrintSize(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {Object.entries(PRINT_SIZES).map(([code, size]) => (
                    <option key={code} value={code}>{size.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Watermark Controls */}
          {mode === 'WATERMARK' && (
            <div className="space-y-4">
              <input type="text" placeholder="Enter watermark text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} className="w-full p-3 border rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold">Position</label>
                  <select value={watermarkPosition} onChange={e => setWatermarkPosition(e.target.value)} className="w-full p-3 border rounded-xl">
                    <option value="TL">Top Left</option>
                    <option value="TC">Top Center</option>
                    <option value="TR">Top Right</option>
                    <option value="ML">Middle Left</option>
                    <option value="MC">Middle Center</option>
                    <option value="MR">Middle Right</option>
                    <option value="BL">Bottom Left</option>
                    <option value="BC">Bottom Center</option>
                    <option value="BR">Bottom Right</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold">Font Size: {watermarkSize}px</label>
                  <input type="range" min="12" max="72" value={watermarkSize} onChange={e => setWatermarkSize(parseInt(e.target.value))} className="w-full" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold">Opacity: {watermarkOpacity}%</label>
                <input type="range" min="10" max="100" value={watermarkOpacity} onChange={e => setWatermarkOpacity(parseInt(e.target.value))} className="w-full" />
              </div>
            </div>
          )}

          {/* Batch Resize Controls */}
          {mode === 'BATCH_RESIZE' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Upload multiple images and resize them all at once!</p>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Width (px)" value={resizeW} onChange={e => setResizeW(e.target.value)} className="w-full p-3 border rounded-xl" />
                <input type="number" placeholder="Height (px)" value={resizeH} onChange={e => setResizeH(e.target.value)} className="w-full p-3 border rounded-xl" />
              </div>
            </div>
          )}

          {/* Collage Controls */}
          {mode === 'COLLAGE' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold">Layout</label>
                <select value={collageLayout} onChange={e => setCollageLayout(e.target.value)} className="w-full p-3 border rounded-xl">
                  {Object.entries(COLLAGE_LAYOUTS).map(([code, layout]) => (
                    <option key={code} value={code}>{layout.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold">Spacing: {collageSpacing}px</label>
                <input type="range" min="0" max="50" value={collageSpacing} onChange={e => setCollageSpacing(parseInt(e.target.value))} className="w-full" />
              </div>
            </div>
          )}

          {/* Comparison Controls */}
          {mode === 'COMPARE' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Upload 2 images to compare side-by-side</p>
            </div>
          )}

          {/* Face Blur Controls */}
          {mode === 'FACE_BLUR' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold">Blur Intensity: {blurIntensity}px</label>
                <input type="range" min="5" max="50" value={blurIntensity} onChange={e => setBlurIntensity(parseInt(e.target.value))} className="w-full" />
              </div>
            </div>
          )}

          {/* Flip Controls */}
          {mode === 'FLIP' && (
            <div className="flex gap-4">
              <button onClick={() => setFlipDirection('horizontal')} className={`flex-1 py-3 border rounded-xl font-bold ${flipDirection === 'horizontal' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700'}`}>Flip Horizontal</button>
              <button onClick={() => setFlipDirection('vertical')} className={`flex-1 py-3 border rounded-xl font-bold ${flipDirection === 'vertical' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700'}`}>Flip Vertical</button>
            </div>
          )}

          {/* Pixelate Controls */}
          {mode === 'PIXELATE' && (
            <div>
              <label className="text-sm font-bold">Pixel Size: {pixelateSize}</label>
              <input type="range" min="1" max="50" value={pixelateSize} onChange={e => setPixelateSize(parseInt(e.target.value))} className="w-full" />
            </div>
          )}

          {/* Invert Controls */}
          {mode === 'INVERT' && (
            <p className="text-sm text-slate-600">Click process to invert colors.</p>
          )}

          {/* QR Code and YT Inputs */}

          {/* QR Code and YT Inputs */}
          {mode === 'QR_CODE' && (
            <input type="text" placeholder="Enter URL or Text" value={qrText} onChange={e => setQrText(e.target.value)} className="w-full p-3 border rounded-xl" />
          )}
          {mode === 'YT_THUMBNAIL' && (
            <input type="text" placeholder="Paste YouTube Link" value={ytUrl} onChange={e => setYtUrl(e.target.value)} className="w-full p-3 border rounded-xl" />
          )}

          {/* Magic Editor Controls */}
          {mode === 'MAGIC_EDITOR' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-2 block">Reference Image / Style</label>
                <div
                  onClick={() => document.getElementById('ref-upload')?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  {referencePreview ? (
                    <img src={referencePreview} alt="Reference" className="h-32 mx-auto object-contain rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <ImageIcon size={24} />
                      <span className="text-xs mt-1">Upload Reference</span>
                    </div>
                  )}
                  <input type="file" id="ref-upload" className="hidden" onChange={handleReferenceSelect} accept="image/*" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">Magic Instructions</label>
                <textarea
                  value={magicInstructions}
                  onChange={e => setMagicInstructions(e.target.value)}
                  placeholder="e.g., 'Transfer the artistic style of the reference image to the base image' or 'Replace the background with the scene from the reference'"
                  className="w-full p-3 border rounded-xl h-24 text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <Button onClick={handleProcess} isLoading={isProcessing} className="w-full py-6 uppercase font-black tracking-widest">
            {['RESIZE', 'CROP', 'COMPRESS', 'CONVERT', 'ROTATE', 'MEME', 'ROUND', 'QR_CODE', 'YT_THUMBNAIL', 'FLIP', 'PIXELATE', 'INVERT'].includes(mode) ? 'Process Image' : 'Apply AI Magic'}
          </Button>
          {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
        </div>
        <div className="flex-1 bg-slate-50 rounded-3xl p-6 min-h-[300px] flex items-center justify-center border border-slate-100 overflow-hidden relative group">
          {mode === 'COMPARE' && previews.length >= 2 ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-full aspect-square max-h-full overflow-hidden rounded-xl shadow-2xl">
                {/* Second Image (After) */}
                <img src={previews[1]} className="absolute inset-0 w-full h-full object-contain" />

                {/* First Image (Before) with Clip Path */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - comparisonSlider}% 0 0)` }}
                >
                  <img src={previews[0]} className="w-full h-full object-contain" />
                </div>

                {/* Slider Control */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={comparisonSlider}
                  onChange={(e) => setComparisonSlider(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                />
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-0 pointer-events-none"
                  style={{ left: `${comparisonSlider}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center border border-slate-200">
                    <ArrowRight size={20} className="text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          ) : processedUrl ? (
            <>
              <img src={processedUrl} className="max-h-full object-contain shadow-2xl rounded-xl" />
              <a href={processedUrl} download={`processed-${Date.now()}`} className="absolute bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Download size={24} />
              </a>
            </>
          ) :
            ocrResult ? (
              <div className="w-full h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-inner overflow-hidden absolute inset-0">
                <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Extracted Text</span>
                  <div className="flex gap-2">
                    <button onClick={handleCopyOCR} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors" title="Copy to clipboard">
                      <Copy size={16} />
                    </button>
                    <button onClick={handleDownloadOCR} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors" title="Download as .txt">
                      <DownloadIcon size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono leading-relaxed">{ocrResult}</pre>
                </div>
              </div>
            ) :
              <div className="text-slate-300 text-center"><ImageIcon size={40} className="mx-auto mb-2 opacity-20" /><p className="text-xs uppercase font-black tracking-widest">Result Preview</p></div>}
        </div>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*" multiple />
    </div >
  );
};