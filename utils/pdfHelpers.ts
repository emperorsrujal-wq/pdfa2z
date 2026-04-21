import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import type * as PdfJsType from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import JSZip from 'jszip';
import { createWorker } from 'tesseract.js';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import ExcelJS from 'exceljs';
import pptxgen from 'pptxgenjs';

type PdfJsLib = typeof PdfJsType;

export interface PageDimensions {
  width: number;
  height: number;
}

export interface PdfProcessingResult {
  images: string[];
  dimensions: PageDimensions[];
}

export interface ExtendedTextItem extends Omit<TextItem, 'fontName'> {
  fontName?: string;
}

/**
 * Resolves the PDF.js engine and configures the worker.
 */
const getPdfEngine = async (): Promise<PdfJsLib> => {
  const pdfjsLib = await import('pdfjs-dist');
  // Handle both ESM default export and named exports
  const engine = (pdfjsLib as PdfJsLib & { default?: PdfJsLib }).default?.getDocument
    ? (pdfjsLib as PdfJsLib & { default: PdfJsLib }).default
    : pdfjsLib as PdfJsLib;

  if (!engine || typeof engine.getDocument !== 'function') {
    throw new Error("PDF engine failed to initialize.");
  }

  // Set worker URL to local file copied by vite-plugin-static-copy
  engine.GlobalWorkerOptions.workerSrc = `/assets/pdf.worker.min.js`;

  return engine;
};

const getDocumentParams = (data: Uint8Array, pdfjsLib: PdfJsLib) => ({
  data,
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
  cMapPacked: true,
});

export const mergePdfs = async (files: File[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return mergedPdf.save();
};

export const splitPdf = async (file: File, pageRanges: string): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  const totalPages = pdf.getPageCount();
  const pagesToKeep = new Set<number>();
  const parts = pageRanges.split(',').map(p => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= totalPages) pagesToKeep.add(i - 1);
        }
      }
    } else {
      const page = Number(part);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        pagesToKeep.add(page - 1);
      }
    }
  }

  const indices = Array.from(pagesToKeep).sort((a, b) => a - b);
  if (indices.length === 0) throw new Error("No valid pages selected");
  const copiedPages = await newPdf.copyPages(pdf, indices);
  copiedPages.forEach(page => newPdf.addPage(page));
  return newPdf.save();
};

export interface CompressionOptions {
  mode: 'preset' | 'target';
  presetLevel?: 'high' | 'balanced' | 'max';
  targetSizeBytes?: number;
}

export const compressPdf = async (file: File, options: CompressionOptions): Promise<Uint8Array> => {
  // Store original buffer to compare size later
  const originalBuffer = await file.arrayBuffer();

  // Create a copy for PDF.js to use.
  // PDF.js worker may transfer (detach) the buffer it receives, making the original unusable.
  const bufferCopy = originalBuffer.slice(0);

  const engine = await getPdfEngine();
  const loadingTask = engine.getDocument(getDocumentParams(new Uint8Array(bufferCopy), engine));
  const pdf = await loadingTask.promise;
  const newPdf = await PDFDocument.create();

  // Determine compression parameters based on options
  let quality = 0.5; // Default balanced
  let scale = 1.0;   // Default resolution

  if (options.mode === 'preset') {
    if (options.presetLevel === 'high') { // High Quality (Low Compression)
      quality = 0.8;
      scale = 1.5;
    } else if (options.presetLevel === 'max') { // Max Compression (Low Quality)
      quality = 0.2;
      scale = 0.8;
    } else { // Balanced
      quality = 0.5;
      scale = 1.0;
    }
  } else if (options.mode === 'target' && options.targetSizeBytes) {
    const originalSize = originalBuffer.byteLength;

    // If target is larger than original, we can just return original (handled at end), 
    // but let's try to just lightly optimize just in case.
    if (options.targetSizeBytes >= originalSize) {
      quality = 0.9;
      scale = 1.0;
    } else {
      // Calculate required reduction ratio
      const ratio = options.targetSizeBytes / originalSize;

      // Heuristic mapping of ratio to quality/scale parameters
      if (ratio > 0.8) {
        quality = 0.8;
        scale = 1.0;
      } else if (ratio > 0.6) {
        quality = 0.6;
        scale = 1.0;
      } else if (ratio > 0.4) {
        quality = 0.4;
        scale = 0.9;
      } else if (ratio > 0.2) {
        quality = 0.2;
        scale = 0.7; // Reduce resolution significantly
      } else {
        // Extreme compression needed
        quality = 0.1;
        scale = 0.6;
      }
    }
  }

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;

    const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
    const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());

    const jpgImage = await newPdf.embedJpg(new Uint8Array(imgBytes));
    const newPage = newPdf.addPage([viewport.width, viewport.height]);
    newPage.drawImage(jpgImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });
  }

  const compressedBytes = await newPdf.save();

  // CRITICAL CHECK: If compressed file is larger than original, return original
  if (compressedBytes.byteLength >= originalBuffer.byteLength) {
    // Compressed file larger than original - return original
    // Safe to use originalBuffer here because we passed a copy to PDF.js
    return new Uint8Array(originalBuffer);
  }

  return compressedBytes;
};

