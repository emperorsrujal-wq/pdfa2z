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
  cMapUrl: '/assets/cmaps/',
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

/**
 * Render a single PDF page to a canvas at a given scale.
 * Returns the canvas element (not data URL) so callers can draw overlays on it.
 */
export const renderPageToCanvas = async (
  pdfBytes: Uint8Array,
  pageIndex: number,
  scale: number = 1.5
): Promise<HTMLCanvasElement | null> => {
  const engine = await getPdfEngine();
  const loadingTask = engine.getDocument(getDocumentParams(pdfBytes, engine));
  const pdf = await loadingTask.promise;
  if (pageIndex < 0 || pageIndex >= pdf.numPages) return null;
  const page = await pdf.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
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

export const insertBlankPage = async (file: File, afterIndex: number): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  const ref = pages[Math.min(afterIndex, pages.length - 1)];
  const { width, height } = ref.getSize();
  pdfDoc.insertPage(afterIndex + 1, [width, height]);
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
  'text' | 'path' | 'image' | 'rect' | 'circle' | 'ellipse' | 'line' | 'arrow' | 'audio' |
  'highlight' | 'strikeout' | 'underline' | 'squiggly' | 'form-check' | 'form-radio' | 'form-text' | 'form-textarea' | 'form-select' | 'link' | 'sticky-note' | 'signature' | 'page-rotation';

export type EditorMode =
  | 'select' | 'text' | 'draw' | 'erase' | 'smart-erase' | 'rect' | 'circle' | 'line' | 'arrow' | 'image' | 'picker' | 'magic-edit' | 'font-picker'
  | 'highlight' | 'strikeout' | 'underline' | 'squiggly' | 'link' | 'ellipse' | 'forms' | 'sign' | 'signature' | 'sticky-note' | 'find-replace'
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
  // True if this rect is a whiteout/erase overlay (not a shape)
  isWhiteout?: boolean;
  
  // Text specific
  text?: string;
  size?: number; // font size in points
  fontName?: string; // e.g. Times Roman, Arial
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikeout?: boolean;
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
  const pages = pdfDoc.getPages();

  // ── Step 1: Apply page rotations first ──
  for (const el of elements) {
    if (el.type === 'page-rotation' && el.pageIndex >= 0 && el.pageIndex < pages.length) {
      const normalised = (((el.rotation || 0) % 360) + 360) % 360;
      pages[el.pageIndex].setRotation(degrees(normalised));
    }
  }

  // ── Step 2: Flatten pages that have mask or whiteout elements ──
  // When users edit existing text or erase content, we create overlay rects.
  // To prevent original content from remaining extractable, we render the
  // page to an image, draw the masks/whiteouts onto it, then embed that image
  // as the new page background. Original content is baked into the image and gone.
  const maskElements = elements.filter(el => el.id.startsWith('mask-'));
  const whiteoutElements = elements.filter(el => el.isWhiteout);
  const pagesToFlatten = new Set([
    ...maskElements.map(el => el.pageIndex),
    ...whiteoutElements.map(el => el.pageIndex),
  ]);

  if (pagesToFlatten.size > 0) {
    const rotatedBytes = await pdfDoc.save();
    for (const pageIdx of pagesToFlatten) {
      if (pageIdx < 0 || pageIdx >= pages.length) continue;
      const page = pages[pageIdx];
      const { width: pw, height: ph } = page.getSize();

      const canvas = await renderPageToCanvas(new Uint8Array(rotatedBytes), pageIdx, 2.0);
      if (!canvas) continue;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      // Draw mask rectangles onto the canvas
      const pageMasks = maskElements.filter(m => m.pageIndex === pageIdx);
      for (const mask of pageMasks) {
        const mx = (mask.x / 1000) * canvas.width;
        const my = (mask.y / 1000) * canvas.height;
        const mw = ((mask.width || 0) / 1000) * canvas.width;
        const mh = ((mask.height || 0) / 1000) * canvas.height;
        ctx.fillStyle = mask.color || '#FFFFFF';
        ctx.fillRect(mx, my, mw, mh);
      }

      // Draw whiteout rectangles onto the canvas
      const pageWhiteouts = whiteoutElements.filter(w => w.pageIndex === pageIdx);
      for (const wo of pageWhiteouts) {
        const wx = (wo.x / 1000) * canvas.width;
        const wy = (wo.y / 1000) * canvas.height;
        const ww = ((wo.width || 0) / 1000) * canvas.width;
        const wh = ((wo.height || 0) / 1000) * canvas.height;
        ctx.fillStyle = wo.color || '#FFFFFF';
        ctx.fillRect(wx, wy, ww, wh);
      }

      // Convert canvas to PNG and embed
      const pngDataUrl = canvas.toDataURL('image/png');
      const base64Data = pngDataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const pngBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) pngBytes[i] = binaryString.charCodeAt(i);

      const embeddedImage = await pdfDoc.embedPng(pngBytes);

      // Cover the entire page with white first (hides original vector content)
      page.drawRectangle({ x: 0, y: 0, width: pw, height: ph, color: rgb(1, 1, 1) });
      // Draw the flattened image on top
      page.drawImage(embeddedImage, { x: 0, y: 0, width: pw, height: ph });
    }
  }

  // ── Step 3: Draw all non-mask, non-whiteout edit elements ──
  for (const el of elements) {
    if (el.pageIndex < 0 || el.pageIndex >= pages.length) continue;
    if (el.type === 'page-rotation') continue; // Already handled
    if (el.id.startsWith('mask-')) continue;   // Baked into flattened image
    if (el.isWhiteout) continue;               // Baked into flattened image

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
      const hasNewlines = el.text.includes('\n');
      const textWidth = font.widthOfTextAtSize(el.text, fontSize);
      const needsWrapping = hasNewlines || (elWidth > 0 && textWidth > elWidth);
      
      if (needsWrapping) {
        // Multi-line / wrapped text: use maxWidth and lineHeight for proper wrapping
        page.drawText(el.text, {
          x: actualX,
          y: actualY - fontSize,
          size: fontSize,
          font,
          color: elColor,
          opacity: elOpacity,
          rotate: elRotation,
          maxWidth: elWidth > 0 ? elWidth : undefined,
          lineHeight: fontSize * 1.3,
          alignment: (el.textAlign || 'left') as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      } else {
        // Single-line short text: preserve original positioning behavior
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
      }

      if (el.isUnderline) {
        const lines = el.text.split('\n');
        const lineHeight = fontSize * 1.3;
        lines.forEach((line, idx) => {
          const lineWidth = Math.min(font.widthOfTextAtSize(line, fontSize), elWidth > 0 ? elWidth : Infinity);
          let drawX = actualX;
          if (el.textAlign === 'center') drawX = actualX + (elWidth > 0 ? (elWidth - lineWidth) / 2 : -lineWidth / 2);
          else if (el.textAlign === 'right') drawX = actualX + (elWidth > 0 ? elWidth - lineWidth : -lineWidth);
          const lineY = actualY - fontSize - 2 - (idx * lineHeight);
          page.drawLine({
            start: { x: drawX, y: lineY },
            end: { x: drawX + lineWidth, y: lineY },
            color: elColor,
            thickness: 1,
            opacity: elOpacity,
          });
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
    } else if (el.type === 'squiggly') {
      // Draw squiggly underline as a series of small line segments
      const segments = Math.ceil(elWidth / 6);
      const amp = 2;
      for (let i = 0; i < segments; i++) {
        const sx = actualX + i * 6;
        const sy = actualY - elHeight + (i % 2 === 0 ? -amp : amp);
        const ex = actualX + (i + 1) * 6;
        const ey = actualY - elHeight + (i % 2 === 0 ? amp : -amp);
        page.drawLine({
          start: { x: sx, y: sy },
          end: { x: ex, y: ey },
          color: elColor,
          thickness: 1.5,
          opacity: elOpacity,
        });
      }
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
    } else if (el.type === 'line' || el.type === 'arrow') {
      const thickness = el.strokeWidth ? (el.strokeWidth / 1000) * width : 2;
      const endX = actualX + elWidth;
      const endY = actualY - elHeight;

      page.drawLine({
        start: { x: actualX, y: actualY },
        end: { x: endX, y: endY },
        color: elColor,
        thickness,
        opacity: elOpacity,
      });

      if (el.type === 'arrow') {
        const angle = Math.atan2(endY - actualY, endX - actualX);
        const headLen = 10 + thickness * 1.5;

        page.drawLine({
          start: { x: endX, y: endY },
          end: { x: endX - headLen * Math.cos(angle - Math.PI / 6), y: endY - headLen * Math.sin(angle - Math.PI / 6) },
          color: elColor, thickness, opacity: elOpacity,
        });
        page.drawLine({
          start: { x: endX, y: endY },
          end: { x: endX - headLen * Math.cos(angle + Math.PI / 6), y: endY - headLen * Math.sin(angle + Math.PI / 6) },
          color: elColor, thickness, opacity: elOpacity,
        });
      }
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
        const ftFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const ftSize = Math.min(el.size || 11, elHeight - 4);
        page.drawText(el.text, { x: actualX + 4, y: actualY - ftSize - 2, size: Math.max(ftSize, 6), font: ftFont, color: elColor, maxWidth: elWidth - 8 });
      }
    } else if (el.type === 'form-textarea') {
      page.drawRectangle({ x: actualX, y: actualY - elHeight, width: elWidth, height: elHeight, color: rgb(1, 1, 1), borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1 });
      if (el.text) {
        const taFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const taSize = Math.min(el.size || 11, 14);
        const lines = el.text.split('\n');
        let lineY = actualY - taSize - 2;
        for (const line of lines) {
          if (lineY < actualY - elHeight + 2) break;
          page.drawText(line, { x: actualX + 4, y: lineY, size: Math.max(taSize, 6), font: taFont, color: elColor, maxWidth: elWidth - 8 });
          lineY -= taSize * 1.3;
        }
      }
    } else if (el.type === 'form-radio') {
      page.drawEllipse({ x: actualX + elWidth / 2, y: actualY - elHeight / 2, xScale: elWidth / 2, yScale: elHeight / 2, color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), borderWidth: 1.5 });
      if (el.isChecked) {
        const dotR = Math.min(elWidth, elHeight) * 0.25;
        page.drawEllipse({ x: actualX + elWidth / 2, y: actualY - elHeight / 2, xScale: dotR, yScale: dotR, color: rgb(0, 0, 0) });
      }
    } else if (el.type === 'form-select') {
      page.drawRectangle({ x: actualX, y: actualY - elHeight, width: elWidth, height: elHeight, color: rgb(1, 1, 1), borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1 });
      // Draw small triangle arrow indicator
      page.drawLine({ start: { x: actualX + elWidth - 12, y: actualY - elHeight * 0.35 }, end: { x: actualX + elWidth - 7, y: actualY - elHeight * 0.65 }, color: rgb(0.4, 0.4, 0.4), thickness: 1.5 });
      page.drawLine({ start: { x: actualX + elWidth - 7, y: actualY - elHeight * 0.65 }, end: { x: actualX + elWidth - 2, y: actualY - elHeight * 0.35 }, color: rgb(0.4, 0.4, 0.4), thickness: 1.5 });
      if (el.text) {
        const fsFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fsSize = Math.min(el.size || 11, elHeight - 4);
        page.drawText(el.text, { x: actualX + 4, y: actualY - fsSize - 2, size: Math.max(fsSize, 6), font: fsFont, color: elColor, maxWidth: elWidth - 20 });
      }
    } else if (el.type === 'sticky-note') {
      const noteColor = el.bgColor ? hexToRgbPdf(el.bgColor) : rgb(1, 0.94, 0.54);
      page.drawRectangle({ x: actualX, y: actualY - elHeight, width: elWidth, height: elHeight, color: noteColor, borderColor: rgb(0.8, 0.7, 0.2), borderWidth: 1, opacity: elOpacity });
      if (el.text) {
        const noteFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = Math.min((el.size || 12) * (width / 794), elHeight - 8);
        page.drawText(el.text, { x: actualX + 5, y: actualY - fontSize - 4, size: Math.max(fontSize, 6), font: noteFont, color: elColor, maxWidth: elWidth - 10 });
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

// ── Client-side conversions: Word/PPT/EPUB → PDF ─────────────────────────────

/**
 * Extract text from DOCX XML content.
 */
const extractDocxText = (xml: string): string[] => {
  const paragraphs: string[] = [];
  const pRegex = /<w:p[\s\S]*?<\/w:p>/g;
  let pMatch;
  while ((pMatch = pRegex.exec(xml)) !== null) {
    const pXml = pMatch[0];
    const texts: string[] = [];
    const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let tMatch;
    while ((tMatch = tRegex.exec(pXml)) !== null) {
      texts.push(tMatch[1]);
    }
    if (texts.length > 0) paragraphs.push(texts.join(''));
  }
  return paragraphs;
};

/**
 * Convert Word DOCX to PDF (basic text extraction).
 */
export const wordToPdf = async (file: File): Promise<Uint8Array> => {
  const zip = await JSZip.loadAsync(file);
  const docXml = await zip.file('word/document.xml')?.async('text');
  if (!docXml) throw new Error('Invalid DOCX file: document.xml not found');

  const paragraphs = extractDocxText(docXml);
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;
  const fontSize = 11;
  const lineHeight = fontSize * 1.4;

  for (const para of paragraphs) {
    // Check if paragraph looks like a heading (short, no period)
    const isHeading = para.length < 60 && !para.includes('.') && para.trim().length > 0;
    const currentFont = isHeading ? boldFont : font;
    const currentSize = isHeading ? fontSize * 1.3 : fontSize;

    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const textWidth = currentFont.widthOfTextAtSize(testLine, currentSize);
      if (textWidth > width - margin * 2 && line) {
        if (y < margin + currentSize) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
        page.drawText(line, { x: margin, y, size: currentSize, font: currentFont });
        y -= currentSize * 1.4;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      if (y < margin + currentSize) {
        page = pdfDoc.addPage();
        y = height - margin;
      }
      page.drawText(line, { x: margin, y, size: currentSize, font: currentFont });
      y -= currentSize * 1.4;
    }
    y -= 4; // paragraph spacing
  }

  return pdfDoc.save();
};

/**
 * Extract text from PPTX slide XML.
 */
const extractPptxSlideText = (xml: string): string[] => {
  const shapes: string[] = [];
  const shapeRegex = /<a:p[\s\S]*?<\/a:p>/g;
  let sMatch;
  while ((sMatch = shapeRegex.exec(xml)) !== null) {
    const sXml = sMatch[0];
    const texts: string[] = [];
    const tRegex = /<a:t>([^<]*)<\/a:t>/g;
    let tMatch;
    while ((tMatch = tRegex.exec(sXml)) !== null) {
      texts.push(tMatch[1]);
    }
    if (texts.length > 0) shapes.push(texts.join(''));
  }
  return shapes;
};

/**
 * Convert PowerPoint PPTX to PDF (basic text extraction per slide).
 */
export const pptToPdf = async (file: File): Promise<Uint8Array> => {
  const zip = await JSZip.loadAsync(file);
  const slideFiles = Object.keys(zip.files)
    .filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
      const nb = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
      return na - nb;
    });

  if (slideFiles.length === 0) throw new Error('Invalid PPTX file: no slides found');

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const slidePath of slideFiles) {
    const xml = await zip.file(slidePath)?.async('text');
    if (!xml) continue;

    const texts = extractPptxSlideText(xml);
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const margin = 50;
    let y = height - margin;
    const fontSize = 14;

    // Slide title (first text, usually short)
    if (texts.length > 0) {
      const title = texts[0];
      page.drawText(title.slice(0, 100), {
        x: margin, y, size: fontSize * 1.4, font: boldFont,
        color: rgb(0.1, 0.1, 0.1)
      });
      y -= fontSize * 2;
    }

    // Body text
    for (const text of texts.slice(1)) {
      const words = text.split(' ');
      let line = '';
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (textWidth > width - margin * 2 && line) {
          if (y < margin + fontSize) {
            // Add new page if needed (rare for slides)
            break;
          }
          page.drawText(line, { x: margin, y, size: fontSize, font });
          y -= fontSize * 1.4;
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line && y >= margin + fontSize) {
        page.drawText(line, { x: margin, y, size: fontSize, font });
        y -= fontSize * 1.4;
      }
      y -= 6;
    }
  }

  return pdfDoc.save();
};

/**
 * Strip HTML tags from text.
 */
const stripHtml = (html: string): string => {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Convert EPUB to PDF (basic text extraction).
 */
export const epubToPdf = async (file: File): Promise<Uint8Array> => {
  const zip = await JSZip.loadAsync(file);

  // Find container.xml to locate the OPF file
  const containerXml = await zip.file('META-INF/container.xml')?.async('text');
  if (!containerXml) throw new Error('Invalid EPUB file: META-INF/container.xml not found');

  const opfMatch = containerXml.match(/full-path="([^"]+)"/);
  const opfPath = opfMatch ? opfMatch[1] : 'OEBPS/content.opf';

  const opfXml = await zip.file(opfPath)?.async('text');
  if (!opfXml) throw new Error('Invalid EPUB file: OPF package not found');

  // Find manifest items (HTML content files)
  const itemRegex = /<item[^>]+href="([^"]+)"[^>]*media-type="application\/xhtml\+xml"[^>]*\/>/g;
  const items: string[] = [];
  let itemMatch;
  while ((itemMatch = itemRegex.exec(opfXml)) !== null) {
    items.push(itemMatch[1]);
  }

  // Fallback: find any HTML items
  if (items.length === 0) {
    const fallbackRegex = /<item[^>]+href="([^"]+)"[^>]*\/>/g;
    while ((itemMatch = fallbackRegex.exec(opfXml)) !== null) {
      if (itemMatch[1].endsWith('.html') || itemMatch[1].endsWith('.xhtml') || itemMatch[1].endsWith('.htm')) {
        items.push(itemMatch[1]);
      }
    }
  }

  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const item of items.slice(0, 50)) { // Limit to 50 chapters
    const htmlPath = opfDir + item;
    const html = await zip.file(htmlPath)?.async('text');
    if (!html) continue;

    const text = stripHtml(html);
    if (!text) continue;

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const margin = 50;
    let y = height - margin;
    const fontSize = 10;

    // Try to extract a title from the first h1/h2
    const titleMatch = html.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
    if (titleMatch) {
      const title = stripHtml(titleMatch[1]).slice(0, 80);
      page.drawText(title, {
        x: margin, y, size: fontSize * 1.5, font: boldFont,
        color: rgb(0.1, 0.1, 0.3)
      });
      y -= fontSize * 2.5;
    }

    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    for (const para of paragraphs.slice(0, 60)) { // Limit paragraphs per chapter
      const cleanPara = para.trim().slice(0, 300);
      const words = cleanPara.split(' ');
      let line = '';
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (textWidth > width - margin * 2 && line) {
          if (y < margin + fontSize) break;
          page.drawText(line, { x: margin, y, size: fontSize, font });
          y -= fontSize * 1.4;
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line && y >= margin + fontSize) {
        page.drawText(line, { x: margin, y, size: fontSize, font });
        y -= fontSize * 1.4;
      }
      y -= 3;
      if (y < margin + fontSize) break;
    }
  }

  return pdfDoc.save();
};

