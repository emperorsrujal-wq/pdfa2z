export interface ToolRelationship {
  toolSlug: string;
  relatedTools: string[];
  complementaryTools: string[];
  frequentlyUsedWith: string[];
}

export const TOOL_RELATIONSHIPS: ToolRelationship[] = [
  {
    toolSlug: 'merge-pdf',
    relatedTools: ['split-pdf', 'pdf-to-word', 'compress-pdf', 'rotate-pdf'],
    complementaryTools: ['remove-bg', 'compress-image', 'convert-image'],
    frequentlyUsedWith: ['compress-pdf', 'split-pdf'],
  },
  {
    toolSlug: 'compress-pdf',
    relatedTools: ['merge-pdf', 'split-pdf', 'pdf-to-word'],
    complementaryTools: ['compress-image', 'resize-image'],
    frequentlyUsedWith: ['merge-pdf', 'split-pdf'],
  },
  {
    toolSlug: 'remove-bg',
    relatedTools: ['compress-image', 'resize-image', 'convert-image'],
    complementaryTools: ['merge-pdf', 'compress-pdf'],
    frequentlyUsedWith: ['compress-image', 'convert-image'],
  },
];

export function getRelatedTools(toolSlug: string): string[] {
  const rel = TOOL_RELATIONSHIPS.find(r => r.toolSlug === toolSlug);
  return rel?.relatedTools || [];
}

export function getComplementaryTools(toolSlug: string): string[] {
  const rel = TOOL_RELATIONSHIPS.find(r => r.toolSlug === toolSlug);
  return rel?.complementaryTools || [];
}

export function getAllRelatedTools(toolSlug: string): string[] {
  const rel = TOOL_RELATIONSHIPS.find(r => r.toolSlug === toolSlug);
  if (!rel) return [];
  const allRelated = new Set([...rel.relatedTools, ...rel.complementaryTools, ...rel.frequentlyUsedWith]);
  return Array.from(allRelated);
}