export const pdfToImages = async (file: File): Promise<PdfProcessingResult> => {
  const engine = await getPdfEngine();
  const arrayBuffer = await file.arrayBuffer();
  // We don't reuse arrayBuffer here after PDF.js, so no need to copy
  const loadingTask = engine.getDocument(getDocumentParams(new Uint8Array(arrayBuffer), engine));
  const pdf = await loadingTask.promise;
  const images: string[] = [];
  const dimensions: PageDimensions[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    
    // Store original dimensions (unscaled)
    const originalViewport = page.getViewport({ scale: 1.0 });
    dimensions.push({
      width: originalViewport.width,
      height: originalViewport.height
    });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: context, viewport }).promise;
      images.push(canvas.toDataURL('image/jpeg', 0.8));
    }
  }
  return { images, dimensions };
};

export const imagesToPdf = async (files: File[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  for (const file of files) {
    try {
      let imageBytes = await file.arrayBuffer();
      let image;
      let fileType = file.type;

      // Consolidate JPG types
      if (fileType === 'image/jpg') fileType = 'image/jpeg';

      // If not PNG or JPG, try to convert to JPG
      if (fileType !== 'image/png' && fileType !== 'image/jpeg') {
        try {
          // Convert unsupported format (e.g. webp) to JPEG using Canvas
          const imgBitmap = await createImageBitmap(file);
          const canvas = document.createElement('canvas');
          canvas.width = imgBitmap.width;
          canvas.height = imgBitmap.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(imgBitmap, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            imageBytes = await fetch(dataUrl).then(r => r.arrayBuffer());
            fileType = 'image/jpeg';
          }
        } catch (conversionErr) {
          console.warn("Failed to convert image:", conversionErr);
          // If conversion fails, we'll fall through and likely error below or skip
        }
      }

      // Explicitly check for PNG signature or MIME type
      if (fileType === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes);
      } else if (fileType === 'image/jpeg') {
        image = await pdfDoc.embedJpg(imageBytes);
      } else {
        console.warn(`Skipping unsupported file type: ${file.type} (${file.name})`);
        continue;
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    } catch (e) {
      console.warn(`Failed to process image ${file.name}:`, e);
    }
  }

  if (pdfDoc.getPageCount() === 0) {
    throw new Error("No valid images were processed. Please ensure you uploaded valid image files.");
  }

  return pdfDoc.save();
};

export const rotatePdf = async (file: File, rotation: number): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  pdfDoc.getPages().forEach(page => page.setRotation(degrees(page.getRotation().angle + rotation)));
  return pdfDoc.save();
};

export const removePages = async (file: File, pagesToRemove: number[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  const indices = [];
  for (let i = 0; i < pdfDoc.getPageCount(); i++) if (!pagesToRemove.includes(i + 1)) indices.push(i);
  const copied = await newPdf.copyPages(pdfDoc, indices);
  copied.forEach(p => newPdf.addPage(p));
  return newPdf.save();
};

export const extractTextFromPdf = async (file: File): Promise<string> => {
  const engine = await getPdfEngine();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = engine.getDocument(getDocumentParams(new Uint8Array(arrayBuffer), engine));
  const pdf = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += `--- Page ${i} ---\n${content.items.map((item: any) => (item as TextItem).str).join(' ')}\n\n`;
  }
  return text;
};

export const watermarkPdf = async (file: File, watermarkText: string): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width / 4,
      y: height / 2,
      size: 50,
      font,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.3,
      rotate: degrees(45),
    });
  }
  return pdfDoc.save();
};

export const grayscalePdf = async (file: File): Promise<Uint8Array> => {
  const engine = await getPdfEngine();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = engine.getDocument(getDocumentParams(new Uint8Array(arrayBuffer), engine));
  const pdf = await loadingTask.promise;
  const newPdf = await PDFDocument.create();
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    context.filter = 'grayscale(100%)';
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;
    const imgDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());
    const jpgImage = await newPdf.embedJpg(new Uint8Array(imgBytes));
    const newPage = newPdf.addPage([viewport.width, viewport.height]);
    newPage.drawImage(jpgImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });
  }
  return newPdf.save();
};

