import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');
const PORT = 4174;

async function prerender() {
    const app = express();
    app.use(express.static(DIST_DIR));

    // Serve index.html for all undefined routes (SPA fallback)
    app.use((req, res) => {
        res.sendFile(path.join(DIST_DIR, 'index.html'));
    });

    const server = app.listen(PORT, async () => {
        console.log(`Server started on http://localhost:${PORT}`);
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Navigate to homepage
            console.log('Prerendering homepage...');
            await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0', timeout: 30000 });

            // Wait for the React app to mount (look for the hero h1)
            await page.waitForSelector('h1', { timeout: 10000 });

            // Inline CSS directly in the browser context before snapshotting
            await page.evaluate(async () => {
                const link = document.querySelector('link[rel="stylesheet"][href*="/assets/index-"]');
                if (link && link.href) {
                    try {
                        const res = await fetch(link.href);
                        const css = await res.text();
                        const style = document.createElement('style');
                        style.textContent = css;
                        link.replaceWith(style);
                    } catch (e) {
                        console.error('Failed to inline CSS fetching:', e);
                    }
                }

                // Also remove any unnecessary modulepreload links for the homepage
                document.querySelectorAll('link[rel="modulepreload"]').forEach(el => el.remove());
            });

            // Get the fully rendered HTML
            let html = await page.content();

            // Save to dist/index.html
            fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html);
            console.log('Successfully prerendered index.html');

        } catch (error) {
            console.error('Prerendering failed:', error);
            process.exit(1);
        } finally {
            if (browser) await browser.close();
            server.close();
            process.exit(0);
        }
    });
}

prerender();
