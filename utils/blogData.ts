
export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    author: string;
    category: string;
    image?: string;
}

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: 'how-to-compress-pdf-to-100kb',
        title: 'How to Compress PDF to 100kb Without Losing Quality',
        excerpt: 'Uploading documents to official portals often requires small file sizes. Learn the best settings to hit the 100kb mark.',
        date: '2026-02-26',
        author: 'PDFA2Z Expert',
        category: 'Optimization',
        content: `
      <h2>The 100kb Challenge</h2>
      <p>Many government and educational portals have strict file size limits, often as low as 100kb. While compressing a PDF is easy, keeping it readable at such a small size requires specific techniques.</p>
      
      <h3>1. Use Smart Grayscale Conversion</h3>
      <p>If your document doesn't strictly need color, converting to grayscale can reduce the file size by up to 50% immediately. Our Grayscale PDF tool handles this while maintaining contrast.</p>
      
      <h3>2. Downsample Images to 72 DPI</h3>
      <p>Standard printing requires 300 DPI, but for web view, 72 DPI is more than enough. This is the single biggest factor in reaching the 100kb goal.</p>
      
      <h3>3. Remove Metadata and Hidden Layers</h3>
      <p>PDFs often store hidden information like 'creator' details and editing history. Flattening your PDF removes these layers, saving precious kilobytes.</p>
      
      <h3>Conclusion</h3>
      <p>By combining grayscale conversion with our "Extreme" compression setting, you can easily turn a 2MB document into a sub-100kb file ready for any portal.</p>
    `
    },
    {
        slug: 'best-ilovepdf-alternative-2026',
        title: 'Why PDFA2Z is the Best Free iLovePDF Alternative in 2026',
        excerpt: 'Looking for a faster, more secure way to manage PDFs? Here is why users are switching to PDFA2Z.',
        date: '2026-02-25',
        author: 'PDFA2Z Team',
        category: 'Guides',
        content: `
      <h2>The Evolution of PDF Tools</h2>
      <p>While iLovePDF has been a staple for years, 2026 has brought new demands for privacy and AI integration. PDFA2Z was built from the ground up to address these needs.</p>
      
      <h3>Privacy First: Local Processing</h3>
      <p>Unlike other tools that upload every file to a server, PDFA2Z performs many operations directly in your browser using WebAssembly. Your sensitive data stays on your machine.</p>
      
      <h3>AI Integration</h3>
      <p>Our "Chat with PDF" and "AI Writer" tools allow you to do more than just edit - you can now analyze and generate content based on your documents.</p>
      
      <h3>Zero Limits</h3>
      <p>Tired of "Maximum 2 files" or "Wait 60 minutes"? PDFA2Z offers truly unlimited merging and splitting for all users, absolutely free.</p>
    `
    }
];