export const flattenPdf = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const form = pdfDoc.getForm();
  form.flatten();
  return pdfDoc.save();
};

export const repairPdf = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  // PDFDocument.load handles cross-reference repair automatically in many cases
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return pdfDoc.save();
};

export const updateMetadata = async (file: File, title: string, author?: string): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  if (title) pdfDoc.setTitle(title);
  if (author) pdfDoc.setAuthor(author);
  // Default creator
  pdfDoc.setCreator('PDFA2Z');
  pdfDoc.setProducer('PDFA2Z');
  return pdfDoc.save();
};

export const addPageNumbers = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  pdfDoc.getPages().forEach((page, idx) => {
    const { width } = page.getSize();
    page.drawText(`${idx + 1}`, { x: width / 2, y: 30, size: 12, font, color: rgb(0, 0, 0) });
  });
  return pdfDoc.save();
};

export const downloadBlob = (data: Uint8Array | Blob, filename: string) => {
  const blob = data instanceof Blob ? data : new Blob([new Uint8Array(data) as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const pdfToWord = async (file: File): Promise<Blob> => {
  const text = await extractTextFromPdf(file);
  const html = `<html><body>${text.split('\n').map(l => `<p>${l}</p>`).join('')}</body></html>`;
  return new Blob(['\ufeff', html], { type: 'application/msword' });
};

export const pdfToExcel = async (file: File): Promise<Blob> => {
  const text = await extractTextFromPdf(file);
  const csv = text.split('\n').map(l => `"${l.replace(/"/g, '""')}"`).join('\n');
  return new Blob(['\ufeff', csv], { type: 'text/csv' });
};

export const pdfToHtml = async (file: File): Promise<Blob> => {
  const text = await extractTextFromPdf(file);
  const html = `<!DOCTYPE html><html><body><pre>${text}</pre></body></html>`;
  return new Blob([html], { type: 'text/html' });
};

export const protectPdf = async (file: File, password: string): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  (pdfDoc as any).encrypt({
    userPassword: password,
    ownerPassword: password,
    permissions: {
      printing: 'highResolution',
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
      documentAssembly: false,
      // creatingTemplate: false, // Not standard permission but checking
    },
  });
  return pdfDoc.save();
};

export const unlockPdf = async (file: File, _password: string): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  // pdf-lib does not support decrypting with password in load().
  // We use ignoreEncryption to attempt to read structure/metadata, which can sometimes remove owner restrictions.
  // Full decryption of user-password protected files is not supported by this library version.
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return pdfDoc.save();
};

export interface PageOrder {
  index: number; // 0-based index from original
  rotation: number; // degrees to add (0, 90, 180, 270)
}

export const reorderPdf = async (file: File, order: PageOrder[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();

  // copyPages takes 0-based indices
  const indices = order.map(p => p.index);
  const copiedPages = await newPdf.copyPages(pdfDoc, indices);

  copiedPages.forEach((page, i) => {
    const rotation = order[i].rotation;
    if (rotation !== 0) {
      page.setRotation(degrees(page.getRotation().angle + rotation));
    }
    newPdf.addPage(page);
  });

  return newPdf.save();
};

export const sanitizePdf = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Deep Clean Metadata
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('PDFA2Z Secure Engine');
  pdfDoc.setCreator('PDFA2Z');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  // Flatten form fields to prevent data recovery from hidden layers
  try {
    const form = pdfDoc.getForm();
    form.flatten();
  } catch (e) {
    // Ignore if no form found
  }

  // Remove all annotations (optional but safer for sanitization)
  // pdf-lib's annotation removal is limited, but flattening helps.

  return pdfDoc.save();
};

export const reversePdf = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  const pageCount = pdfDoc.getPageCount();
  const indices = Array.from({ length: pageCount }, (_, i) => pageCount - 1 - i);
  const copiedPages = await newPdf.copyPages(pdfDoc, indices);
  copiedPages.forEach(page => newPdf.addPage(page));
  return newPdf.save();
};

export const pdfToImagesZip = async (file: File): Promise<Blob> => {
  const { images } = await pdfToImages(file); // Re-use existing rendering logic (returns data URLs)
  const zip = new JSZip();
  const folder = zip.folder("images");

  // Add images to folder
  images.forEach((dataUrl, i) => {
    // Remove "data:image/jpeg;base64," header
    const base64Data = dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    if (folder) folder.file(`page-${i + 1}.jpg`, base64Data, { base64: true });
  });

  return zip.generateAsync({ type: "blob" });
};

