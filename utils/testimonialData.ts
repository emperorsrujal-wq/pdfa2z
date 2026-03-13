export interface Testimonial {
  id: string;
  author: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  tool: string;
  date: string;
  verified: boolean;
  imageUrl?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'testimonial-1',
    author: 'Sarah Johnson',
    role: 'Marketing Manager',
    company: 'TechCorp Inc.',
    content: 'Merged 150 PDF files in minutes. Absolutely amazing tool!',
    rating: 5,
    tool: 'merge-pdf',
    date: '2026-03-10',
    verified: true,
  },
  {
    id: 'testimonial-2',
    author: 'James Chen',
    role: 'Graphic Designer',
    company: 'Creative Studio',
    content: 'The remove background tool is better than Photoshop. Free and no sign-up!',
    rating: 5,
    tool: 'remove-bg',
    date: '2026-03-08',
    verified: true,
  },
  {
    id: 'testimonial-3',
    author: 'Maria Garcia',
    role: 'Content Creator',
    company: 'YouTube Channel',
    content: 'Compressed a 500MB PDF to 50MB without losing quality. Tool saved me thousands!',
    rating: 5,
    tool: 'compress-pdf',
    date: '2026-03-05',
    verified: true,
  },
];

export function getToolTestimonials(toolSlug: string): Testimonial[] {
  return TESTIMONIALS.filter(t => t.tool === toolSlug);
}

export function getAllTestimonials(): Testimonial[] {
  return [...TESTIMONIALS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getFeaturedTestimonials(): Testimonial[] {
  return TESTIMONIALS.filter(t => t.rating === 5).slice(0, 6);
}
