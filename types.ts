export enum ToolType {
  DASHBOARD = 'DASHBOARD',
  IMAGE_GENERATOR = 'IMAGE_GENERATOR',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  PDF_SUITE = 'PDF_SUITE',
  IMAGE_TOOLKIT = 'IMAGE_TOOLKIT',
  AI_WRITER = 'AI_WRITER',
  AI_VISION = 'AI_VISION',
  VIDEO_SUITE = 'VIDEO_SUITE',
}

export type PdfToolMode = 'MENU' | 'MERGE' | 'SPLIT' | 'TO_IMAGE' | 'COMPRESS' | 'IMG_TO_PDF' | 'ROTATE' | 'DELETE_PAGES' | 'EXTRACT_TEXT' | 'PAGE_NUMBERS' | 'PROTECT' | 'TO_WORD' | 'TO_EXCEL' | 'TO_HTML' | 'UNLOCK' | 'WATERMARK' | 'GRAYSCALE' | 'FLATTEN' | 'REPAIR' | 'METADATA' | 'CHAT' | 'SIGN';

export type ImageToolMode = 'MENU' | 'RESIZE' | 'CONVERT' | 'ROTATE' | 'COMPRESS' | 'MEME' | 'FILTER' | 'CROP' | 'UPSCALE' | 'PASSPORT' | 'REMOVE_BG' | 'OCR' | 'COLORIZE' | 'WATERMARK' | 'BATCH_RESIZE' | 'COLLAGE' | 'COMPARE' | 'FACE_BLUR' | 'ROUND';

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