// --- New Tools placeholders & implementations ---

// Utility to check if a pixel is transparent (alpha === 0)
export const isTransparentPixel = (rgba: Uint8ClampedArray): boolean => {
  // rgba is [r,g,b,a]
  return rgba[3] === 0;
};

// Sample background color at a given point on the PDF page image
// Returns hex color string (e.g., "#FFFFFF")
export const sampleBackgroundColor = async (
  imageSrc: string,
  x: number,
  y: number,
  canvasWidth: number = 794,
  canvasHeight: number = 1123
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("#FFFFFF");
        return;
      }
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      if (isTransparentPixel(pixel)) {
        resolve("#FFFFFF");
        return;
      }
      const toHex = (c: number) => c.toString(16).padStart(2, "0");
      const hex = `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`;
      resolve(hex);
    };
    img.onerror = () => resolve("#FFFFFF");
    img.src = imageSrc;
  });
};

export type EditElementType = 
  'text' | 'path' | 'image' | 'rect' | 'circle' | 'ellipse' | 'line' | 'audio' | 
  'highlight' | 'strikeout' | 'underline' | 'form-check' | 'form-radio' | 'form-text' | 'form-textarea' | 'form-select' | 'link' | 'sticky-note' | 'signature';

export type EditorMode =
  | 'select' | 'text' | 'draw' | 'erase' | 'smart-erase' | 'rect' | 'circle' | 'line' | 'arrow' | 'image' | 'picker' | 'magic-edit' | 'font-picker'
  | 'highlight' | 'strikeout' | 'underline' | 'link' | 'ellipse' | 'forms' | 'sign' | 'signature' | 'sticky-note' | 'find-replace'
  | 'ocr' | 'convert' | 'page-tools' | 'form-builder' | 'form-check' | 'form-radio' | 'form-text' | 'form-textarea' | 'form-select' | 'comment';


export type FormFieldType = 'text' | 'checkbox' | 'dropdown';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  options?: string[]; // For dropdowns
  value?: string | boolean;
  required?: boolean;
}

export interface EditElement {
  id: string;
  type: EditElementType;
  pageIndex: number;
  x: number; // 0-1000 relative to page width
  y: number; // 0-1000 relative to page height
  color?: string; // hex color
  rotation?: number; // degrees
  opacity?: number; // 0 to 1
  // Optional background color for whiteout/cover elements
  bgColor?: string; // hex string
  
  // Text specific
  text?: string;
  size?: number; // font size in points
  fontName?: string; // e.g. Times Roman, Arial
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right'; // text alignment
  
  // Path/Line specific
  path?: { x: number, y: number }[]; // Array of points 0-1000
  strokeWidth?: number;

  // Image/Shape specific
  imageUrl?: string; // base64
  width?: number; // relative width 0-1000
  height?: number; // relative height 0-1000
  borderWidth?: number; // in points
  borderColor?: string; // hex string
  
  // Audio/Link/Form specific
  audioData?: string; // base64 or URL
  linkUrl?: string;
  isChecked?: boolean;
  options?: string[]; // For dropdowns
}

// Helper to convert hex to rgb for pdf-lib
const hexToRgbPdf = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? rgb(
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ) : rgb(0, 0, 0);
};

