import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
// Use local worker from node_modules via Vite's public directory or import
// For Vite, it's best to copy the worker to public or use a direct import if configured.
// Here we will use the CDN as a fallback but prefer a local structure if possible.
// Ideally, the worker should be copied to the public folder during build.
// For now, we will stick to a reliable CDN version matching the package.

// We need to use a dynamic import or ensure this doesn't break the build.
// The previous static import caused issues with Vite/Rollup executing Node-specific code.

/**
 * Resolves the PDF.js engine and configures the worker.
 */
const getPdfEngine = async () => {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
  const engine: any = (pdfjsLib as any).getDocument ? pdfjsLib : (pdfjsLib as any).default;
  if (!engine || typeof engine.getDocument !== 'function') {
    throw new Error("PDF engine failed to initialize.");
  }

  // Set worker URL to local file copied by vite-plugin-static-copy
  const PDF_WORKER_URL = `/pdf.worker.min.js`;

  if (engine.GlobalWorkerOptions) {
    engine.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
  }
  return engine;
};

const getDocumentParams = (data: Uint8Array, pdfjsLib: any) => ({
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
    console.log(`Compressed size (${compressedBytes.byteLength}) larger than original (${originalBuffer.byteLength}). Returning original.`);
    // Safe to use originalBuffer here because we passed a copy to PDF.js
    return new Uint8Array(originalBuffer);
  }

  return compressedBytes;
};

export const pdfToImages = async (file: File): Promise<string[]> => {
  const engine = await getPdfEngine();
  const arrayBuffer = await file.arrayBuffer();
  // We don't reuse arrayBuffer here after PDF.js, so no need to copy
  const loadingTask = engine.getDocument(getDocumentParams(new Uint8Array(arrayBuffer), engine));
  const pdf = await loadingTask.promise;
  const images: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
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
  return images;
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
    text += `--- Page ${i} ---\n${content.items.map((item: any) => item.str).join(' ')}\n\n`;
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
  const blob = data instanceof Blob ? data : new Blob([data as any], { type: 'application/pdf' });
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