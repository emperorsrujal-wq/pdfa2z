import https from 'https';

const API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&url=https://pdf-tools-6c9d2.web.app/';

function runTest(runNumber) {
    return new Promise((resolve) => {
        console.log(`Running test ${runNumber}...`);
        https.get(API_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.error) {
                        console.error('API Error:', result.error.message);
                        resolve(null);
                        return;
                    }
                    const lh = result.lighthouseResult;
                    const metrics = {
                        score: Math.round(lh.categories.performance.score * 100),
                        fcp: lh.audits['first-contentful-paint'].displayValue,
                        lcp: lh.audits['largest-contentful-paint'].displayValue,
                        speedIndex: lh.audits['speed-index'].displayValue,
                        tbt: lh.audits['total-blocking-time'].displayValue,
                        cls: lh.audits['cumulative-layout-shift'].displayValue,
                    };
                    console.log(`--- Run ${runNumber} Results ---`);
                    console.log(`Performance: ${metrics.score}`);
                    console.log(`FCP: ${metrics.fcp}`);
                    console.log(`LCP: ${metrics.lcp}`);
                    console.log(`Speed Index: ${metrics.speedIndex}`);
                    console.log(`TBT: ${metrics.tbt}`);
                    console.log(`CLS: ${metrics.cls}\n`);
                    resolve(metrics);
                } catch (e) {
                    console.error('Failed to parse:', e.message);
                    resolve(null);
                }
            });
        }).on('error', (e) => {
            console.error(e);
            resolve(null);
        });
    });
}

async function main() {
    console.log('Starting PageSpeed validation on https://pdf-tools-6c9d2.web.app/ (Mobile)\n');
    await runTest(1);
    await runTest(2);
    await runTest(3);
}

main();
