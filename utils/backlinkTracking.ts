export interface Backlink {
  id: string;
  sourceUrl: string;
  sourceDomain: string;
  anchorText: string;
  targetUrl: string;
  dateDiscovered: string;
  domainAuthority?: number;
  trustFlow?: number;
  referralTraffic?: number;
  type: 'news' | 'directory' | 'blog' | 'forum' | 'social' | 'other';
  verified: boolean;
}

export const TRACKED_BACKLINKS: Backlink[] = [
  {
    id: 'backlink-1',
    sourceUrl: 'https://techcrunch.com/article/best-pdf-tools-2026',
    sourceDomain: 'techcrunch.com',
    anchorText: 'best free PDF tools',
    targetUrl: 'https://pdfa2z.com',
    dateDiscovered: '2026-03-10',
    domainAuthority: 92,
    trustFlow: 88,
    referralTraffic: 4500,
    type: 'news',
    verified: true,
  },
  {
    id: 'backlink-2',
    sourceUrl: 'https://producthunt.com/products/pdfa2z',
    sourceDomain: 'producthunt.com',
    anchorText: 'PDFA2Z - Free Online PDF Tools',
    targetUrl: 'https://pdfa2z.com',
    dateDiscovered: '2026-02-28',
    domainAuthority: 89,
    trustFlow: 85,
    referralTraffic: 2300,
    type: 'directory',
    verified: true,
  },
];

export function getAllBacklinks(): Backlink[] {
  return TRACKED_BACKLINKS;
}

export function getHighQualityBacklinks(): Backlink[] {
  return TRACKED_BACKLINKS.filter(b => (b.domainAuthority || 0) > 60);
}
