import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');
const BASE_HTML_PATH = path.join(DIST_DIR, 'index.html');

const SUPPORTED_LANGS = ['es', 'fr', 'hi'];
const SITE_URL = 'https://pdfa2z.com';

// ── Read base HTML ───────────────────────────────────────────────────────────
if (!fs.existsSync(BASE_HTML_PATH)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(BASE_HTML_PATH, 'utf-8');

// ── Read TOOLS_REGISTRY from seoData.ts (parse simply) ───────────────────────
// We extract the registry by evaluating the TypeScript file
let TOOLS_REGISTRY = {};
try {
  const seoDataPath = path.join(__dirname, '../utils/seoData.ts');
  const seoDataContent = fs.readFileSync(seoDataPath, 'utf-8');
  
  // Extract individual tool entries with regex
  const toolRegex = /'([a-z0-9-]+)':\s*\{([\s\S]*?)\n  \},?\n  '[a-z0-9-]+':/g;
  const toolRegexEnd = /'([a-z0-9-]+)':\s*\{([\s\S]*?)\n  \}\s*\};?\s*$/g;
  
  // Simple parser: extract key fields
  const extractField = (content, field) => {
    const regex = new RegExp(field + ":\\s*'([^']*)", 'i');
    const match = content.match(regex);
    return match ? match[1] : '';
  };
  
  const extractStringArray = (content, field) => {
    const regex = new RegExp(field + ':\\s*\\[([\\s\\S]*?)\\]', 'i');
    const match = content.match(regex);
    if (!match) return [];
    return match[1].match(/'([^']*)'/g)?.map(s => s.slice(1, -1)) || [];
  };
  
  const extractFAQs = (content) => {
    const faqs = [];
    const qRegex = /q:\s*'([^']*)'/g;
    const aRegex = /a:\s*'([^']*)'/g;
    let qMatch, aMatch;
    const qs = [], as = [];
    while ((qMatch = qRegex.exec(content)) !== null) qs.push(qMatch[1]);
    while ((aMatch = aRegex.exec(content)) !== null) as.push(aMatch[1]);
    for (let i = 0; i < Math.min(qs.length, as.length); i++) {
      faqs.push({ q: qs[i], a: as[i] });
    }
    return faqs;
  };
  
  // Parse with brace depth tracking
  const lines = seoDataContent.split(/\r?\n/);
  let currentTool = null;
  let currentContent = [];
  let braceDepth = 0;
  
  for (const line of lines) {
    const match = line.match(/^  '([a-z0-9-]+)':\s*\{$/);
    if (match && braceDepth === 0) {
      if (currentTool) {
        const content = currentContent.join('\n');
        TOOLS_REGISTRY[currentTool] = {
          slug: extractField(content, 'slug'),
          title: extractField(content, 'title'),
          description: extractField(content, 'description'),
          h1: extractField(content, 'h1'),
          intro: extractField(content, 'intro'),
          steps: extractStringArray(content, 'steps'),
          faqs: extractFAQs(content),
          features: extractStringArray(content, 'features'),
        };
      }
      currentTool = match[1];
      currentContent = [];
      braceDepth = 1;
      continue;
    }
    if (currentTool) {
      currentContent.push(line);
      // Track brace depth within the tool entry
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceDepth += openBraces - closeBraces;
      if (braceDepth <= 0) {
        // Tool entry ended
        const content = currentContent.join('\n');
        TOOLS_REGISTRY[currentTool] = {
          slug: extractField(content, 'slug'),
          title: extractField(content, 'title'),
          description: extractField(content, 'description'),
          h1: extractField(content, 'h1'),
          intro: extractField(content, 'intro'),
          steps: extractStringArray(content, 'steps'),
          faqs: extractFAQs(content),
          features: extractStringArray(content, 'features'),
        };
        currentTool = null;
        currentContent = [];
        braceDepth = 0;
      }
    }
  }
} catch (e) {
  console.error('Failed to parse TOOLS_REGISTRY:', e.message);
  process.exit(1);
}

// ── Build page list ──────────────────────────────────────────────────────────
const pages = [];

// Homepage
pages.push({ slug: '', path: '/' });

// Tool pages
for (const [key, tool] of Object.entries(TOOLS_REGISTRY)) {
  if (!tool.slug) continue;
  pages.push({ slug: tool.slug, path: `/${tool.slug}`, tool });
  for (const lang of SUPPORTED_LANGS) {
    pages.push({ slug: tool.slug, path: `/${lang}/${tool.slug}`, tool, lang });
  }
}

// Info pages
for (const slug of ['about', 'contact', 'privacy', 'terms']) {
  const tool = TOOLS_REGISTRY[slug];
  pages.push({ slug, path: `/${slug}`, tool });
}

// Blog index
const blogTool = {
  slug: 'blog',
  title: 'PDF & Image Tools Blog — Tips, Guides & Tutorials | PDFA2Z',
  description: 'Expert guides and tutorials on PDF editing, image processing, document management, and productivity tips. Learn how to merge, compress, convert PDFs and more.',
  h1: 'PDFA2Z Blog',
  intro: 'Expert guides, tutorials, and tips for PDF and image tools.',
  steps: [],
  faqs: [],
  features: [],
};
pages.push({ slug: 'blog', path: '/blog', tool: blogTool });
for (const lang of SUPPORTED_LANGS) {
  pages.push({ slug: 'blog', path: `/${lang}/blog`, tool: blogTool });
}

