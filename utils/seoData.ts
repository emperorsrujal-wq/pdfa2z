
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
  'merge-pdf': {
    slug: 'merge-pdf',
    title: 'Merge PDF - Combine PDF Files Online for Free',
    description: 'Combine multiple PDFs into one unified document. Fast, secure, and easy PDF merger tool. No software installation required.',
    h1: 'Merge PDF Files',
    intro: 'Select multiple PDF files and merge them into one in seconds. Drag and drop pages to reorder them exactly how you want. Our PDF merger is secure, fast, and free.',
    steps: [
      'Click "Upload" to select your PDF files, or drag and drop them into the box.',
      'Drag the thumbnails to rearrange the files in your desired order.',
      'Click "Merge PDF" to combine them.',
      'Download your single, unified PDF document.'
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
    title: 'Split PDF - Extract Pages & Separate Documents',
    description: 'Separate one PDF into multiple files or extract specific pages instantly. User-friendly and free PDF splitter.',
    h1: 'Split PDF Document',
    intro: 'Need to get a specific page out of a large document? Or split a book into chapters? Our Split PDF tool lets you extract specific pages or ranges with ease.',
    steps: [
      'Upload your PDF document.',
      'Enter the page numbers you want to extract (e.g., "1, 3, 5") or a range (e.g., "10-20").',
      'Choose to merge extracted pages into one file or download them separately.',
      'Click "Split PDF" and download your files.'
    ],
    faqs: [
      { q: 'Can I extract single pages?', a: 'Yes, simply enter the specific page number you need.' },
      { q: 'Can I split by range?', a: 'Yes, use the format "Start-End" (e.g., 1-5).' },
      { q: 'Will the original file be modified?', a: 'No, your original file remains untouched. We create new files from the extracted pages.' }
    ],
    features: [
      'Extract Specific Pages',
      'Split by Range',
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
    title: 'Compress PDF - Reduce File Size Online',
    description: 'Optimize PDF files for web and email without losing quality. Reduce PDF file size by up to 90%.',
    h1: 'Compress PDF Online',
    intro: 'Too large to email? Reduce the file size of your PDFs significantly using our intelligent compression algorithm. We optimize images and fonts to save space while maintaining readability.',
    steps: [
      'Select your PDF file from your computer or mobile.',
      'Choose a compression level: "Recommended" (Best balance) or "Extreme" (Smallest size).',
      'Click "Compress PDF".',
      'Compare size reduction and download your optimized file.'
    ],
    faqs: [
      { q: 'How much can I reduce size?', a: 'Results vary, but we often see reductions of 50-80% for image-heavy documents.' },
      { q: 'Does it affect quality?', a: 'Our "Recommended" setting keeps quality almost identical to the original. "Extreme" may slightly reduce image quality for maximum space saving.' },
      { q: 'Can I compress multiple files?', a: 'Yes, you can upload and compress multiple PDFs at once.' }
    ],
    features: [
      'Smart Compression Algorithm',
      'Multiple Compression Levels',
      'Batch Processing',
      'Quality Preservation',
      'Detailed Size Report'
    ],
    tips: [
      'Use "Extreme" compression for documents that are only for screen viewing.',
      'Use "Recommended" for documents you intend to print.'
    ],
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
        intro: 'Réduisez considérablement la taille de vos fichiers PDF.',
        steps: ['Téléchargez le PDF.', 'Sélectionnez le niveau de compression.', 'Téléchargez le fichier.'],
        faqs: [{ q: 'De combien puis-je réduire la taille ?', a: 'Jusqu\'à 80-90% selon le contenu.' }]
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
    title: 'PDF to Word Converter - Free Online Docx',
    description: 'Convert PDF documents to editable Microsoft Word (DOC/DOCX) files with high accuracy. Preserve layout, fonts, and tables.',
    h1: 'Convert PDF to Word',
    intro: 'Turn your static PDFs into editable Word documents. Our AI-powered conversion engine maintains your original formatting, paragraphs, lists, and tables so you can start editing immediately.',
    steps: [
      'Upload your PDF file.',
      'Wait a moment while we convert the document.',
      'Download your fully editable Word (.docx) file.',
      'Open in Microsoft Word, Google Docs, or any office suite.'
    ],
    faqs: [
      { q: 'Will the formatting be messed up?', a: 'We try our best to preserve the exact layout, including columns and tables.' },
      { q: 'Can I convert scanned PDFs?', a: 'Yes, but for images of text, the editable output depends on the clarity of the scan.' },
      { q: 'Is it compatible with Google Docs?', a: 'Yes, you can upload the resulting .docx, file to Google Drive and edit it there.' }
    ],
    features: [
      'High-Fidelity Conversion',
      'Table Reconstruction',
      'Paragraph Recognition',
      'Fast & Confidential',
      'No Account Needed'
    ],
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
    title: 'Free Background Remover - Remove BG Online',
    description: 'Remove image backgrounds automatically in 5 seconds with AI. Download transparent PNGs for free. High accuracy for people, products, and cars.',
    h1: 'Remove Background from Image Free',
    intro: 'Instantly remove the background from your photos using our advanced AI technology. Perfect for e-commerce, profile pictures, and design projects. No sign-up required.',
    steps: [
      'Click "Upload Image" or drag and drop your file.',
      'Wait a few seconds while our AI detects and removes the background.',
      'Preview the transparent result.',
      'Download your high-quality PNG image.'
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
    title: 'Universal Video Downloader - YouTube, TikTok, Insta',
    description: 'Download videos from YouTube, Facebook, Instagram, TikTok, and Twitter in MP4 HD quality. Free online video saver, no watermark.',
    h1: 'Free Universal Video Downloader',
    intro: 'Save your favorite videos for offline viewing from over 50+ websites. Whether it\'s a YouTube tutorial, an Instagram Reel, or a TikTok trend, our tool grabs the highest quality version available instantly.',
    steps: [
      'Copy the video URL from YouTube, Instagram, Facebook, or TikTok.',
      'Paste the link into the input box above.',
      'Click the "Analyze" button.',
      'Choose your desired format (MP4, MP3) and quality (720p, 1080p).',
      'Click "Download" to save the file to your device.'
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
    title: 'PDF to Excel - Extract Tables to XLS',
    description: 'Extract tables from PDF to Excel spreadsheets automatically. Convert PDF data into editable rows and columns.',
    h1: 'Convert PDF to Excel',
    intro: 'Stop retyping data manually! Our PDF to Excel converter automatically detects tables in your document and converts them into an editable spreadsheet.',
    steps: [
      'Upload the PDF containing data tables.',
      'Our engine analyzes the document structure.',
      'Download your converted Excel (.xlsx) file.',
      'Open in Excel, Numbers, or Google Sheets.'
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
  },
  'flip-image': {
    slug: 'flip-image',
    title: 'Flip Image - Mirror Photo Online',
    description: 'Flip your images horizontally or vertically instantly.',
    h1: 'Flip Image Online',
    intro: 'Mirror your photos with a single click.',
    steps: ['Upload Image', 'Select Direction', 'Download'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'FLIP'
  },
  'pixelate-image': {
    slug: 'pixelate-image',
    title: 'Pixelate Image - Anonymize Photos',
    description: 'Add pixelation effect to blur out details or faces.',
    h1: 'Pixelate Image',
    intro: 'Anonymize sensitive information or create retro art.',
    steps: ['Upload Image', 'Adjust Pixel Size', 'Download'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'PIXELATE'
  },
  'invert-image': {
    slug: 'invert-image',
    title: 'Invert Colors - Negative Image Generator',
    description: 'Invert colors of any image to create a negative effect.',
    h1: 'Invert Image Colors',
    intro: 'Create cool negative effects instantly.',
    steps: ['Upload Image', 'Click Process', 'Download'],
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
    title: 'Edit PDF - Add Text & Annotations',
    description: 'Add text, notes, and annotations to PDF documents online.',
    h1: 'Edit PDF Online',
    intro: 'Add text and edit your PDF documents easily.',
    steps: ['Upload PDF', 'Add text or annotations', 'Download edited PDF'],
    faqs: [
      { q: 'Can I change existing text?', a: 'Currently you can only add new text and annotations.' },
      { q: 'Is it free?', a: 'Yes, 100% free tool.' }
    ],
    features: ['Add text to PDF', 'Annotate documents', 'Browser-based editing'],
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
    h1: 'Convert Is EPUB to PDF',
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
    title: 'Free Profile Picture Maker - Circle & Border',
    description: 'Create professional circular profile pictures with custom borders for social media.',
    h1: 'Profile Picture Maker',
    intro: 'Design the perfect profile photo for Instagram, LinkedIn, and more.',
    steps: ['Upload photo', 'Adjust crop', 'Download circular image'],
    features: ['Circle Crop', 'Custom Borders', 'Instant Preview'],
    faqs: [],
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
    title: 'Image Splitter - Cut Images into Grid Pieces',
    description: 'Split one image into multiple grid pieces (2x2, 3x3) for Instagram.',
    h1: 'Split Image Online',
    intro: 'Slice your photos into a grid for creative social media layouts.',
    steps: ['Upload image', 'Select grid size', 'Download ZIP of pieces'],
    features: ['Grid Splitting', 'ZIP Download', 'Instagram Ready'],
    faqs: [],
    type: ToolType.IMAGE_TOOLKIT,
    mode: 'SPLIT_IMAGE'
  },
  'add-text-to-image': {
    slug: 'add-text-to-image',
    title: 'Add Text to Image - Online Photo Editor',
    description: 'Add custom text overlays to your images quickly and easily.',
    h1: 'Add Text to Photo',
    intro: 'Personalize your photos with custom text and captions.',
    steps: ['Upload image', 'Enter text', 'Download edited image'],
    features: ['Custom Text', 'Adjustable Positioning', 'Simple Interface'],
    faqs: [],
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
  }
};