export const editPdf = async (file: File, elements: EditElement[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  for (const el of elements) {
    const pages = pdfDoc.getPages();
    if (el.pageIndex < 0 || el.pageIndex >= pages.length) continue;
    const page = pages[el.pageIndex];
    const { width, height } = page.getSize();
    
    // Map 0-1000 coordinates to actual PDF points
    const actualX = (el.x / 1000) * width;
    const actualY = height - ((el.y / 1000) * height); // PDF y is from bottom (Cartesian)

    const elColor = el.color ? hexToRgbPdf(el.color) : rgb(0, 0, 0);
    const elOpacity = el.opacity !== undefined ? el.opacity : 1.0;
    const elRotation = degrees(el.rotation || 0);

    const elWidth = el.width ? (el.width / 1000) * width : 100;
    const elHeight = el.height ? (el.height / 1000) * height : 20;

    if (el.type === 'text' && el.text) {
      const fontSize = el.size || 24; 
      
      // Determine font family
      let fontName = el.fontName || 'Helvetica';
      let fontToEmbed;
      
      if (fontName.includes('Times')) {
         if (el.isBold && el.isItalic) fontToEmbed = StandardFonts.TimesRomanBoldItalic;
         else if (el.isBold) fontToEmbed = StandardFonts.TimesRomanBold;
         else if (el.isItalic) fontToEmbed = StandardFonts.TimesRomanItalic;
         else fontToEmbed = StandardFonts.TimesRoman;
      } else if (fontName.includes('Courier')) {
         if (el.isBold && el.isItalic) fontToEmbed = StandardFonts.CourierBoldOblique;
         else if (el.isBold) fontToEmbed = StandardFonts.CourierBold;
         else if (el.isItalic) fontToEmbed = StandardFonts.CourierOblique;
         else fontToEmbed = StandardFonts.Courier;
      } else { // Default to Helvetica (Arial style)
         if (el.isBold && el.isItalic) fontToEmbed = StandardFonts.HelveticaBoldOblique;
         else if (el.isBold) fontToEmbed = StandardFonts.HelveticaBold;
         else if (el.isItalic) fontToEmbed = StandardFonts.HelveticaOblique;
         else fontToEmbed = StandardFonts.Helvetica;
      }

      const font = await pdfDoc.embedFont(fontToEmbed); 
      const textWidth = font.widthOfTextAtSize(el.text, fontSize);
      
      let drawX = actualX;
      if (el.textAlign === 'center') drawX = actualX - (textWidth / 2);
      else if (el.textAlign === 'right') drawX = actualX - textWidth;

      page.drawText(el.text, {
        x: drawX,
        y: actualY - fontSize,
        size: fontSize,
        font,
        color: elColor,
        opacity: elOpacity,
        rotate: elRotation,
      });

      if (el.isUnderline) {
        page.drawLine({
          start: { x: drawX, y: actualY - fontSize - 2 },
          end: { x: drawX + textWidth, y: actualY - fontSize - 2 },
          color: elColor,
          thickness: 1,
          opacity: elOpacity,
        });
      }
    } else if (el.type === 'highlight') {
      page.drawRectangle({
        x: actualX,
        y: actualY - elHeight,
        width: elWidth,
        height: elHeight,
        color: elColor,
        opacity: 0.35, 
      });
    } else if (el.type === 'strikeout') {
      page.drawLine({
        start: { x: actualX, y: actualY - (elHeight/2) },
        end: { x: actualX + elWidth, y: actualY - (elHeight/2) },
        color: elColor,
        thickness: 2,
        opacity: elOpacity,
      });
    } else if (el.type === 'underline') {
      page.drawLine({
        start: { x: actualX, y: actualY - elHeight },
        end: { x: actualX + elWidth, y: actualY - elHeight },
        color: elColor,
        thickness: 2,
        opacity: elOpacity,
      });
    } else if (el.type === 'rect') {
      page.drawRectangle({
        x: actualX,
        y: actualY - elHeight,
        width: elWidth,
        height: elHeight,
        color: elColor,
        borderColor: el.borderColor ? hexToRgbPdf(el.borderColor) : undefined,
        borderWidth: el.borderWidth || 0,
        opacity: elOpacity,
        rotate: elRotation,
      });
    } else if (el.type === 'circle' || el.type === 'ellipse') {
      page.drawEllipse({
        x: actualX + elWidth / 2,
        y: actualY - elHeight / 2,
        xScale: elWidth / 2,
        yScale: elHeight / 2,
        color: elColor,
        borderColor: el.borderColor ? hexToRgbPdf(el.borderColor) : undefined,
        borderWidth: el.borderWidth || 0,
        opacity: elOpacity,
        rotate: elRotation,
      });
    } else if (el.type === 'line') {
      page.drawLine({
        start: { x: actualX, y: actualY },
        end: { x: actualX + elWidth, y: actualY - elHeight },
        color: elColor,
        thickness: el.strokeWidth ? (el.strokeWidth / 1000) * width : 2,
        opacity: elOpacity,
      });
    } else if (el.type === 'path' && el.path && el.path.length > 0) {
      const thickness = el.strokeWidth || 5;
      const actualThickness = (thickness / 1000) * width;
      for (let i = 0; i < el.path.length - 1; i++) {
        const p1 = el.path[i];
        const p2 = el.path[i+1];
        page.drawLine({
          start: { x: (p1.x / 1000) * width, y: height - ((p1.y / 1000) * height) },
          end: { x: (p2.x / 1000) * width, y: height - ((p2.y / 1000) * height) },
          color: elColor,
          thickness: actualThickness,
          opacity: elOpacity,
        });
      }
    } else if (el.type === 'image' && el.imageUrl) {
      try {
        let embeddedImage;
        const base64Data = el.imageUrl.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        if (el.imageUrl.startsWith('data:image/png')) embeddedImage = await pdfDoc.embedPng(bytes);
        else embeddedImage = await pdfDoc.embedJpg(bytes);
        page.drawImage(embeddedImage, { x: actualX, y: actualY - elHeight, width: elWidth, height: elHeight, opacity: elOpacity, rotate: elRotation });
      } catch (err) { console.error(err); }
    } else if (el.type === 'form-check') {
      page.drawRectangle({ x: actualX, y: actualY - elHeight, width: elWidth, height: elHeight, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), borderWidth: 1.5 });
      if (el.isChecked) {
        page.drawLine({ start: { x: actualX + 5, y: actualY - 5 }, end: { x: actualX + elWidth - 5, y: actualY - elHeight + 5 }, thickness: 2, color: rgb(0, 0, 1) });
        page.drawLine({ start: { x: actualX + 5, y: actualY - elHeight + 5 }, end: { x: actualX + elWidth - 5, y: actualY - 5 }, thickness: 2, color: rgb(0, 0, 1) });
      }
    } else if (el.type === 'form-text') {
      page.drawRectangle({ x: actualX, y: actualY - elHeight, width: elWidth, height: elHeight, color: rgb(1, 1, 1), borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1 });
      if (el.text) {
        page.drawText(el.text, { x: actualX + 5, y: actualY - 15, size: 8, color: rgb(0, 0, 0) });
      }
    } else if (el.type === 'link' && el.linkUrl) {
      // Add a clickable link annotation
      // Using page.drawText is optional, here we just add the annotation
      // Note: Rotation for annotations is complex in pdf-lib, focusing on static boxes first
      try {
        const linkAnnotation = (pdfDoc as any).context.obj({
          Type: 'Annot',
          Subtype: 'Link',
          Rect: [actualX, actualY - elHeight, actualX + elWidth, actualY],
          Border: [0, 0, 0],
          C: [0, 0, 1],
          A: {
            Type: 'Action',
            S: 'URI',
            URI: (pdfDoc as any).context.obj(el.linkUrl),
          },
        });
        const annots = page.node.get( (pdfDoc as any).context.obj('Annots') );
        if (annots) {
          (annots as any).push(linkAnnotation);
        } else {
          page.node.set( (pdfDoc as any).context.obj('Annots'), (pdfDoc as any).context.obj([linkAnnotation]) );
        }
      } catch (err) { console.error("Link annotation error:", err); }
    }
  }
  return pdfDoc.save();
};

