import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';
import * as chromeLauncher from 'chrome-launcher';

async function runLighthouse(url, runNumber) {
    console.log(`Running Lighthouse Mobile Test #${runNumber}...`);
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
        logLevel: 'error',
        output: 'json',
        onlyCategories: ['performance'],
        port: chrome.port,
        formFactor: 'mobile',
        screenEmulation: { mobile: true }
    };

    const runnerResult = await lighthouse(url, options);

    const lhr = runnerResult.lhr;
    console.log(`\n--- Run ${runNumber} Results ---`);
    console.log(`Performance Score: ${Math.round(lhr.categories.performance.score * 100)}`);
    console.log(`FCP (First Contentful Paint): ${lhr.audits['first-contentful-paint'].displayValue}`);
    console.log(`LCP (Largest Contentful Paint): ${lhr.audits['largest-contentful-paint'].displayValue}`);
    console.log(`Speed Index: ${lhr.audits['speed-index'].displayValue}`);
    console.log(`TBT (Total Blocking Time): ${lhr.audits['total-blocking-time'].displayValue}`);
    console.log(`CLS (Cumulative Layout Shift): ${lhr.audits['cumulative-layout-shift'].displayValue}\n`);

    await chrome.kill();
}

async function main() {
    const url = 'https://pdf-tools-6c9d2.web.app/';
    for (let i = 1; i <= 3; i++) {
        await runLighthouse(url, i);
    }
}

main();
