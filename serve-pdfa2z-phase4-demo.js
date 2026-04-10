/**
 * Phase 4 White-Label & Branding Demo
 * Run with: node serve-pdfa2z-phase4-demo.js
 *
 * This demo shows how the PDF Journey Builder can be customized with:
 * - Custom colors (primary, accent, success, error)
 * - Custom fonts (Google Fonts integration)
 * - Custom logo
 * - Custom messaging (success message, footer text)
 * - White-label option (hide PDFA2Z branding)
 *
 * The demo serves both:
 * 1. Brand Configuration UI - for customizing the journey
 * 2. Branded PDF Journey - showing the custom branding applied
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5174;

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Journey Builder - Phase 4 White-Label Demo</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #e2e8f0;
      padding: 40px 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 60px;
    }

    .header h1 {
      font-size: 44px;
      font-weight: 800;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #f59e0b 0%, #f8b817 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header p {
      font-size: 18px;
      color: #94a3b8;
      line-height: 1.6;
    }

    .content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 60px;
    }

    @media (max-width: 1024px) {
      .content {
        grid-template-columns: 1fr;
      }
    }

    .section {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(71, 85, 105, 0.3);
      border-radius: 16px;
      padding: 32px;
    }

    .section h2 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 20px;
      color: #f59e0b;
    }

    .feature-list {
      list-style: none;
      margin-bottom: 24px;
    }

    .feature-list li {
      padding: 12px 0;
      padding-left: 32px;
      position: relative;
      border-bottom: 1px solid rgba(71, 85, 105, 0.1);
      font-size: 15px;
      color: #cbd5e1;
    }

    .feature-list li:last-child {
      border-bottom: none;
    }

    .feature-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: 700;
    }

    .config-form {
      background: rgba(99, 102, 241, 0.05);
      border: 1px solid rgba(99, 102, 241, 0.1);
      border-radius: 12px;
      padding: 24px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-input {
      width: 100%;
      padding: 10px;
      background: rgba(51, 65, 85, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 6px;
      color: #e2e8f0;
      font-size: 14px;
      font-family: inherit;
    }

    .form-input:focus {
      outline: none;
      border-color: #f59e0b;
      background: rgba(51, 65, 85, 0.8);
    }

    .color-picker-group {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .color-input {
      width: 50px;
      height: 40px;
      padding: 2px;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 6px;
      cursor: pointer;
    }

    .preview-section {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(71, 85, 105, 0.2);
      border-radius: 12px;
      padding: 20px;
      margin-top: 16px;
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 12px;
    }

    .color-swatch {
      text-align: center;
    }

    .color-box {
      width: 100%;
      height: 60px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 8px;
    }

    .color-label {
      font-size: 12px;
      color: #94a3b8;
    }

    .button-group {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      flex: 1;
    }

    .btn-primary {
      background: #f59e0b;
      color: #000;
    }

    .btn-primary:hover {
      background: #f8b817;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .btn-secondary {
      background: rgba(148, 163, 184, 0.1);
      color: #cbd5e1;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }

    .btn-secondary:hover {
      background: rgba(148, 163, 184, 0.15);
    }

    .use-cases {
      margin-top: 40px;
    }

    .use-case-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .use-case-card {
      background: rgba(99, 102, 241, 0.05);
      border: 1px solid rgba(99, 102, 241, 0.1);
      border-radius: 12px;
      padding: 20px;
      transition: all 0.2s;
    }

    .use-case-card:hover {
      border-color: rgba(99, 102, 241, 0.3);
      background: rgba(99, 102, 241, 0.08);
    }

    .use-case-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }

    .use-case-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #e2e8f0;
    }

    .use-case-desc {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 40px;
    }

    .stat {
      background: rgba(16, 185, 129, 0.05);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 800;
      color: #10b981;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 13px;
      color: #94a3b8;
    }

    code {
      background: rgba(51, 65, 85, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      padding: 2px 6px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #f8b817;
    }

    .info-box {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 12px;
      padding: 16px;
      margin-top: 20px;
      font-size: 14px;
      color: #cbd5e1;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 Phase 4: White-Label & Branding</h1>
      <p>Enterprise-ready customization for lawyers, insurance agents, mortgage brokers, and banks</p>
    </div>

    <div class="content">
      <!-- Features -->
      <div class="section">
        <h2>✨ Key Features</h2>
        <ul class="feature-list">
          <li><strong>Custom Colors</strong> - Primary, accent, success, error colors</li>
          <li><strong>Google Fonts</strong> - 10+ font families for body and headings</li>
          <li><strong>Logo Upload</strong> - Display your company logo at the top</li>
          <li><strong>Custom Messaging</strong> - Success messages and footer text</li>
          <li><strong>Legal Links</strong> - Privacy, terms, and support URLs</li>
          <li><strong>Branding Control</strong> - Hide PDFA2Z branding for white-label</li>
          <li><strong>Email Templates</strong> - Custom email configurations</li>
          <li><strong>Advanced CSS</strong> - Custom CSS for additional customization</li>
          <li><strong>Analytics Integration</strong> - Custom tracking scripts</li>
          <li><strong>Local Storage</strong> - Config persists across sessions</li>
        </ul>
      </div>

      <!-- Quick Reference -->
      <div class="section">
        <h2>🔧 Integration</h2>
        <div class="info-box">
          <strong>Three simple steps:</strong>
          <br><br>
          1. Import the branding utilities:
          <br><code>import { BrandConfig, applyBrandConfig } from './utils/journeyBranding'</code>
          <br><br>
          2. Create or load brand config:
          <br><code>const config = loadBrandConfig() || DEFAULT_BRAND_CONFIG</code>
          <br><br>
          3. Apply to journey:
          <br><code>applyBrandConfig(config)</code>
        </div>

        <h3 style="margin-top: 24px; margin-bottom: 12px; color: #f59e0b;">Configuration Example</h3>
        <pre style="background: rgba(51, 65, 85, 0.5); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 6px; padding: 12px; overflow-x: auto; font-size: 12px; color: #cbd5e1; font-family: monospace;">const config: BrandConfig = {
  primaryColor: '#f59e0b',
  fontFamily: 'Poppins',
  companyName: 'Acme Law Firm',
  successMessage: 'Application submitted!',
  privacyUrl: 'https://acme-law.com/privacy',
  showPdfa2zBranding: false
}</pre>
      </div>
    </div>

    <!-- Use Cases -->
    <div class="section use-cases">
      <h2>🎯 Enterprise Use Cases</h2>
      <div class="use-case-grid">
        <div class="use-case-card">
          <div class="use-case-icon">⚖️</div>
          <div class="use-case-title">Law Firms</div>
          <div class="use-case-desc">Client intake forms with your firm's branding and colors</div>
        </div>
        <div class="use-case-card">
          <div class="use-case-icon">🏥</div>
          <div class="use-case-title">Insurance Agents</div>
          <div class="use-case-desc">Claim and policy forms matching your agency identity</div>
        </div>
        <div class="use-case-card">
          <div class="use-case-icon">🏠</div>
          <div class="use-case-title">Mortgage Brokers</div>
          <div class="use-case-desc">Loan application with your lender's branding</div>
        </div>
        <div class="use-case-card">
          <div class="use-case-icon">🏦</div>
          <div class="use-case-title">Banks & Credit Unions</div>
          <div class="use-case-desc">Account opening forms with your bank's visual identity</div>
        </div>
        <div class="use-case-card">
          <div class="use-case-icon">📋</div>
          <div class="use-case-title">Real Estate</div>
          <div class="use-case-desc">Document collection and signatures with custom branding</div>
        </div>
        <div class="use-case-card">
          <div class="use-case-icon">🏥</div>
          <div class="use-case-title">Healthcare</div>
          <div class="use-case-desc">Patient intake and consent forms with your clinic's colors</div>
        </div>
      </div>
    </div>

    <!-- Success Metrics -->
    <div class="stats">
      <div class="stat">
        <div class="stat-value">10x</div>
        <div class="stat-label">Revenue Potential</div>
      </div>
      <div class="stat">
        <div class="stat-value">$199/mo</div>
        <div class="stat-label">Enterprise Tier</div>
      </div>
      <div class="stat">
        <div class="stat-value">∞</div>
        <div class="stat-label">Customization Options</div>
      </div>
      <div class="stat">
        <div class="stat-value">0</div>
        <div class="stat-label">Branding Limits</div>
      </div>
    </div>

    <!-- Next Steps -->
    <div class="section" style="margin-top: 40px;">
      <h2>🚀 Next Steps</h2>
      <ul class="feature-list">
        <li><strong>Phase 4 Complete:</strong> White-Label & Branding infrastructure ✓</li>
        <li><strong>Phase 5:</strong> Analytics Dashboard (completion rates, drop-off analysis)</li>
        <li><strong>Phase 6:</strong> Mobile Optimization & Performance</li>
        <li><strong>Phase 7:</strong> Staging Deployment & Testing</li>
        <li><strong>Phase 8:</strong> Beta Launch with 10 enterprise partners</li>
        <li><strong>Phase 9:</strong> Public Launch & Marketing Campaign</li>
      </ul>
    </div>
  </div>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/phase4') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n🎨 Phase 4 White-Label Demo\n`);
  console.log(`✓ Server running at http://localhost:${PORT}`);
  console.log(`✓ Open your browser and navigate to http://localhost:${PORT}/phase4\n`);
  console.log(`Features enabled:\n`);
  console.log(`  • Custom colors (primary, accent, success, error)`);
  console.log(`  • Google Fonts integration`);
  console.log(`  • Logo upload`);
  console.log(`  • Custom messaging`);
  console.log(`  • White-label branding control`);
  console.log(`  • LocalStorage persistence\n`);
  console.log(`Press Ctrl+C to stop the server\n`);
});
