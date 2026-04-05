export enum ToolType {
  DASHBOARD = 'DASHBOARD',
  IMAGE_GENERATOR = 'IMAGE_GENERATOR',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  PDF_SUITE = 'PDF_SUITE',
  IMAGE_TOOLKIT = 'IMAGE_TOOLKIT',
  AI_WRITER = 'AI_WRITER',
  AI_VISION = 'AI_VISION',
  VIDEO_SUITE = 'VIDEO_SUITE',
  INFO_PAGE = 'INFO_PAGE',
  NOTARIZE = 'NOTARIZE',
}


export type PdfToolMode = 'MENU' | 'MERGE' | 'SPLIT' | 'TO_IMAGE' | 'COMPRESS' | 'IMG_TO_PDF' | 'ROTATE' | 'DELETE_PAGES' | 'EXTRACT_TEXT' | 'PAGE_NUMBERS' | 'PROTECT' | 'TO_WORD' | 'TO_EXCEL' | 'TO_HTML' | 'UNLOCK' | 'WATERMARK' | 'GRAYSCALE' | 'FLATTEN' | 'REPAIR' | 'METADATA' | 'CHAT' | 'SIGN' | 'ORGANIZE' | 'SANITIZE' | 'REVERSE' | 'EXTRACT_IMAGES' | 'EDIT' | 'CROP' | 'URL_TO_PDF' | 'PDF_TO_CSV' | 'PDF_TO_PPT' | 'PPT_TO_PDF' | 'EPUB_TO_PDF' | 'MOBI_TO_PDF' | 'AZW3_TO_PDF' | 'OUTLOOK_TO_PDF' | 'PDF_TO_TEXT' | 'REDACT';

export type ImageToolMode = 'MENU' | 'RESIZE' | 'CONVERT' | 'ROTATE' | 'COMPRESS' | 'MEME' | 'FILTER' | 'CROP' | 'UPSCALE' | 'PASSPORT' | 'REMOVE_BG' | 'OCR' | 'COLORIZE' | 'WATERMARK' | 'BATCH_RESIZE' | 'COLLAGE' | 'COMPARE' | 'FACE_BLUR' | 'ROUND' | 'QR_CODE' | 'YT_THUMBNAIL' | 'BASE64' | 'FLIP' | 'PIXELATE' | 'INVERT' | 'PROFILE_MAKER' | 'HEIC_CONVERT' | 'BLUR_IMG' | 'SHARPEN' | 'IMG_TO_SVG' | 'SPLIT_IMAGE' | 'BLACK_WHITE' | 'ADD_TEXT' | 'MAGIC_EDITOR';

export type VideoToolMode = 'MENU' | 'GENERATE' | 'CHAT' | 'DOWNLOAD';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  timestamp: number;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface ImageConfig {
  aspectRatio: AspectRatio;
  highQuality: boolean; // Triggers Pro model
}