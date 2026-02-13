
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
  },
  'rotate-pdf': {
    slug: 'rotate-pdf',
    title: 'Rotate PDF - Rotate PDF Pages Online',
    description: 'Rotate PDF pages permanently. Save your PDF with new orientation.',
    h1: 'Rotate PDF Pages',
    intro: 'Rotate specific pages or the entire document.',
    steps: ['Upload PDF', 'Select rotation angle', 'Download rotated PDF'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'ROTATE'
  },
  'protect-pdf': {
    slug: 'protect-pdf',
    title: 'Protect PDF - Encrypt PDF with Password',
    description: 'Secure your PDF files with military-grade encryption.',
    h1: 'Password Protect PDF',
    intro: 'Add a password to your PDF files securely.',
    steps: ['Upload PDF', 'Enter password', 'Download protected file'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'PROTECT'
  },
  'unlock-pdf': {
    slug: 'unlock-pdf',
    title: 'Unlock PDF - Remove PDF Password',
    description: 'Remove security restrictions and passwords from PDFs.',
    h1: 'Unlock PDF',
    intro: 'Remove passwords from PDF files instantly.',
    steps: ['Upload PDF', 'Enter owner password', 'Download unlocked file'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'UNLOCK'
  },
  'pdf-to-excel': {
    slug: 'pdf-to-excel',
    title: 'PDF to Excel - Convert PDF to XLS',
    description: 'Extract tables from PDF to Excel spreadsheets.',
    h1: 'Convert PDF to Excel',
    intro: 'Turn PDF tables into editable Excel sheets.',
    steps: ['Upload PDF', 'Wait for extraction', 'Download Excel file'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'TO_EXCEL'
  },
  'pdf-to-html': {
    slug: 'pdf-to-html',
    title: 'PDF to HTML - Convert PDF to Web Page',
    description: 'Convert PDF documents to HTML5 web pages.',
    h1: 'Convert PDF to HTML',
    intro: 'Make your PDF web-ready by converting to HTML.',
    steps: ['Upload PDF', 'Convert', 'Download HTML'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'TO_HTML'
  },
  'page-numbers': {
    slug: 'page-numbers',
    title: 'Page Numbers - Add Numbers to PDF',
    description: 'Insert page numbers into PDF document headers/footers.',
    h1: 'Add Page Numbers to PDF',
    intro: 'Number your PDF pages easily.',
    steps: ['Upload PDF', 'Select position', 'Download numbered PDF'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'PAGE_NUMBERS'
  },
  'delete-pages': {
    slug: 'delete-pages',
    title: 'Delete PDF Pages - Remove Pages Online',
    description: 'Remove unwanted pages from PDF documents.',
    h1: 'Delete Pages from PDF',
    intro: 'Select and remove specific pages from your PDF.',
    steps: ['Upload PDF', 'Enter page numbers', 'Download modified PDF'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'DELETE_PAGES'
  },
  'grayscale-pdf': {
    slug: 'grayscale-pdf',
    title: 'Grayscale PDF - Convert to Black & White',
    description: 'Convert colored PDFs to grayscale/black and white.',
    h1: 'Make PDF Grayscale',
    intro: 'Save ink by converting PDFs to grayscale.',
    steps: ['Upload PDF', 'Convert', 'Download B&W PDF'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'GRAYSCALE'
  },
  'watermark-pdf': {
    slug: 'watermark-pdf',
    title: 'Watermark PDF - Add Stamp to PDF',
    description: 'Add text or image watermarks to PDF documents.',
    h1: 'Add Watermark to PDF',
    intro: 'Protect your documents with custom watermarks.',
    steps: ['Upload PDF', 'Enter text', 'Download watermarked PDF'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'WATERMARK'
  },
  'repair-pdf': {
    slug: 'repair-pdf',
    title: 'Repair PDF - Fix Corrupted PDF',
    description: 'Recover data from damaged or corrupted PDF files.',
    h1: 'Repair Broken PDF',
    intro: 'Attempt to fix corrupted PDF files.',
    steps: ['Upload file', 'Wait for repair', 'Download fixed PDF'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'REPAIR'
  },
  'flatten-pdf': {
    slug: 'flatten-pdf',
    title: 'Flatten PDF - Merge Layers',
    description: 'Flatten PDF forms and layers into a single printable layer.',
    h1: 'Flatten PDF Document',
    intro: 'Make PDF forms non-editable by flattening them.',
    steps: ['Upload PDF', 'Flatten', 'Download result'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'FLATTEN'
  },
  'resize-image': {
    slug: 'resize-image',
    title: 'Resize Image - Change Dimensions',
    description: 'Resize JPG, PNG, WebP images by pixel or percentage.',
    h1: 'Resize Image Online',
    intro: 'Change image size without losing quality.',
    steps: ['Upload Image', 'Set dimensions', 'Download'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'RESIZE'
  },
  'convert-image': {
    slug: 'convert-image',
    title: 'Convert Image - JPG to PNG, WebP',
    description: 'Convert between common image formats like JPG, PNG, and WebP.',
    h1: 'Image Converter',
    intro: 'Convert images to different formats.',
    steps: ['Upload Image', 'Select format', 'Download'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'CONVERT'
  },
  'crop-image': {
    slug: 'crop-image',
    title: 'Crop Image - Cut Photo Online',
    description: 'Crop images to remove unwanted areas.',
    h1: 'Crop Image',
    intro: 'Trim your photos to the perfect size.',
    steps: ['Upload Image', 'Select area', 'Crop'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'CROP'
  },
  'rotate-image': {
    slug: 'rotate-image',
    title: 'Rotate Image - Flip Photo',
    description: 'Rotate images 90 degrees left or right.',
    h1: 'Rotate Image',
    intro: 'Fix image orientation instantly.',
    steps: ['Upload Image', 'Rotate', 'Download'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'ROTATE'
  },
  'meme-maker': {
    slug: 'meme-maker',
    title: 'Meme Maker - Create Memes Online',
    description: 'Add top and bottom text to images to make memes.',
    h1: 'Free Meme Generator',
    intro: 'Create funny memes in seconds.',
    steps: ['Upload Image', 'Add text', 'Download Meme'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'MEME'
  },
  'passport-photo': {
    slug: 'passport-photo',
    title: 'Passport Photo Maker - ID Photo',
    description: 'Create compliant passport, visa, and ID photos.',
    h1: 'Passport Photo Generator',
    intro: 'Make professional ID photos at home.',
    steps: ['Upload Photo', 'Select Country', 'Get Printable Sheet'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'PASSPORT'
  },
  'collage-maker': {
    slug: 'collage-maker',
    title: 'Collage Maker - Photo Grid',
    description: 'Create beautiful photo collages online.',
    h1: 'Photo Collage Maker',
    intro: 'Combine photos into stunning grids.',
    steps: ['Upload Photos', 'Choose layout', 'Download Collage'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'COLLAGE'
  },
  'compare-image': {
    slug: 'compare-image',
    title: 'Image Comparison - Before After Slider',
    description: 'Compare two images with a slider.',
    h1: 'Compare Images',
    intro: 'Visualize difference between two images.',
    steps: ['Upload 2 images', 'Use slider', 'Analyze'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'COMPARE'
  },
  'face-blur': {
    slug: 'face-blur',
    title: 'Face Blur - Privacy Tool',
    description: 'Automatically detect and blur faces in photos.',
    h1: 'Blur Faces in Photos',
    intro: 'Protect privacy by blurring faces automatically.',
    steps: ['Upload Photo', 'AI Blurs Faces', 'Download'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'FACE_BLUR'
  },
  'upscale-image': {
    slug: 'upscale-image',
    title: 'Upscale Image - AI Enhancer',
    description: 'Increase image resolution with AI upscaling.',
    h1: 'AI Image Upscaler',
    intro: 'Enhance low-res images to 2x or 4x.',
    steps: ['Upload Image', 'Wait for AI', 'Download HD'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'UPSCALE'
  },
  'round-image': {
    slug: 'round-image',
    title: 'Round Image Cropper - Circle Crop Online',
    description: 'Crop your photos into a perfect circle shape instantly.',
    h1: 'Round Image Cropper',
    intro: 'Create circular profile pictures or icons easily.',
    steps: ['Upload Photo', 'Adjust Circle', 'Download PNG'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'ROUND'
  },
  'sign-pdf': {
    slug: 'sign-pdf',
    title: 'Sign PDF - Add Signature Online',
    description: 'Draw and add your signature to PDF documents for free.',
    h1: 'Sign PDF Online',
    intro: 'Create and add electronic signatures to your PDF.',
    steps: ['Upload PDF', 'Draw Signature', 'Download Signed PDF'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'SIGN'
  },
  'compress-image': {
    slug: 'compress-image',
    title: 'Compress Image - Reduce Size',
    description: 'Reduce image file size (JPG, PNG) without quality loss.',
    h1: 'Compress Images',
    intro: 'Optimize images for the web.',
    steps: ['Upload Image', 'Compress', 'Download'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'COMPRESS'
  },
  'qr-code-generator': {
    slug: 'qr-code-generator',
    title: 'Free QR Code Generator - Create Custom QR Codes',
    description: 'Generate free custom QR codes for URLs, text, and more. Instant download, no sign-up required.',
    h1: 'Free QR Code Generator',
    intro: 'Create custom QR codes instantly for any URL or text.',
    steps: ['Enter URL or text', 'Customize (optional)', 'Download QR Code'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'QR_CODE'
  },
  'youtube-thumbnail-downloader': {
    slug: 'youtube-thumbnail-downloader',
    title: 'YouTube Thumbnail Downloader - Save HD Thumbnails',
    description: 'Download high-quality YouTube video thumbnails in 4K, HD, and more. Free and fast.',
    h1: 'YouTube Thumbnail Downloader',
    intro: 'Save high-quality thumbnails from any YouTube video.',
    steps: ['Paste YouTube URL', 'Preview Thumbnail', 'Download Image'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'YT_THUMBNAIL'
  },
  'pdf-organizer': {
    slug: 'pdf-organizer',
    title: 'Organize PDF Pages - Reorder, Rotate & Delete',
    description: 'Rearrange, rotate, and delete PDF pages online for free. Easy-to-use PDF organizer tool.',
    h1: 'Organize PDF Pages',
    intro: 'Reorder, rotate, and manage your PDF pages visually.',
    steps: ['Upload PDF', 'Drag pages to reorder', 'Rotate or delete pages', 'Save PDF'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'ORGANIZE'
  },
  'pdf-tools': {
    slug: 'pdf-tools',
    title: 'Free PDF Tools - Merge, Split, Convert & More',
    description: 'Complete suite of free online PDF tools. Merge, split, compress, convert to Word/Excel, and more.',
    h1: 'All PDF Tools',
    intro: 'Select a tool to manage your PDF documents.',
    steps: [],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'MENU'
  },
  'image-tools': {
    slug: 'image-tools',
    title: 'Free Image Tools - Resize, Crop, Convert & More',
    description: 'Online image editing tools. Resize, crop, convert DB, remove background, and generate AI images.',
    h1: 'All Image Tools',
    intro: 'Professional image editing tools for everyone.',
    steps: [],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'MENU'
  },
  'ai-tools': {
    slug: 'ai-tools',
    title: 'Free AI Tools - Writer, Generator & Chat',
    description: 'Harness the power of AI to write content, generate images, and chat with documents.',
    h1: 'AI Powered Tools',
    intro: 'Smart AI tools to boost your productivity.',
    steps: [],
    faqs: [],
    type: ToolType.AI_WRITER
  },
  'batch-resize': {
    slug: 'batch-resize',
    title: 'Batch Image Resizer - Resize Multiple Images',
    description: 'Bulk resize images at once online for free.',
    h1: 'Batch Resize Images',
    intro: 'Resize multiple images simultaneously.',
    steps: ['Upload images', 'Set dimensions', 'Download ZIP'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'BATCH_RESIZE'
  },
  'watermark-image': {
    slug: 'watermark-image',
    title: 'Watermark Image - Protect Photos',
    description: 'Add text or logo watermarks to your images.',
    h1: 'Add Watermark to Image',
    intro: 'Protect your photos with custom watermarks.',
    steps: ['Upload image', 'Add text', 'Download'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'WATERMARK'
  }
};