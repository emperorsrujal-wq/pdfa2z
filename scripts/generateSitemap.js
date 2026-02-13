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

        let match;
        while ((match = SLUG_REGEX.exec(seoDataContent)) !== null) {
            if (match[1]) {
                slugs.add(match[1]);
            }
        }

        console.log(`Found ${slugs.size} unique routes.`);

        const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(slugs).map(slug => {
            const url = slug ? `${BASE_URL}/${slug}` : BASE_URL;
            const priority = slug === '' ? '1.0' : '0.8';
            return `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>${priority}</priority>
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