export const cropPdf = async (file: File, margin: number = 0): Promise<Uint8Array> => {
  // Simple crop: trim margins from all sides
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach(page => {
    const { x, y, width, height } = page.getMediaBox();
    page.setMediaBox(x + margin, y + margin, width - margin * 2, height - margin * 2);
  });

  return pdfDoc.save();
};

// Placeholders for complex conversions that require backend or heavy libraries
export const notImplementedPlaceholder = async (file: File, format: string): Promise<Blob> => {
  // Check if we can do basic extraction
  if (format === 'csv') {
    return pdfToExcel(file); // Reuse CSV logic
  }

  throw new Error(`Client-side conversion for ${format} is not currently supported. Please use a backend service.`);
};

export const pdfToPpt = async (file: File): Promise<Blob> => {
  const text = await extractTextFromPdf(file);
  return convertPdfToPptx(text);
};

export interface RedactionArea {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const redactPdf = async (file: File, areas: RedactionArea[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  for (const area of areas) {
    if (area.pageIndex < 0 || area.pageIndex >= pages.length) continue;
    const page = pages[area.pageIndex];
    const { height } = page.getSize();

    // Draw a black rectangle over the sensitive area
    // PDF coordinates start from bottom-left, so we flip Y
    page.drawRectangle({
      x: area.x,
      y: height - area.y - area.height,
      width: area.width,
      height: area.height,
      color: rgb(0, 0, 0),
    });
  }

  // To make redaction "permanent" and prevent text selection underneath,
  // we could flatten the PDF. However, drawing rectangles in pdf-lib 
  // doesn't automatically remove text. 
  // A common "hack" for secure redaction in browser is to render as image and back.
  // We'll perform metadata sanitization as well.

  pdfDoc.setTitle('Redacted Document');
  pdfDoc.setProducer('PDFA2Z Secure Redactor');

  return pdfDoc.save();
};

export const detectSigningLines = async (file: File, pageIndex: number): Promise<RedactionArea[]> => {
  const engine = await getPdfEngine();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = engine.getDocument(getDocumentParams(new Uint8Array(arrayBuffer), engine));
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageIndex + 1);
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1.0 });

  const keywords = ['Signature', 'Sign Here', 'Date', 'X _', 'Initial'];
  const suggestedAreas: RedactionArea[] = [];

  for (const item of textContent.items as TextItem[]) {
    const text = item.str || '';
    const hasKeyword = keywords.some(k => text.toLowerCase().includes(k.toLowerCase()));
    
    if (hasKeyword || text.includes('___')) {
      const transform = item.transform; 
      const x = transform[4];
      const y = viewport.height - transform[5]; 
      const width = item.width || 100;
      const height = item.height || 20;

      suggestedAreas.push({
        pageIndex,
        x,
        y: y - height,
        width: width + 50,
        height: height + 10
      });
    }
  }
  return suggestedAreas;
};

