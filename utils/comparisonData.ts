export interface ToolComparison {
  id: string;
  slug: string;
  title: string;
  description: string;
  tools: string[];
  features: ComparisonFeature[];
  verdict: string;
  useCase: string;
  keywords: string[];
}

export interface ComparisonFeature {
  name: string;
  description: string;
  tools: Record<string, string | number | boolean>;
}

export const TOOL_COMPARISONS: ToolComparison[] = [
  {
    id: 'comparison-1',
    slug: 'merge-pdf-vs-split-pdf',
    title: 'Merge PDF vs Split PDF: When to Use Each Tool',
    description: 'Understand the differences between merging and splitting PDFs.',
    tools: ['merge-pdf', 'split-pdf'],
    features: [
      {
        name: 'Primary Function',
        description: 'What the tool is designed to do',
        tools: {
          'merge-pdf': 'Combine multiple PDFs into one file',
          'split-pdf': 'Extract or separate pages from a PDF',
        },
      },
      {
        name: 'Speed',
        description: 'Processing time',
        tools: {
          'merge-pdf': '< 5 seconds',
          'split-pdf': '< 3 seconds',
        },
      },
    ],
    verdict: 'Both excel in their areas. Use Merge for combining, Split for separating.',
    useCase: 'Merge reports, then split into sections for distribution.',
    keywords: ['merge vs split', 'pdf tools comparison'],
  },
];

export function getAllComparisons(): ToolComparison[] {
  return TOOL_COMPARISONS;
}

export function getComparisonBySlug(slug: string): ToolComparison | undefined {
  return TOOL_COMPARISONS.find(c => c.slug === slug);
}

export function getComparisonsForTool(toolSlug: string): ToolComparison[] {
  return TOOL_COMPARISONS.filter(c => c.tools.includes(toolSlug));
}
