import { ToolType } from '../types.ts';
import {
  Home, Info, Mail, Shield, FileSearch, ShieldCheck, Layers, Route, Scissors,
  Minimize2, FileText, MessageSquare, Zap, UserMinus, PenTool, Download,
  Video, RotateCw, RefreshCw, Lock, Unlock, Table, Image, FileType, Code, Hash,
  Trash2, Paintbrush, Stamp, Maximize2, EyeOff, LayoutTemplate,
  ImageMinus, Grid, User, PlusCircle,
  Move, FileSpreadsheet, FileCode, ListOrdered, Type,
  FileStack, Smile, LucideIcon,
  Wrench, FileEdit, ImageDown, Sparkles, PenLine
} from 'lucide-react';

export interface ToolSEO {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  steps: string[];
  faqs: { q: string; a: string }[];
  type: ToolType;
  icon?: LucideIcon;
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
    title: 'Free Online PDF & Image Tools — PDFA2Z | 100+ Tools, No Signup',
    description: 'The #1 free online PDF and image tool suite. Merge PDF, compress, convert to Word/Excel, edit, split, sign, remove background, resize images and 100+ more tools. No signup, instant access.',
    h1: 'Free Online PDF & Image Tools',
    intro: 'PDFA2Z gives you 100+ free online PDF and image tools — no signup, no watermarks, no limits. Merge, compress, convert, edit, sign PDFs. Remove backgrounds, resize, compress images. All in your browser.',
    steps: [],
    faqs: [
      { q: 'Are all tools really free?', a: 'Yes. Every PDF and image tool on PDFA2Z is 100% free with no signup required.' },
      { q: 'Is my data safe?', a: 'All file processing runs locally in your browser or is deleted from our servers immediately after processing. We never store your documents.' },
      { q: 'What PDF tools are available?', a: 'We offer 50+ PDF tools including merge, split, compress, convert to Word/Excel/PPT, edit, sign, watermark, protect, unlock, rotate, and more.' },
      { q: 'What image tools are available?', a: 'We offer 30+ image tools including background removal, resize, compress, crop, rotate, upscale, face blur, collage maker, and more.' },
    ],
    type: ToolType.DASHBOARD,
    icon: Home,
    features: [
      '100+ Free Tools',
      'No Signup Required',
      'Merge PDF Online',
      'Compress PDF',
      'PDF to Word',
      'Remove Background',
      'Resize Image',
      'AI-Powered Tools',
      'Secure & Private',
      'Browser-Based Processing',
    ],
    translations: {
      es: {
        title: 'Herramientas PDF e Imagen Gratis en Línea — PDFA2Z | +100 Herramientas',
        description: 'La suite #1 de herramientas PDF e imagen gratuitas. Combinar, comprimir, convertir a Word, editar, firmar PDFs. Eliminar fondos, redimensionar imágenes y más. Sin registro.',
        h1: 'Herramientas PDF e Imagen Gratis en Línea',
        intro: 'PDFA2Z te ofrece más de 100 herramientas gratuitas para PDF e imágenes. Sin registro, sin marcas de agua. Todo en tu navegador.'
      },
      fr: {
        title: 'Outils PDF et Image Gratuits en Ligne — PDFA2Z | +100 Outils',
        description: 'La suite #1 d\'outils PDF et image gratuits. Fusionner, compresser, convertir en Word, éditer, signer des PDF. Supprimer l\'arrière-plan, redimensionner des images. Sans inscription.',
        h1: 'Outils PDF et Image Gratuits en Ligne',
        intro: 'PDFA2Z vous propose plus de 100 outils PDF et image gratuits. Sans inscription, sans filigrane. Tout dans votre navigateur.'
      },
      hi: {
        title: 'मुफ्त ऑनलाइन PDF और इमेज टूल्स — PDFA2Z | 100+ टूल्स',
        description: '#1 मुफ्त ऑनलाइन PDF और इमेज टूल्स सूट। PDF मर्ज, कंप्रेस, Word में कन्वर्ट, एडिट, साइन करें। बैकग्राउंड हटाएं, इमेज रीसाइज़ करें और 100+ और टूल्स। कोई साइनअप नहीं।',
        h1: 'मुफ्त ऑनलाइन PDF और इमेज टूल्स',
        intro: 'PDFA2Z आपको 100+ मुफ्त PDF और इमेज टूल्स देता है। कोई साइनअप नहीं, कोई वाटरमार्क नहीं। सब कुछ आपके ब्राउज़र में।'
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
    type: ToolType.INFO_PAGE,
    icon: Info,
  },
  'contact': {
    slug: 'contact',
    title: 'Contact Us - PDF A2Z Support',
    description: 'Get in touch with the PDF A2Z team for support, feedback, or inquiries.',
    h1: 'Contact Us',
    intro: 'Have a question? We are here to help.',
    steps: [],
    faqs: [],
    type: ToolType.INFO_PAGE,
    icon: Mail,
  },
  'privacy': {
    slug: 'privacy',
    title: 'Privacy Policy - PDF A2Z',
    description: 'Read our privacy policy to understand how we handle your data and ensure your security.',
    h1: 'Privacy Policy',
    intro: 'Your privacy is our priority.',
    steps: [],
    faqs: [],
    type: ToolType.INFO_PAGE,
    icon: Shield,
  },
  'terms': {
    slug: 'terms',
    title: 'Terms of Service - PDF A2Z',
    description: 'Terms and conditions for using PDF A2Z services.',
    h1: 'Terms of Service',
    intro: 'Please read our terms carefully.',
    steps: [],
    faqs: [],
    type: ToolType.INFO_PAGE,
    icon: FileSearch,
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
    icon: ShieldCheck,
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
    title: 'Merge PDF Online — Combine PDF Files Free (iLovePDF Alternative)',
    description: 'Merge PDF files online for free. Combine unlimited PDFs into one document instantly, reorder pages, and download. No signup, no watermark. Faster than iLovePDF.',
    h1: 'Merge PDF Files Online — Free',
    intro: 'Combine multiple PDF files into one unified document in seconds. Our professional-grade PDF merger supports unlimited files, drag-and-drop reordering, and instant download — 100% free with no signup or watermark. The best free alternative to iLovePDF and Smallpdf.',
    steps: [
      'Click "Upload Files" or drag and drop your PDF files onto the page. You can select as many PDFs as you need.',
      'Drag the file thumbnails to rearrange them in your desired order. The first file in the list becomes the first pages of the merged PDF.',
      'Click any thumbnail to preview the file content before merging.',
      'Click "Merge PDF" to combine all files into a single document.',
      'Your merged PDF is ready — click "Download" to save it to your device.'
    ],
    faqs: [
      { q: 'Is merging PDFs free on PDFA2Z?', a: 'Yes, completely free. There are no file limits, no watermarks, and no signup required.' },
      { q: 'How many PDF files can I merge at once?', a: 'You can merge unlimited PDF files in a single session, provided the total size fits within your browser\'s available memory. For very large batches (50+ files), merging in two steps is recommended.' },
      { q: 'Is it secure? Are my files uploaded to a server?', a: 'Your files are processed securely. Small files may be handled client-side in your browser; larger files use encrypted server transmission with immediate deletion after processing. We never store or share your documents.' },
      { q: 'Can I merge PDF and image files (JPG, PNG) together?', a: 'This tool merges PDFs only. To include images, first convert them to PDF using our free JPG to PDF tool, then merge the resulting PDF files.' },
      { q: 'How do I change the order of PDFs before merging?', a: 'Simply drag and drop the file thumbnails into your desired order after uploading. The merge follows the order shown on screen.' },
      { q: 'Can I merge password-protected PDFs?', a: 'If a PDF has an "open password", you\'ll need to unlock it first using our free Unlock PDF tool. PDFs with only editing restrictions (owner password) can usually be merged without entering a password.' },
      { q: 'Will bookmarks and hyperlinks be preserved in the merged PDF?', a: 'Internal hyperlinks and text content are preserved. Complex bookmark trees may be simplified in the output. Test your merged PDF before distributing for critical document linking.' },
      { q: 'Does the merge tool work on mobile phones and tablets?', a: 'Yes. The merge tool works in mobile browsers on Android and iOS without any app installation required.' },
      { q: 'What is the maximum file size I can merge?', a: 'There is no hard size limit, but browser performance is best with files under 500MB total. For larger documents, consider splitting them first and merging in batches.' },
      { q: 'Will the merged PDF look different from the original files?', a: 'No. The PDF pages are combined as-is, preserving all formatting, fonts, images, and layout exactly as they appear in the original files.' },
      { q: 'How long does merging take?', a: 'Most merges complete in under 10 seconds. Very large files (100MB+) may take 20-30 seconds depending on your connection and device speed.' },
      { q: 'Is PDFA2Z a good iLovePDF alternative?', a: 'Yes. PDFA2Z offers the same core PDF merge functionality as iLovePDF with no daily file limits, no forced signup, and additional tools like AI chat, OCR, and video tools.' }
    ],
    features: [
      'Merge unlimited PDFs for free',
      'Visual drag & drop reordering',
      'No signup, no watermark',
      'Secure encrypted processing',
      'Preserve all formatting & fonts',
      'Works on mobile & desktop',
      'Instant download after merge',
      'iLovePDF & Smallpdf alternative'
    ],
    tips: [
      'Number your files (1.pdf, 2.pdf) before uploading to sort them automatically by filename.',
      'Use our Organize PDF tool first if you need to rotate or delete individual pages before merging.'
    ],
    relatedGuides: ['best-ilovepdf-alternative-2026', 'how-to-merge-pdfs'],
    type: ToolType.PDF_SUITE,
    mode: 'MERGE',
    icon: FileStack,
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
  'remote-sign': {
    slug: 'remote-sign',
    title: 'Free Remote E-Signing — Send Contracts for Digital Signature Online',
    description: 'Upload a PDF, add signers, place signature fields and send a secure signing link — no account required for signers. Free DocuSign alternative with audit trail.',
    h1: 'Free Remote E-Signing',
    intro: 'Send any PDF for legally binding e-signatures in minutes. Add multiple signers, place signature, initials, date and text fields, then send each signer a secure link. No DocuSign subscription needed.',
    steps: [
      'Upload your PDF contract or document.',
      'Add signer names and email addresses.',
      'Click to place signature, initials, date and text fields on each page.',
      'Send — each signer receives a secure email link. No account required for signers.',
      'Download the completed, signed PDF with a full audit trail.'
    ],
    faqs: [
      { q: 'Is this a free DocuSign alternative?', a: 'Yes. PDFA2Z Remote Signing is completely free and lets you send unlimited documents for e-signature.' },
      { q: 'Do signers need to create an account?', a: 'No. Signers receive a unique secure link via email and can sign directly in their browser — no login required.' },
      { q: 'Is the electronic signature legally binding?', a: 'Yes. E-signatures created on PDFA2Z meet the requirements of ESIGN, eIDAS and similar legislation. A full audit trail with timestamps and IP addresses is recorded.' },
      { q: 'Can I add multiple signers?', a: 'Yes. You can add up to 5 signers and choose sequential (one by one) or parallel (all at once) signing order.' },
      { q: 'What field types can I place?', a: 'Signature, initials, date, text box, and checkbox fields are supported.' }
    ],
    features: [
      'Free DocuSign Alternative',
      'No Account Required for Signers',
      'Legally Binding E-Signatures',
      'Multi-Signer Support',
      'Sequential & Parallel Signing',
      'Full Audit Trail',
      'Signature Draw or Type',
      'Instant Email Delivery'
    ],
    type: ToolType.REMOTE_SIGN,
    icon: PenLine,
    unique: true,
  },
  'journey-builder': {
    slug: 'journey-builder',
    title: 'PDF Journey Builder - High-Stakes Onboarding Automation',
    description: 'Automate Mortgage applications, Legal intakes, and Real Estate contracts. Turn static PDFs into secure, step-by-step journeys with audit trails and compliance.',
    h1: 'PDF to <em>Compliant Journey</em>',
    intro: 'Ditch the static forms. Create professional, guided experiences for your clients. Perfect for Law firms, Mortgage brokers, and Banks requiring PIPEDA/GDPR compliance.',
    steps: [
      'Select an industry-specific template (Mortgage, Legal, Real Estate).',
      'AI detects fields and maps them to a secure workflow.',
      'Configure compliance settings (Bates numbering, Audit trail).',
      'Deploy your journey and capture verified, signed documents.'
    ],
    faqs: [
      { q: 'Is it PIPEDA / GDPR compliant?', a: 'Yes, our Enterprise mode enables strict data purging and encrypted audit logs.' },
      { q: 'Can I add Bates numbering?', a: 'Yes, our Legal vertical includes automated Bates numbering for document discovery.' },
      { q: 'Do you support Mortgage Form 1003?', a: 'We have pre-built templates for standard mortgage and real estate disclosures.' }
    ],
    features: [
      'Industry-Specific Templates',
      'PIPEDA / GDPR Compliance',
      'Automated Bates Numbering',
      'Legally Binding Audit Trails',
      'CRM & Webhook Integration'
    ],
    type: ToolType.JOURNEY_BUILDER,
    icon: Route,
  },
  'split-pdf': {
    slug: 'split-pdf',
    title: 'Free Split PDF Online — Extract & Separate PDF Pages Instantly',
    description: 'Free online PDF splitter. Split PDF into individual pages, extract page ranges, or download each page separately as a ZIP. No signup, no watermark. Fast & secure.',
    h1: 'Free Split PDF Online',
    intro: 'Break apart large PDF files in seconds. Our Split PDF tool lets you extract specific pages, split by custom page ranges, or separate every page into its own file. Perfect for extracting invoices, chapters, or contracts from multi-document PDFs.',
    steps: [
      'Upload your PDF document by clicking "Upload" or dragging and dropping it onto the tool.',
      'Enter the page numbers or ranges you want to extract. Examples: "3" for a single page, "1-5" for a range, or "1-5, 8, 11-15" for multiple non-consecutive ranges.',
      'Choose whether to download extracted pages as a single merged PDF or as individual files (one per page).',
      'Click "Split PDF" to process the document.',
      'Download your extracted pages. If you selected individual pages, they are packaged into a ZIP file for easy download.'
    ],
    faqs: [
      { q: 'Is splitting PDFs free on PDFA2Z?', a: 'Yes, completely free with no signup and no watermarks.' },
      { q: 'Can I extract a single page from a PDF?', a: 'Yes. Simply enter the specific page number (e.g., "5") to extract just that page as a new PDF file.' },
      { q: 'How do I specify page ranges?', a: 'Use a hyphen for ranges: "1-5" extracts pages 1 through 5. Separate multiple ranges with commas: "1-5, 8, 10-12".' },
      { q: 'Can I split a PDF into individual pages all at once?', a: 'Yes. Use the "Extract all pages" option and each page will be saved as its own PDF, all bundled in a ZIP download.' },
      { q: 'Will the original file be modified?', a: 'No. Your original file is never changed. We create brand new PDF files from the pages you select.' },
      { q: 'How do I extract non-consecutive pages?', a: 'Use comma-separated values: for example, "1, 3, 7, 12" extracts those exact pages as separate files or merged into one new PDF.' },
      { q: 'Does the split PDF preserve the original quality?', a: 'Yes. PDF pages are extracted without re-encoding, so the quality is identical to the original.' },
      { q: 'Can I split a password-protected PDF?', a: 'Only if you know the open password. Use our Unlock PDF tool first to remove the password, then split.' },
      { q: 'What is the maximum PDF size for splitting?', a: 'There is no strict limit, but performance is best for files under 200MB. Very large PDFs may take longer to process.' },
      { q: 'Will bookmarks be preserved in split pages?', a: 'Bookmarks that reference pages within the extracted range are preserved. Bookmarks pointing to other pages are removed from the split output.' },
      { q: 'Can I split a PDF that has form fields?', a: 'Yes. Form fields within extracted pages are preserved in the output PDF.' },
      { q: 'How is "split PDF" different from "delete pages"?', a: 'Split PDF creates new files from selected pages. Delete Pages removes specific pages from the original and gives you the remainder. Both tools are available free on PDFA2Z.' }
    ],
    features: [
      'Extract specific pages by number',
      'Split by custom page ranges',
      'Extract all pages as ZIP',
      'Preserve original quality',
      'No signup, no watermark',
      'Works on mobile & desktop',
      'Instant download',
      'Handle any PDF size'
    ],
    tips: [
      'Use commas to separate different ranges (e.g., "1-5, 8, 11-15") for non-consecutive extractions.',
      'Perfect for separating invoices, receipts, or chapters from a long combined document.'
    ],
    type: ToolType.PDF_SUITE,
    icon: Scissors,
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
    title: 'Compress PDF Online — Reduce File Size to 100KB, 200KB (Free)',
    description: 'Compress PDF file size online for free. Reduce PDF to 100KB, 200KB or 1MB without losing quality. Best free PDF compressor — no signup, no watermark.',
    h1: 'Compress PDF Online — Free',
    intro: 'Shrink your PDF files to a fraction of their original size without losing readability. Our smart compression algorithm optimizes images, fonts, and embedded content to help you meet strict file-size requirements like 100KB for government portals or 1MB for email attachments — all free, no signup.',
    steps: [
      'Click "Upload PDF" or drag your file onto the tool. Multiple files are supported for batch compression.',
      'Select your compression level: "Recommended" balances quality and size, while "Extreme" achieves the smallest possible file at the cost of some image quality.',
      'Optionally set a specific target file size (e.g., 200KB) for government form submissions.',
      'Click "Compress PDF" and wait a few seconds for processing.',
      'Download your compressed PDF. The tool shows you the exact before/after size reduction so you can verify results.'
    ],
    faqs: [
      { q: 'Is PDF compression free on PDFA2Z?', a: 'Yes, 100% free. No signup, no watermarks, no daily limits.' },
      { q: 'How much can I reduce a PDF\'s file size?', a: 'Results depend on content. Image-heavy PDFs typically see 50-85% reduction. Text-only PDFs are already compact and may only compress 10-20% further.' },
      { q: 'What causes a PDF to be so large?', a: 'Large PDFs usually contain high-resolution images, embedded fonts, or unoptimized scanned pages. Our compressor targets all three to maximize size reduction.' },
      { q: 'How do I compress a PDF to under 100KB?', a: 'Use "Extreme" compression mode. If the file is still over 100KB, it likely contains high-resolution scans — try converting color images to grayscale first using our Grayscale PDF tool, then compress again.' },
      { q: 'Does compression reduce visual quality?', a: '"Recommended" mode preserves near-original quality suitable for printing. "Extreme" mode slightly downsizes images but remains fully readable on screen.' },
      { q: 'Can I compress multiple PDFs at once?', a: 'Yes. Upload multiple PDFs together and each will be compressed and available for individual download.' },
      { q: 'Does compression remove metadata or document properties?', a: 'Standard compression does not remove metadata. If you need to remove author info or hidden data, use our PDF Redact tool first.' },
      { q: 'Will embedded fonts still display correctly after compression?', a: 'Yes. Fonts are optimized (unused character subsets removed) but remain embedded so text renders correctly on all devices.' },
      { q: 'Can I compress a scanned PDF?', a: 'Yes. Scanned PDFs benefit most from compression because their raw scan images are replaced with optimized versions. Expect 60-80% size reduction for typical scanned documents.' },
      { q: 'Is there a file size limit for uploading?', a: 'Files up to 500MB can be uploaded for compression. If your file is larger, try splitting it first and compressing each part.' },
      { q: 'Does compressing a PDF affect its password protection?', a: 'Compression works on both unprotected and owner-restricted PDFs. Open-password-protected PDFs must be unlocked first using our Unlock PDF tool.' },
      { q: 'How is PDFA2Z\'s compressor different from printing to PDF?', a: 'Printing to PDF re-renders content and can sometimes increase file size or lose formatting. Our compressor directly optimizes the existing PDF structure without re-rendering, preserving all content accurately.' }
    ],
    features: [
      'Reduce PDF size by up to 85%',
      'Target 100KB, 200KB, 1MB',
      'Batch compress multiple PDFs',
      'Preserve text sharpness',
      'Recommended & Extreme modes',
      'No signup, no watermark',
      'Before/after size comparison',
      'Works on mobile & desktop'
    ],
    tips: [
      'Combine compression with Grayscale PDF conversion for maximum size reduction on color-scan documents.',
      'Use "Recommended" for documents you will print — "Extreme" for screen-only or email use.'
    ],
    relatedGuides: ['how-to-compress-pdf-to-100kb', 'how-to-make-pdf-smaller-for-email'],
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
    title: 'PDF to Word Converter — Free Online PDF to DOCX (High Quality)',
    description: 'Convert PDF to Word (DOCX) free online. AI-powered converter preserves editable text, tables, columns, and original formatting. No signup, instant download.',
    h1: 'Convert PDF to Word Free',
    intro: 'Turn any PDF into a fully editable Microsoft Word document in seconds. Our advanced OCR and layout reconstruction engine preserves columns, tables, headings, and text styles so your Word doc looks exactly like the original PDF — ready to edit without reformatting.',
    steps: [
      'Click "Upload PDF" or drag your PDF file onto the tool. Scanned PDFs are also supported via OCR.',
      'The system automatically detects whether the PDF contains real text or scanned images and applies the appropriate conversion method.',
      'Wait 10-30 seconds for the AI to analyze and reconstruct the document layout.',
      'Download your converted Word (.docx) file directly to your device.',
      'Open the file in Microsoft Word, Google Docs, LibreOffice, or any compatible word processor and start editing immediately.'
    ],
    faqs: [
      { q: 'Is PDF to Word conversion free on PDFA2Z?', a: 'Yes, completely free. No signup, no watermarks, and no limits on conversions.' },
      { q: 'Will the formatting be preserved after conversion?', a: 'Our converter uses advanced layout analysis to preserve columns, tables, paragraphs, headings, and font styles. Complex multi-column layouts or custom fonts may require minor manual adjustment.' },
      { q: 'Can I convert a scanned PDF to Word?', a: 'Yes. Scanned PDFs go through OCR (Optical Character Recognition) to extract text from images. Accuracy depends on scan quality — clear, high-resolution scans produce the best results.' },
      { q: 'Is the converted file compatible with Google Docs?', a: 'Yes. Upload the resulting .docx file to Google Drive and open it with Google Docs for full editing capability.' },
      { q: 'What formatting elements are preserved?', a: 'Bold, italic, underline, font sizes, headings (H1-H6), bullet lists, numbered lists, tables, and images are all preserved where technically possible.' },
      { q: 'Can I convert password-protected PDFs to Word?', a: 'Only if you know the password. Unlock the PDF first using our free Unlock PDF tool, then convert to Word.' },
      { q: 'How accurate is OCR for scanned documents?', a: 'For clean, high-contrast scans at 300 DPI or above, accuracy is typically 95-99%. Handwritten text, faded scans, or complex scientific notation will have lower accuracy.' },
      { q: 'What is the maximum file size for PDF to Word conversion?', a: 'Files up to 100MB are supported. For larger PDFs, consider splitting them first using our Split PDF tool and converting each part separately.' },
      { q: 'Does it work with PDFs that have complex tables?', a: 'Yes. Table structure is detected and reconstructed as Word tables. Very complex merged-cell tables may need manual adjustment after conversion.' },
      { q: 'What if the converted Word document has errors or garbled text?', a: 'For PDFs with unusual fonts or encoding, try flattening the PDF first using our PDF Flatten tool, then reconvert. OCR-based conversion often handles such files better.' },
      { q: 'Can I convert to .doc (old Word format) instead of .docx?', a: 'We output .docx by default, which is the modern standard compatible with Word 2007 and later. You can save as .doc from within Microsoft Word if needed.' },
      { q: 'Will images in the PDF be included in the Word document?', a: 'Yes, images embedded in the PDF are extracted and inserted inline in the Word document.' }
    ],
    features: [
      'High-fidelity layout reconstruction',
      'OCR for scanned PDF documents',
      'Preserve tables, columns & images',
      'Editable DOCX output',
      'Compatible with Google Docs',
      'No signup, no watermark',
      'Supports files up to 100MB',
      'AI-powered text extraction'
    ],
    relatedGuides: ['how-to-edit-pdf-free-without-adobe'],
    type: ToolType.PDF_SUITE,
    icon: FileText,
    mode: 'TO_WORD'
  },
  'pdf-chat': {
    slug: 'pdf-chat',
    title: 'Free Chat with PDF — AI-Powered PDF Q&A Assistant Online',
    description: 'Free AI-powered PDF chat tool. Upload any PDF and ask questions, get summaries, and extract key insights instantly. No signup required.',
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
    icon: MessageSquare,
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
    type: ToolType.IMAGE_GENERATOR,
    icon: Sparkles,
  },
  'remove-bg': {
    slug: 'remove-bg',
    title: 'Free Background Remover — Remove Background from Image Online',
    description: 'Remove image background online for free. AI automatically removes backgrounds from photos, products, and portraits in seconds. Download transparent PNG. No signup.',
    h1: 'Remove Background from Image — Free',
    intro: 'Instantly remove any background from photos, product images, and portraits with one click. Our AI-powered background remover automatically detects the subject and creates a transparent PNG — no manual selection needed. Unlimited free use, no signup.',
    steps: [
      'Click "Upload Image" or drag and drop your JPG, PNG, or WebP photo onto the tool.',
      'The AI instantly analyzes your image and automatically detects the foreground subject — this typically takes 3-5 seconds.',
      'Preview your image with the background removed. Transparent areas are shown as a checkered pattern.',
      'Use the fine-tune brush to touch up edges if needed (zoom in for precision on hair and fur).',
      'Click "Download" to save your transparent PNG. Place it on any new background using our image tools.'
    ],
    faqs: [
      { q: 'Is background removal free on PDFA2Z?', a: 'Yes, completely free with unlimited removals. No signup required.' },
      { q: 'What image formats are supported?', a: 'JPG, PNG, WebP, and BMP are all supported as input. The output is always a transparent PNG.' },
      { q: 'Does it work on complex hair and fur?', a: 'Yes. Our AI model is specifically trained to handle fine details like flyaway hair, fur, and transparent materials with high precision.' },
      { q: 'Can I add a new background color or image after removal?', a: 'Yes. After removing the background, use the background replacement feature to add a solid color, gradient, or custom image. Or download the transparent PNG and place it in any image editor.' },
      { q: 'How do I get the best results for product photos?', a: 'Place your product on a high-contrast background (white or solid color) and ensure good, even lighting. AI detection is most accurate when subject edges are clearly defined.' },
      { q: 'Can I remove backgrounds from multiple images at once?', a: 'For bulk background removal, contact us about API access. The individual tool processes one image at a time.' },
      { q: 'What resolution is the output PNG?', a: 'The output maintains the original image resolution. No downscaling occurs — your transparent PNG is the same dimensions as your uploaded image.' },
      { q: 'Does it work on logos, graphics, and illustrations?', a: 'Yes, though results are best on photos with clear subjects. For flat graphics with solid fills, the tool works excellently. For complex illustrations with similar colors, manual refinement may be needed.' },
      { q: 'How long does background removal take?', a: 'Most images are processed in 3-5 seconds. Larger files (over 5MB) may take 10-15 seconds.' },
      { q: 'Can I refine the results if the edges aren\'t perfect?', a: 'Yes. Use the built-in eraser and restore brush to clean up edges after the initial AI removal. Zoom in for detailed adjustments.' },
      { q: 'Is the processing done on my device or on a server?', a: 'Processing happens on our secure servers using AI models. Your image is transmitted over HTTPS and deleted immediately after you download the result.' },
      { q: 'What is the maximum image size I can upload?', a: 'Images up to 25MB are supported. For best performance, images under 5MB process fastest.' }
    ],
    features: [
      'AI auto-detects subjects instantly',
      'Handle hair, fur & fine details',
      'Transparent PNG output',
      'No watermark, no signup',
      'Unlimited free removals',
      'Manual refinement brush',
      'Preserve original resolution',
      'Works on photos, products & portraits'
    ],
    tips: [
      'For product photos, shoot against a white or single-color background for best AI accuracy.',
      'After removal, use our Image Resize tool to create perfectly sized images for e-commerce platforms like Amazon or Shopify.'
    ],
    relatedGuides: ['remove-image-background'],
    type: ToolType.IMAGE_TOOLKIT,
    icon: ImageMinus,
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
    type: ToolType.AI_WRITER,
    icon: PenTool
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
    icon: Download,
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
    icon: Video,
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
    icon: Sparkles,
    mode: 'MAGIC_EDITOR'
  },
  'rotate-pdf': {
    slug: 'rotate-pdf',
    title: 'Free Rotate PDF Online — Rotate Pages 90°, 180°, 270°',
    description: 'Free online PDF rotation tool. Rotate individual PDF pages or the entire document by 90, 180, or 270 degrees permanently. No signup required.',
    h1: 'Free Rotate PDF Online',
    intro: 'Fix upside-down or sideways PDF pages instantly. Rotate specific pages or the entire document and save the new orientation permanently.',
    steps: [
      'Upload your PDF file.',
      'Select which pages to rotate (all or specific pages).',
      'Choose 90°, 180°, or 270° rotation.',
      'Download your permanently rotated PDF.'
    ],
    faqs: [
      { q: 'Is it free?', a: 'Yes, rotating PDFs on PDFA2Z is completely free with no signup required.' },
      { q: 'Will rotation be permanent?', a: 'Yes, the rotation is embedded into the PDF file, not just a viewer setting.' },
      { q: 'Can I rotate individual pages?', a: 'Yes, you can select specific pages to rotate while leaving others unchanged.' }
    ],
    features: [
      'Rotate 90°, 180°, 270°',
      'Rotate All or Specific Pages',
      'Permanent Rotation',
      'No Quality Loss',
      'No Signup Needed'
    ],
    type: ToolType.PDF_SUITE,
    icon: RotateCw,
    mode: 'ROTATE'
  },
  'protect-pdf': {
    slug: 'protect-pdf',
    title: 'Free PDF Password Protect — Encrypt PDF with AES-256 Online',
    description: 'Free online PDF password protection. Add 256-bit AES encryption to your PDF to prevent unauthorized access. Instant, secure, no signup required.',
    h1: 'Password Protect PDF Free',
    intro: 'Add military-grade 256-bit AES encryption to any PDF file in seconds. Set an open password so only authorized people can view the document, and control permissions like printing and copying. 100% free, browser-based, no files stored on our servers.',
    steps: [
      'Upload the PDF you want to protect by clicking "Upload" or dragging the file onto the tool.',
      'Enter a strong password in the "Set Password" field. Use a mix of uppercase, lowercase, numbers, and symbols for maximum security.',
      'Confirm the password in the second field to avoid typos.',
      'Optionally, set document permissions to restrict printing, copying, or editing even for people who know the password.',
      'Click "Protect PDF" and download your encrypted, password-protected PDF file.'
    ],
    faqs: [
      { q: 'Is PDF password protection free on PDFA2Z?', a: 'Yes, completely free. No signup, no watermarks, unlimited use.' },
      { q: 'What encryption standard is used?', a: 'We use AES-256 (Advanced Encryption Standard with 256-bit key), the same encryption standard used by governments and financial institutions worldwide. It is virtually impossible to brute-force.' },
      { q: 'Can you recover my password if I forget it?', a: 'No. For your security, your password is never stored on our servers. If you forget it, the document cannot be recovered. Please use a password manager to store important passwords.' },
      { q: 'Can I restrict printing but still allow viewing?', a: 'Yes. Use the permission settings to allow viewing but restrict printing, copying, or editing. Only people with the owner password can change these restrictions.' },
      { q: 'Is the password-protected PDF compatible with Adobe Reader and other viewers?', a: 'Yes. AES-256 encrypted PDFs are fully compatible with Adobe Acrobat Reader, Preview (Mac), Foxit Reader, and all modern PDF viewers.' },
      { q: 'Can I protect multiple PDFs at once?', a: 'Currently, the tool processes one PDF at a time. For batch protection needs, contact us about API access.' },
      { q: 'Will the file size increase after encryption?', a: 'Yes, slightly — typically by a few kilobytes. The encryption overhead is minimal and will not noticeably affect the file size.' },
      { q: 'What\'s the difference between an open password and an owner password?', a: 'An open password (user password) prevents anyone from opening the file without the password. An owner password (permissions password) allows viewing but restricts editing, printing, or copying — even without sharing the password.' },
      { q: 'Can the password protection be opened on mobile devices?', a: 'Yes. Password-protected PDFs open correctly in Adobe Acrobat Reader for Android and iOS, and other mobile PDF apps.' },
      { q: 'Is my document uploaded to PDFA2Z servers?', a: 'Your document is transmitted over encrypted HTTPS and processed temporarily. It is deleted immediately after you download the protected version.' },
      { q: 'How do I create a strong password for my PDF?', a: 'Use at least 12 characters with uppercase, lowercase, numbers, and symbols. Avoid common words or birthdays. Use a password manager like Bitwarden or 1Password to generate and store it securely.' },
      { q: 'Can I add password protection to a PDF that already has a password?', a: 'You would need to unlock it first using our Unlock PDF tool, then re-protect it with the new password.' }
    ],
    features: [
      'AES-256 military-grade encryption',
      'Set open and owner passwords',
      'Restrict print, copy & edit',
      'Compatible with all PDF readers',
      'No file storage on servers',
      'Instant encryption & download',
      'No signup required',
      'Works on mobile & desktop'
    ],
    tips: ['Use a password manager to generate and securely store your PDF passwords.'],
    relatedGuides: ['how-to-password-protect-pdf-free'],
    type: ToolType.PDF_SUITE,
    icon: Lock,
    mode: 'PROTECT'
  },
  'unlock-pdf': {
    slug: 'unlock-pdf',
    title: 'Free Unlock PDF — Remove PDF Password & Restrictions Online',
    description: 'Free online PDF unlocker. Remove passwords and security restrictions from PDF files you own. Decrypt secured PDFs instantly. No signup, no watermark.',
    h1: 'Unlock PDF — Remove Password Free',
    intro: 'Remove password protection and editing restrictions from your own PDF documents. Whether you\'ve forgotten an owner password or need to unlock a PDF for editing, our tool creates a fully accessible, unprotected copy in seconds — free and no signup required.',
    steps: [
      'Upload the password-protected or restricted PDF file.',
      'If the PDF has an "open password" (required to view the file), enter it when prompted to verify you are the authorized owner.',
      'For PDFs that only have owner restrictions (printing/editing disabled but no view password), restrictions can often be removed without any password.',
      'Click "Unlock PDF" to process and remove the restrictions.',
      'Download the unlocked, unrestricted PDF — use our Protect PDF tool if you want to re-secure it with a new password.'
    ],
    faqs: [
      { q: 'Is PDF unlocking free on PDFA2Z?', a: 'Yes, completely free with no signup required.' },
      { q: 'Can you remove a password I don\'t know?', a: 'No. This tool removes passwords from PDFs you have legitimate access to. You must provide the open password if one is set. We do not brute-force or crack unknown passwords.' },
      { q: 'What\'s the difference between an open password and an owner password?', a: 'An open password prevents anyone from opening the file at all. An owner password (permissions password) allows viewing but restricts editing, printing, or copying. Owner restrictions can often be removed without the password.' },
      { q: 'Can I remove restrictions that prevent printing and copying?', a: 'Yes. PDFs with only owner restrictions (editing/printing disabled but no view password required) can often have those restrictions removed instantly without a password.' },
      { q: 'Does unlocking a PDF change any of its content?', a: 'No. The content, formatting, images, and structure remain completely unchanged. Only the security restrictions are removed.' },
      { q: 'Is it legal to unlock a PDF?', a: 'It is legal to remove restrictions from PDF documents you own or have the right to access. It is not legal to use this tool to access documents you are not authorized to view or to circumvent commercially distributed copy protection.' },
      { q: 'What happens if I enter the wrong password?', a: 'The tool will notify you that the password is incorrect. You will have multiple attempts to enter the correct password.' },
      { q: 'Can I unlock a PDF on a mobile device?', a: 'Yes. The tool works fully in mobile browsers on Android and iOS.' },
      { q: 'Is there a file size limit for unlocking?', a: 'Files up to 500MB can be uploaded for unlocking.' },
      { q: 'How long does unlocking take?', a: 'Most PDFs are unlocked in 2-5 seconds. Very large files may take up to 30 seconds.' },
      { q: 'After unlocking, will the PDF still be compatible with all PDF readers?', a: 'Yes. The unlocked PDF is a fully standard, unencrypted PDF compatible with Adobe Acrobat, Preview, and all modern PDF readers.' },
      { q: 'Can I re-protect the PDF after unlocking with a different password?', a: 'Yes. After downloading the unlocked PDF, use our Protect PDF tool to add new AES-256 encryption with a new password.' }
    ],
    features: [
      'Remove open passwords (with verification)',
      'Remove owner/permissions restrictions',
      'No content changes',
      'Fast decryption in seconds',
      'No signup, no watermark',
      'Works on mobile & desktop',
      'Files deleted immediately after',
      'Re-protect with Protect PDF tool'
    ],
    type: ToolType.PDF_SUITE,
    icon: Unlock,
    mode: 'UNLOCK'
  },
  'pdf-to-excel': {
    slug: 'pdf-to-excel',
    title: 'Free PDF to Excel Converter — Extract Tables to XLSX Online',
    description: 'Free PDF to Excel converter. Convert PDF to Excel (XLSX/XLS) online — automatically extracts tables and data. No signup, no watermark. Best free PDF to Excel tool.',
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
    icon: Table,
    mode: 'TO_EXCEL'
  },
  'jpg-to-pdf': {
    slug: 'jpg-to-pdf',
    title: 'Free JPG to PDF Converter — Convert Images to PDF Online',
    description: 'Free JPG to PDF converter online. Convert JPG, PNG, WebP, or BMP images to PDF instantly. Combine multiple images into one PDF. No signup, no watermark.',
    h1: 'Convert JPG to PDF Free',
    intro: 'Turn your images into a professional PDF document in seconds. Upload one or multiple JPGs, PNGs, or WebPs, rearrange them in any order, and download a combined PDF — perfect for portfolios, scanned documents, and photo collections.',
    steps: [
      'Click "Upload Images" or drag and drop your JPG, PNG, WebP, or BMP files onto the tool. You can select multiple images at once.',
      'Drag the image thumbnails to reorder them — the arrangement on screen becomes the page order in the PDF.',
      'Select your page size (A4, Letter, or "fit to image") and orientation (portrait or landscape).',
      'Click "Convert to PDF" to create your document.',
      'Download the combined PDF file containing all your images as pages.'
    ],
    features: [
      'Convert JPG, PNG, WebP, BMP to PDF',
      'Combine unlimited images',
      'Drag & drop page reordering',
      'Choose A4, Letter, or custom size',
      'Full image quality preserved',
      'No signup, no watermark',
      'Instant download',
      'Works on mobile & desktop'
    ],
    faqs: [
      { q: 'Is JPG to PDF conversion free on PDFA2Z?', a: 'Yes, completely free. No signup, no watermarks, no file limits.' },
      { q: 'Can I convert multiple images into one PDF?', a: 'Yes. Upload as many images as you need and they will be combined into a single PDF with one image per page.' },
      { q: 'Will the image quality be reduced in the PDF?', a: 'No. We embed your images at full quality in the PDF. No compression or quality loss occurs during conversion.' },
      { q: 'What image formats are supported?', a: 'JPG/JPEG, PNG, WebP, and BMP are all supported. The output is always a PDF.' },
      { q: 'Can I set a custom page size like A4 or Letter?', a: 'Yes. You can choose standard page sizes (A4, Letter, A3) or select "fit to image" to make each PDF page exactly the size of the image.' },
      { q: 'Will the images be centered on the page?', a: 'Images are fitted to the page with proportional margins. You can choose to fill the entire page or keep proportions with white space.' },
      { q: 'Can I rotate images before converting them to PDF?', a: 'Yes. Use the rotate button on each thumbnail to rotate images 90° before converting.' },
      { q: 'Is there a limit on how many images I can convert at once?', a: 'There is no hard limit. However, very large batches (100+ images) may take longer. Your browser memory is the practical limit.' },
      { q: 'Can I add a title page or text to the PDF?', a: 'This tool focuses on image-to-PDF conversion. For adding text, use our Edit PDF tool after conversion.' },
      { q: 'Will the resulting PDF be searchable?', a: 'No. Images converted to PDF are not text-searchable because they remain as image data. For searchable PDFs from scanned documents, use our PDF to Word converter with OCR instead.' },
      { q: 'Can I control the DPI or resolution of the output PDF?', a: 'The PDF embeds images at their native resolution. For print-quality PDFs, ensure your source images are at least 300 DPI.' },
      { q: 'Can I convert PNG, WebP, and BMP to PDF the same way?', a: 'Yes. The same tool handles all image formats (JPG, PNG, WebP, BMP) and converts them all to PDF in exactly the same way.' }
    ],
    type: ToolType.PDF_SUITE,
    icon: Image,
    mode: 'IMG_TO_PDF'
  },
  'word-to-pdf': {
    slug: 'word-to-pdf',
    title: 'Free Word to PDF Converter — Convert DOC/DOCX to PDF Online',
    description: 'Free Word to PDF converter online. Convert Microsoft Word DOC and DOCX files to PDF instantly. Preserves formatting, fonts, and layout. No signup required.',
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
    icon: FileType,
    mode: 'WORD_TO_PDF'
  },
  'pdf-to-html': {
    slug: 'pdf-to-html',
    title: 'Free PDF to HTML Converter — Convert PDF to Web Page Online',
    description: 'Free PDF to HTML converter. Turn your PDF documents into HTML5 web pages instantly. Preserve text, images, and layout. No signup required.',
    h1: 'Free PDF to HTML Converter',
    intro: 'Make your PDF documents web-ready. Convert any PDF to a clean HTML5 web page that looks great in any browser, preserving your original content and layout.',
    steps: ['Upload your PDF file.', 'Wait for the conversion to complete.', 'Download your HTML file or ZIP archive.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, converting PDF to HTML on PDFA2Z is completely free.' },
      { q: 'Does it preserve images?', a: 'Yes, images from the PDF are included and embedded in the HTML output.' }
    ],
    features: ['Preserve Text & Images', 'HTML5 Output', 'No Signup', 'Fast Conversion', 'Secure Processing'],
    type: ToolType.PDF_SUITE,
    icon: Code,
    mode: 'TO_HTML'
  },
  'page-numbers': {
    slug: 'page-numbers',
    title: 'Free Add Page Numbers to PDF — Online PDF Numbering Tool',
    description: 'Free online tool to add page numbers to PDF files. Choose position (header/footer), starting number, and font style. No signup, instant download.',
    h1: 'Add Page Numbers to PDF Free',
    intro: 'Professionally number your PDF pages. Choose exactly where numbers appear — top or bottom, left, center, or right — and customize font and starting number.',
    steps: ['Upload your PDF.', 'Choose number position (header or footer) and alignment.', 'Set starting page number and font size.', 'Download your numbered PDF.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, adding page numbers to PDF is completely free on PDFA2Z.' },
      { q: 'Can I start from a custom number?', a: 'Yes, you can set any starting number (e.g., start from page 5).' }
    ],
    features: ['Header & Footer Placement', 'Custom Start Number', 'Font Size Control', 'No Signup', 'Instant Download'],
    type: ToolType.PDF_SUITE,
    icon: Hash,
    mode: 'PAGE_NUMBERS'
  },
  'delete-pages': {
    slug: 'delete-pages',
    title: 'Free Delete PDF Pages — Remove Unwanted Pages Online',
    description: 'Free online tool to delete or remove pages from a PDF file. Select specific pages or page ranges to remove instantly. No signup, no watermark.',
    h1: 'Free Delete Pages from PDF',
    intro: 'Remove unwanted pages from your PDF in seconds. Select individual pages or ranges and download your clean, trimmed PDF immediately.',
    steps: ['Upload your PDF file.', 'Select the page numbers you want to remove (e.g., 3, 5-8).', 'Click "Delete Pages".', 'Download your updated PDF.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, deleting PDF pages is completely free on PDFA2Z.' },
      { q: 'Can I delete multiple pages at once?', a: 'Yes, enter a comma-separated list or range (e.g., 1, 3-5, 8).' }
    ],
    features: ['Delete Individual Pages', 'Page Range Selection', 'Instant Processing', 'No Signup', 'No Watermark'],
    type: ToolType.PDF_SUITE,
    icon: Trash2,
    mode: 'DELETE_PAGES'
  },
  'grayscale-pdf': {
    slug: 'grayscale-pdf',
    title: 'Free Grayscale PDF — Convert PDF to Black & White Online',
    description: 'Free online PDF grayscale converter. Convert colored PDF pages to black and white to save printer ink and reduce file size. No signup required.',
    h1: 'Free Convert PDF to Grayscale',
    intro: 'Save on printing costs by converting your PDF to black and white. Our free grayscale converter removes all colors from your PDF while keeping all text and images crisp.',
    steps: ['Upload your color PDF.', 'Click "Convert to Grayscale".', 'Download your black and white PDF.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, converting PDF to grayscale is completely free on PDFA2Z.' },
      { q: 'Will text remain sharp?', a: 'Yes, text stays sharp and all content is preserved — only color is removed.' }
    ],
    features: ['Remove All Colors', 'Save Ink on Printing', 'Reduce File Size', 'No Signup', 'Instant Download'],
    type: ToolType.PDF_SUITE,
    icon: Paintbrush,
    mode: 'GRAYSCALE'
  },
  'watermark-pdf': {
    slug: 'watermark-pdf',
    title: 'Free PDF Watermark Tool — Add Text or Image Watermark Online',
    description: 'Free online PDF watermarking. Add custom text or image watermarks to your PDF to protect or brand your documents. Control opacity, size, and position. No signup.',
    h1: 'Free Add Watermark to PDF',
    intro: 'Brand and protect your PDF documents with custom watermarks. Add "CONFIDENTIAL", "DRAFT", or your logo to every page with full control over size, position, and opacity.',
    steps: ['Upload your PDF.', 'Choose text or image watermark.', 'Set position, opacity, and font size.', 'Download your watermarked PDF.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, adding watermarks to PDFs is completely free on PDFA2Z.' },
      { q: 'Can I control the opacity?', a: 'Yes, you can adjust transparency from 10% to 100% so the watermark is subtle or bold.' }
    ],
    features: ['Text & Image Watermarks', 'Adjustable Opacity', 'Custom Position', 'Diagonal Stamp', 'No Signup'],
    type: ToolType.PDF_SUITE,
    icon: Stamp,
    mode: 'WATERMARK'
  },
  'repair-pdf': {
    slug: 'repair-pdf',
    title: 'Free Repair PDF — Fix Corrupted PDF Files Online',
    description: 'Free PDF repair tool. Fix corrupted, damaged, or broken PDF files that won\'t open. Recover and restore your documents instantly. No signup required.',
    h1: 'Free Repair Corrupted PDF',
    intro: 'Can\'t open your PDF? Our free repair tool attempts to recover and fix corrupted or damaged PDF files so you can access your documents again.',
    steps: ['Upload your corrupted or broken PDF.', 'Our tool analyzes and attempts to repair the file.', 'Download your repaired PDF if recovery is successful.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, repairing PDF files is completely free on PDFA2Z.' },
      { q: 'Can all PDFs be repaired?', a: 'We can repair most lightly corrupted PDFs. Severely damaged files may not be fully recoverable.' }
    ],
    features: ['Fix Corrupted PDFs', 'Recover Unreadable Files', 'No Data Loss', 'No Signup', 'Instant Processing'],
    type: ToolType.PDF_SUITE,
    icon: Wrench,
    mode: 'REPAIR'
  },
  'flatten-pdf': {
    slug: 'flatten-pdf',
    title: 'Free Flatten PDF — Lock PDF Forms & Merge Layers Online',
    description: 'Free PDF flattening tool. Flatten PDF forms, annotations, and layers into a single non-editable layer. Perfect for archiving and printing. No signup.',
    h1: 'Free Flatten PDF Online',
    intro: 'Lock down your filled PDF forms by flattening them. Prevents editing of form fields and merges all annotations and layers into a single printable layer.',
    steps: ['Upload your PDF form or layered PDF.', 'Click "Flatten PDF".', 'Download the flattened, print-ready PDF.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, flattening PDFs is completely free on PDFA2Z.' },
      { q: 'What does flattening do?', a: 'It merges all interactive form fields, annotations, and layers into static content that cannot be edited.' }
    ],
    features: ['Flatten Form Fields', 'Lock Annotations', 'Merge Layers', 'Print-Ready Output', 'No Signup'],
    type: ToolType.PDF_SUITE,
    icon: Layers,
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
    icon: EyeOff,
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
    icon: Move,
    mode: 'RESIZE'
  },
  'convert-image': {
    slug: 'convert-image',
    title: 'Free Image Converter — Convert JPG to PNG, WebP, GIF Online',
    description: 'Free online image converter. Convert JPG, PNG, WebP, HEIC, BMP, and GIF formats instantly. Batch convert multiple images at once. No signup required.',
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
    icon: RefreshCw,
    mode: 'CONVERT'
  },
  'crop-image': {
    slug: 'crop-image',
    title: 'Free Crop Image Online — Cut & Trim Photos Instantly',
    description: 'Free online image cropper. Crop JPG, PNG, and WebP photos to remove unwanted areas, change aspect ratio, or focus on your subject. No signup required.',
    h1: 'Free Crop Image Online',
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
    icon: Scissors,
    mode: 'CROP'
  },
  'rotate-image': {
    slug: 'rotate-image',
    title: 'Free Rotate Image Online — Flip & Rotate Photos 90°/180°',
    description: 'Free online image rotation tool. Rotate JPG, PNG, and WebP photos 90°, 180°, or 270°. Flip horizontally or vertically. Fix sideways photos instantly. No signup.',
    h1: 'Free Rotate Image Online',
    intro: 'Fix upside-down or sideways photos instantly. Rotate your images 90°, 180°, or 270° and flip horizontally or vertically — all with a single click.',
    steps: [
      'Upload your image (JPG, PNG, or WebP).',
      'Use the rotation buttons to rotate 90° left, 90° right, or 180°.',
      'Flip horizontally or vertically if needed.',
      'Download your corrected image.'
    ],
    features: ['90°, 180°, 270° Rotation', 'Horizontal & Vertical Flip', 'Lossless Rotation', 'No Signup', 'Instant Download'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, rotating images on PDFA2Z is completely free.' },
      { q: 'Does rotating reduce quality?', a: 'No, image quality is fully preserved during rotation.' }
    ],
    type: ToolType.IMAGE_TOOLKIT,
    icon: RotateCw,
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
    icon: Smile,
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
    icon: Grid,
    mode: 'COLLAGE'
  },
  'compare-image': {
    slug: 'compare-image',
    title: 'Free Image Comparison Tool — Before & After Slider Online',
    description: 'Free online before and after image comparison tool. Create interactive drag sliders to showcase edits, renovations, or transformations. No signup required.',
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
    icon: Move,
    mode: 'COMPARE'
  },
  'face-blur': {
    slug: 'face-blur',
    title: 'Free Face Blur Tool — Anonymize & Blur Faces in Photos Online',
    description: 'Free AI-powered face blur tool. Automatically detect and blur faces in photos to protect privacy. Perfect for sharing photos publicly. No signup required.',
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
    icon: UserMinus,
    mode: 'FACE_BLUR'
  },
  'upscale-image': {
    slug: 'upscale-image',
    title: 'Free AI Image Upscaler — Enhance Photo Quality to 4K Online',
    description: 'Free AI-powered image upscaler. Upscale low-resolution photos to 2x or 4x HD quality without losing sharpness. Fix blurry images instantly. No signup required.',
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
    icon: Maximize2,
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
    icon: PlusCircle,
    mode: 'ROUND'
  },
  'sign-pdf': {
    slug: 'sign-pdf',
    title: 'Free Sign PDF Online — Add E-Signature to PDF (No Signup)',
    description: 'Free online PDF signer. Draw, type, or upload your signature and add it to any PDF. Legally valid e-signature, no signup needed. Download signed PDF instantly.',
    h1: 'Sign PDF Online — Free',
    intro: 'Electronically sign any PDF document in under a minute — for free. Draw your signature with a mouse or finger, type it in a handwriting font, or upload a photo of your actual signature. Place it anywhere on any page and download a signed PDF instantly. No account needed.',
    steps: [
      'Upload the PDF document you need to sign by clicking "Upload" or dragging the file.',
      'Choose how to create your signature: Draw (use your mouse or touchscreen), Type (pick from handwriting fonts), or Upload (photo of your actual signature).',
      'Drag the signature to the correct position on the page. Resize it by dragging the corner handles.',
      'Navigate between pages if you need to sign multiple pages.',
      'Click "Download Signed PDF" to save the finalized document with your signature permanently embedded.'
    ],
    faqs: [
      { q: 'Is signing PDFs free on PDFA2Z?', a: 'Yes, 100% free. No signup, no subscription, no watermarks.' },
      { q: 'Is an e-signature legally valid?', a: 'Yes. Electronic signatures are legally recognized in most countries under the ESIGN Act (USA), eIDAS (EU), and similar legislation in the UK, Canada, India, and Australia. They are equivalent to handwritten signatures for most contracts and agreements.' },
      { q: 'What signature methods are supported?', a: 'Three methods: (1) Draw — write with mouse or finger on a canvas, (2) Type — generate a signature from your name in handwriting fonts, (3) Upload — take a photo of your ink signature and upload it.' },
      { q: 'Can I sign multiple pages of the same PDF?', a: 'Yes. After placing a signature on one page, navigate to other pages and add signatures or initials as needed.' },
      { q: 'Can I add the date next to my signature?', a: 'Yes. Use the Text tool in the editor to add a date field anywhere on the document.' },
      { q: 'Does signing permanently embed the signature in the PDF?', a: 'Yes. When you download the signed PDF, your signature is permanently embedded as part of the document — it cannot be moved or deleted without visible evidence of tampering.' },
      { q: 'Can I sign a PDF on a mobile phone or tablet?', a: 'Yes. The tool works fully in mobile browsers. The Draw mode is especially intuitive on touchscreens — just use your finger.' },
      { q: 'Is my signature stored on PDFA2Z servers?', a: 'Your signature is processed temporarily and the signed document is not stored after you download it. We never retain or share your signature data.' },
      { q: 'Can I add initials instead of a full signature?', a: 'Yes. Create a short "signature" with just your initials using the Draw or Type method. Place it wherever initials are required in the document.' },
      { q: 'What\'s the difference between an electronic signature and a digital signature?', a: 'An electronic signature (like drawing your name) indicates intent to agree. A digital signature is a cryptographic certificate that also verifies the signer\'s identity through a Certificate Authority. PDFA2Z provides electronic signatures; for certified digital signatures, you need a PKI certificate.' },
      { q: 'Can multiple people sign the same PDF?', a: 'For self-signing (adding your own signature) this tool handles one signer at a time. For sending a document to multiple signers remotely, use our free Remote E-Sign tool which supports up to 5 signers with full audit trails.' },
      { q: 'What file formats can I sign?', a: 'Only PDF files are supported for signing. If you have a Word or image document, convert it to PDF first using our free converter tools.' }
    ],
    features: [
      'Draw signature with mouse or finger',
      'Type signature with handwriting fonts',
      'Upload photo of ink signature',
      'Sign any page in any position',
      'Legally valid e-signature',
      'No signup, no watermark',
      'Works on mobile & desktop',
      'Signature permanently embedded'
    ],
    type: ToolType.PDF_SUITE,
    icon: PenTool,
    mode: 'SIGN'
  },
  'compress-image': {
    slug: 'compress-image',
    title: 'Free Image Compressor — Reduce JPG/PNG File Size Online',
    description: 'Free online image compressor. Reduce JPG, PNG, and WebP file sizes by up to 90% without visible quality loss. Perfect for web optimization. No signup required.',
    h1: 'Free Image Compressor Online',
    intro: 'Make your images load faster without sacrificing quality. Our smart compression engine reduces file sizes up to 90% while keeping your photos looking sharp.',
    steps: ['Upload your JPG, PNG, or WebP image.', 'Choose compression level (Balanced or Maximum).', 'Preview the quality vs size tradeoff.', 'Download your compressed image.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, compressing images on PDFA2Z is completely free with no signup.' },
      { q: 'How much can I reduce size?', a: 'Typically 50-90% size reduction depending on the image and compression level.' },
      { q: 'Will quality suffer?', a: 'Our Balanced mode keeps quality nearly identical to the original.' }
    ],
    features: ['Up to 90% Size Reduction', 'No Visible Quality Loss', 'JPG, PNG, WebP Support', 'Batch Compression', 'No Signup'],
    type: ToolType.IMAGE_TOOLKIT,
    icon: Minimize2,
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
    icon: Grid,
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
    icon: Download,
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
    icon: Layers,
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
    icon: ListOrdered,
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
    icon: LayoutTemplate,
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
    type: ToolType.AI_WRITER,
    icon: Zap
  },
  'batch-resize': {
    slug: 'batch-resize',
    title: 'Free Batch Image Resizer — Resize Multiple Images at Once Online',
    description: 'Free bulk image resizer. Resize 50+ JPG, PNG, and WebP images simultaneously. Set dimensions once, apply to all. Download as ZIP. No signup required.',
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
    icon: FileStack,
    mode: 'BATCH_RESIZE'
  },
  'watermark-image': {
    slug: 'watermark-image',
    title: 'Free Watermark Image Online — Add Logo or Text to Photos',
    description: 'Free online image watermarking tool. Protect your photography by adding text copyright or logo overlays to images. Adjustable opacity and position. No signup.',
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
    icon: Stamp,
    mode: 'WATERMARK'
  },
  'flip-image': {
    slug: 'flip-image',
    title: 'Free Flip Image Online — Mirror Photo Horizontally or Vertically',
    description: 'Free online image flipper. Mirror photos horizontally or vertically. Fix mirrored selfies, create reflections, and correct image orientation. No signup needed.',
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
    icon: RotateCw,
    mode: 'FLIP'
  },
  'pixelate-image': {
    slug: 'pixelate-image',
    title: 'Free Pixelate Image — Censor & Blur Photos Online',
    description: 'Free online pixelate tool. Blur or censor faces, license plates, or sensitive info in photos. Create retro 8-bit pixel art effects. No signup required.',
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
    icon: Grid,
    mode: 'PIXELATE'
  },
  'invert-image': {
    slug: 'invert-image',
    title: 'Free Invert Image Colors — Negative Photo Effect Online',
    description: 'Free online color inversion tool. Invert image colors to create a negative photo effect instantly. Turn white to black and vice versa. No signup required.',
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
    icon: RotateCw,
    mode: 'INVERT'
  },
  'extract-images': {
    slug: 'extract-images',
    title: 'Free Extract Images from PDF — Save All PDF Images Online',
    description: 'Free online PDF image extractor. Extract and save all images from a PDF file in their original quality as a ZIP archive. No signup required.',
    h1: 'Free Extract Images from PDF',
    intro: 'Save all photos and graphics embedded in your PDF. Our extractor pulls every image from the document and packages them in a single ZIP download.',
    steps: ['Upload your PDF file.', 'Wait while we extract all embedded images.', 'Download all images as a ZIP archive.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, extracting images from PDF is completely free on PDFA2Z.' },
      { q: 'What formats are the images saved as?', a: 'Images are saved in their original format (JPG, PNG, etc.) from the PDF.' }
    ],
    features: ['Extract All Images', 'Original Quality', 'ZIP Download', 'Supports All PDF Types', 'No Signup'],
    type: ToolType.PDF_SUITE,
    icon: ImageDown,
    mode: 'EXTRACT_IMAGES'
  },
  'reverse-pdf': {
    slug: 'reverse-pdf',
    title: 'Free Reverse PDF — Flip Page Order Online Instantly',
    description: 'Free online PDF page reversal tool. Reverse the page order of any PDF document instantly. Perfect for fixing print order issues. No signup required.',
    h1: 'Free Reverse PDF Page Order',
    intro: 'Flip the page order of your PDF instantly. If your scanner produces pages in reverse order, this tool fixes it in one click.',
    steps: ['Upload your PDF file.', 'Click "Reverse Pages".', 'Download your PDF with pages in the reversed order.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, reversing PDF pages is completely free on PDFA2Z.' },
      { q: 'Does it affect the content?', a: 'No, only the order of pages changes. All content remains exactly the same.' }
    ],
    features: ['Instant Page Reversal', 'No Content Changes', 'Fix Scanner Output', 'No Signup', 'Fast Processing'],
    type: ToolType.PDF_SUITE,
    icon: ListOrdered,
    mode: 'REVERSE'
  },
  'edit-pdf': {
    slug: 'edit-pdf',
    title: 'Free PDF Editor Online — Edit, Annotate & Draw on PDF Files',
    description: 'Free online PDF editor. Add text, draw shapes, highlight, whiteout, sign, and annotate PDF files directly in your browser. No signup, no installation needed.',
    h1: 'Free Online PDF Editor',
    intro: 'Edit any PDF directly in your browser — no downloads, no software, no signup. Add and drag custom text boxes, draw freehand, highlight passages, add sticky notes, whiteout existing content, and sign documents. All edits are embedded permanently when you download.',
    steps: [
      'Upload your PDF file by clicking "Upload" or dragging it onto the editor. Large multi-page PDFs are fully supported.',
      'Select a page from the thumbnail gallery on the left to open it in the interactive editing canvas.',
      'Use the toolbar to choose your editing tool: Text (add typed content), Pen (freehand drawing), Highlight, Sticky Note, Whiteout, or Shapes.',
      'Click or tap on the canvas to place your element. Text boxes, images, and signature blocks can be dragged and resized.',
      'Review your changes using the page preview. When satisfied, click "Download Edited PDF" to save a new PDF with all edits permanently embedded.'
    ],
    faqs: [
      { q: 'Is the PDF editor free on PDFA2Z?', a: 'Yes, completely free. No signup, no watermarks, unlimited use.' },
      { q: 'Does the PDF editor work on mobile?', a: 'Yes. The editor is touch-optimized and works on iPhone, iPad, and Android devices. Freehand drawing is especially natural with a touchscreen.' },
      { q: 'Can I delete or replace existing text in a PDF?', a: 'Directly editing existing PDF text is complex in a browser-based tool. However, you can use the Whiteout tool to cover existing text and then add new text on top of it.' },
      { q: 'Can I add images to a PDF?', a: 'Yes. Use the Image Insert tool to upload and place images anywhere on any PDF page. Resize and reposition by dragging.' },
      { q: 'Can I highlight text in a PDF?', a: 'Yes. The Highlight tool lets you drag-select areas to apply yellow, green, or pink highlight overlays over any part of the document.' },
      { q: 'Can I add sticky notes or comments?', a: 'Yes. Sticky notes can be placed on any page to add reviewer comments that appear as pop-up annotations in standard PDF readers.' },
      { q: 'Can I whiteout (cover) existing text?', a: 'Yes. The Whiteout tool draws a white rectangle over any area, effectively hiding the content underneath. Use our Redact PDF tool for permanent data removal from the PDF stream.' },
      { q: 'What drawing tools are available?', a: 'Freehand pen, straight line, rectangle, circle, and arrow tools are all available in the toolbar.' },
      { q: 'Are my edits saved permanently in the downloaded PDF?', a: 'Yes. When you download the edited PDF, all annotations, text, drawings, and signatures are permanently embedded. Recipients do not need special software to see the edits.' },
      { q: 'Can I undo edits I don\'t want?', a: 'Yes. Use Ctrl+Z (or Cmd+Z on Mac) to undo your last action. You can undo multiple steps.' },
      { q: 'Can I edit password-protected PDFs?', a: 'Only if you know the password. Unlock the PDF first using our free Unlock PDF tool, then edit it in the editor.' },
      { q: 'Is there a page limit for the PDF I can edit?', a: 'No hard limit, though very large PDFs (100+ pages, 50MB+) may load slower. For best performance, use our Split PDF tool to work on sections of very large documents.' }
    ],
    features: [
      'Add and drag custom text boxes',
      'Freehand pen and shape drawing',
      'Highlight, underline & strikethrough',
      'Sticky notes & comments',
      'Whiteout existing content',
      'Insert images anywhere',
      'No signup, no watermark',
      'Works on mobile & desktop'
    ],
    type: ToolType.PDF_SUITE,
    icon: FileEdit,
    mode: 'EDIT'
  },
  'crop-pdf': {
    slug: 'crop-pdf',
    title: 'Free Crop PDF Online — Trim Margins & White Space Instantly',
    description: 'Free online PDF cropping tool. Remove margins, white space, and unwanted borders from PDF pages. Set custom crop margins for all pages. No signup.',
    h1: 'Free Crop PDF Pages Online',
    intro: 'Remove excessive margins and white space from your PDF pages. Set precise crop margins to trim all pages uniformly and get a clean, professional result.',
    steps: ['Upload PDF', 'Set crop margin', 'Download cropped PDF'],
    faqs: [
      { q: 'Does it crop all pages?', a: 'Yes, the crop is applied to all pages.' }
    ],
    features: ['Visual margin adjustment', 'Crop all pages', 'Instant download'],
    type: ToolType.PDF_SUITE,
    icon: Scissors,
    mode: 'CROP'
  },
  'pdf-to-csv': {
    slug: 'pdf-to-csv',
    title: 'Free PDF to CSV Converter — Extract Tables to CSV Online',
    description: 'Free PDF to CSV converter. Extract data tables from PDF files and convert to CSV format compatible with Excel, Google Sheets, and more. No signup.',
    h1: 'Free Convert PDF to CSV',
    intro: 'Extract tabular data from your PDF and convert it to a CSV file you can open in Excel, Google Sheets, or any data tool. Stop copying data by hand.',
    steps: ['Upload PDF', 'Click Convert', 'Download CSV'],
    faqs: [
      { q: 'Can it handle scanned PDFs?', a: 'For scanned PDFs you might need an OCR tool.' }
    ],
    features: ['Extract tabular data', 'Excel compatible CSV', 'Fast conversion'],
    type: ToolType.PDF_SUITE,
    icon: FileSpreadsheet,
    mode: 'PDF_TO_CSV'
  },
  'url-to-pdf': {
    slug: 'url-to-pdf',
    title: 'Free URL to PDF — Convert Any Webpage to PDF Online',
    description: 'Free online webpage to PDF converter. Paste any URL and save the webpage as a PDF document instantly. Archive articles, save receipts, and share web content as PDF.',
    h1: 'Free Convert URL to PDF',
    intro: 'Save any webpage as a PDF document. Just paste the URL and we\'ll capture the full page — including images, styles, and layout — and convert it to a clean PDF.',
    steps: ['Open Webpage', 'Print (Ctrl+P)', 'Save as PDF'],
    faqs: [
      { q: 'Do I need software?', a: 'No, just your browser.' }
    ],
    features: ['Convert any website', 'Maintain layout', 'No installation needed'],
    type: ToolType.PDF_SUITE,
    icon: FileSearch,
    mode: 'URL_TO_PDF'
  },
  'html-to-pdf': {
    slug: 'html-to-pdf',
    title: 'Free HTML to PDF Converter — Convert HTML Code to PDF Online',
    description: 'Free online HTML to PDF converter. Paste HTML and CSS code and convert it into a professional PDF document instantly. Real-time preview. No signup required.',
    h1: 'Convert HTML Code to PDF',
    intro: 'Paste your HTML code and transform it into a high-fidelity PDF document instantly.',
    steps: [
      'Paste your HTML and CSS code into the editor.',
      'Check the real-time preview of your document.',
      'Click "Convert & Download" to generate your PDF.'
    ],
    faqs: [
      { q: 'Can I include CSS?', a: 'Yes, you can include <style> tags or inline styles per page.' },
      { q: 'Is it secure?', a: 'Absolutely. All rendering happens locally in your browser.' }
    ],
    features: [
      'Real-time HTML Preview',
      'Full CSS Support',
      'No Server-side Storage',
      'High-Fidelity Rendering'
    ],
    type: ToolType.PDF_SUITE,
    icon: FileCode,
    mode: 'HTML_TO_PDF'
  },
  'pdf-to-ppt': {
    slug: 'pdf-to-ppt',
    title: 'Free PDF to PowerPoint Converter — Convert PDF to PPTX Online',
    description: 'Free PDF to PowerPoint converter. Convert PDF slides to editable PPTX files online. Preserve text, layout, and images. No signup, instant download.',
    h1: 'Free Convert PDF to PowerPoint',
    intro: 'Turn your PDF presentations into fully editable PowerPoint files. Modify slides, update text, and present with confidence.',
    steps: ['Upload your PDF presentation.', 'Wait for the conversion to PPTX.', 'Download your editable PowerPoint file.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, converting PDF to PowerPoint is completely free on PDFA2Z.' },
      { q: 'Can I edit the slides after conversion?', a: 'Yes, the output is a fully editable PPTX file you can open in PowerPoint or Google Slides.' }
    ],
    features: ['Editable PPTX Output', 'Preserve Slide Layout', 'Fast Conversion', 'No Signup', 'Instant Download'],
    type: ToolType.PDF_SUITE,
    icon: FileType,
    mode: 'PDF_TO_PPT'
  },
  'ppt-to-pdf': {
    slug: 'ppt-to-pdf',
    title: 'Free PowerPoint to PDF Converter — Convert PPT/PPTX to PDF',
    description: 'Free online PowerPoint to PDF converter. Convert PPT and PPTX slides to PDF format while preserving your design, fonts, and images. No signup required.',
    h1: 'Free Convert PowerPoint to PDF',
    intro: 'Share your presentations universally by converting to PDF. Perfect for sending slides that look identical on any device.',
    steps: ['Upload your PPT or PPTX file.', 'Wait for the conversion to complete.', 'Download your PDF file.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, converting PowerPoint to PDF is completely free on PDFA2Z.' },
      { q: 'Will animations be preserved?', a: 'Animations are not preserved in PDF format — each slide is captured as a static page.' }
    ],
    features: ['Preserve Fonts & Layout', 'PPT & PPTX Support', 'Fast Conversion', 'No Signup', 'Universal PDF Output'],
    type: ToolType.PDF_SUITE,
    icon: FileType,
    mode: 'PPT_TO_PDF'
  },
  'epub-to-pdf': {
    slug: 'epub-to-pdf',
    title: 'Free EPUB to PDF Converter — Convert eBook to PDF Online',
    description: 'Free online EPUB to PDF converter. Convert EPUB eBooks to universal PDF format so you can read them on any device. No signup, instant download.',
    h1: 'Free Convert EPUB to PDF',
    intro: 'Read your eBooks anywhere by converting EPUB to PDF. PDFs open on every device — smartphones, tablets, computers — without a special eBook reader app.',
    steps: ['Upload your EPUB eBook file.', 'Wait for the conversion to PDF.', 'Download your PDF file.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, converting EPUB to PDF is completely free on PDFA2Z.' },
      { q: 'Will the formatting be preserved?', a: 'Text, chapters, and images are preserved. Complex EPUB layouts may vary slightly.' }
    ],
    features: ['EPUB to PDF Conversion', 'Preserve Chapters & Text', 'Read on Any Device', 'No Signup', 'Instant Download'],
    type: ToolType.PDF_SUITE,
    icon: FileType,
    mode: 'EPUB_TO_PDF'
  },
  'mobi-to-pdf': {
    slug: 'mobi-to-pdf',
    title: 'Free MOBI to PDF Converter — Convert Kindle Books to PDF Online',
    description: 'Free online MOBI to PDF converter. Convert Kindle MOBI eBooks to PDF format so they can be read on any device. No signup, instant conversion.',
    h1: 'Free Convert MOBI to PDF',
    intro: 'Convert your Kindle MOBI eBook files to universal PDF format. Read your books on any device without needing the Kindle app.',
    steps: ['Upload your MOBI file.', 'Wait for conversion.', 'Download your PDF file.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, converting MOBI to PDF is completely free on PDFA2Z.' }
    ],
    features: ['MOBI & AZW3 Support', 'Preserve Text & Images', 'Read on Any Device', 'No Signup', 'Fast Conversion'],
    type: ToolType.PDF_SUITE,
    icon: FileType,
    mode: 'MOBI_TO_PDF'
  },
  'outlook-to-pdf': {
    slug: 'outlook-to-pdf',
    title: 'Free Email to PDF Converter — Convert MSG/EML to PDF Online',
    description: 'Free online email to PDF converter. Convert Outlook MSG and EML email files to PDF for archiving, sharing, or printing. No signup required.',
    h1: 'Free Convert Email to PDF',
    intro: 'Archive and share your emails as PDFs. Convert Outlook MSG and EML files to clean PDF documents — preserving the email body, sender, and attachments summary.',
    steps: ['Upload your MSG or EML email file.', 'Wait for conversion.', 'Download your email as a PDF.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, converting emails to PDF is completely free on PDFA2Z.' },
      { q: 'What formats are supported?', a: 'We support MSG (Outlook) and EML (standard email) formats.' }
    ],
    features: ['MSG & EML Support', 'Preserve Email Formatting', 'Archive Emails as PDF', 'No Signup', 'Instant Download'],
    type: ToolType.PDF_SUITE,
    icon: Mail,
    mode: 'OUTLOOK_TO_PDF'
  },
  'pdf-to-text': {
    slug: 'pdf-to-text',
    title: 'Free PDF to Text Extractor — Copy Plain Text from PDF Online',
    description: 'Free online PDF to text converter. Extract all plain text content from any PDF file instantly. Copy, paste, or download the extracted text. No signup.',
    h1: 'Free Extract Text from PDF',
    intro: 'Pull all the text content from your PDF documents instantly. Whether you need to copy a few paragraphs or extract an entire document, our tool does it in seconds.',
    steps: ['Upload your PDF file.', 'Wait while we extract all text content.', 'Copy the text or download it as a TXT file.'],
    faqs: [
      { q: 'Is it free?', a: 'Yes, extracting text from PDF is completely free on PDFA2Z.' },
      { q: 'Does it work on scanned PDFs?', a: 'For scanned PDFs (images of text), please use our OCR tool for best results.' }
    ],
    features: ['Extract All Text', 'Download as TXT', 'Copy to Clipboard', 'No Signup', 'Instant Processing'],
    type: ToolType.PDF_SUITE,
    icon: FileText,
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
    icon: User,
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
    icon: Zap,
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
    icon: Paintbrush,
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
    icon: EyeOff,
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
    icon: Grid,
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
    icon: Type,
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
    title: 'Free PDF to JPG Converter — Convert PDF Pages to Images Online',
    description: 'Free PDF to JPG converter online. Convert each PDF page to a high-quality JPG image. Download all images as a ZIP file. No signup, no watermark.',
    h1: 'Convert PDF to JPG Free',
    intro: 'Convert every page of your PDF into a high-quality JPG image instantly. Each PDF page becomes a separate image, all packaged into a ZIP for easy download. Perfect for sharing PDF content on social media, embedding in presentations, or editing in image software.',
    steps: [
      'Upload your PDF file by clicking "Upload" or dragging it onto the tool.',
      'Select the image quality: "High" for print-quality JPGs, "Medium" for smaller file sizes.',
      'Optionally specify which pages to convert (all pages, or a specific range like 1-5).',
      'Click "Convert to JPG" to process the document.',
      'Download all images at once as a ZIP archive, or download individual pages separately.'
    ],
    features: [
      'Convert all or specific PDF pages',
      'High-quality 150/300 DPI output',
      'Download all images as ZIP',
      'No signup, no watermark',
      'Fast batch conversion',
      'Works on mobile & desktop',
      'Choose JPG quality level',
      'Compatible with all PDF types'
    ],
    faqs: [
      { q: 'Is PDF to JPG conversion free on PDFA2Z?', a: 'Yes, 100% free with no signup required.' },
      { q: 'What resolution are the JPG images?', a: 'Images are exported at 150 DPI by default (screen quality). High-quality mode produces images at 300 DPI suitable for printing.' },
      { q: 'Can I convert specific pages instead of the entire PDF?', a: 'Yes. Enter a page range (e.g., "1-5") or individual page numbers (e.g., "2, 4, 7") to convert only those pages.' },
      { q: 'Will each page become a separate image file?', a: 'Yes. Each page of the PDF is converted into its own JPG file. All files are zipped together for a single convenient download.' },
      { q: 'Can I choose PNG instead of JPG?', a: 'Yes. Use our PDF to PNG tool for lossless image output, which is better for documents with text and line art where sharpness matters more than file size.' },
      { q: 'What quality setting should I use?', a: 'Use "High" (300 DPI) if you plan to print or zoom in closely. Use "Medium" (150 DPI) for web sharing, presentations, or social media where smaller file sizes are preferred.' },
      { q: 'Is the download a ZIP file?', a: 'Yes. When converting multiple pages, all JPG images are packaged into a ZIP archive. You can extract them with Windows built-in zip, Mac Archive Utility, or 7-Zip.' },
      { q: 'Can I convert a very large PDF with many pages?', a: 'Yes, there is no hard page limit. However, PDFs with 50+ pages may take longer to process. The ZIP file will contain one JPG per page.' },
      { q: 'Does the PDF to JPG converter work on mobile?', a: 'Yes. The tool works in all mobile browsers on Android and iOS. After conversion, the ZIP file downloads to your device.' },
      { q: 'Are the resulting JPG images text-searchable or editable?', a: 'No. JPG images are raster images — the text within them is not machine-readable. If you need editable or searchable text from a PDF, use our PDF to Word converter instead.' },
      { q: 'How is this different from taking a screenshot of a PDF?', a: 'Screenshots capture only what\'s visible on screen at your screen resolution. Our converter renders each page at a full, specified DPI regardless of screen size, producing consistently higher-quality images.' },
      { q: 'Will the background of the converted images be white?', a: 'Yes. PDFs with transparent backgrounds are rendered with a white background in JPG format. If you need transparency preserved, use PDF to PNG instead.' }
    ],
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
    mode: 'IMG_TO_PDF',
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
    mode: 'IMG_TO_PDF',
    unique: true
  }
};