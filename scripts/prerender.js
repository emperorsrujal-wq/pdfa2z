
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '../dist');
const PORT = 4173;

async function prerender() {
    const app = express();
    app.use(express.static(DIST_DIR));
    app.use((req, res) => {
        res.sendFile(path.join(DIST_DIR, 'index.html'));
    });

    const server = app.listen(PORT, async () => {
        console.log(`Server started on http://localhost:${PORT}`);

        // Find CSS and Core JS for inlining/preloading
        const assetsDir = path.join(DIST_DIR, 'assets');
        if (!fs.existsSync(assetsDir)) {
            console.error('Assets directory not found, build first!');
            server.close();
            process.exit(1);
        }
        const files = fs.readdirSync(assetsDir);
        const cssFile = files.find(f => f.startsWith('index') && f.endsWith('.css'));
        const coreJsFile = files.find(f => f.startsWith('core') && f.endsWith('.js'));
        const indexJsFile = files.find(f => f.startsWith('index') && f.endsWith('.js'));

        let cssContent = '';
        if (cssFile) {
            cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
            console.log(`Found CSS to inline: ${cssFile} (${(cssContent.length / 1024).toFixed(2)} KB)`);
        }

        const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
        if (!fs.existsSync(sitemapPath)) {
            console.error('Sitemap not found, build first!');
            server.close();
            process.exit(1);
        }
        const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
        const urls = sitemapContent.match(/<loc>(.*?)<\/loc>/g)?.map(val => {
            return val.replace(/<\/?loc>/g, '').replace('https://pdfa2z.com', '');
        }) || [];

        console.log(`Found ${urls.length} routes to prerender.`);

        let browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        let counter = 0;
        for (const route of urls) {
            counter++;
            // Restart browser every 50 pages to prevent memory leaks/instability
            if (counter % 50 === 0) {
                console.log('Restarting browser for stability...');
                try { await browser.close(); } catch (e) { /* ignore */ }
                browser = await puppeteer.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                });
            }

            const url = `http://localhost:${PORT}${route}`;
            console.log(`Prerendering (${counter}/${urls.length}): ${route}...`);

            let page = null;
            try {
                page = await browser.newPage();
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

                try {
                    await page.waitForSelector('h1', { timeout: 3000 });
                } catch (e) {
                    // Ignore h1 timeout
                }

                let html = await page.content();

                // POST-PROCESSING: Performance Optimizations

                // 1. Inline CSS and remove external link
                if (cssContent) {
                    const styleRegex = new RegExp('<link rel="stylesheet".*?href="/assets/index-.*?\\.css".*?>', 'g');
                    const styleTag = `<style>${cssContent}</style>`;
                    html = html.replace(styleRegex, styleTag);
                }

                // 2. Add preloads for Core JS and Index JS
                const preloads = [];
                if (coreJsFile) preloads.push(`<link rel="modulepreload" href="/assets/${coreJsFile}">`);
                if (indexJsFile) preloads.push(`<link rel="modulepreload" href="/assets/${indexJsFile}">`);

                if (preloads.length > 0) {
                    html = html.replace('</head>', `${preloads.join('')}</head>`);
                }

                let filePath = path.join(DIST_DIR, route === '' || route === '/' ? 'index.html' : route);
                if (!path.extname(filePath)) {
                    if (!fs.existsSync(filePath)) {
                        fs.mkdirSync(filePath, { recursive: true });
                    }
                    filePath = path.join(filePath, 'index.html');
                }

                fs.writeFileSync(filePath, html);
            } catch (err) {
                console.error(`ERROR prerendering ${route}:`, err.message);
            } finally {
                if (page) {
                    try { await page.close(); } catch (e) { /* ignore close errors */ }
                }
            }
        }

        try { await browser.close(); } catch (e) { /* ignore */ }
        server.close();
        console.log('Prerendering and optimization complete.');
        process.exit(0);
    });
}

// Global error handlers to prevent script crash
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception (non-fatal):', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection (non-fatal):', reason);
});

prerender();