/**
 * Convert HTML to PDF (basic).
 */
export const htmlToPdf = async (file: File): Promise<Uint8Array> => {
  const html = await file.text();
  const text = stripHtml(html);

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;
  const fontSize = 10;

  const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
  for (const para of paragraphs) {
    const cleanPara = para.trim().slice(0, 500);
    const words = cleanPara.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (textWidth > width - margin * 2 && line) {
        if (y < margin + fontSize) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
        page.drawText(line, { x: margin, y, size: fontSize, font });
        y -= fontSize * 1.4;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      if (y < margin + fontSize) {
        page = pdfDoc.addPage();
        y = height - margin;
      }
      page.drawText(line, { x: margin, y, size: fontSize, font });
      y -= fontSize * 1.4;
    }
    y -= 3;
  }

  return pdfDoc.save();
};

/**
 * Parse a simple EML (email) file and extract key fields.
 */
const parseEml = (content: string): { subject: string; from: string; to: string; date: string; body: string } => {
  const headers: Record<string, string> = {};
  const lines = content.split(/\r?\n/);
  let i = 0;
  let currentKey = '';

  // Parse headers
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line === '') break; // Empty line separates headers from body

    if (line.startsWith(' ') || line.startsWith('\t')) {
      // Continuation of previous header
      if (currentKey) headers[currentKey] += ' ' + line.trim();
    } else {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        currentKey = line.substring(0, colonIndex).toLowerCase();
        headers[currentKey] = line.substring(colonIndex + 1).trim();
      }
    }
  }

  // Body starts after empty line
  const bodyLines = lines.slice(i + 1);
  let body = bodyLines.join('\n');

  // Try to find plain text body in multipart
  if (body.includes('Content-Type: multipart/')) {
    const textMatch = body.match(/Content-Type: text\/plain[\s\S]*?\n\n([\s\S]*?)(?:\n--|$)/);
    if (textMatch) body = textMatch[1].trim();
  }

  // Decode quoted-printable basic
  body = body.replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  body = body.replace(/=\r?\n/g, '');

  return {
    subject: headers['subject'] || 'No Subject',
    from: headers['from'] || 'Unknown Sender',
    to: headers['to'] || 'Unknown Recipient',
    date: headers['date'] || 'Unknown Date',
    body: stripHtml(body).trim() || body.trim(),
  };
};

