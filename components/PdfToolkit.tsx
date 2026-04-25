import * as React from 'react';

import { Upload, Download, ArrowRight, ArrowLeft, File as FileIcon, Scissors, Layers, PenTool, Stamp, EyeOff, LayoutTemplate, Wrench, Tag, Hash, FileSpreadsheet, FileCode, RotateCw, FileX, FileText, FileImage, Lock, Unlock, Mail, Trash2, Sliders, Target, CheckCircle2, Copy, Download as DownloadIcon, FileType, Book, Link, Package, Printer, Globe, Info, ChevronLeft, ChevronRight, Zap, Image as ImageIcon, ShieldAlert } from 'lucide-react';
import { PDFDocument as LibPDFDocument } from 'pdf-lib';
import { Button } from './Button.tsx';
import { mergePdfs, splitPdf, pdfToImages, downloadBlob, compressPdf, imagesToPdf, rotatePdf, removePages, extractTextFromPdf, addPageNumbers, protectPdf, pdfToWord, pdfToExcel, pdfToHtml, unlockPdf, watermarkPdf, grayscalePdf, flattenPdf, repairPdf, updateMetadata, CompressionOptions, reorderPdf, sanitizePdf, PageOrder, reversePdf, pdfToImagesZip, editPdf, cropPdf, pdfToPpt, redactPdf, RedactionArea } from '../utils/pdfHelpers.ts';
import { performOcrOnImages } from '../services/ocrService.ts';
import { ToolCard } from './ToolCard.tsx';
import { PdfToolMode } from '../types.ts';
import { PdfSignerWorkstation } from './PdfSignerWorkstation';
import { Redactor } from './Redactor';
import { PdfEditorUI } from './PdfEditorUI';
import { BatchProcessor } from './BatchProcessor';
import { uploadToLibrary } from '../services/documentService';
import { useAuth } from '../context/AuthContext';
import { ToolCategory } from '../types';

interface PdfToolkitProps {
  initialMode?: PdfToolMode;
}