// Read blog post slugs
const blogSlugs = new Set();
try {
  const blogDataContent = fs.readFileSync(path.join(__dirname, '../utils/blogData.ts'), 'utf-8');
  const BLOG_SLUG_REGEX = /slug:\s*['"]([^'"]+)['"]/g;
  let bMatch;
  while ((bMatch = BLOG_SLUG_REGEX.exec(blogDataContent)) !== null) {
    blogSlugs.add(bMatch[1]);
  }
} catch (e) {}
try {
  const blogIndexPath = path.join(__dirname, '../src/content/blog-index.json');
  if (fs.existsSync(blogIndexPath)) {
    const blogIndex = JSON.parse(fs.readFileSync(blogIndexPath, 'utf-8'));
    if (Array.isArray(blogIndex)) {
      for (const post of blogIndex) {
        if (post.slug) blogSlugs.add(post.slug);
      }
    }
  }
} catch (e) {}

for (const slug of Array.from(blogSlugs).slice(0, 20)) {
  pages.push({ slug: `blog/${slug}`, path: `/blog/${slug}` });
}

console.log(`Generating ${pages.length} static HTML files...`);

// ── Generate static HTML for each page ───────────────────────────────────────
let successCount = 0;

for (const page of pages) {
  const html = generatePageHtml(page);
  const outputPath = path.join(DIST_DIR, page.path === '/' ? 'index.html' : `${page.path.replace(/^\//, '')}.html`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html);
  successCount++;
}

console.log(`Successfully generated ${successCount} static HTML files.`);

// ── Helper functions ─────────────────────────────────────────────────────────
function generatePageHtml({ path: urlPath, tool, lang }) {
  const isHome = urlPath === '/';
  const pageTool = tool || {};
  
  const title = pageTool.title || (isHome ? 'Free Online PDF & Image Tools — PDFA2Z | 100+ Tools, No Signup' : 'PDFA2Z');
  const description = pageTool.description || '100+ free online PDF and image tools. No signup required.';
  const h1 = pageTool.h1 || title;
  const intro = pageTool.intro || '';
  const steps = pageTool.steps || [];
  const faqs = pageTool.faqs || [];
  const features = pageTool.features || [];
  
  const canonical = `${SITE_URL}${urlPath}`;
  const ogImage = `${SITE_URL}/pwa-512x512.png`;
  
  // Build schema
  const schemas = [];
  
  // WebPage schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': canonical,
    url: canonical,
    name: title,
    description: description,
    isPartOf: { '@id': `${SITE_URL}/#website` }
  });
  
  // SoftwareApplication schema for tools
  if (pageTool.slug) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: h1,
      description: description,
      url: canonical,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: features.join(', ') || 'Free online tool'
    });
  }
  
  // HowTo schema
  if (steps.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `How to ${h1}`,
      description: description,
      totalTime: `PT${Math.max(1, steps.length)}M`,
      step: steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.split('.')[0] || `Step ${i + 1}`,
        text: s
      }))
    });
  }
  
  // FAQ schema
  if (faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a }
      }))
    });
  }
  
  // BreadcrumbList schema
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL }
  ];
  if (!isHome) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: title,
      item: canonical
    });
  }
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems
  });
  
  // Build static content for body (visible to crawlers)
  let staticContent = '';
  if (!isHome && pageTool.slug) {
    staticContent = `
    <div id="static-seo-content" style="position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
      <h1>${escapeHtml(h1)}</h1>
      <p>${escapeHtml(intro)}</p>
      ${steps.length > 0 ? `<ol>${steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>` : ''}
      ${faqs.length > 0 ? `<dl>${faqs.map(f => `<dt>${escapeHtml(f.q)}</dt><dd>${escapeHtml(f.a)}</dd>`).join('')}</dl>` : ''}
    </div>`;
  }
  
  // Replace meta tags in base HTML
  let html = baseHtml;
  
  // Title
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  
  // Meta description
  html = html.replace(
    /<meta name="description"\s+content="[^"]*"/,
    `<meta name="description" content="${escapeHtml(description)}"`
  );
  
  // OG tags
  html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapeHtml(title)}"`);
  html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escapeHtml(description)}"`);
  html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${canonical}"`);
  
  // Twitter tags
  html = html.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${escapeHtml(title)}"`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${escapeHtml(description)}"`);
  
  // Canonical
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${canonical}"`);
  } else {
    html = html.replace('</head>', `<link rel="canonical" href="${canonical}" />\n  </head>`);
  }
  
  // Hreflang
  const hreflangs = [
    { lang: 'x-default', href: `${SITE_URL}${urlPath}` },
    { lang: 'en', href: `${SITE_URL}${urlPath}` },
    ...SUPPORTED_LANGS.map(l => ({ lang: l, href: `${SITE_URL}/${l}${urlPath}` }))
  ];
  
  // Remove existing hreflang tags
  html = html.replace(/<link rel="alternate" hrefLang="[^"]*" href="[^"]*"\s*\/?>\s*/g, '');
  
  // Add new hreflang tags before </head>
  const hreflangTags = hreflangs.map(h => `<link rel="alternate" hrefLang="${h.lang}" href="${h.href}" />`).join('\n  ');
  html = html.replace('</head>', `${hreflangTags}\n  </head>`);
  
  // Schema
  const schemaScript = `<script type="application/ld+json">${JSON.stringify(schemas.length === 1 ? schemas[0] : schemas)}</script>`;
  
  // Remove existing schema scripts and add new ones
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '');
  html = html.replace('</head>', `${schemaScript}\n  </head>`);
  
  // Inject static content before the root div
  if (staticContent) {
    html = html.replace('<div id="root">', `${staticContent}\n    <div id="root">`);
  }
  
  return html;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
