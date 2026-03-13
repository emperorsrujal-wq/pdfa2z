export interface FAQ {
  question: string;
  answer: string;
  keywords?: string[];
}

export interface ToolFAQ {
  toolSlug: string;
  faqs: FAQ[];
}

export const TOOL_FAQS: ToolFAQ[] = [
  {
    toolSlug: 'merge-pdf',
    faqs: [
      {
        question: 'How do I merge multiple PDF files?',
        answer: 'Upload your PDFs, arrange in desired order, click Merge. Ready in seconds.',
        keywords: ['merge pdfs', 'combine pdfs'],
      },
      {
        question: 'Is it safe to merge PDFs online?',
        answer: 'Yes, completely safe. Files are encrypted, processed securely, and auto-deleted after 1 hour.',
        keywords: ['secure', 'privacy', 'safe'],
      },
      {
        question: 'How many PDFs can I merge?',
        answer: 'Unlimited files up to 500MB total. Most users merge 2-10 files.',
        keywords: ['file limit', 'maximum'],
      },
      {
        question: 'Will merging reduce PDF quality?',
        answer: 'No, merging is lossless. Your PDFs maintain 100% original quality.',
        keywords: ['quality', 'lossless'],
      },
    ],
  },
];

export function getToolFAQs(toolSlug: string): FAQ[] {
  const toolFAQ = TOOL_FAQS.find(t => t.toolSlug === toolSlug);
  return toolFAQ?.faqs || [];
}
