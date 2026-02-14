
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

// We need to import the routes. Since seoData.ts is TS, we might need to 
// compile this script or just parse the file. 
// For simplicity in this script, we'll fetch the sitemap or just hardcode the registry import 
// if we use ts-node or similar. 
// Actually, let's just make this script read the sitemap.xml to know what to prerender!
// That way it's always in sync with what we tell Google.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '../dist');
const PORT = 4173; // Vite preview port

async function prerender() {
    // 1. Start a local server serving the dist folder
    const app = express();
    app.use(express.static(DIST_DIR));
    // Fallback for SPA
    app.use((req, res) => {
        res.sendFile(path.join(DIST_DIR, 'index.html'));
    });

    const server = app.listen(PORT, async () => {
        console.log(`Server started on http://localhost:${PORT}`);

        // 2. Launch Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // 3. Get routes from sitemap (generated via build)
        const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
        if (!fs.existsSync(sitemapPath)) {
            console.error('Sitemap not found, build first!');
            process.exit(1);
        }
        const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
        const urls = sitemapContent.match(/<loc>(.*?)<\/loc>/g)?.map(val => {
            return val.replace(/<\/?loc>/g, '').replace('https://pdfa2z.com', '');
        }) || [];

        console.log(`Found ${urls.length} routes to prerender.`);

        for (const route of urls) {
            // Skip if route is empty (home) handled separately or if external
            const url = `http://localhost:${PORT}${route}`;
            console.log(`Prerendering: ${route}...`);

            // Debug: Log console errors
            page.on('console', msg => console.log('PAGE LOG:', msg.text()));
            page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
            page.on('requestfailed', request =>
                console.log(`REQ FAIL: ${request.failure()?.errorText} ${request.url()}`)
            );

            await page.goto(url, { waitUntil: 'networkidle0' });


            try {
                // Wait for H1 to appear (SPA rendering)
                await page.waitForSelector('h1', { timeout: 10000 });
                // Also wait for the footer and the specific SEO content marker
                await page.waitForSelector('footer', { timeout: 5000 });
                // If it's a tool page, wait for the SEO content to be ready (captured from lazy-load)
                if (route !== '/' && route !== '') {
                    await page.waitForSelector('.seo-content-ready', { timeout: 10000 });
                }
            } catch (e) {
                console.warn(`WARNING: Timeout waiting for content markers on ${route}`);
                const bodyHtml = await page.evaluate(() => document.body.innerHTML);
                console.log('DUMP BODY:', bodyHtml.substring(0, 1000)); // Log first 1000 chars of body
            }

            // Verification: Check if H1 exists (P0 requirement)
            const h1Count = await page.$$eval('h1', h1s => h1s.length);
            if (h1Count === 0) {
                console.warn(`WARNING: No H1 found on ${route}`);
            }

            const html = await page.content();

            // Save HTML
            let filePath = path.join(DIST_DIR, route === '' || route === '/' ? 'index.html' : route);

            // If extensionless, make directory and index.html
            if (!path.extname(filePath)) {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath, { recursive: true });
                }
                filePath = path.join(filePath, 'index.html');
            }

            fs.writeFileSync(filePath, html);
        }

        await browser.close();
        server.close();
        console.log('Prerendering complete.');
        process.exit(0);
    });
}

prerender();
