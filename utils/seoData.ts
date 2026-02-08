
import { ToolType } from '../types.ts';

export interface ToolSEO {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  steps: string[];
  faqs: { q: string; a: string }[];
  type: ToolType;
  mode?: string;
}

export const TOOLS_REGISTRY: Record<string, ToolSEO> = {
  'home': {
    slug: '',
    title: 'PDFA2Z - Free Online PDF & AI Tools',
    description: 'All-in-one PDF and Image tools. Merge, split, compress, edit, and generate content with AI. 100% free and secure.',
    h1: 'Professional PDF & Image Tools',
    intro: 'PDFA2Z provides a complete suite of utilities to manage your documents and images. No signup required.',
    steps: [],
    faqs: [],
    type: ToolType.DASHBOARD
  },
  'merge-pdf': {
    slug: 'merge-pdf',
    title: 'Merge PDF - Combine PDF Files Online for Free',
    description: 'Combine multiple PDFs into one unified document. Fast, secure, and easy PDF merger tool.',
    h1: 'Merge PDF Files',
    intro: 'Combine multiple PDF documents into a single file with our easy-to-use tool.',
    steps: ['Upload PDF files.', 'Reorder if needed.', 'Click Process to merge.'],
    faqs: [{ q: 'Is it free?', a: 'Yes, completely free.' }],
    type: ToolType.PDF_SUITE,
    mode: 'MERGE'
  },
  'split-pdf': {
    slug: 'split-pdf',
    title: 'Split PDF - Extract Pages Online',
    description: 'Separate one PDF into multiple files or extract specific pages instantly.',
    h1: 'Split PDF Document',
    intro: 'Extract pages from your PDF documents easily.',
    steps: ['Upload PDF.', 'Enter page ranges (e.g., 1-5).', 'Download split files.'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'SPLIT'
  },
  'compress-pdf': {
    slug: 'compress-pdf',
    title: 'Compress PDF - Reduce File Size',
    description: 'Optimize PDF files for web and email without losing quality.',
    h1: 'Compress PDF Online',
    intro: 'Reduce the file size of your PDFs significantly.',
    steps: ['Upload PDF.', 'Select compression level.', 'Download optimized file.'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'COMPRESS'
  },
  'pdf-to-word': {
    slug: 'pdf-to-word',
    title: 'PDF to Word - Convert PDF to DOCX Online',
    description: 'Convert PDF documents to editable Microsoft Word files with high accuracy.',
    h1: 'Convert PDF to Word',
    intro: 'Turn your PDFs into editable Word documents.',
    steps: ['Upload PDF.', 'Wait for conversion.', 'Download DOCX file.'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'TO_WORD'
  },
  'pdf-chat': {
    slug: 'pdf-chat',
    title: 'Chat with PDF - AI Document Assistant',
    description: 'Upload PDF and chat with it. Ask questions, summarize, and analyze PDF with AI.',
    h1: 'Chat with PDF using AI',
    intro: 'Interact with your documents using advanced AI.',
    steps: ['Upload PDF.', 'Ask questions in the chat.', 'Get instant AI answers.'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'CHAT'
  },
  'ai-image-generator': {
    slug: 'ai-image-generator',
    title: 'AI Image Generator - Text to Image',
    description: 'Generate stunning artwork and realistic photos from text prompts using Gemini AI.',
    h1: 'Free AI Image Generator',
    intro: 'Create unlimited AI art from text descriptions.',
    steps: ['Enter prompt.', 'Choose style.', 'Generate and download.'],
    faqs: [],
    type: ToolType.IMAGE_GENERATOR
  },
  'remove-bg': {
    slug: 'remove-bg',
    title: 'Remove Background - Free AI Background Remover',
    description: 'Instantly remove backgrounds from images automatically with AI.',
    h1: 'Remove Image Background',
    intro: 'Make your image background transparent in seconds.',
    steps: ['Upload image.', 'AI removes background.', 'Download PNG.'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'REMOVE_BG'
  },
  'ai-writer': {
    slug: 'ai-writer',
    title: 'AI Writer - Free AI Writing Assistant',
    description: 'Write emails, fix grammar, and summarize text with AI.',
    h1: 'Free AI Writing Tool',
    intro: 'Improve your writing instantly with AI.',
    steps: ['Enter text.', 'Select mode.', 'Get results.'],
    faqs: [],
    type: ToolType.AI_WRITER
  },
  'video-downloader': {
    slug: 'video-downloader',
    title: 'Video Downloader - Download from YouTube, FB, TikTok',
    description: 'Free online video downloader. Save videos from YouTube, Facebook, Instagram, and TikTok in MP4/MP3.',
    h1: 'Universal Video Downloader',
    intro: 'Download videos from any social platform instantly.',
    steps: ['Paste video link.', 'Click Analyze.', 'Choose quality and download.'],
    faqs: [],
    type: ToolType.VIDEO_SUITE,
    mode: 'DOWNLOAD'
  },
  'video-generator': {
    slug: 'video-generator',
    title: 'AI Video Generator - Text to Video (Veo)',
    description: 'Create professional videos from text prompts using Google Veo AI model.',
    h1: 'AI Video Generator',
    intro: 'Turn text into cinematic videos with Veo.',
    steps: ['Enter video description.', 'Select aspect ratio.', 'Generate video.'],
    faqs: [],
    type: ToolType.VIDEO_SUITE,
    mode: 'GENERATE'
  }
};