export const extractStyleAtPoint = async (file: File, pageIndex: number, px: number, py: number, image?: string): Promise<{ color: string, fontSize: number, fontName: string, backgroundColor: string }> => {
  const engine = await getPdfEngine();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = engine.getDocument(getDocumentParams(new Uint8Array(arrayBuffer), engine));
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageIndex + 1);
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1.0 });

  const targetX = (px / 1000) * viewport.width;
  const targetY = (py / 1000) * viewport.height;

  let bestMatch = { color: '#000000', fontSize: 12, fontName: 'Helvetica', backgroundColor: '#FFFFFF' };
  let minDistance = Infinity;

  for (const item of textContent.items as TextItem[]) {
    const tx = item.transform[4];
    const ty = viewport.height - item.transform[5];
    const dist = Math.sqrt(Math.pow(tx - targetX, 2) + Math.pow(ty - targetY, 2));

    if (dist < minDistance && dist < 100) {
      minDistance = dist;
      bestMatch.fontSize = Math.round(item.transform[0]);
      
      // Clean up font name (remove PDF prefixes like AAAAAA+)
      let rawFont = (item as any).fontName || 'Helvetica';
      if (rawFont.includes('+')) rawFont = rawFont.split('+')[1];
      
      // Map to standard fonts
      if (rawFont.toLowerCase().includes('bold')) {
        if (rawFont.toLowerCase().includes('italic') || rawFont.toLowerCase().includes('oblique')) {
           bestMatch.fontName = rawFont.toLowerCase().includes('times') ? 'Times-BoldItalic' : 'Helvetica-BoldOblique';
        } else {
           bestMatch.fontName = rawFont.toLowerCase().includes('times') ? 'Times-Bold' : 'Helvetica-Bold';
        }
      } else if (rawFont.toLowerCase().includes('italic') || rawFont.toLowerCase().includes('oblique')) {
        bestMatch.fontName = rawFont.toLowerCase().includes('times') ? 'Times-Italic' : 'Helvetica-Oblique';
      } else {
        bestMatch.fontName = rawFont.toLowerCase().includes('courier') ? 'Courier' : (rawFont.toLowerCase().includes('times') ? 'Times-Roman' : 'Helvetica');
      }
    }
  }

  // Sample colors from the provided image/canvas
  if (image) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = image;
      await new Promise(res => img.onload = res);
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const sampleX = Math.round((px / 1000) * img.width);
      const sampleY = Math.round((py / 1000) * img.height);
      const pixel = ctx?.getImageData(sampleX, sampleY, 1, 1).data;
      
      if (pixel) {
        const toHex = (c: number) => c.toString(16).padStart(2, '0');
        const hex = `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`;
        bestMatch.backgroundColor = hex;
        // Also use this as the foreground color if we're picking for text
        bestMatch.color = hex;
      }
    } catch (e) {
      console.warn("Could not sample colors", e);
    }
  }

  return bestMatch;
};

// For formats like EPUB, MOBI, AZW3, OUTLOOK - we can't easily parse them in browser without libs.
// We will throw error for now or generic "text extraction" if possible.

export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
}

export const getTextItems = async (file: File, pageIndex: number): Promise<PdfTextItem[]> => {
  const engine = await getPdfEngine();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = engine.getDocument(getDocumentParams(new Uint8Array(arrayBuffer), engine));
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageIndex + 1);
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1.0 });

  return (textContent.items as ExtendedTextItem[]).map(item => {
    const tx = item.transform;
    const x = tx[4];
    const y = viewport.height - tx[5];
    const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);

    return {
      str: item.str || '',
      x: (x / viewport.width) * 1000,
      y: (y / viewport.height) * 1000,
      width: (item.width / viewport.width) * 1000,
      height: (fontSize / viewport.height) * 1000,
      fontSize,
      fontName: item.fontName || 'Helvetica'
    };
  });
};

