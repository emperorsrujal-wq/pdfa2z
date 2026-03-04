import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const BASE_URL = 'https://pdfa2z.com';
const SUPPORTED_LANGS = ['es', 'fr', 'hi'];
const TODAY = new Date().toISOString().split('T')[0];

// ── All tool slugs from TOOLS_REGISTRY ────────────────────────────────────────
const TOOL_SLUGS = [
    // Core PDF tools
    'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-word', 'pdf-to-excel',
    'jpg-to-pdf', 'word-to-pdf', 'pdf-to-html', 'protect-pdf', 'unlock-pdf',
    'rotate-pdf', 'page-numbers', 'delete-pages', 'grayscale-pdf', 'watermark-pdf',
    'repair-pdf', 'flatten-pdf', 'redact-pdf', 'pdf-chat', 'sign-pdf',
    'edit-pdf', 'crop-pdf', 'extract-images', 'reverse-pdf', 'pdf-to-text',
    'pdf-to-csv', 'pdf-to-ppt', 'ppt-to-pdf', 'epub-to-pdf', 'mobi-to-pdf',
    'outlook-to-pdf', 'url-to-pdf',
    // AI tools
    'ai-image-generator', 'magic-ai-editor', 'ai-writer', 'video-generator',
    // Image tools
    'remove-bg', 'resize-image', 'convert-image', 'crop-image', 'rotate-image',
    'compress-image', 'upscale-image', 'face-blur', 'meme-maker', 'passport-photo',
    'collage-maker', 'compare-image', 'flip-image', 'pixelate-image', 'invert-image',
    'round-image',
    // Image sub-tools (from footer)
    'image-tools/profile-picture-maker', 'image-tools/sharpen-image',
    'image-tools/black-and-white-filter', 'image-tools/blur-image',
    'image-tools/split-image', 'image-tools/add-text-to-image',
    // Video tools
    'video-downloader',
    // Company pages
    'about', 'contact', 'privacy', 'terms',
];

// ── Blog posts (read from blogData.ts) ─────────────────────────────────────
const blogDataContent = fs.readFileSync(
    path.join(__dirname, '../utils/blogData.ts'), 'utf-8'
);
const BLOG_SLUG_REGEX = /slug:\s*['"]([^'"]+)['"]/g;
const blogSlugs = [];
let bMatch;
while ((bMatch = BLOG_SLUG_REGEX.exec(blogDataContent)) !== null) {
    blogSlugs.push(`blog/${bMatch[1]}`);
}

// ── Priority map ─────────────────────────────────────────────────────────────
const getPriority = (slug) => {
    if (slug === '') return '1.0';
    if (['merge-pdf', 'compress-pdf', 'pdf-to-word', 'remove-bg',
        'ai-image-generator', 'magic-ai-editor', 'pdf-chat', 'split-pdf'].includes(slug)) return '0.9';
    if (slug.startsWith('blog/') || slug === 'blog') return '0.8';
    if (['about', 'contact', 'privacy', 'terms'].includes(slug)) return '0.5';
    return '0.7';
};

async function generateSitemap() {
    try {
        const allUrls = [];

        // Homepage
        allUrls.push({ url: BASE_URL, priority: '1.0' });
        for (const lang of SUPPORTED_LANGS) {
            allUrls.push({ url: `${BASE_URL}/${lang}`, priority: '0.9' });
        }

        // Blog index (with localized versions)
        allUrls.push({ url: `${BASE_URL}/blog`, priority: '0.8' });
        for (const lang of SUPPORTED_LANGS) {
            allUrls.push({ url: `${BASE_URL}/${lang}/blog`, priority: '0.7' });
        }

        // All tool pages (English only — tools are primarily English)
        for (const slug of TOOL_SLUGS) {
            allUrls.push({ url: `${BASE_URL}/${slug}`, priority: getPriority(slug) });
        }

        // Blog posts (with localized versions)
        for (const slug of blogSlugs) {
            allUrls.push({ url: `${BASE_URL}/${slug}`, priority: '0.8' });
            for (const lang of SUPPORTED_LANGS) {
                allUrls.push({ url: `${BASE_URL}/${lang}/${slug}`, priority: '0.7' });
            }
        }

        console.log(`Generating sitemap for ${allUrls.length} total URLs.`);

        const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>\n    <loc>${u.url}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}
</urlset>`;

        if (!fs.existsSync(PUBLIC_DIR)) {
            fs.mkdirSync(PUBLIC_DIR, { recursive: true });
        }

        const outputPath = path.join(PUBLIC_DIR, 'sitemap.xml');
        fs.writeFileSync(outputPath, sitemapContent);
        console.log(`Sitemap generated at ${outputPath} with ${allUrls.length} URLs.`);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();