export const PdfToolkit: React.FC<PdfToolkitProps> = ({ initialMode = 'MENU' }) => {
  const [mode, setMode] = React.useState<PdfToolMode>(initialMode);
  const [files, setFiles] = React.useState<File[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const [resultImages, setResultImages] = React.useState<string[]>([]);
  const [resultText, setResultText] = React.useState<string>('');
  const [resultBlob, setResultBlob] = React.useState<{ blob: Blob, fileName: string } | null>(null);
  const { user, openAuthModal } = useAuth();
  const [isSaving, setIsSaving] = React.useState(false);

  const [signingPage, setSigningPage] = React.useState<{ index: number, image: string } | null>(null);

  const [inputValue, setInputValue] = React.useState('');
  // Compression Settings
  const [compressionMode, setCompressionMode] = React.useState<'preset' | 'target'>('preset');
  const [compressionLevel, setCompressionLevel] = React.useState<'high' | 'balanced' | 'max'>('balanced');
  const [targetSizeMB, setTargetSizeMB] = React.useState<string>('1.0');

  const [rotationAngle, setRotationAngle] = React.useState<number>(90);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Organize State
  const [organizedPages, setOrganizedPages] = React.useState<{ index: number, rotation: number, isDeleted: boolean, originalIndex: number }[]>([]);
  const [redactionAreas, setRedactionAreas] = React.useState<RedactionArea[]>([]);
  const [activeRedactPage, setActiveRedactPage] = React.useState<number | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const htmlFileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      reset(); // Ensure state is cleared when mode changes from props
    }
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
      // SIGN mode also needs multiple files logic if we want to support it, but essentially it takes one PDF.
      // MERGE, IMG_TO_PDF, COMPRESS support multiple.
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
    setSigningPage(null);
    setOrganizedPages([]);
    setRedactionAreas([]);
    setActiveRedactPage(null);
    setResultBlob(null);
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
        const blob = new Blob([res as any], { type: 'application/pdf' });
        downloadBlob(blob, 'merged.pdf');
        setResultBlob({ blob, fileName: 'merged.pdf' });
        setSuccessMsg("Merged successfully!");
      }
      else if (mode === 'SPLIT') {
        const res = await splitPdf(files[0], inputValue);
        const blob = new Blob([res as any], { type: 'application/pdf' });
        downloadBlob(blob, `split-${files[0].name}`);
        setResultBlob({ blob, fileName: `split-${files[0].name}` });
        setSuccessMsg("Split successfully!");
      }
      else if (mode === 'SIGN') {
        // If files are selected, first convert to images if not already done
        if (resultImages.length === 0 && files.length > 0) {
          const { images: imgs } = await pdfToImages(files[0]);
          setResultImages(imgs);
          setIsProcessing(false); // Stop here to show UI
          return;
        }

        // If we have signed results (modified images), save back to PDF
        if (resultImages.length > 0) {
          // imagesToPdf expects File[], but we have base64 strings
          // We need to convert base64 to File objects
          const imageFiles = await Promise.all(resultImages.map(async (dataUrl, i) => {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            return new File([blob], `page-${i + 1}.png`, { type: 'image/png' });
          }));

          const res = await imagesToPdf(imageFiles);
          downloadBlob(res, `signed-${files[0].name}`);
          setSuccessMsg("Signed PDF ready!");
        }
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
        for (const file of files) {
          const res = await compressPdf(file, options);
          downloadBlob(res, `optimized-${file.name}`);
        }
        setSuccessMsg("Compressed successfully!");
      }
      else if (mode === 'TO_IMAGE') {
        const { images } = await pdfToImages(files[0]);
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
        const { images } = await pdfToImages(files[0]);
        const text = await performOcrOnImages(images);
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
        const pages = inputValue.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (pages.length === 0) throw new Error("Enter valid page numbers");
        const res = await removePages(files[0], pages);
        downloadBlob(res, `pages-deleted-${files[0].name}`);
        setSuccessMsg("Pages removed!");
      }
      else if (mode === 'ORGANIZE') {
        const order: PageOrder[] = organizedPages
          .filter(p => !p.isDeleted)
          .map(p => ({ index: p.originalIndex, rotation: p.rotation }));

        if (order.length === 0) throw new Error("Resulting PDF must have at least one page.");

        const res = await reorderPdf(files[0], order);
        downloadBlob(res, `organized-${files[0].name}`);
        setSuccessMsg("Organized PDF created!");
      } else if (mode === 'SANITIZE') {
        const res = await sanitizePdf(files[0]);
        downloadBlob(res, `sanitized-${files[0].name}`);
        setSuccessMsg("PDF Sanitized!");
      } else if (mode === 'REVERSE') {
        const res = await reversePdf(files[0]);
        downloadBlob(res, `reversed-${files[0].name}`);
        setSuccessMsg("PDF Reversed!");
      } else if (mode === 'EXTRACT_IMAGES') {
        const blob = await pdfToImagesZip(files[0]);
        downloadBlob(blob, `extracted-images-${files[0].name}.zip`);
        setSuccessMsg("Images Extracted!");
      } else if (mode === 'REDACT') {
        if (resultImages.length === 0) {
          const { images: imgs } = await pdfToImages(files[0]);
          setResultImages(imgs);
          setIsProcessing(false);
          return;
        }
        const res = await redactPdf(files[0], await Promise.all(redactionAreas.map(async (area) => {
          // Mapping from 0-1000 scale to PDF points
          const arrayBuffer = await files[0].arrayBuffer();
          const pdfDoc = await LibPDFDocument.load(arrayBuffer);
          const page = pdfDoc.getPage(area.pageIndex);
          const { width, height } = page.getSize();

          return {
            ...area,
            x: (area.x / 1000) * width,
            y: (area.y / 1000) * height,
            width: (area.width / 1000) * width,
            height: (area.height / 1000) * height
          };
        })));

        // FOOLPROOF STEP: Strip all remaining metadata for maximum security
        const redactedBlob = new Blob([res as any], { type: 'application/pdf' });
        const finalizedRes = await sanitizePdf(new File([redactedBlob], files[0].name, { type: 'application/pdf' }));

        downloadBlob(finalizedRes, `redacted-${files[0].name}`);
        setSuccessMsg("PDF Redacted & Sanitized Successfully!");
      } else if (mode === 'CROP') {
        const margin = parseInt(inputValue) || 20;
        const res = await cropPdf(files[0], margin);
        downloadBlob(res, `cropped-${files[0].name}`);
        setSuccessMsg("PDF Cropped!");
      } else if (mode === 'PDF_TO_CSV') {
        const blob = await pdfToExcel(files[0]); // CSV logic
        downloadBlob(blob, `converted.csv`);
      } else if (mode === 'PDF_TO_PPT') {
        const blob = await pdfToPpt(files[0]);
        downloadBlob(blob, `converted.pptx`);
      } else if (mode === 'URL_TO_PDF') {
        // This is handled in UI (print instructions), no process needed really
        setSuccessMsg("Use Print > Save as PDF in your browser.");
      } else if (mode === 'PPT_TO_PDF' || mode === 'WORD_TO_PDF' || mode === 'EPUB_TO_PDF' || mode === 'MOBI_TO_PDF' || mode === 'AZW3_TO_PDF' || mode === 'OUTLOOK_TO_PDF') {
        // Placeholder for client-side limitations
        setError("This conversion requires a backend server. We are working on it!");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!resultBlob) return;
    setIsSaving(true);
    try {
      await uploadToLibrary(resultBlob.blob, resultBlob.fileName, 'PDF');
      setSuccessMsg("File saved to your library!");
      setResultBlob(null); // Clear to prevent double saving
    } catch (e: any) {
      setError(e.message || "Failed to save file.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyText = () => {
    if (resultText) {
      navigator.clipboard.writeText(resultText);
      setSuccessMsg('Copied to clipboard!');
      setTimeout(() => setSuccessMsg(null), 2000);
    }
  };

  const handleDownloadText = () => {
    if (resultText) {
      const blob = new Blob([resultText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted-text-${Date.now()}.txt`;
      a.click();
    }
  };


  const handleSaveSignature = (signedImage: string) => {
    if (signingPage) {
      const newImages = [...resultImages];
      newImages[signingPage.index] = signedImage;
      setResultImages(newImages);
      setSigningPage(null);
    }
  };

  const handleSaveRedactions = (pageIdx: number, areas: RedactionArea[]) => {
    // Remove old areas for this page and add new ones
    setRedactionAreas(prev => [
      ...prev.filter(a => a.pageIndex !== pageIdx),
      ...areas
    ]);
    setActiveRedactPage(null);
  };

  const handleOrganizeLoad = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      // 1. Convert to images for preview
      const { images: imgs } = await pdfToImages(files[0]);
      setResultImages(imgs);
      // 2. Init state
      setOrganizedPages(imgs.map((_, i) => ({
        index: i,
        originalIndex: i,
        rotation: 0,
        isDeleted: false
      })));
    } catch (e: any) {
      setError("Failed to load PDF pages: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const movePage = (currIndex: number, direction: 'left' | 'right') => {
    const newPages = [...organizedPages];
    const targetIndex = direction === 'left' ? currIndex - 1 : currIndex + 1;
    if (targetIndex < 0 || targetIndex >= newPages.length) return;

    // Swap
    [newPages[currIndex], newPages[targetIndex]] = [newPages[targetIndex], newPages[currIndex]];
    setOrganizedPages(newPages);
  };

  const rotatePage = (index: number) => {
    const newPages = [...organizedPages];
    newPages[index].rotation = (newPages[index].rotation + 90) % 360;
    setOrganizedPages(newPages);
  };

  const toggleDeletePage = (index: number) => {
    const newPages = [...organizedPages];
    newPages[index].isDeleted = !newPages[index].isDeleted;
    setOrganizedPages(newPages);
  };

  if (mode === 'MENU') {
    return (
      <div className="h-full flex flex-col animate-fade-in p-6 overflow-y-auto custom-scrollbar">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">PDF Utilities</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ToolCard title="Merge PDF" description="Combine multiple PDF files into one single document securely." icon={<Layers />} onClick={() => setMode('MERGE')} colorClass="bg-indigo-600 text-indigo-600" />
          <ToolCard title="Split PDF" description="Extract specific pages or split a file into multiple PDFs." icon={<Scissors />} onClick={() => setMode('SPLIT')} colorClass="bg-orange-600 text-orange-600" />
          <ToolCard title="Sign PDF" description="E-Sign document." icon={<PenTool />} onClick={() => setMode('SIGN')} colorClass="bg-green-600 text-green-600" />
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
          <ToolCard title="PDF Organizer" description="Reorder, rotate, and delete pages visually." icon={<LayoutTemplate />} onClick={() => setMode('ORGANIZE')} colorClass="bg-indigo-900 text-indigo-900" />
          <ToolCard title="Sanitize PDF" description="Remove metadata and hidden data for security." icon={<ShieldAlert />} onClick={() => setMode('SANITIZE')} colorClass="bg-slate-800 text-slate-800" />
          <ToolCard title="Reverse PDF" description="Reverse the order of pages in your PDF." icon={<ArrowLeft />} onClick={() => setMode('REVERSE')} colorClass="bg-emerald-700 text-emerald-700" />
          <ToolCard title="Extract Images" description="Extract all pages as images in a ZIP file." icon={<FileImage />} onClick={() => setMode('EXTRACT_IMAGES')} colorClass="bg-pink-700 text-pink-700" />
          <ToolCard title="Edit PDF" description="Add text, shapes, and annotations to your PDF." icon={<PenTool />} onClick={() => setMode('EDIT')} colorClass="bg-blue-500 text-blue-500" />
          <ToolCard title="Crop PDF" description="Trim margins and crop PDF pages." icon={<Scissors />} onClick={() => setMode('CROP')} colorClass="bg-orange-500 text-orange-500" />
          <ToolCard title="PDF to PowerPoint" description="Convert PDF to editable PPTX slides." icon={<FileSpreadsheet />} onClick={() => setMode('PDF_TO_PPT')} colorClass="bg-red-500 text-red-500" />
          <ToolCard title="PowerPoint to PDF" description="Convert PPT/PPTX presentations to PDF." icon={<FileSpreadsheet />} onClick={() => setMode('PPT_TO_PDF')} colorClass="bg-red-600 text-red-600" />
          <ToolCard title="PDF to CSV" description="Extract tables and data to CSV format." icon={<FileSpreadsheet />} onClick={() => setMode('PDF_TO_CSV')} colorClass="bg-green-500 text-green-500" />
          <ToolCard title="URL to PDF" description="Convert any webpage URL to PDF document." icon={<Link />} onClick={() => setMode('URL_TO_PDF')} colorClass="bg-indigo-500 text-indigo-500" />
          <ToolCard title="EPUB to PDF" description="Convert EPUB ebooks to PDF format." icon={<Book />} onClick={() => setMode('EPUB_TO_PDF')} colorClass="bg-yellow-600 text-yellow-600" />
          <ToolCard title="MOBI to PDF" description="Convert MOBI ebooks to PDF format." icon={<Book />} onClick={() => setMode('MOBI_TO_PDF')} colorClass="bg-yellow-500 text-yellow-500" />
          <ToolCard title="Outlook to PDF" description="Convert MSG/EML email files to PDF." icon={<Mail />} onClick={() => setMode('OUTLOOK_TO_PDF')} colorClass="bg-cyan-500 text-cyan-500" />
          <ToolCard title="HTML to PDF" description="Convert raw HTML code and CSS into high-quality PDF." icon={<FileCode />} onClick={() => setMode('HTML_TO_PDF')} colorClass="bg-orange-600 text-orange-600" />
          <ToolCard title="Batch Process" description="Bulk merge, split, and compress files." icon={<Package />} onClick={() => setMode('BATCH')} colorClass="bg-indigo-600 border-2 border-indigo-400 shadow-indigo-100 shadow-xl" />
        </div>
      </div>
    );
  }

  const getHeader = () => {
    switch (mode) {
      case 'MERGE': return { icon: <Layers />, title: 'Merge PDF' };
      case 'SPLIT': return { icon: <Scissors />, title: 'Split PDF' };
      case 'SIGN': return { icon: <PenTool />, title: 'Sign PDF' };
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
      case 'ORGANIZE': return { icon: <LayoutTemplate />, title: 'Organize Pages' };
      case 'SANITIZE': return { icon: <ShieldAlert />, title: 'Sanitize PDF' };
      case 'REVERSE': return { icon: <ArrowLeft />, title: 'Reverse PDF' };
      case 'EXTRACT_IMAGES': return { icon: <FileImage />, title: 'Extract Images' };
      case 'REDACT': return { icon: <EyeOff />, title: 'Redact PDF' };
      case 'BATCH': return { icon: <Package />, title: 'Batch Workspace' };
      case 'HTML_TO_PDF': return { icon: <FileCode />, title: 'HTML to PDF' };
      case 'EDIT': return { icon: <PenTool />, title: 'Online PDF editor' };
      default: return { icon: <FileIcon />, title: 'PDF Tool' };
    }
  };
  const header = getHeader();

  return (
    <div className={`h-full flex flex-col p-6 animate-fade-in ${mode === 'EDIT' ? 'bg-white' : ''}`}>
      <div className={`flex items-center gap-4 mb-8 ${mode === 'EDIT' ? 'flex-col text-center' : 'justify-between'}`}>
        <div className={`flex items-center gap-4 ${mode === 'EDIT' ? 'flex-col' : ''}`}>
          {mode !== 'MENU' && (
            <button onClick={() => setMode('MENU')} className="p-2 bg-slate-50 rounded-xl self-start"><ArrowLeft size={20} /></button>
          )}
          <div className={`${mode === 'EDIT' ? 'mt-4' : ''}`}>
            <h1 className={`${mode === 'EDIT' ? 'text-4xl font-extrabold text-[#333] mb-2' : 'text-2xl font-black'} flex items-center gap-3 justify-center`}>
              {mode !== 'EDIT' && header.icon}
              {header.title}
            </h1>
            {mode === 'EDIT' && (
              <p className="text-slate-500 text-lg max-w-xl mx-auto">Edit PDF files for free. Fill & sign PDF</p>
            )}
          </div>
        </div>
      </div>
      <div className={`flex-1 ${mode === 'EDIT' ? 'bg-transparent' : 'bg-slate-50 rounded-3xl'} p-8 flex flex-col overflow-y-auto custom-scrollbar`}>
        {files.length === 0 && !['URL_TO_PDF', 'HTML_TO_PDF'].includes(mode) ? (
          <div 
            onClick={() => fileInputRef.current?.click()} 
            className={`flex-1 ${mode === 'EDIT' ? 'bg-[#11b67a] hover:bg-[#0da26a] max-w-md mx-auto h-20 flex-none rounded px-12 py-6' : 'border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center min-h-[300px] hover:border-indigo-600'} transition-all cursor-pointer flex items-center justify-center`}
          >
            {mode === 'EDIT' ? (
              <span className="text-white text-xl font-bold uppercase tracking-wider">Upload PDF file</span>
            ) : (
              <>
                <Upload size={40} className="mb-4 text-indigo-600" />
                <p className="font-black uppercase tracking-tighter text-slate-800">
                  {mode === 'IMG_TO_PDF' ? 'Upload Images' :
                    mode === 'PPT_TO_PDF' ? 'Upload PPT Presentation' :
                      mode === 'EPUB_TO_PDF' || mode === 'MOBI_TO_PDF' ? 'Upload Ebook' :
                        'Upload your PDF'}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto w-full pb-8">
            {mode === 'URL_TO_PDF' && files.length === 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                  <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 mb-4">
                    <Link size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Webpage to PDF</h3>
                  <p className="text-slate-500 mb-6 text-sm">Enter a URL to convert the webpage into a high-quality PDF document.</p>
                  <input
                    type="url"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-medium mb-4"
                  />
                  <Button onClick={handleProcess} isLoading={isProcessing} className="w-full py-4">Convert to PDF</Button>
                </div>
              </div>
            )}

            {mode === 'HTML_TO_PDF' && files.length === 0 && (
              <div className="space-y-6 animate-fade-in w-full">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center">
                  <div className="p-4 bg-orange-50 rounded-2xl text-orange-600 mb-4">
                    <FileCode size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">HTML to PDF Converter</h3>
                  <p className="text-slate-500 mb-6 text-sm text-center">Paste your HTML and CSS code below, or upload a .html file to get started.</p>
                  
                  <div className="w-full flex justify-end mb-2">
                    <button 
                      onClick={() => htmlFileInputRef.current?.click()}
                      className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg transition-all"
                    >
                      <Upload size={12} /> Upload HTML File
                    </button>
                    <input 
                      type="file" 
                      ref={htmlFileInputRef} 
                      className="hidden" 
                      accept=".html,.htm" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => {
                            setInputValue(re.target?.result as string);
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </div>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="<h1 style='color: navy; text-align: center'>Hello PDFA2Z</h1><p>This is a professional PDF generated from HTML.</p>"
                    className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm mb-4 custom-scrollbar"
                  />

                  <div className="w-full border border-slate-200 rounded-2xl overflow-hidden mb-6 bg-white min-h-[250px] shadow-inner">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                      <span>Live Canvas Preview</span>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                      </div>
                    </div>
                    <iframe
                      title="HTML Preview"
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <script src="https://cdn.tailwindcss.com"></script>
                            <style>
                              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                              body { 
                                font-family: 'Inter', sans-serif; 
                                padding: 2rem; 
                                color: #1e293b;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                              }
                              ${inputValue ? '' : 'body { display: flex; align-items: center; justify-content: center; height: 80vh; color: #cbd5e1; font-weight: bold; }'}
                            </style>
                          </head>
                          <body>${inputValue || 'Real-time high-fidelity preview will appear here...'}</body>
                        </html>
                      `}
                      className="w-full h-[350px] border-none"
                    />
                  </div>

                  <Button onClick={() => {
                    const win = window.open('', '_blank');
                    if (win) {
                      win.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>PDFA2Z Generated Document</title>
                            <script src="https://cdn.tailwindcss.com"></script>
                            <style>
                              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                              @page { margin: 1.5cm; size: auto; }
                              body { 
                                margin: 0; 
                                padding: 0; 
                                font-family: 'Inter', sans-serif;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color: #1e293b;
                              }
                              table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; page-break-inside: auto; }
                              tr { page-break-inside: avoid !important; page-break-after: auto; }
                              thead { display: table-header-group; }
                              th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                              th { background-color: #f8fafc; font-weight: 600; }
                              img, canvas, svg { max-width: 100%; height: auto; page-break-inside: avoid; }
                              h1, h2, h3 { color: #0f172a; page-break-after: avoid; }
                            </style>
                          </head>
                          <body class="bg-white p-8">${inputValue}</body>
                        </html>
                      `);
                      win.document.close();
                      win.focus();
                      
                      // Professional delay for complex chart initialization
                      setTimeout(() => {
                        win.print();
                      }, 2000);
                    }
                    setSuccessMsg("High-Fidelity PDF Generation Started. Please select 'Save as PDF' as your printer destination.");
                  }} className="w-full py-4 bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-100 uppercase tracking-widest font-black">
                    Convert & Download PDF
                  </Button>
                </div>
              </div>
            )}

            {['PPT_TO_PDF', 'EPUB_TO_PDF', 'MOBI_TO_PDF', 'OUTLOOK_TO_PDF', 'AZW3_TO_PDF'].includes(mode) && files.length > 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-blue-900">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <Info size={18} /> Direct Conversion Limited
                  </h3>
                  <p className="text-sm opacity-90 leading-relaxed">
                    Converting <strong>{mode.split('_')[0]}</strong> files permanently to PDF locally in the browser is challenging. We are building a secure server-side engine for this.
                  </p>
                  <div className="mt-4 pt-4 border-t border-blue-100">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Pro Tip:</p>
                    <p className="text-sm">Open your file and use <strong>File {" > "} Print {" > "} Save as PDF</strong> for a high-quality result right now.</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm opacity-50">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FileIcon size={20} /></div>
                    <span className="font-bold text-sm truncate text-slate-700">{files[0].name}</span>
                  </div>
                  <button onClick={reset}><Trash2 size={18} className="text-slate-300" /></button>
                </div>
                <Button disabled className="w-full py-6 bg-slate-400 opacity-50 cursor-not-allowed uppercase font-black tracking-widest">
                  Server Enging Coming Soon
                </Button>
              </div>
            )}

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
                      <div className="flex items-center justify-center gap-2"><Sliders size={16} /> Preset Levels</div>
                    </button>
                    <button
                      onClick={() => setCompressionMode('target')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${compressionMode === 'target' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-center gap-2"><Target size={16} /> Target Size</div>
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
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all select-none ${compressionLevel === opt.id
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
            ) : mode === 'SIGN' ? (
              <PdfSignerWorkstation 
                file={files[0]} 
                image={resultImages[0] || ''} 
                pageIndex={0} 
                totalPages={resultImages.length} 
                onSave={() => {}} 
                onCancel={reset}
                onNextPage={() => {}}
                onPrevPage={() => {}}
              />
            ) : mode === 'REDACT' ? (
              <div className="space-y-6 animate-fade-in w-full">
                {resultImages.length === 0 ? (
                  <Button onClick={handleProcess} isLoading={isProcessing} className="w-full py-6 uppercase font-black tracking-widest shadow-xl shadow-indigo-100">
                    Load PDF to Redact
                  </Button>
                ) : (
                  <div className="space-y-6 w-full">
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold flex items-center gap-2 justify-center">
                      <EyeOff size={20} /> Click a page to select redaction areas
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {resultImages.map((img, i) => (
                        <div key={i} className="relative group cursor-pointer" onClick={() => setActiveRedactPage(i)}>
                          <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-slate-200 hover:border-red-500 transition-all shadow-lg bg-slate-100">
                            <img src={img} className="w-full h-full object-contain" />

                            {/* Overlay showing number of redactions on this page */}
                            <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                              {redactionAreas.filter(a => a.pageIndex === i).length} REDACTIONS
                            </div>

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                              <div className="bg-white p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all text-red-600">
                                <EyeOff />
                              </div>
                            </div>
                          </div>
                          <div className="text-center mt-2 font-bold text-slate-500 text-sm">Page {i + 1}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 sticky bottom-4">
                      <Button onClick={handleProcess} isLoading={isProcessing} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white shadow-lg">
                        <CheckCircle2 size={20} className="mr-2" /> Apply All Redactions
                      </Button>
                      <Button onClick={reset} className="px-8 py-4 bg-white border border-slate-200 text-slate-400 font-bold hover:bg-slate-50">
                        Reset
                      </Button>
                    </div>
                  </div>
                )}

                {activeRedactPage !== null && (
                  <Redactor
                    image={resultImages[activeRedactPage]}
                    pageIndex={activeRedactPage}
                    existingAreas={redactionAreas.filter(a => a.pageIndex === activeRedactPage)}
                    onSave={(areas) => handleSaveRedactions(activeRedactPage, areas)}
                    onCancel={() => setActiveRedactPage(null)}
                    file={files[0]}
                  />
                )}
              </div>
            ) : mode === 'ORGANIZE' ? (
              <div className="space-y-6 animate-fade-in w-full">
                {organizedPages.length === 0 ? (
                  <Button onClick={handleOrganizeLoad} isLoading={isProcessing} className="w-full py-6 uppercase font-black tracking-widest shadow-xl shadow-indigo-100">
                    Load Pages to Organize
                  </Button>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-50 z-10 py-2 border-b border-slate-200">
                      <p className="font-bold text-slate-700 text-sm">
                        Total Pages: {organizedPages.filter(p => !p.isDeleted).length} / {organizedPages.length}
                      </p>
                      <Button onClick={handleProcess} isLoading={isProcessing} className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700">
                        Save Changes
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {organizedPages.map((page, i) => (
                        <div key={i} className={`relative group border-2 rounded-xl overflow-hidden transition-all bg-white ${page.isDeleted ? 'opacity-50 border-red-200 bg-red-50' : 'border-slate-200 hover:border-indigo-400'}`}>
                          {/* Page Preview with rotation */}
                          <div className="aspect-[3/4] p-2 overflow-hidden relative">
                            <img
                              src={resultImages[page.originalIndex]}
                              className="w-full h-full object-contain transition-transform"
                              style={{ transform: `rotate(${page.rotation}deg)` }}
                            />
                            {page.isDeleted && (
                              <div className="absolute inset-0 flex items-center justify-center bg-red-100/50 backdrop-blur-sm">
                                <Trash2 className="text-red-500 w-12 h-12" />
                              </div>
                            )}
                          </div>

                          {/* Controls */}
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 backdrop-blur border-t border-slate-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <button onClick={() => movePage(i, 'left')} disabled={i === 0} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronLeft size={16} /></button>
                              <button onClick={() => movePage(i, 'right')} disabled={i === organizedPages.length - 1} className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronRight size={16} /></button>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => rotatePage(i)} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded" title="Rotate"><RotateCw size={16} /></button>
                              <button onClick={() => toggleDeletePage(i)} className={`p-1.5 rounded ${page.isDeleted ? 'bg-green-100 text-green-600' : 'hover:bg-red-50 text-red-500'}`} title={page.isDeleted ? "Restore" : "Delete"}>
                                {page.isDeleted ? <CheckCircle2 size={16} /> : <Trash2 size={16} />}
                              </button>
                            </div>
                          </div>

                          {/* Page Number Badge */}
                          <div className="absolute top-2 left-2 bg-slate-900/70 text-white text-xs px-2 py-0.5 rounded-md font-bold">
                            {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : mode === 'EDIT' ? (
              <PdfEditorUI file={files[0]} onCancel={reset} />
            ) : mode === 'BATCH' ? (
              <BatchProcessor onCancel={reset} />
            ) : (
              <>
                {/* GENERIC UI FOR OTHER TOOLS */}
                {files.length > 0 && (
                  <div className="bg-white p-4 rounded-2xl border flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FileIcon size={20} /></div>
                      <span className="font-bold text-sm truncate text-slate-700">{files[0].name}</span>
                    </div>
                    <button onClick={reset}><Trash2 size={18} className="text-slate-300 hover:text-red-500 transition-colors" /></button>
                  </div>
                )}

                {(mode === 'SPLIT' || mode === 'WATERMARK' || mode === 'METADATA' || mode === 'DELETE_PAGES' || mode === 'CROP') && (
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={
                    mode === 'SPLIT' ? "Page range (e.g. 1-3)" :
                      mode === 'METADATA' ? "New PDF Title" :
                        mode === 'DELETE_PAGES' ? "Pages to remove (e.g. 1, 5)" :
                            mode === 'CROP' ? "Crop Margin (px)" :
                              "Watermark text"
                  } className="w-full bg-white border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                )}

                {mode === 'ROTATE' && (
                  <div className="flex gap-4 w-full">
                    <button onClick={() => setRotationAngle((prev: number) => (prev + 90) % 360)} className="flex-1 py-4 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl font-bold flex flex-col items-center gap-2 transition-all">
                      <RotateCw size={24} className="text-indigo-600" />
                      Rotate Right (+90°)
                    </button>
                    <div className="flex items-center justify-center font-bold text-2xl text-slate-700 w-20">
                      {rotationAngle}°
                    </div>
                  </div>
                )}

                {(mode === 'PROTECT' || mode === 'UNLOCK') && (
                  <input type="password" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter Password" className="w-full bg-white border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                )}

                <Button onClick={handleProcess} isLoading={isProcessing} className="w-full py-6 uppercase font-black tracking-widest shadow-xl shadow-indigo-100">Process File</Button>
              </>
            )}

            {successMsg && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 size={20} /> {successMsg}
                </div>
                {resultBlob && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => downloadBlob(resultBlob.blob, resultBlob.fileName)} 
                      variant="outline"
                      className="flex-1 py-4 border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <Download size={18} className="mr-2" /> Download Again
                    </Button>
                    <Button 
                      onClick={handleSaveToLibrary} 
                      isLoading={isSaving}
                      className="flex-1 py-4 bg-green-600 hover:bg-green-700 shadow-green-100"
                    >
                      <FileIcon size={18} className="mr-2" /> Save to My Library
                    </Button>
                  </div>
                )}
              </div>
            )}
            {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-center animate-fade-in">{error}</div>}

            {resultText && (
              <div className="w-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-inner overflow-hidden mt-8 animate-fade-in">
                <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Extracted Content</span>
                  <div className="flex gap-2">
                    <button onClick={handleCopyText} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors" title="Copy to clipboard">
                      <Copy size={16} />
                    </button>
                    <button onClick={handleDownloadText} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors" title="Download as .txt">
                      <DownloadIcon size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[500px] bg-white">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono leading-relaxed">{resultText}</pre>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept={
        mode === 'IMG_TO_PDF' ? "image/*" :
          mode === 'PPT_TO_PDF' ? ".ppt,.pptx" :
            mode === 'EPUB_TO_PDF' ? ".epub" :
              mode === 'MOBI_TO_PDF' ? ".mobi" :
                mode === 'AZW3_TO_PDF' ? ".azw3" :
                  mode === 'OUTLOOK_TO_PDF' ? ".msg,.eml" :
                    "application/pdf"
      } multiple={mode === 'MERGE' || mode === 'IMG_TO_PDF' || mode === 'COMPRESS'} />
    </div>
  );
};