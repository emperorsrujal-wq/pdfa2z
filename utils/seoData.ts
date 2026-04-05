
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
  features?: string[];
  mode?: string;
  parentSlug?: string;
  tips?: string[];
  tradeoffs?: string[];
  unique?: boolean;
  relatedGuides?: string[];
  translations?: Record<string, Partial<Omit<ToolSEO, 'slug' | 'type' | 'mode' | 'parentSlug' | 'unique' | 'translations'>>>;
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
    type: ToolType.DASHBOARD,
    translations: {
      es: {
        title: 'PDFA2Z - Herramientas Gratuitas de PDF e IA',
        description: 'Herramientas todo en uno para PDF e imágenes. Combinar, dividir, comprimir y generar contenido con IA.',
        h1: 'Herramientas Profesionales de PDF e Imagen',
        intro: 'PDFA2Z ofrece un conjunto completo de utilidades para gestionar sus documentos e imágenes. Sin registro.'
      },
      fr: {
        title: 'PDFA2Z - Outils PDF et IA Gratuits en Ligne',
        description: 'Outils PDF et Image tout-en-un. Fusionner, diviser, compresser et générer du contenu avec l\'IA.',
        h1: 'Outils PDF et Image Professionnels',
        intro: 'PDFA2Z propose une suite complète d\'utilitaires pour gérer vos documents et images. Aucun abonnement requis.'
      },
      hi: {
        title: 'PDFA2Z - मुफ्त ऑनलाइन PDF और AI टूल्स',
        description: 'ऑल-इन-वन PDF और इमेज टूल्स। AI के साथ PDF मर्ज, स्प्लिट, कंप्रेस और कंटेंट जेनरेट करें।',
        h1: 'प्रोफेशनल PDF और इमेज टूल्स',
        intro: 'PDFA2Z आपके दस्तावेज़ों और छवियों को प्रबंधित करने के लिए उपयोगिताओं का एक पूरा सूट प्रदान करता है।'
      }
    }
  },
  'about': {
    slug: 'about',
    title: 'About Us - PDF A2Z',
    description: 'Learn about PDF A2Z mission to provide free, secure, and easy-to-use PDF and image tools for everyone.',
    h1: 'About PDF A2Z',
    intro: 'We are on a mission to make document management accessible, free, and secure.',
    steps: [],
    faqs: [],
    type: ToolType.INFO_PAGE
  },
  'contact': {
    slug: 'contact',
    title: 'Contact Us - PDF A2Z Support',
    description: 'Get in touch with the PDF A2Z team for support, feedback, or inquiries.',
    h1: 'Contact Us',
    intro: 'Have a question? We are here to help.',
    steps: [],
    faqs: [],
    type: ToolType.INFO_PAGE
  },
  'privacy': {
    slug: 'privacy',
    title: 'Privacy Policy - PDF A2Z',
    description: 'Read our privacy policy to understand how we handle your data and ensure your security.',
    h1: 'Privacy Policy',
    intro: 'Your privacy is our priority.',
    steps: [],
    faqs: [],
    type: ToolType.INFO_PAGE
  },
  'terms': {
    slug: 'terms',
    title: 'Terms of Service - PDF A2Z',
    description: 'Terms and conditions for using PDF A2Z services.',
    h1: 'Terms of Service',
    intro: 'Please read our terms carefully.',
    steps: [],
    faqs: [],
    type: ToolType.INFO_PAGE
  },
  'notarize': {
    slug: 'notarize',
    title: 'Online Notary - Remote Online Notarization (RON) in 10 Minutes',
    description: 'Get your documents notarized online instantly with a licensed notary. Secure, legal, and available 24/7. No office visit required.',
    h1: 'Remote Online Notarization',
    intro: 'The fastest way to notarize your documents. Legally valid in all 50 states.',
    steps: [
      'Upload your PDF document securely.',
      'Verify your identity with a valid government ID.',
      'Connect with a live, licensed notary via video call.',
      'Download your legally notarized document instantly.'
    ],
    faqs: [
      { q: 'Is it legally valid?', a: 'Yes, Remote Online Notarization (RON) is legally valid across the United States under the SECURE Notary Act and individual state laws.' },
      { q: 'What do I need?', a: 'You need a valid government-issued ID, a device with a camera and microphone, and your document in PDF format.' },
      { q: 'How much does it cost?', a: 'Notarization starts at $45 for the first seal and one signer. Additional signers/seals are $35 each.' },
      { q: 'How long does it take?', a: 'Most sessions are completed in under 15 minutes.' }
    ],
    type: ToolType.NOTARIZE,
    features: [
      '24/7 Availability',
      'Licensed US Notaries',
      'Secure Identity Verification',
      'All 50 States Supported',
      'Encrypted Storage'
    ]
  },
  'merge-pdf': {
    slug: 'merge-pdf',
    title: 'Merge PDF Online - Combine PDF Files for Free (No. 1 iLovePDF Alternative)',
    description: 'Merge PDF documents online for free. Combine multiple PDFs into one unified file instantly. Secure, fast, and easy PDF merger without registration.',
    h1: 'Merge PDF Files Online',
    intro: 'Combine multiple PDF files into a single document in seconds. Our professional-grade PDF merger allows you to reorder pages and merge unlimited files for free. No signup, no watermarks - the perfect alternative to iLovePDF.',
    steps: [
      'Click "Upload" to select your PDF files, or drag and drop them.',
      'Drag the thumbnails to rearrange the files in your desired order.',
      'Click "Merge PDF" to combine them into one document.',
      'Download your single, unified PDF file.'
    ],
    faqs: [
      { q: 'Is it free?', a: 'Yes, PDFA2Z is completely free to use for merging files.' },
      { q: 'Is it secure?', a: 'Absolutely. We process your files locally in your browser when possible, or use secure temporary servers that delete files immediately after processing.' },
      { q: 'Can I merge PDF and JPG?', a: 'Currently this tool is for PDFs. To merge images, first use our JPG to PDF tool.' },
      { q: 'Is there a file limit?', a: 'You can merge unlimited files, provided they fit within your browser memory.' }
    ],
    features: [
      'Combine unlimited PDFs',
      'Visual Drag & Drop Reordering',
      'Secure Processing',
      'Retain Formatting',
      'Mobile Friendly'
    ],
    tips: [
      'Number your files (1.pdf, 2.pdf) before uploading to sort them automatically.',
      'Use the "Organize" mode if you need to rotate individual pages before merging.'
    ],
    relatedGuides: ['best-ilovepdf-alternative-2026', 'how-to-merge-pdfs'],
    type: ToolType.PDF_SUITE,
    mode: 'MERGE',
    translations: {
      es: {
        title: 'Combinar PDF - Unir Archivos PDF Gratis Online',
        description: 'Combina varios PDF en un solo documento. Herramienta rápida, segura y fácil de usar.',
        h1: 'Combinar Archivos PDF',
        intro: 'Une múltiples documentos PDF en un solo archivo con nuestra herramienta fácil de usar.',
        steps: ['Sube archivos PDF.', 'Reordena si es necesario.', 'Haz clic en Procesar.'],
        faqs: [{ q: '¿Es gratis?', a: 'Sí, totalmente gratis.' }]
      },
      fr: {
        title: 'Fusionner PDF - Combiner des Fichiers PDF en Ligne',
        description: 'Fusionnez plusieurs fichiers PDF en un seul document. Outil rapide, sécurisé et facile.',
        h1: 'Fusionner des PDF',
        intro: 'Combinez plusieurs documents PDF en un seul fichier grâce à notre outil simple.',
        steps: ['Téléchargez les PDF.', 'Réorganisez-les.', 'Cliquez sur Fusionner.'],
        faqs: [{ q: 'Est-ce gratuit?', a: 'Oui, totalement gratuit.' }]
      },
      hi: {
        title: 'मर्ज PDF - PDF फाइलों को मुफ्त में ऑनलाइन जोड़ें',
        description: 'कई PDF को एक दस्तावेज़ में जोड़ें। तेज़, सुरक्षित और आसान PDF मर्जर टूल।',
        h1: 'PDF फाइलें जोड़ें',
        intro: 'हमारे उपयोग में आसान टूल के साथ कई PDF दस्तावेज़ों को एक साथ जोड़ें।',
        steps: ['PDF फाइलें अपलोड करें।', 'यदि आवश्यक हो तो क्रम बदलें।', 'मर्ज करने के लिए क्लिक करें।'],
        faqs: [{ q: 'क्या यह मुफ्त है?', a: 'हाँ, पूरी तरह से मुफ्त।' }]
      }
    }
  },
  'split-pdf': {
    slug: 'split-pdf',
    title: 'Split PDF - Extract Pages & Separate Documents Online',
    description: 'Split PDF files into individual pages or extract specific ranges. Free online PDF splitter to separate PDF documents instantly.',
    h1: 'Split PDF Document',
    intro: 'Need to extract specific pages from a large PDF? Our Split PDF tool lets you separate PDF documents by range or extract every page into a new file.',
    steps: [
      'Upload your PDF document to the splitter.',
      'Enter page numbers (e.g., "1, 3, 5") or ranges (e.g., "10-20").',
      'Select "Merge extracted pages" or download separately.',
      'Click "Split PDF" to process and download.'
    ],
    faqs: [
      { q: 'Can I extract single pages?', a: 'Yes, simply enter the specific page number you need.' },
      { q: 'Can I split by range?', a: 'Yes, use the format "Start-End" (e.g., 1-5).' },
      { q: 'Will the original file be modified?', a: 'No, your original file remains untouched. We create new files from the extracted pages.' }
    ],
    features: [
      'Extract Specific Pages',
      'Split by Page Range',
      'Batch Extraction',
      'Instant Preview',
      'No Quality Loss'
    ],
    tips: [
      'Use commas to separate different ranges (e.g., "1-5, 8, 11-15").',
      'Perfect for separating invoices or receipts from a long scanned document.'
    ],
    type: ToolType.PDF_SUITE,
    mode: 'SPLIT',
    translations: {
      es: {
        title: 'Dividir PDF - Extraer Páginas Online',
        description: 'Separar un PDF en varios archivos o extraer páginas específicas al instante.',
        h1: 'Dividir Documento PDF',
        intro: 'Extrae páginas de tus documentos PDF fácilmente.',
        steps: ['Sube el PDF.', 'Ingresa rangos de página (ej. 1-5).', 'Descarga los archivos.'],
        faqs: [{ q: '¿Puedo extraer páginas sueltas?', a: 'Sí, solo ingresa el número de página.' }]
      },
      fr: {
        title: 'Diviser PDF - Extraire des Pages en Ligne',
        description: 'Séparez un PDF en plusieurs fichiers ou extrayez des pages spécifiques instantanément.',
        h1: 'Diviser un Document PDF',
        intro: 'Extrayez facilement les pages de vos documents PDF.',
        steps: ['Téléchargez le PDF.', 'Entrez les plages de pages (ex. 1-5).', 'Téléchargez les fichiers.'],
        faqs: [{ q: 'Puis-je extraire des pages uniques ?', a: 'Oui, entrez simplement le numéro de la page.' }]
      },
      hi: {
        title: 'स्प्लिट PDF - ऑनलाइन पेज निकालें',
        description: 'एक PDF को कई फाइलों में अलग करें या विशिष्ट पेजों को तुरंत निकालें।',
        h1: 'PDF दस्तावेज़ स्प्लिट करें',
        intro: 'अपने PDF दस्तावेज़ों से आसानी से पेज निकालें।',
        steps: ['PDF अपलोड करें।', 'पेज रेंज दर्ज करें (जैसे 1-5)।', 'स्प्लिट फाइलें डाउनलोड करें।'],
        faqs: [{ q: 'क्या मैं सिंगल पेज निकाल सकता हूँ?', a: 'हाँ, बस पेज नंबर दर्ज करें।' }]
      }
    }
  },
  'compress-pdf': {
    slug: 'compress-pdf',
    title: 'Compress PDF Online - Reduce File Size to 100kb & 200kb (Free)',
    description: 'Compress PDF file size online for free. Reduce PDF size to 100kb, 200kb, or 500kb without losing quality. Best PDF compressor for email and web.',
    h1: 'Compress PDF Online',
    intro: 'Shrink your PDF files without losing quality. Our smart compression algorithm optimizes images and fonts to help you reach target sizes like 100kb or 200kb for official uploads.',
    steps: [
      'Select your PDF file to compress.',
      'Choose a compression level: "Recommended" (Best quality) or "Extreme" (Smallest size).',
      'Click "Compress PDF" to reduce file size.',
      'Download your optimized, smaller PDF file.'
    ],
    faqs: [
      { q: 'How much can I reduce size?', a: 'Results vary, but we often see reductions of 50-80% for image-heavy documents.' },
      { q: 'Does it affect quality?', a: 'Our "Recommended" setting keeps quality almost identical to the original. "Extreme" may slightly reduce image quality for maximum space saving.' },
      { q: 'Can I compress multiple files?', a: 'Yes, you can upload and compress multiple PDFs at once.' }
    ],
    features: [
      'Smart Compression Algorithm',
      'Target 100kb, 200kb, 1MB',
      'Batch Compress PDFs',
      'Quality Preservation',
      'Detailed Size Report'
    ],
    tips: [
      'Use "Extreme" compression for documents that are only for screen viewing.',
      'Use "Recommended" for documents you intend to print.'
    ],
    relatedGuides: ['how-to-compress-pdf-to-100kb'],
    type: ToolType.PDF_SUITE,
    mode: 'COMPRESS',
    translations: {
      es: {
        title: 'Comprimir PDF - Reducir Tamaño de Archivo',
        description: 'Optimiza archivos PDF para web y correo electrónico sin perder calidad.',
        h1: 'Comprimir PDF Online',
        intro: 'Reduce significativamente el tamaño de tus archivos PDF.',
        steps: ['Sube el PDF.', 'Selecciona el nivel de compresión.', 'Descarga el archivo optimizado.'],
        faqs: [{ q: '¿Cuánto puedo reducir el tamaño?', a: 'Hasta un 80-90% según el contenido.' }]
      },
      fr: {
        title: 'Compresser PDF - Réduire la Taille du Fichier',
        description: 'Optimisez les fichiers PDF pour le Web et les e-mails sans perte de qualité.',
        h1: 'Compresser un PDF en Ligne',
        intro: 'Réduisez considérablement la taille de vos archivos PDF.',
        steps: ['Téléchargez le PDF.', 'Sélectionnez le niveau de compression.', 'Téléchargez le fichier.'],
        faqs: [{ q: 'De combien puis-je réduire la taille ?', a: 'Jusqu\'à 80-90% según el contenido.' }]
      },
      hi: {
        title: 'कंप्रेस PDF - फाइल का आकार कम करें',
        description: 'बिना गुणवत्ता खोए वेब और ईमेल के लिए PDF फाइलों को ऑप्टिमाइज़ करें।',
        h1: 'ऑनलाइन PDF कंप्रेस करें',
        intro: 'अपने PDF के फाइल आकार को महत्वपूर्ण रूप से कम करें।',
        steps: ['PDF अपलोड करें।', 'कंप्रेशन लेवल चुनें।', 'ऑप्टिमाइज़ फाइल डाउनलोड करें।'],
        faqs: [{ q: 'मैं साइज कितना कम कर सकता हूँ?', a: 'फाइल कंटेंट के आधार पर 80-90% तक।' }]
      }
    }
  },

  'pdf-to-word': {
    slug: 'pdf-to-word',
    title: 'PDF to Word Converter - Free Online PDF to Docx (High Quality)',
    description: 'Convert PDF to Word (Docx) online for free. Our AI-powered converter preserves editable text, tables, and original formatting perfectly.',
    h1: 'Convert PDF to Word',
    intro: 'Turn your PDF documents into fully editable Microsoft Word files. We use advanced OCR and layout reconstruction to ensure your Word docs look exactly like the original PDF.',
    steps: [
      'Upload your PDF file to convert.',
      'Wait for the PDF to Word conversion process.',
      'Download your editable Word (.docx) document.',
      'Open and edit in Microsoft Word or Google Docs.'
    ],
    faqs: [
      { q: 'Will the formatting be messed up?', a: 'We try our best to preserve the exact layout, including columns and tables.' },
      { q: 'Can I convert scanned PDFs?', a: 'Yes, but for images of text, the editable output depends on the clarity of the scan.' },
      { q: 'Is it compatible with Google Docs?', a: 'Yes, you can upload the resulting .docx, file to Google Drive and edit it there.' }
    ],
    features: [
      'High-Fidelity Conversion',
      'Table & Layout Reconstruction',
      'Paragraph Recognition',
      'Convert Scanned PDFs (OCR)',
      'No Account Needed'
    ],
    relatedGuides: ['pdf-to-word-conversion'],
    type: ToolType.PDF_SUITE,
    mode: 'TO_WORD'
  },
  'pdf-chat': {
    slug: 'pdf-chat',
    title: 'Chat with PDF - AI Document Assistant',
    description: 'Upload any PDF and chat with it using AI. Ask questions, get summaries, and extract insights from your documents instantly.',
    h1: 'Chat with PDF using AI',
    intro: 'Turn your static documents into an interactive conversation. Upload research papers, contracts, or manuals and get instant answers without reading hundreds of pages.',
    steps: [
      'Upload your PDF document.',
      'Wait for the AI to analyze the content.',
      'Type your question in the chat box (e.g., "Summarize this file").',
      'Get instant, accurate answers based on the document.'
    ],
    faqs: [
      { q: 'Does it work with scanned PDFs?', a: 'It works best with text-based PDFs. For scanned files, ensure they are clear.' },
      { q: 'Is my data private?', a: 'Yes, files are processed securely and are not used to train our models.' },
      { q: 'Can I ask about specific details?', a: 'Absolutely. You can ask for dates, names, or specific clauses within the document.' }
    ],
    features: [
      'Interactive Document Chat',
      'Instant Summarization',
      'Citation & References',
      'Multi-document Support',
      'Secure Analysis'
    ],
    relatedGuides: ['ai-chat-with-pdf'],
    type: ToolType.PDF_SUITE,
    mode: 'CHAT'
  },
  'ai-image-generator': {
    slug: 'ai-image-generator',
    title: 'Free AI Image Generator - Text to Image Online',
    description: 'Generate stunning artwork, realistic photos, and 3D assets from text prompts using Gemini AI. 100% free, unlimited generations.',
    h1: 'Free AI Image Generator',
    intro: 'Turn your imagination into reality. Describe what you want to see, and our advanced AI will generate high-quality images in seconds. Perfect for designers, marketers, and creatives.',
    steps: [
      'Enter a detailed text prompt (e.g., "A futuristic city with flying cars at sunset").',
      'Select a style (Cinematic, Anime, Digital Art, Photography).',
      'Click "Generate Images".',
      'Download your favorite creations in high resolution.'
    ],
    faqs: [
      { q: 'Is it really free?', a: 'Yes, you can generate unlimited images for free.' },
      { q: 'Can I use the images for commercial projects?', a: 'Yes, you own the rights to the images you generate.' },
      { q: 'What is the best way to write a prompt?', a: 'Be descriptive! Mention the subject, lighting, style, and mood. For example: "A cute cat, studio lighting, 4k, realistic."' }
    ],
    features: [
      'Text-to-Image Generation',
      'Multiple Art Styles',
      'High Resolution Output',
      'Fast Generation',
      'No Daily Limits'
    ],
    tips: [
      'Experiment with different styles to see how they affect the result.',
      'Use negative prompts (if available) to specify what you don\'t want in the image.'
    ],
    type: ToolType.IMAGE_GENERATOR
  },
  'remove-bg': {
    slug: 'remove-bg',
    title: 'Free Background Remover - Remove Background from Image',
    description: 'Remove background from image online for free. Automatic AI background eraser for JPG, PNG, WebP. transparent background instantly.',
    h1: 'Remove Background from Image',
    intro: 'Instantly remove the background from any photo. Our AI automatically detects the subject and creates a transparent background PNG in seconds. Perfect for e-commerce and profiles.',
    steps: [
      'Upload an image to remove the background.',
      'Wait 5 seconds for AI to auto-detect the subject.',
      'Preview your image with a transparent background.',
      'Download your high-quality PNG.'
    ],
    faqs: [
      { q: 'Is this tool really free?', a: 'Yes, PDFA2Z provides unlimited free background removals.' },
      { q: 'What image formats are supported?', a: 'We support JPG, PNG, WebP, and BMP files.' },
      { q: 'Does it work on complex hair?', a: 'Yes, our AI is trained to handle fine details like hair and fur with high precision.' },
      { q: 'Can I add a new background?', a: 'Currently, we provide a transparent PNG, which you can place on any background using our other image tools.' }
    ],
    features: [
      'Automatic AI Detection',
      'Handle Hair & Fur Details',
      'Transparent PNG Output',
      'No Watermark',
      'Unlimited Free Usage'
    ],
    tips: [
      'Ensure your subject is clearly visible for the best results.',
      'High-contrast images work best for automatic detection.'
    ],
    relatedGuides: ['remove-image-background'],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'REMOVE_BG'
  },
  'ai-writer': {
    slug: 'ai-writer',
    title: 'Free AI Writer - Content Generator & Copywriting Tool',
    description: 'Write emails, blog posts, essays, and social media captions 10x faster with AI. Fix grammar, summarize text, and generate creative content.',
    h1: 'Free AI Writing Assistant',
    intro: 'Writer\'s block is a thing of the past. Whether you need a professional email, a catchy headline, or a full article, our AI writer helps you create high-quality content instantly.',
    steps: [
      'Choose your use case (Email, Blog, Social Media, etc.).',
      'Enter a short topic or description of what you need.',
      'Select the tone (Professional, Casual, Funny).',
      'Click "Generate" and get your text.'
    ],
    faqs: [
      { q: 'Is the content unique?', a: 'Yes, our AI generates original content every time.' },
      { q: 'Can it rewrite existing text?', a: 'Yes, use the "Rewrite" or "Paraphrase" mode to improve existing content.' },
      { q: 'What languages does it support?', a: 'It supports over 30 languages including English, Spanish, French, and Hindi.' }
    ],
    features: [
      'Email & Blog Writing',
      'Grammar Correction',
      'Text Summarization',
      'Multi-language Support',
      'Tone Adjustment'
    ],
    type: ToolType.AI_WRITER
  },
  'video-downloader': {
    slug: 'video-downloader',
    title: 'Video Downloader - Download Video from YouTube, Insta, TikTok',
    description: 'Universal video downloader for YouTube, Instagram, TikTok, Facebook. Download MP4 HD videos online for free. No watermark.',
    h1: 'Universal Video Downloader',
    intro: 'Download videos from YouTube, Instagram, Facebook, TikTok, and Twitter (X) in MP4 HD or MP3. Save your favorite content for offline viewing with our free video downloader.',
    steps: [
      'Paste the video URL from YouTube, Instagram, or TikTok.',
      'Click "Analyze" to find available formats.',
      'Choose MP4 (Video) or MP3 (Audio) and quality (HD/4K).',
      'Click "Download" to save to your device.'
    ],
    faqs: [
      { q: 'Is it legal to download videos?', a: 'It is legal to download videos for personal offline use. However, you should not distribute copyrighted material without permission.' },
      { q: 'Does it work on mobile?', a: 'Yes, our tool works perfectly on iPhone (iOS) and Android browsers.' },
      { q: 'Can I download MP3 audio only?', a: 'Yes, you can extract the audio track from YouTube videos and save it as MP3.' },
      { q: 'Do you remove TikTok watermarks?', a: 'Yes, for most TikTok videos, we provide a "No Watermark" download option.' }
    ],
    features: [
      'Support for 50+ Platforms (YT, FB, Insta, TikTok)',
      '4K and HD Downloads',
      'MP3 Audio Extraction',
      'No Watermark Options',
      'Fast & Secure'
    ],
    tips: [
      'For Instagram, make sure the account is public.',
      'If the download doesn\'t start, right-click the button and select "Save Link As".'
    ],
    type: ToolType.VIDEO_SUITE,
    mode: 'DOWNLOAD'
  },
  'video-generator': {
    slug: 'video-generator',
    title: 'AI Video Generator - Text to Video Online (Free)',
    description: 'Create amazing videos from text descriptions using Google Veo. Explain your idea, and AI generates a professional video clip.',
    h1: 'Text to Video AI Generator',
    intro: 'Turn your words into motion. Our AI Video Generator uses Google\'s advanced Veo model to create cinematic clips, animations, and realistic scenes from simple text prompts.',
    steps: [
      'Enter a detailed text description of the video you want (e.g., "A cyberpunk city in rain").',
      'Select the Aspect Ratio (16:9 for YouTube, 9:16 for TikTok/Shorts).',
      'Click "Generate Video".',
      'Wait for the AI to render your unique clip.',
      'Preview and Download.'
    ],
    faqs: [
      { q: 'How long are the generated videos?', a: 'Currently, the AI generates 5-second clips. You can generate multiple clips and combine them using a video editor.' },
      { q: 'Is it copyright free?', a: 'Yes, you own the rights to the video content generated by our AI.' },
      { q: 'What is the resolution?', a: 'Videos are generated in 720p HD resolution.' }
    ],
    features: [
      'Text-to-Video generation',
      'Cinematic & Realistic Styles',
      'Multiple Aspect Ratios',
      'Powered by Google Veo',
      'No Watermark'
    ],
    tips: [
      'Be descriptive with lighting and style (e.g., "Cinematic lighting, 4k, slow motion").',
      'Mention camera movements like "Drone shot" or "Close up".'
    ],
    tradeoffs: [
      'Video generation is computationally expensive and may take 1-2 minutes.',
      'Faces in complex scenes may sometimes appear slightly distorted.'
    ],
    type: ToolType.VIDEO_SUITE,
    mode: 'GENERATE'
  },
  'magic-ai-editor': {
    slug: 'magic-ai-editor',
    title: 'Magic AI Editor - Edit Images with Generative AI',
    description: 'Transform photos using advanced Generative AI. Swap faces, change backgrounds, add objects, and edit ID cards with professional precision. 100% Free.',
    h1: 'Free Magic AI Photo Editor',
    intro: 'Unleash the power of Generative AI to magically transform your images. Whether you need to swap a face, update text on an ID card, or completely reimagine a scene, our Magic Editor does it all with simple text prompts.',
    steps: [
      'Upload your Base Image (the image you want to edit).',
      '(Optional) Upload a Reference Image for face swaps or style transfer.',
      'Select your mode: "General", "Face Swap", or "ID / Doc".',
      'Enter your instructions (e.g., "Make him smile" or "Swap face with reference").',
      'Click "Apply Magic" and download your high-quality result.'
    ],
    faqs: [
      { q: 'What can I do with Magic Editor?', a: 'You can swap faces, remove objects, change backgrounds, edit text on documents, and apply artistic styles.' },
      { q: 'Is it free?', a: 'Yes, our Magic AI tools are completely free to use online.' },
      { q: 'How does Face Swap work?', a: 'We use advanced AI to detect facial features in both images and seamlessly blend the reference face onto the target body, matching lighting and skin tone.' },
      { q: 'Can I edit ID cards?', a: 'Yes, use the "ID / Doc" mode to swap photos or change text on ID cards while maintaining the original document\'s look and feel.' }
    ],
    features: [
      'Generative Fill & Replace',
      'Realistic Face Swapping',
      'ID Card & Document Editing',
      'Style Transfer',
      'High-Resolution Output'
    ],
    tips: [
      'For best face swap results, use photos with similar angles and lighting.',
      'Be specific in your prompts (e.g., "Add a red hat" works better than "Change style").',
      'Use "ID / Doc" mode specifically for text documents to preserve fonts.'
    ],
    tradeoffs: [
      'Complex generative edits may take 10-20 seconds to process.',
      'AI might occasionally hallucinate details on very low-resolution images.'
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'MAGIC_EDITOR'
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
    description: 'Secure your PDF files with military-grade AES encryption. Add a password to prevent unauthorized access.',
    h1: 'Password Protect PDF',
    intro: 'Keep your sensitive documents safe. Add a strong password to your PDF files so only authorized people can view them.',
    steps: [
      'Upload the PDF you want to protect.',
      'Enter a strong password.',
      'Confirm the password.',
      'Click "Protect PDF" and download your encrypted file.'
    ],
    faqs: [
      { q: 'What kind of encryption is used?', a: 'We use industry-standard 128-bit or 256-bit AES encryption.' },
      { q: 'Can you recover my password if I lose it?', a: 'No. For your security, we do not store your password. Please remember it.' }
    ],
    features: [
      'Strong AES Encryption',
      'Instant Processing',
      'Client-side Options',
      'No File Storage',
      'Cross-Platform Compatibility'
    ],
    tips: ['Use a password manager to generate and save a strong, unique password.'],
    relatedGuides: ['how-to-password-protect-pdf'],
    type: ToolType.PDF_SUITE,
    mode: 'PROTECT'
  },
  'unlock-pdf': {
    slug: 'unlock-pdf',
    title: 'Unlock PDF - Remove Password Online',
    description: 'Remove security restrictions and passwords from PDFs you own. Decrypt secured PDF files instantly.',
    h1: 'Unlock PDF',
    intro: 'Forgot the editing password? Or want to remove the password from a file you access frequently? Use our Unlock PDF tool to create an unprotected copy.',
    steps: [
      'Upload the secured PDF file.',
      'If the file has an "Open Password", enter it to verify ownership.',
      'Click "Unlock PDF".',
      'Download the password-free version.'
    ],
    faqs: [
      { q: 'Can you crack a password I don\'t know?', a: 'No, this tool removes known passwords or owner restrictions. You must have the right to unlock the file.' },
      { q: 'Is it safe?', a: 'Yes, the unlocking process happens securely.' }
    ],
    features: [
      'Remove Open Passwords',
      'Remove Editing Restrictions',
      'Safe & Secure',
      'Instant Decryption',
      'No Watermark'
    ],
    type: ToolType.PDF_SUITE,
    mode: 'UNLOCK'
  },
  'pdf-to-excel': {
    slug: 'pdf-to-excel',
    title: 'PDF to Excel Converter - Convert PDF to XLS/XLSX Online',
    description: 'Convert PDF to Excel spreadsheets online for free. Extract tables from PDF to Excel (XLSX) automatically. Best PDF to Excel converter.',
    h1: 'Convert PDF to Excel',
    intro: 'Stop retyping data manually! Our PDF to Excel converter automatically detects tables in your document and converts them into editable Excel spreadsheets (.xlsx).',
    steps: [
      'Upload the PDF containing data tables.',
      'Our AI analyzes the document structure.',
      'Download your converted Excel (.xlsx) file.',
      'Open in Microsoft Excel, Numbers, or Google Sheets.'
    ],
    faqs: [
      { q: 'Does it handle multiple tables?', a: 'Yes, all detected tables will be extracted.' },
      { q: 'What happens to non-table text?', a: 'It is typically placed in cells preserving the general layout, or skipped depending on the mode.' }
    ],
    features: [
      'Smart Table Detection',
      'Preserve Number Formatting',
      'Multi-page Extraction',
      'Secure & Private',
      'XLSX Output'
    ],
    type: ToolType.PDF_SUITE,
    mode: 'TO_EXCEL'
  },
  'jpg-to-pdf': {
    slug: 'jpg-to-pdf',
    title: 'JPG to PDF - Convert Images to PDF Document',
    description: 'Convert JPG, PNG, or BMP images to PDF online for free. Merge multiple images into one PDF file. Best JPG to PDF converter.',
    h1: 'Convert JPG to PDF',
    intro: 'Turn your images into a professional PDF document. Combine multiple JPGs into a single PDF file for easy sharing and archiving.',
    steps: [
      'Upload your JPG or PNG images.',
      'Drag and drop to rearrange the order.',
      'Click "Convert to PDF".',
      'Download your new PDF document.'
    ],
    features: [
      'Support JPG, PNG, BMP',
      'Merge Multiple Images',
      'Adjust Orientation',
      'No File Limit',
      'Secure Conversion'
    ],
    faqs: [
      { q: 'Can I convert multiple images?', a: 'Yes, you can upload and merge unlimited images into one PDF.' },
      { q: 'Does it reduce quality?', a: 'We maintain the original image quality in the PDF.' }
    ],
    type: ToolType.PDF_SUITE,
    mode: 'IMAGES_TO_PDF'
  },
  'word-to-pdf': {
    slug: 'word-to-pdf',
    title: 'Word to PDF Converter - Convert Docx to PDF',
    description: 'Convert Microsoft Word documents to PDF online for free. Save Doc and Docx files as PDF instantly. Best Word to PDF converter.',
    h1: 'Convert Word to PDF',
    intro: 'Create professional PDFs from your Word documents. Preserve your formatting, fonts, and layout exactly as they appear in Microsoft Word.',
    steps: [
      'Upload your Word document (.doc, .docx).',
      'Wait for the conversion to PDF.',
      'Download your secure PDF file.'
    ],
    features: [
      'Preserve Formatting',
      'Support DOC and DOCX',
      'Fast Conversion',
      'Secure & Private'
    ],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'WORD_TO_PDF'
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
  'redact-pdf': {
    slug: 'redact-pdf',
    title: 'Redact PDF Online - Remove Sensitive Info for Free (Secure)',
    description: 'Permanently remove sensitive text and images from PDF documents. Secure, client-side PDF redaction tool for privacy.',
    h1: 'Redact & Censor PDF',
    intro: 'Protect your privacy by permanently removing sensitive information. Our redaction tool blacks out text or images so they can never be recovered. 100% secure processing in your browser.',
    steps: [
      'Upload the PDF you want to redact.',
      'Select the text or areas you want to black out.',
      'Click "Apply Redaction" to permanently erase the data.',
      'Download your secure, redacted PDF.'
    ],
    faqs: [
      { q: 'Is redaction permanent?', a: 'Yes, our tool doesn\'t just cover the text with a black box; it removes the underlying data from the PDF stream.' },
      { q: 'Can I redact images?', a: 'Currently, you can draw boxes over sensitive areas to censor them.' }
    ],
    features: [
      'Permanent Data Removal',
      'Secure Local Processing',
      'Visual Selection',
      'No Quality Loss'
    ],
    type: ToolType.PDF_SUITE,
    mode: 'REDACT'
  },
  'resize-image': {
    slug: 'resize-image',
    title: 'Resize Image - Change Photo Dimensions Online (Free)',
    description: 'Resize JPG, PNG, and WebP images by pixel dimensions or percentage online. Resize images for Instagram, Facebook, and Web.',
    h1: 'Free Online Image Resizer',
    intro: 'Change the size of your images instantly. Resize photos for social media profiles, banners, or website optimization without losing quality.',
    steps: [
      'Upload your image file.',
      'Enter new width and height in pixels or percentage.',
      'Toggle "Lock Aspect Ratio" to prevent distortion.',
      'Download your resized image.'
    ],
    features: [
      'Pixel & Percentage Resizing',
      'Lock Aspect Ratio',
      'No Quality Loss',
      'Batch Processing Supported'
    ],
    faqs: [
      { q: 'Will my image lose quality?', a: 'We use high-quality resampling algorithms to ensure your image stays sharp.' },
      { q: 'Can I resize multiple images?', a: 'Yes, use our "Batch Resize" tool for processing multiple files at once.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'RESIZE'
  },
  'convert-image': {
    slug: 'convert-image',
    title: 'Image Converter - Convert JPG to PNG, WebP, GIF',
    description: 'Convert images to JPG, PNG, WebP, BMP, or GIF online. Free image format converter for all your photos.',
    h1: 'Convert Image Format Online',
    intro: 'Need a different image format? Convert your photos instantly to JPG, PNG, WebP or other formats for compatibility with any device or website.',
    steps: [
      'Upload your image (JPG, PNG, WebP, HEIC).',
      'Select the output format (e.g., JPG to PNG).',
      'Click "Convert Image".',
      'Download your converted file.'
    ],
    features: [
      'Support JPG, PNG, WebP, GIF',
      'High-Speed Conversion',
      'Batch Conversion',
      'Secure & Private'
    ],
    faqs: [
      { q: 'Which format is best for web?', a: 'WebP offers the best balance of quality and file size for websites.' },
      { q: 'Can I convert to transparent PNG?', a: 'Yes, if your source image has transparency, converting to PNG will preserve it.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'CONVERT'
  },
  'crop-image': {
    slug: 'crop-image',
    title: 'Crop Image Online - Cut Photos Free',
    description: 'Crop images to remove unwanted areas or change aspect ratio. Free online photo cropper.',
    h1: 'Crop Image Online',
    intro: 'Trim your photos to focus on the subject. Use preset aspect ratios like 1:1 (Square), 16:9, or freeform crop.',
    steps: [
      'Upload your photo.',
      'Drag the corners of the crop box to select the area.',
      'Choose a preset ratio if needed.',
      'Click "Crop" and download.'
    ],
    features: [
      'Visual Crop Editor',
      'Preset Aspect Ratios',
      'Mobile Friendly'
    ],
    faqs: [
      { q: 'Does it reduce resolution?', a: 'The output resolution depends on the size of the cropped area.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'CROP'
  },
  'rotate-image': {
    slug: 'rotate-image',
    title: 'Rotate Image - Flip & Rotate Photos',
    description: 'Rotate images 90 degrees left or right, or flip them horizontally/vertically.',
    h1: 'Rotate Image Online',
    intro: 'Fix upside-down or sideways photos instantly. Rotate or mirror your images with a click.',
    steps: [
      'Upload your image.',
      'Use the buttons to rotate left/right or flip.',
      'Click "download" when satisfied.'
    ],
    features: [
      '90° Rotation',
      'Horizontal & Vertical Flip',
      'Lossless Rotation'
    ],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'ROTATE'
  },
  'meme-maker': {
    slug: 'meme-maker',
    title: 'Free Meme Generator - Create Funny Memes Online',
    description: 'Make your own memes instantly. Add top and bottom text to any image. No watermarks, completely free meme maker.',
    h1: 'Online Meme Generator',
    intro: 'Turn your photos into viral memes in seconds. Use our simple tool to add custom text to popular templates or your own images.',
    steps: [
      'Upload your image or select a template.',
      'Add top and bottom text strings.',
      'Adjust text size and color if needed.',
      'Click "Generate Meme" and download.'
    ],
    features: [
      'No Watermarks',
      'Custom Text Styling',
      'Works on Mobile',
      'High Quality Output'
    ],
    faqs: [
      { q: 'Is there a watermark?', a: 'No, all memes generated are 100% watermark-free.' },
      { q: 'Can I use my own images?', a: 'Yes, you can upload any JPG or PNG file to create a meme.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'MEME'
  },
  'passport-photo': {
    slug: 'passport-photo',
    title: 'Passport Photo Maker - Create ID Photos Online',
    description: 'Create biometric passport, visa, and ID photos for over 100 countries. AI automatically crops and adjusts background.',
    h1: 'Free Passport Photo Generator',
    intro: 'Save money on studio fees. Take a photo with your phone and convert it into a perfectly compliant passport or visa photo instantly.',
    steps: [
      'Upload a clear photo of yourself against a plain background.',
      'Select your country and document type (Passport, Visa, ID).',
      'Our AI automatically crops and centers the photo.',
      'Download a printable sheet or a single digital photo.'
    ],
    features: [
      'Biometric Standards Check',
      'White Background Support',
      'Printable 4x6 Inch Sheets',
      'Supports 100+ Countries'
    ],
    faqs: [
      { q: 'Is this acceptable for official documents?', a: 'Our tool follows standard biometric guidelines (dimensions, head size). However, always double-check your official government requirements.' },
      { q: 'Do you verify the photo?', a: 'We provide the correct cropping and sizing, but you must ensure your original photo has good lighting and a neutral expression.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'PASSPORT'
  },
  'collage-maker': {
    slug: 'collage-maker',
    title: 'Free Photo Collage Maker - Create Photo Grids',
    description: 'Combine multiple photos into beautiful collages. Choose from varied layouts and styles. No sign-up required.',
    h1: 'Online Photo Collage Maker',
    intro: 'Tell a story with your photos. improved collage maker lets you combine memories into stunning grids and artistic layouts.',
    steps: [
      'Upload multiple photos from your gallery.',
      'Choose a grid layout that fits your style.',
      'Adjust spacing, borders, and background colors.',
      'Download your high-resolution collage.'
    ],
    features: [
      'Drag & Drop Interface',
      'Multiple Layout Options',
      'Custom Borders & Backgrounds',
      'HD Download'
    ],
    faqs: [
      { q: 'How many photos can I add?', a: 'You can add up to 10 photos in a single collage.' },
      { q: 'Can I resize individual photos?', a: 'Yes, you can zoom and pan each photo within its cell.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'COLLAGE'
  },
  'compare-image': {
    slug: 'compare-image',
    title: 'Image Comparison Tool - Before and After Slider',
    description: 'Create interactive "Before and After" comparison images. Perfect for showcasing edits, renovations, or weight loss.',
    h1: 'Compare Images Online',
    intro: 'Visualise the difference. Upload a "Before" and "After" image to generate a side-by-side comparison with a draggable slider.',
    steps: [
      'Upload your "Before" image.',
      'Upload your "After" image.',
      'Customize the slider orientation (Horizontal/Vertical).',
      'Download the comparison as a GIF or shareable image.'
    ],
    features: [
      'Interactive Slider',
      'GIF Export',
      'Side-by-Side View',
      'Responsive Design'
    ],
    faqs: [
      { q: 'Can I export as video?', a: 'Currently we support GIF and static image export.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'COMPARE'
  },
  'face-blur': {
    slug: 'face-blur',
    title: 'Face Blur - Anonymize Faces in Photos',
    description: 'Automatically detect and blur faces in your photos to protect privacy. AI-powered face redaction tool.',
    h1: 'Blur Faces Online',
    intro: 'Privacy matters. Our AI automatically detects faces in your uploaded photos and applies a secure blur effect. Perfect for sharing public photos or news media.',
    steps: [
      'Upload your photo.',
      'Wait for AI to detect all faces.',
      'Adjust the blur intensity leveling.',
      'Download your anonymized photo.'
    ],
    features: [
      'Auto Face Detection',
      'Adjustable Blur Level',
      'Multiple Face Support',
      'Secure Processing'
    ],
    faqs: [
      { q: 'Does it work on groups?', a: 'Yes, our AI can detect and blur multiple faces in a single photo.' },
      { q: 'Can I blur only specific faces?', a: 'Currently, the tool applies blur to all detected faces for maximum privacy.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'FACE_BLUR'
  },
  'upscale-image': {
    slug: 'upscale-image',
    title: 'AI Image Upscaler - Enhance Photo Quality 4K',
    description: 'Upscale low-resolution images to 2x or 4x without losing quality using AI. Fix blurry photos and enhance details instantly.',
    h1: 'Free AI Image Upscaler',
    intro: 'Don\'t let low-resolution photos ruin your project. Our AI Image Upscaler adds missing pixels and enhances clarity to give you crisp, high-definition results up to 4K resolution.',
    steps: [
      'Upload your low-resolution image (JPG, PNG).',
      'Select your upscale factor (2x or 4x).',
      'Wait for the AI to analyze and enhance the image.',
      'Download your sharp, high-resolution photo.'
    ],
    faqs: [
      { q: 'How does AI upscaling work?', a: 'Traditional resizing simply stretches pixels, making images blurry. AI upscaling "hallucinates" realistic details based on millions of training images to create a sharp result.' },
      { q: 'What is the maximum resolution?', a: 'You can upscale images up to 4096px (4K) depending on the input size.' },
      { q: 'Can it fix blurry text?', a: 'Yes, it works exceptionally well for sharpening blurry text and logos.' }
    ],
    features: [
      '2x and 4x Upscaling',
      'Noise Reduction',
      'Face Enhancement',
      'Restore Old Photos',
      'Fix Blurriness'
    ],
    tips: [
      'Use 2x for subtle enhancement and 4x for maximum size increase.',
      'This tool is perfect for preparing old photos for printing.'
    ],
    tradeoffs: [
      'Processing 4x upscales may take up to 20-30 seconds depending on server load.',
      'Extremely small thumbnails (e.g., <100px) may not have enough data to recover perfectly.'
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'UPSCALE'
  },
  'round-image': {
    slug: 'round-image',
    title: 'Round Image Cropper - Circle Crop Online',
    description: 'Crop photos into perfect circles for profile pictures. Transparent background support. Free online tool.',
    h1: 'Round Image Cropper',
    intro: 'Create circular profile pictures instantly. Upload any photo and crop it into a perfect circle with a transparent background.',
    steps: [
      'Upload your photo (JPG, PNG).',
      'Adjust the circle selection area.',
      'Zoom and pan to perfect the crop.',
      'Download your circular image as a PNG.'
    ],
    features: [
      'Perfect Circle Crop',
      'Transparent Background',
      'Profile Picture Ready'
    ],
    faqs: [
      { q: 'Is the background transparent?', a: 'Yes, the output is a PNG file with a transparent background outside the circle.' }
    ],
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
    title: 'Batch Image Resizer - Resize Multiple Images at Once',
    description: 'Bulk resize JPG, PNG, and WebP images simultaneously. Save time by processing up to 50 images in one go.',
    h1: 'Bulk Resize Images Online',
    intro: 'Need to resize a whole album? Our batch processing tool handles multiple files instantly. Set your dimensions once and apply to all.',
    steps: [
      'Click "Upload Images" and select multiple files.',
      'Enter the target width and height.',
      'Choose to crop or fit images to the new size.',
      'Download all resized images as a ZIP file.'
    ],
    features: [
      'Process 50+ Images',
      'Download as ZIP',
      'Consistent Sizing',
      'Fast Client-Side Processing'
    ],
    faqs: [
      { q: 'Is there a limit on files?', a: 'Your browser memory is the only limit, but we recommend up to 50 files for best performance.' },
      { q: 'Are my photos uploaded?', a: 'No, batch resizing happens locally in your browser for maximum privacy.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'BATCH_RESIZE'
  },
  'watermark-image': {
    slug: 'watermark-image',
    title: 'Watermark Image Online - Add Logo or Text',
    description: 'Protect your photography with custom watermarks. Add text copyrights or logo overlays to photos online.',
    h1: 'Add Watermark to Photo',
    intro: 'Secure your creative work. Easily add transparency-adjusted logos or repeated text patterns to your images to prevent theft.',
    steps: [
      'Upload your main image.',
      'Choose "Text Watermark" or "Logo Watermark".',
      'Adjust opacity, size, and position.',
      'Download your protected image.'
    ],
    features: [
      'Text & Image Support',
      'Adjustable Opacity',
      'Tiled / Repeated Patterns',
      'Custom Fonts'
    ],
    faqs: [
      { q: 'Can I batch watermark?', a: 'Currently this tool processes one image at a time. Check back for batch updates!' },
      { q: 'Does it support transparent logos?', a: 'Yes, upload a PNG logo with transparency for the best results.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'WATERMARK'
  },
  'flip-image': {
    slug: 'flip-image',
    title: 'Flip Image Online - Mirror Photo Horizontally',
    description: 'Mirror photos horizontally or vertically. Create reflection effects or correct selfie orientation.',
    h1: 'Mirror Image Online',
    intro: 'Did your phone take a mirrored selfie? Fix it instantly with our Flip Image tool.',
    steps: [
      'Upload your photo.',
      'Click "Flip Horizontal" or "Flip Vertical".',
      'Preview the result.',
      'Download the corrected image.'
    ],
    features: [
      'Instant Mirroring',
      'Fix Selfies',
      'No Quality Loss'
    ],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'FLIP'
  },
  'pixelate-image': {
    slug: 'pixelate-image',
    title: 'Pixelate Image Tool - Censor Photos Online',
    description: 'Pixelate faces, license plates, or sensitive info. Create retro 8-bit style art effects.',
    h1: 'Pixelate Photo Online',
    intro: 'Hide sensitive details or create artistic pixel art. Adjust the block size to control the level of pixelation.',
    steps: [
      'Upload your photo.',
      'Adjust the "Pixel Size" slider.',
      'See the pixelation effect in real-time.',
      'Download the censored or stylized image.'
    ],
    features: [
      'Adjustable Block Size',
      'Censor Sensitive Info',
      'Retro Game Style'
    ],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'PIXELATE'
  },
  'invert-image': {
    slug: 'invert-image',
    title: 'Invert Colors Online - Negative Photo Effect',
    description: 'Invert image colors to make a negative. Turn white to black and black to white instantly.',
    h1: 'Negative Image Generator',
    intro: 'Create a "camera negative" effect by inverting all colors in your photo. Useful for analyzing contrasts or artistic effects.',
    steps: [
      'Upload your image.',
      'The tool automatically inverts the colors.',
      'Download the negative image.'
    ],
    features: [
      'Instant Negative Effect',
      'High Contrast Analysis',
      'Artistic Filters'
    ],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'INVERT'
  },
  'extract-images': {
    slug: 'extract-images',
    title: 'Extract Images from PDF - Save All Images',
    description: 'Extract all images from a PDF file and save them as a ZIP archive.',
    h1: 'Extract Images from PDF',
    intro: 'Get all images from your PDF document in high quality.',
    steps: ['Upload PDF', 'Wait for extraction', 'Download ZIP file'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'EXTRACT_IMAGES'
  },
  'reverse-pdf': {
    slug: 'reverse-pdf',
    title: 'Reverse PDF - Reverse Page Order',
    description: 'Reverse the order of pages in your PDF document instantly.',
    h1: 'Reverse PDF Pages',
    intro: 'Flip the order of pages in your PDF file.',
    steps: ['Upload PDF', 'Click Process', 'Download reversed PDF'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'REVERSE'
  },
  'edit-pdf': {
    slug: 'edit-pdf',
    title: 'Edit PDF Online - Add Text and Draw on PDFs Free',
    description: 'Free online PDF editor. Add text, draw shapes, and annotate your PDF files directly in your browser. Fast, secure, and interactive PDF editing.',
    h1: 'Edit PDF Files Online',
    intro: 'Add text, drawings, and annotations to your PDF documents instantly. Our interactive visual editor makes modifying your PDFs easier than ever.',
    steps: [
      'Upload the PDF file you want to edit.',
      'Select a page from the gallery to open the interactive canvas.',
      'Use the Pen to draw, or select the Text Tool to add text.',
      'Save your changes and click "Download Edited PDF".'
    ],
    faqs: [
      { q: 'Is it free?', a: 'Yes, our PDF Editor is completely free to use.' },
      { q: 'Does it work on mobile?', a: 'Yes, you can tap and draw on any modern mobile device.' }
    ],
    features: [
      'Interactive Canvas Editor',
      'Add & Drag Custom Text',
      'Freehand Drawing (Pen)',
      'Secure Browser Processing'
    ],
    type: ToolType.PDF_SUITE,
    mode: 'EDIT'
  },
  'crop-pdf': {
    slug: 'crop-pdf',
    title: 'Crop PDF - Trim Margins Online',
    description: 'Crop PDF pages to remove margins or white space.',
    h1: 'Crop PDF Pages',
    intro: 'Trim unwanted areas from your PDF pages.',
    steps: ['Upload PDF', 'Set crop margin', 'Download cropped PDF'],
    faqs: [
      { q: 'Does it crop all pages?', a: 'Yes, the crop is applied to all pages.' }
    ],
    features: ['Visual margin adjustment', 'Crop all pages', 'Instant download'],
    type: ToolType.PDF_SUITE,
    mode: 'CROP'
  },
  'pdf-to-csv': {
    slug: 'pdf-to-csv',
    title: 'PDF to CSV - Extract Data Tables',
    description: 'Convert PDF data and tables to CSV format for Excel.',
    h1: 'Convert PDF to CSV',
    intro: 'Extract tables from PDF to CSV.',
    steps: ['Upload PDF', 'Click Convert', 'Download CSV'],
    faqs: [
      { q: 'Can it handle scanned PDFs?', a: 'For scanned PDFs you might need an OCR tool.' }
    ],
    features: ['Extract tabular data', 'Excel compatible CSV', 'Fast conversion'],
    type: ToolType.PDF_SUITE,
    mode: 'PDF_TO_CSV'
  },
  'url-to-pdf': {
    slug: 'url-to-pdf',
    title: 'URL to PDF - Convert Webpage to PDF',
    description: 'Save any webpage as a PDF document.',
    h1: 'Convert URL to PDF',
    intro: 'Turn web pages into PDF documents.',
    steps: ['Open Webpage', 'Print (Ctrl+P)', 'Save as PDF'],
    faqs: [
      { q: 'Do I need software?', a: 'No, just your browser.' }
    ],
    features: ['Convert any website', 'Maintain layout', 'No installation needed'],
    type: ToolType.PDF_SUITE,
    mode: 'URL_TO_PDF'
  },
  'pdf-to-ppt': {
    slug: 'pdf-to-ppt',
    title: 'PDF to PowerPoint - Convert PDF to PPTX',
    description: 'Convert PDF presentations to editable PowerPoint slides.',
    h1: 'Convert PDF to PowerPoint',
    intro: 'Turn your PDF slides into PowerPoint presentations.',
    steps: ['Upload PDF', 'Convert', 'Download PPTX'],
    faqs: [],
    features: ['Convert slides', 'Editable PPTX', 'Preserve text'],
    type: ToolType.PDF_SUITE,
    mode: 'PDF_TO_PPT'
  },
  'ppt-to-pdf': {
    slug: 'ppt-to-pdf',
    title: 'PowerPoint to PDF - Convert PPT to PDF',
    description: 'Convert PowerPoint presentations (PPT, PPTX) to PDF.',
    h1: 'Convert PowerPoint to PDF',
    intro: 'Save your slides as a PDF document.',
    steps: ['Upload PPT', 'Convert', 'Download PDF'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'PPT_TO_PDF'
  },
  'epub-to-pdf': {
    slug: 'epub-to-pdf',
    title: 'EPUB to PDF - Convert eBook to PDF',
    description: 'Convert EPUB eBooks to universal PDF format.',
    h1: 'Convert EPUB to PDF',
    intro: 'Read your eBooks on any device by converting to PDF.',
    steps: ['Upload EPUB', 'Convert', 'Download PDF'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'EPUB_TO_PDF'
  },
  'mobi-to-pdf': {
    slug: 'mobi-to-pdf',
    title: 'MOBI to PDF - Convert Kindle to PDF',
    description: 'Convert MOBI files to PDF format.',
    h1: 'Convert MOBI to PDF',
    intro: 'Convert Kindle eBooks to PDF easily.',
    steps: ['Upload MOBI', 'Convert', 'Download PDF'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'MOBI_TO_PDF'
  },
  'outlook-to-pdf': {
    slug: 'outlook-to-pdf',
    title: 'Outlook to PDF - Convert MSG/EML to PDF',
    description: 'Convert Outlook emails (MSG, EML) to PDF documents.',
    h1: 'Convert Email to PDF',
    intro: 'Save your emails as PDF files for archiving.',
    steps: ['Upload File', 'Convert', 'Download PDF'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'OUTLOOK_TO_PDF'
  },
  'pdf-to-text': {
    slug: 'pdf-to-text',
    title: 'PDF to Text - Extract Plain Text',
    description: 'Extract all text content from a PDF file.',
    h1: 'Extract Text from PDF',
    intro: 'Get the plain text from your PDF documents.',
    steps: ['Upload PDF', 'Extract', 'Copy Text'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'EXTRACT_TEXT'
  },
  'profile-picture-maker': {
    slug: 'profile-picture-maker',
    title: 'Free Profile Picture Maker - Border & Circle Crop',
    description: 'Create professional profile pictures for LinkedIn, Instagram, and more. Add colorful borders and circle crops instantly.',
    h1: 'Profile Picture Maker',
    intro: 'Stand out on social media. Create a perfect circular profile photo with custom borders and backgrounds.',
    steps: [
      'Upload your photo.',
      'Adjust the zoom and position.',
      'Choose a border color and thickness.',
      'Download your new profile picture.'
    ],
    features: [
      'Custom Borders',
      'Circle Crop',
      'Professional Templates',
      'Instant Preview'
    ],
    faqs: [
      { q: 'What is the best size for profile pics?', a: 'Most platforms use 400x400px. We output high-resolution images suitable for all social media.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'PROFILE_MAKER'
  },
  'sharpen-image': {
    slug: 'sharpen-image',
    title: 'Sharpen Image Online - Unblur Photos Free',
    description: 'Instantly sharpen blurry images and enhance details online.',
    h1: 'Sharpen Image Online',
    intro: 'Fix blurry photos and enhance image details in seconds.',
    steps: ['Upload blurry image', 'Apply sharpen filter', 'Download clear photo'],
    features: ['Instant Sharpening', 'Detail Enhancement', 'No Upload Needed'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'SHARPEN'
  },
  'black-and-white-filter': {
    slug: 'black-and-white-filter',
    title: 'Black and White Filter - Convert Image to Grayscale',
    description: 'Convert colorful images to classic black and white photos online.',
    h1: 'Black & White Photo Filter',
    intro: 'Give your photos a timeless, classic look with our grayscale filter.',
    steps: ['Upload image', 'Apply B&W filter', 'Download result'],
    features: ['Classic Look', 'Instant Conversion', 'High Quality'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'BLACK_WHITE'
  },
  'blur-image': {
    slug: 'blur-image',
    title: 'Blur Image Online - Hide Details & Faces',
    description: 'Blur parts of an image or the entire photo for privacy.',
    h1: 'Blur Image Tool',
    intro: 'Easily blur images to hide sensitive details or create depth effects.',
    steps: ['Upload image', 'Adjust blur intensity', 'Download blurred image'],
    features: ['Adjustable Intensity', 'Privacy Protection', 'Fast Processing'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'BLUR_IMG'
  },
  'split-image': {
    slug: 'split-image',
    title: 'Image Splitter - Grid Maker for Instagram',
    description: 'Split photos into 3x1, 3x2, or 3x3 grids. Create swipeable panoramas and giant square grids for Instagram.',
    h1: 'Split Image for Instagram',
    intro: 'Plan your Instagram feed with precision. Split your large photos into multiple square posts to create a stunning grid layout.',
    steps: [
      'Upload your large photo.',
      'Select grid columns and rows (e.g., 3x3).',
      'Preview the split consistency.',
      'Download a ZIP file containing all the pieces.'
    ],
    features: [
      'Grid Splitting (2x1, 3x1, 3x3)',
      'High Resolution Output',
      'ZIP Download',
      'No Watermarks'
    ],
    faqs: [
      { q: 'How do I post these?', a: 'Post them in reverse order (bottom-right to top-left) to form the grid on your profile.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'SPLIT_IMAGE'
  },
  'add-text-to-image': {
    slug: 'add-text-to-image',
    title: 'Add Text to Photo - Online Image Editor',
    description: 'Add captions, quotes, and text overlays to images. Choose custom fonts, colors, and styles.',
    h1: 'Add Text to Image',
    intro: 'Make your photos speak. Add custom text with a variety of fonts and styles to create memes, quotes, or social media posts.',
    steps: [
      'Upload your image.',
      'Type your text and choose a font.',
      'Adjust size, color, and position.',
      'Download your edited image.'
    ],
    features: [
      'Custom Fonts Library',
      'Text Styling (Bold, Italic)',
      'Drag and Drop Positioning',
      'Layer Management'
    ],
    faqs: [
      { q: 'Can I add multiple text boxes?', a: 'Yes, you can add as many text layers as you need.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'ADD_TEXT'
  },
  // Programmatic Use Cases (Virtual Routes)
  'compress-pdf-100kb': {
    slug: 'compress-pdf-100kb',
    parentSlug: 'compress-pdf',
    title: 'Compress PDF to 100KB - Free High-Quality Shrink',
    description: 'Reduce your PDF file size to exactly 100KB or less without losing quality. Perfect for online applications.',
    h1: 'Compress PDF to 100KB',
    intro: 'Need to shrink your PDF for an official upload? Our tool optimizes your document to fit 100KB limits perfectly.',
    steps: ['Upload your PDF.', 'Select "Extreme Compression".', 'Download your 100KB file.'],
    faqs: [
      { q: 'Will my PDF still be readable at 100KB?', a: 'Yes, we optimize images and fonts to preserve readability even at small sizes.' }
    ],
    tips: ['Use grayscale mode to save even more space.', 'Remove unnecessary metadata before saving.'],
    tradeoffs: ['High compression may slightly blur very small text or complex images.'],
    type: ToolType.PDF_SUITE,
    mode: 'COMPRESS',
    unique: true
  },
  'pdf-merger-real-estate': {
    slug: 'pdf-merger-real-estate',
    parentSlug: 'merge-pdf',
    title: 'PDF Merger for Real Estate - Combine Property Docs',
    description: 'The #1 tool for real estate agents. Combine closing docs, property listings, and contracts into one branded PDF.',
    h1: 'Real Estate PDF Merger',
    intro: 'Streamline your real estate workflow. Combine all property documents into a single, organized PDF for your clients.',
    steps: ['Upload listing photos and contracts.', 'Arrange documents in chronological order.', 'Generate unified property PDF.'],
    faqs: [
      { q: 'Can I add a cover page?', a: 'Yes, just upload your cover page as the first file in the merger.' }
    ],
    tips: ['Keep your file names descriptive for better organization.', 'Ensure all scanned documents are right-side up.'],
    type: ToolType.PDF_SUITE,
    mode: 'MERGE',
    unique: true
  },
  'instagram-image-resizer': {
    slug: 'instagram-image-resizer',
    parentSlug: 'resize-image',
    title: 'Instagram Image Resizer - Perfect Post & Story Sizes',
    description: 'Resize your photos for Instagram Posts, Stories, and Reels instantly. No cropping required.',
    h1: 'Resize Image for Instagram',
    intro: 'Get your photos ready for social media. Automatically resize to 1080x1080, 1080x1350, or 1080x1920.',
    steps: ['Upload your photo.', 'Select "Instagram Story" or "Square Post".', 'Download and share.'],
    faqs: [],
    tips: ['Use PNG format for better color quality on Instagram.', 'Check "Maintain Aspect Ratio" to avoid stretching.'],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'RESIZE',
    unique: true
  },
  'pdf-to-jpg': {
    slug: 'pdf-to-jpg',
    parentSlug: 'extract-images',
    title: 'PDF to JPG - Convert PDF Pages to Images',
    description: 'Convert PDF pages to high-quality JPG images. Save each page of your PDF as a separate JPG file.',
    h1: 'Convert PDF to JPG',
    intro: 'Turn your PDF document into a set of JPG images. Perfect for sharing on social media or inserting into other documents.',
    steps: ['Upload PDF.', 'Select "Convert to JPG".', 'Download ZIP of images.'],
    features: ['High Quality JPGs', 'Batch Conversion', 'Secure Processing'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'EXTRACT_IMAGES',
    unique: true
  },
  'pdf-to-png': {
    slug: 'pdf-to-png',
    parentSlug: 'extract-images',
    title: 'PDF to PNG - Convert PDF to Transparent Images',
    description: 'Convert PDF pages to PNG images. Best for high-quality graphics and preserving text clarity.',
    h1: 'Convert PDF to PNG',
    intro: 'Extract pages from your PDF as lossless PNG images. Ideal for when you need higher quality than JPG.',
    steps: ['Upload PDF.', 'Select "Convert to PNG".', 'Download ZIP of images.'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'EXTRACT_IMAGES',
    unique: true
  },
  'png-to-pdf': {
    slug: 'png-to-pdf',
    parentSlug: 'jpg-to-pdf',
    title: 'PNG to PDF - Convert PNG Images to PDF',
    description: 'Convert PNG images to PDF documents. Merge multiple PNGs into a single PDF file.',
    h1: 'Convert PNG to PDF',
    intro: 'Turn your PNG images into a professional PDF document. Combine multiple files into one.',
    steps: ['Upload PNG images.', 'Drag to reorder.', 'Download combined PDF.'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'IMAGES_TO_PDF',
    unique: true
  },
  'bmp-to-pdf': {
    slug: 'bmp-to-pdf',
    parentSlug: 'jpg-to-pdf',
    title: 'BMP to PDF - Convert Bitmap to PDF',
    description: 'Convert BMP images to PDF format online for free.',
    h1: 'Convert BMP to PDF',
    intro: 'Easily convert older BMP bitmap images into modern, shareable PDF documents.',
    steps: ['Upload BMP images.', 'Convert to PDF.', 'Download.'],
    faqs: [],
    type: ToolType.PDF_SUITE,
    mode: 'IMAGES_TO_PDF',
    unique: true
  }
};