/**
 * Post-build: Inline CSS into index.html + fix font loading
 * Runs after `vite build` to eliminate render-blocking resources.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '../dist');
const INDEX_PATH = path.join(DIST_DIR, 'index.html');

function injectCssAndFixFonts() {
    if (!fs.existsSync(INDEX_PATH)) {
        console.error('dist/index.html not found. Run vite build first.');
        process.exit(1);
    }

    // Find the built CSS file
    const assetsDir = path.join(DIST_DIR, 'assets');
    const files = fs.readdirSync(assetsDir);
    const cssFile = files.find(f => f.startsWith('index') && f.endsWith('.css'));

    if (!cssFile) {
        console.log('No CSS file found to inline, skipping.');
        return;
    }

    const cssPath = path.join(assetsDir, cssFile);
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    console.log(`Inlining ${cssFile} (${(cssContent.length / 1024).toFixed(1)} KB) into index.html...`);

    let html = fs.readFileSync(INDEX_PATH, 'utf-8');

    // 1. Replace render-blocking CSS link with inline <style>
    const cssLinkRegex = new RegExp(`<link[^>]*rel="stylesheet"[^>]*href="/assets/${cssFile.replace('.', '\\.')}[^"]*"[^>]*>`, 'g');
    const cssLinkRegex2 = new RegExp(`<link[^>]*href="/assets/index[^"]*\\.css[^"]*"[^>]*rel="stylesheet"[^>]*>`, 'g');
    // Also catch modulepreload for css
    const genericCssLinkRegex = /<link[^>]*\/assets\/index[^"]*\.css[^>]*>/g;

    html = html.replace(genericCssLinkRegex, `<style>${cssContent}</style>`);

    // 2. Fix Google Fonts: replace any blocking font stylesheet with async preload
    //    Match both rel="stylesheet" and rel="preload" to avoid duplication
    const fontStylesheetRegex = /<link[^>]*href="https:\/\/fonts\.googleapis\.com[^"]*"[^>]*rel="stylesheet"[^>]*>/g;
    const fontStylesheetRegex2 = /<link[^>]*rel="stylesheet"[^>]*href="https:\/\/fonts\.googleapis\.com[^"]*"[^>]*>/g;

    const fontHrefMatch = html.match(/href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/);
    const fontUrl = fontHrefMatch ? fontHrefMatch[1] : 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';

    // Remove the original font stylesheet link
    html = html.replace(fontStylesheetRegex, '');
    html = html.replace(fontStylesheetRegex2, '');

    // Insert async font preload before </head>
    const asyncFontLink = `<link rel="preload" as="style" href="${fontUrl}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${fontUrl}"></noscript>`;
    html = html.replace('</head>', `${asyncFontLink}</head>`);

    // 3. Reduce Google Fonts weights (remove heavy weights 300,500,800,900 if present)
    html = html.replace(/Inter:wght@300;400;500;600;700;800;900/g, 'Inter:wght@400;600;700');
    html = html.replace(/Inter:wght@[^&"]+/g, (match) => {
        // Keep only 400, 600, 700
        const weights = match.replace('Inter:wght@', '').split(';');
        const filtered = weights.filter(w => ['400', '600', '700'].includes(w));
        return `Inter:wght@${filtered.join(';')}`;
    });

    fs.writeFileSync(INDEX_PATH, html, 'utf-8');
    console.log('✓ CSS inlined into index.html');
    console.log('✓ Google Fonts switched to async preload');
    console.log('✓ Font weights reduced to 400;600;700');
    console.log('\nindex.html is now render-blocking-free.');
}

injectCssAndFixFonts();
