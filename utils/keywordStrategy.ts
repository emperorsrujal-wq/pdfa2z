export interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  relatedTools: string[];
  targetUrl: string;
  status: 'targeting' | 'ranking' | 'potential';
  currentRank?: number;
}

export const TARGET_KEYWORDS: KeywordData[] = [
  {
    keyword: 'merge pdf free online',
    searchVolume: 12400,
    difficulty: 32,
    intent: 'transactional',
    relatedTools: ['merge-pdf'],
    targetUrl: '/merge-pdf',
    status: 'targeting',
  },
  {
    keyword: 'compress pdf without losing quality',
    searchVolume: 8900,
    difficulty: 28,
    intent: 'transactional',
    relatedTools: ['compress-pdf'],
    targetUrl: '/compress-pdf',
    status: 'targeting',
  },
  {
    keyword: 'remove background from image ai',
    searchVolume: 15600,
    difficulty: 35,
    intent: 'transactional',
    relatedTools: ['remove-bg'],
    targetUrl: '/remove-bg',
    status: 'targeting',
  },
  {
    keyword: 'how to merge pdf files',
    searchVolume: 18900,
    difficulty: 24,
    intent: 'informational',
    relatedTools: ['merge-pdf'],
    targetUrl: '/blog/how-to-merge-pdfs',
    status: 'targeting',
  },
];

export function getHighValueKeywords(): KeywordData[] {
  return TARGET_KEYWORDS.filter(k => k.searchVolume > 5000 && k.difficulty < 40);
}

export function getKeywordsForTool(toolSlug: string): KeywordData[] {
  return TARGET_KEYWORDS.filter(k => k.relatedTools.includes(toolSlug));
}