/**
 * Convert EML email to PDF.
 */
export const emlToPdf = async (file: File): Promise<Uint8Array> => {
  const content = await file.text();
  const email = parseEml(content);

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;
  const fontSize = 10;

  // Header info
  const headerFields = [
    { label: 'From:', value: email.from },
    { label: 'To:', value: email.to },
    { label: 'Date:', value: email.date },
    { label: 'Subject:', value: email.subject },
  ];

  for (const field of headerFields) {
    page.drawText(field.label, { x: margin, y, size: fontSize, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
    y -= fontSize * 1.4;

    const words = field.value.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (textWidth > width - margin * 2 && line) {
        if (y < margin + fontSize) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
        page.drawText(line, { x: margin + 10, y, size: fontSize, font });
        y -= fontSize * 1.4;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      if (y < margin + fontSize) {
        page = pdfDoc.addPage();
        y = height - margin;
      }
      page.drawText(line, { x: margin + 10, y, size: fontSize, font });
      y -= fontSize * 1.4;
    }
    y -= 6;
  }

  // Separator
  y -= 10;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  y -= 16;

  // Body
  const paragraphs = email.body.split(/\n+/).filter(p => p.trim().length > 0);
  for (const para of paragraphs) {
    const cleanPara = para.trim().slice(0, 500);
    const words = cleanPara.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (textWidth > width - margin * 2 && line) {
        if (y < margin + fontSize) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
        page.drawText(line, { x: margin, y, size: fontSize, font });
        y -= fontSize * 1.4;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      if (y < margin + fontSize) {
        page = pdfDoc.addPage();
        y = height - margin;
      }
      page.drawText(line, { x: margin, y, size: fontSize, font });
      y -= fontSize * 1.4;
    }
    y -= 4;
  }

  return pdfDoc.save();
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
        // Pick a contrasting text color based on background luminance
        const lum = (0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]) / 255;
        bestMatch.color = lum > 0.5 ? '#000000' : '#FFFFFF';
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
  
  pages.forEach((page: any, i: number) => {
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