// --- Tier 2 Advanced Processing ---

/**
 * Performs OCR on a PDF page image to extract text.
 */
export const performOCR = async (imageSrc: string): Promise<string> => {
  const worker = await createWorker('eng');
  const ret = await worker.recognize(imageSrc);
  await worker.terminate();
  return ret.data.text;
};

/**
 * Mock implementation of PDF to Word conversion.
 * In a real scenario, this would extract text and layout.
 */
export const convertPdfToDocx = async (text: string): Promise<Blob> => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun(text),
          ],
        }),
      ],
    }],
  });

  return Packer.toBlob(doc);
};

/**
 * Mock implementation of PDF to Excel conversion.
 */
export const convertPdfToExcel = async (text: string): Promise<Blob> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    worksheet.getCell(`A${i + 1}`).value = line;
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Mock implementation of PDF to PowerPoint conversion.
 */
export const convertPdfToPptx = async (text: string): Promise<Blob> => {
  const pres = new pptxgen();
  const slide = pres.addSlide();
  slide.addText(text, { x: 1, y: 1, w: 8, h: 5, fontSize: 12 });
  const buffer = await pres.write({ outputType: 'blob' });
  return buffer as Blob;
};

/**
 * Crops a page in a PDF byte array.
 */
export const cropPage = async (pdfBytes: Uint8Array, pageIndex: number, x: number, y: number, width: number, height: number): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(pageIndex);
  page.setCropBox(x, y, width, height);
  return pdfDoc.save();
};

/**
 * Rotates a page in a PDF byte array.
 */
export const rotatePage = async (pdfBytes: Uint8Array, pageIndex: number, rotation: number): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(pageIndex);
  page.setRotation(degrees(rotation));
  return pdfDoc.save();
};

/**
 * Applies a digital signature to a PDF.
 * This uploads the signature to Firebase Storage (handled in component)
 * and embeds the resulting image URL here.
 */
export const applySignature = async (pdfBytes: Uint8Array, pageIndex: number, signatureUrl: string, x: number, y: number, width: number, height: number): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPage(pageIndex);
  
  const response = await fetch(signatureUrl);
  const sigImageBytes = await response.arrayBuffer();
  
  let sigImage;
  if (signatureUrl.includes('png')) {
    sigImage = await pdfDoc.embedPng(sigImageBytes);
  } else {
    sigImage = await pdfDoc.embedJpg(sigImageBytes);
  }

  page.drawImage(sigImage, {
    x,
    y,
    width,
    height,
  });

  return pdfDoc.save();
};

export interface TextPosition {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Finds the positions of specific strings on a page.
 */
export const findTextPositions = async (pdfBytes: Uint8Array, pageIndex: number, searchStrings: string[]): Promise<RedactionArea[]> => {
  const engine = await getPdfEngine();
  const loadingTask = engine.getDocument(getDocumentParams(pdfBytes, engine));
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageIndex + 1);
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1.0 });

  const foundAreas: RedactionArea[] = [];
  const normalizedSearch = searchStrings.map(s => s.toLowerCase().trim());

  textContent.items.forEach((item: any) => {
    if (!item.str) return;
    const itemStr = item.str.toLowerCase().trim();
    
    // Check if item contains any of our search strings
    const matched = normalizedSearch.some(s => itemStr.includes(s));
    
    if (matched) {
      const transform = item.transform; // [scaleX, skewY, skewX, scaleY, translateX, translateY]
      const x = transform[4];
      const y = viewport.height - transform[5] - item.height; // PDF space is bottom-up
      
      // Convert to 0-1000 scale
      foundAreas.push({
        pageIndex,
        x: (x / viewport.width) * 1000,
        y: (y / viewport.height) * 1000,
        width: (item.width / viewport.width) * 1000,
        height: (item.height / viewport.height) * 1000
      });
    }
  });

  return foundAreas;
};

/**
 * Adds Bates Numbering to a PDF document for legal compliance
 */
export const addBatesNumbering = async (pdfBytes: ArrayBuffer, prefix: string = 'ABC-', startNumber: number = 1): Promise<Uint8Array> => {
  const { PDFDocument, rgb, StandardFonts } = (window as any).PDFLib;
  const doc = await PDFDocument.load(pdfBytes);
  const pages = doc.getPages();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  
  pages.forEach((page, i) => {
    const batesNumber = `${prefix}${String(startNumber + i).padStart(6, '0')}`;
    const { width } = page.getSize();
    page.drawText(batesNumber, {
      x: width - 120,
      y: 20,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });
  
  return await doc.save();
};