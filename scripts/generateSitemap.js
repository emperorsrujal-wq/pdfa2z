import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEO_DATA_PATH = path.join(__dirname, '../utils/seoData.ts');
const PUBLIC_DIR = path.join(__dirname, '../public');
const DIST_DIR = path.join(__dirname, '../dist'); // For safety if running post-build
const BASE_URL = 'https://pdfa2z.com';

// Regex to find slugs in the object keys or slug properties
// Matches: 'slug': 'value' or slug: 'value'
const SLUG_REGEX = /slug:\s*['"]([^'"]+)['"]/g;

async function generateSitemap() {
    try {
        const seoDataContent = fs.readFileSync(SEO_DATA_PATH, 'utf-8');
        const slugs = new Set();

        // Always add home
        slugs.add('');

        // Import blog posts (requires dynamic import or reading file as text)
        const blogDataContent = fs.readFileSync(path.join(__dirname, '../utils/blogData.ts'), 'utf-8');
        const blogSlugs = [];
        const BLOG_SLUG_REGEX = /slug:\s*['"]([^'"]+)['"]/g;
        let bMatch;
        while ((bMatch = BLOG_SLUG_REGEX.exec(blogDataContent)) !== null) {
            blogSlugs.push(`blog/${bMatch[1]}`);
        }

        // Add blog index
        slugs.add('blog');
        blogSlugs.forEach(s => slugs.add(s));

        const SUPPORTED_LANGS = ['es', 'fr', 'hi'];
        const allUrls = [];

        for (const slug of slugs) {
            // English version (Default)
            allUrls.push({
                url: slug ? `${BASE_URL}/${slug}` : BASE_URL,
                priority: slug === '' ? '1.0' : '0.8'
            });

            // Localized versions
            for (const lang of SUPPORTED_LANGS) {
                allUrls.push({
                    url: slug ? `${BASE_URL}/${lang}/${slug}` : `${BASE_URL}/${lang}`,
                    priority: slug === '' ? '0.9' : '0.7'
                });
            }
        }

        console.log(`Generating sitemap for ${allUrls.length} total URLs.`);

        const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => {
            return `  <url>
    <loc>${u.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>${u.priority}</priority>
  </url>`;
        }).join('\n')}
</urlset>`;

        // Ensure public dir exists
        if (!fs.existsSync(PUBLIC_DIR)) {
            fs.mkdirSync(PUBLIC_DIR, { recursive: true });
        }

        const outputPath = path.join(PUBLIC_DIR, 'sitemap.xml');
        fs.writeFileSync(outputPath, sitemapContent);
        console.log(`Sitemap generated at ${outputPath}`);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();
