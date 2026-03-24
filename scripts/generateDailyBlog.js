import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Configuration ───────────────────────────────────────────────────────────
const GEMINI_API_KEY = 'AIzaSyALQpm0gSZg9y-OWSSMh7ysJlWdqU9uDPY';
const MODEL = 'gemini-2.5-flash';
const BLOG_DATA_PATH = path.join(__dirname, '../utils/blogData.ts');
const SITEMAP_SCRIPT = path.join(__dirname, 'generateSitemap.js');

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ── Topic Queue (30+ SEO-targeted topics) ───────────────────────────────────
const TOPIC_QUEUE = [
  {
    keyword: 'how to compress pdf',
    slug: 'how-to-compress-pdf-file-size',
    category: 'Optimization',
    toolLinks: ['/compress-pdf', '/merge-pdf', '/split-pdf', '/grayscale-pdf']
  },
  {
    keyword: 'merge pdf online free',
    slug: 'merge-pdf-online-free-unlimited',
    category: 'Guides',
    toolLinks: ['/merge-pdf', '/split-pdf', '/compress-pdf', '/page-numbers']
  },
  {
    keyword: 'remove background from image',
    slug: 'remove-background-from-image-free',
    category: 'Images',
    toolLinks: ['/remove-bg', '/resize-image', '/compress-image', '/crop-image']
  },
  {
    keyword: 'pdf to word converter',
    slug: 'best-pdf-to-word-converter-free',
    category: 'Productivity',
    toolLinks: ['/pdf-to-word', '/pdf-to-excel', '/pdf-to-text', '/edit-pdf']
  },
  {
    keyword: 'how to sign pdf electronically',
    slug: 'how-to-sign-pdf-electronically-free',
    category: 'Security',
    toolLinks: ['/sign-pdf', '/protect-pdf', '/flatten-pdf', '/edit-pdf']
  },
  {
    keyword: 'best free pdf editor 2026',
    slug: 'best-free-pdf-editor-2026',
    category: 'Guides',
    toolLinks: ['/edit-pdf', '/merge-pdf', '/compress-pdf', '/pdf-to-word', '/sign-pdf']
  },
  {
    keyword: 'how to split pdf pages',
    slug: 'how-to-split-pdf-pages-free',
    category: 'Guides',
    toolLinks: ['/split-pdf', '/delete-pages', '/merge-pdf', '/extract-images']
  },
  {
    keyword: 'image compressor online',
    slug: 'image-compressor-online-free',
    category: 'Images',
    toolLinks: ['/compress-image', '/resize-image', '/convert-image', '/remove-bg']
  },
  {
    keyword: 'pdf password remover',
    slug: 'pdf-password-remover-free-online',
    category: 'Security',
    toolLinks: ['/unlock-pdf', '/protect-pdf', '/compress-pdf', '/merge-pdf']
  },
  {
    keyword: 'convert jpg to pdf',
    slug: 'convert-jpg-to-pdf-online-free',
    category: 'Guides',
    toolLinks: ['/jpg-to-pdf', '/compress-pdf', '/merge-pdf', '/resize-image']
  },
  {
    keyword: 'how to add page numbers to pdf',
    slug: 'how-to-add-page-numbers-to-pdf',
    category: 'Guides',
    toolLinks: ['/page-numbers', '/edit-pdf', '/merge-pdf', '/compress-pdf']
  },
  {
    keyword: 'pdf to excel converter',
    slug: 'pdf-to-excel-converter-free-online',
    category: 'Productivity',
    toolLinks: ['/pdf-to-excel', '/pdf-to-csv', '/pdf-to-word', '/edit-pdf']
  },
  {
    keyword: 'how to watermark pdf',
    slug: 'how-to-add-watermark-to-pdf-free',
    category: 'Security',
    toolLinks: ['/watermark-pdf', '/protect-pdf', '/edit-pdf', '/flatten-pdf']
  },
  {
    keyword: 'resize image online',
    slug: 'resize-image-online-free-tool',
    category: 'Images',
    toolLinks: ['/resize-image', '/compress-image', '/crop-image', '/remove-bg']
  },
  {
    keyword: 'word to pdf converter',
    slug: 'word-to-pdf-converter-free-online',
    category: 'Guides',
    toolLinks: ['/word-to-pdf', '/compress-pdf', '/merge-pdf', '/protect-pdf']
  },
  {
    keyword: 'how to delete pages from pdf',
    slug: 'how-to-delete-pages-from-pdf',
    category: 'Guides',
    toolLinks: ['/delete-pages', '/split-pdf', '/merge-pdf', '/compress-pdf']
  },
  {
    keyword: 'pdf to ppt converter',
    slug: 'convert-pdf-to-powerpoint-free',
    category: 'Productivity',
    toolLinks: ['/pdf-to-ppt', '/ppt-to-pdf', '/pdf-to-word', '/edit-pdf']
  },
  {
    keyword: 'how to rotate pdf pages',
    slug: 'how-to-rotate-pdf-pages-permanently',
    category: 'Guides',
    toolLinks: ['/rotate-pdf', '/edit-pdf', '/merge-pdf', '/compress-pdf']
  },
  {
    keyword: 'ai image generator free',
    slug: 'ai-image-generator-free-online-2026',
    category: 'AI Tools',
    toolLinks: ['/ai-image-generator', '/remove-bg', '/resize-image', '/compress-image']
  },
  {
    keyword: 'how to extract images from pdf',
    slug: 'how-to-extract-images-from-pdf-free',
    category: 'Guides',
    toolLinks: ['/extract-images', '/pdf-to-word', '/compress-image', '/resize-image']
  },
  {
    keyword: 'pdf to html converter',
    slug: 'convert-pdf-to-html-free-online',
    category: 'Productivity',
    toolLinks: ['/pdf-to-html', '/pdf-to-word', '/pdf-to-text', '/edit-pdf']
  },
  {
    keyword: 'crop image online free',
    slug: 'crop-image-online-free-tool',
    category: 'Images',
    toolLinks: ['/crop-image', '/resize-image', '/compress-image', '/remove-bg']
  },
  {
    keyword: 'epub to pdf converter',
    slug: 'convert-epub-to-pdf-free-online',
    category: 'Guides',
    toolLinks: ['/epub-to-pdf', '/compress-pdf', '/merge-pdf', '/edit-pdf']
  },
  {
    keyword: 'how to redact pdf',
    slug: 'how-to-redact-sensitive-info-in-pdf',
    category: 'Security',
    toolLinks: ['/redact-pdf', '/protect-pdf', '/flatten-pdf', '/compress-pdf']
  },
  {
    keyword: 'ai writer tool free',
    slug: 'best-free-ai-writer-tool-2026',
    category: 'AI Tools',
    toolLinks: ['/ai-writer', '/pdf-chat', '/ai-image-generator', '/edit-pdf']
  },
  {
    keyword: 'upscale image online free',
    slug: 'upscale-image-online-free-ai',
    category: 'Images',
    toolLinks: ['/upscale-image', '/resize-image', '/compress-image', '/remove-bg']
  },
  {
    keyword: 'pdf chat ai assistant',
    slug: 'chat-with-pdf-ai-assistant-free',
    category: 'AI Tools',
    toolLinks: ['/pdf-chat', '/ai-writer', '/pdf-to-text', '/pdf-to-word']
  },
  {
    keyword: 'flatten pdf online',
    slug: 'how-to-flatten-pdf-form-fields',
    category: 'Guides',
    toolLinks: ['/flatten-pdf', '/edit-pdf', '/compress-pdf', '/protect-pdf']
  },
  {
    keyword: 'passport photo maker online',
    slug: 'passport-photo-maker-online-free',
    category: 'Images',
    toolLinks: ['/passport-photo', '/resize-image', '/crop-image', '/remove-bg']
  },
  {
    keyword: 'convert url to pdf',
    slug: 'convert-website-url-to-pdf-free',
    category: 'Guides',
    toolLinks: ['/url-to-pdf', '/compress-pdf', '/merge-pdf', '/edit-pdf']
  },
  {
    keyword: 'how to repair corrupted pdf',
    slug: 'how-to-repair-corrupted-pdf-file',
    category: 'Guides',
    toolLinks: ['/repair-pdf', '/compress-pdf', '/merge-pdf', '/pdf-to-word']
  },
  {
    keyword: 'make photo collage online',
    slug: 'photo-collage-maker-online-free',
    category: 'Images',
    toolLinks: ['/collage-maker', '/resize-image', '/crop-image', '/compress-image']
  },
  {
    keyword: 'meme maker online free',
    slug: 'meme-maker-online-free-no-watermark',
    category: 'Images',
    toolLinks: ['/meme-maker', '/resize-image', '/compress-image', '/remove-bg']
  },
  {
    keyword: 'pdf to csv converter',
    slug: 'convert-pdf-to-csv-free-online',
    category: 'Productivity',
    toolLinks: ['/pdf-to-csv', '/pdf-to-excel', '/pdf-to-word', '/pdf-to-text']
  },
  {
    keyword: 'reverse pdf page order',
    slug: 'reverse-pdf-page-order-online-free',
    category: 'Guides',
    toolLinks: ['/reverse-pdf', '/rotate-pdf', '/merge-pdf', '/split-pdf']
  }
];

// ── Helper: Get today's date in YYYY-MM-DD format ───────────────────────────
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// ── Helper: Read existing slugs from blogData.ts ────────────────────────────
function getExistingSlugs() {
  try {
    const content = fs.readFileSync(BLOG_DATA_PATH, 'utf-8');
    const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
    const slugs = new Set();
    let match;
    while ((match = slugRegex.exec(content)) !== null) {
      slugs.add(match[1]);
    }
    return slugs;
  } catch (err) {
    console.error('Error reading blogData.ts:', err.message);
    return new Set();
  }
}

// ── Helper: Pick next unpublished topic ─────────────────────────────────────
function pickNextTopic(existingSlugs) {
  for (const topic of TOPIC_QUEUE) {
    if (!existingSlugs.has(topic.slug)) {
      return topic;
    }
  }
  return null;
}

// ── Helper: Build the Gemini prompt for metadata ────────────────────────────
function buildMetadataPrompt(topic) {
  return `You are an SEO content writer for PDFA2Z. Generate metadata for a blog post about: "${topic.keyword}"

Return ONLY a valid JSON object (no markdown, no code fences):
{"title":"SEO title 50-65 chars","excerpt":"Meta description 140-160 chars"}`;
}

// ── Helper: Build the Gemini prompt for content ─────────────────────────────
function buildContentPrompt(topic, title) {
  const toolLinksStr = topic.toolLinks.map(t => `<a href="${t}">`).join(', ');

  return `You are an SEO content writer for PDFA2Z, a free online suite of PDF, image, and AI tools at https://pdfa2z.com.

Write a comprehensive, SEO-optimized blog post.
Title: "${title}"
Target keyword: "${topic.keyword}"

REQUIREMENTS:
- Length: 2000-3000 words of HTML content
- Professional but approachable tone, helpful and actionable
- Target the keyword "${topic.keyword}" naturally throughout
- Include a compelling introduction (hook the reader in the first 2 sentences)
- Use proper HTML formatting: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags
- Do NOT include <h1> tag (the title is rendered separately)
- Do NOT include any markdown formatting, ONLY HTML tags
- Include 5-8 internal links to PDFA2Z tools using these links: ${toolLinksStr}
  Also use: <a href="/merge-pdf">, <a href="/compress-pdf">, <a href="/split-pdf">, <a href="/remove-bg">, <a href="/pdf-to-word">, <a href="/sign-pdf">, <a href="/protect-pdf">, <a href="/pdf-chat"> as relevant.
- Include an FAQ section at the end with 8-10 questions and answers formatted as:
  <h3>Q: [question]</h3>
  <p>A: [answer]</p>
- Include a strong conclusion with a call to action to try PDFA2Z tools
- Break up content with subheadings every 150-250 words
- Use bullet lists where appropriate for scannability
- Mention benefits like: free, no signup required, works in browser, private/secure, unlimited usage

Return ONLY the HTML content. No JSON wrapper, no markdown fences, no preamble. Start directly with the first <h2> or <p> tag.`;
}

// ── Helper: Parse Gemini response into a blog post object ───────────────────
function parseGeminiResponse(text, topic) {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);

    // Fill in defaults from topic if Gemini missed them
    parsed.slug = parsed.slug || topic.slug;
    parsed.category = parsed.category || topic.category;
    parsed.author = parsed.author || 'PDFA2Z Team';

    // Validate critical fields
    const required = ['title', 'excerpt', 'content'];
    for (const field of required) {
      if (!parsed[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return parsed;
  } catch (err) {
    // If JSON parse fails, try to extract JSON from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        parsed.slug = parsed.slug || topic.slug;
        parsed.category = parsed.category || topic.category;
        parsed.author = parsed.author || 'PDFA2Z Team';
        if (parsed.title && parsed.content) return parsed;
      } catch (_) { /* fall through */ }
    }
    console.error('Failed to parse Gemini response as JSON:', err.message);
    console.error('Raw response (first 500 chars):', cleaned.substring(0, 500));
    throw err;
  }
}

// ── Helper: Escape content for TypeScript template literal ──────────────────
function escapeForTemplateLiteral(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

// ── Helper: Append blog post to blogData.ts ─────────────────────────────────
function appendToBlogData(post) {
  let fileContent = fs.readFileSync(BLOG_DATA_PATH, 'utf-8');

  const today = getTodayDate();
  const escapedContent = escapeForTemplateLiteral(post.content);

  const newEntry = `
  {
    slug: '${post.slug.replace(/'/g, "\\'")}',
    title: '${post.title.replace(/'/g, "\\'")}',
    excerpt: '${post.excerpt.replace(/'/g, "\\'")}',
    date: '${today}',
    author: '${post.author.replace(/'/g, "\\'")}',
    category: '${post.category.replace(/'/g, "\\'")}',
    content: \`
      ${escapedContent}
    \`
  }`;

  // Find the closing of the BLOG_POSTS array and insert before it
  const closingBracketIndex = fileContent.lastIndexOf('];');
  if (closingBracketIndex === -1) {
    throw new Error('Could not find closing ]; of BLOG_POSTS array in blogData.ts');
  }

  // Insert a comma after the last entry, then the new entry
  const before = fileContent.substring(0, closingBracketIndex);
  const after = fileContent.substring(closingBracketIndex);

  // Check if there's already content (need a comma)
  const trimmedBefore = before.trimEnd();
  const needsComma = trimmedBefore.endsWith('}') || trimmedBefore.endsWith('`');

  const updatedContent = before + (needsComma ? ',' : '') + newEntry + '\n' + after;

  fs.writeFileSync(BLOG_DATA_PATH, updatedContent, 'utf-8');
  console.log(`Successfully appended blog post "${post.title}" to blogData.ts`);
}

// ── Helper: Regenerate sitemap ──────────────────────────────────────────────
function regenerateSitemap() {
  try {
    console.log('Regenerating sitemap...');
    execSync(`node "${SITEMAP_SCRIPT}"`, { stdio: 'inherit' });
    console.log('Sitemap regenerated successfully.');
  } catch (err) {
    console.error('Warning: Failed to regenerate sitemap:', err.message);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== PDFA2Z Daily Blog Generator ===');
  console.log(`Date: ${getTodayDate()}`);
  console.log('');

  // Step 1: Read existing slugs
  console.log('Step 1: Reading existing blog posts...');
  const existingSlugs = getExistingSlugs();
  console.log(`Found ${existingSlugs.size} existing posts: ${[...existingSlugs].join(', ')}`);
  console.log('');

  // Step 2: Pick next topic
  console.log('Step 2: Selecting next topic...');
  const topic = pickNextTopic(existingSlugs);
  if (!topic) {
    console.log('All topics in the queue have been published! Add more topics to TOPIC_QUEUE.');
    process.exit(0);
  }
  console.log(`Selected topic: "${topic.keyword}" (slug: ${topic.slug})`);
  console.log('');

  // Step 3: Generate metadata via Gemini
  console.log('Step 3: Generating blog metadata via Gemini API...');
  let metadata;
  try {
    const metaResponse = await ai.models.generateContent({
      model: MODEL,
      contents: buildMetadataPrompt(topic),
    });
    let metaText = metaResponse.text.trim();
    if (metaText.startsWith('```')) {
      metaText = metaText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    const jsonMatch = metaText.match(/\{[\s\S]*\}/);
    metadata = JSON.parse(jsonMatch ? jsonMatch[0] : metaText);
    console.log(`Title: ${metadata.title}`);
    console.log(`Excerpt: ${metadata.excerpt}`);
  } catch (err) {
    console.error('Metadata generation error:', err.message);
    // Use fallback metadata
    metadata = {
      title: topic.keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' - Complete Guide',
      excerpt: `Learn ${topic.keyword} with our free online tools. Step-by-step guide with expert tips for ${new Date().getFullYear()}.`
    };
    console.log(`Using fallback metadata: ${metadata.title}`);
  }
  console.log('');

  // Step 4: Generate content via Gemini
  console.log('Step 4: Generating blog content via Gemini API...');
  let htmlContent;
  try {
    const contentResponse = await ai.models.generateContent({
      model: MODEL,
      contents: buildContentPrompt(topic, metadata.title),
    });
    htmlContent = contentResponse.text.trim();
    // Strip markdown fences if present
    if (htmlContent.startsWith('```')) {
      htmlContent = htmlContent.replace(/^```(?:html)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    console.log(`Received content (${htmlContent.length} characters)`);
  } catch (err) {
    console.error('Content generation error:', err.message);
    process.exit(1);
  }
  console.log('');

  // Step 5: Assemble blog post
  console.log('Step 5: Assembling blog post...');
  const post = {
    title: metadata.title,
    slug: topic.slug,
    excerpt: metadata.excerpt,
    content: htmlContent,
    category: topic.category,
    author: metadata.author || 'PDFA2Z Team'
  };
  console.log(`Title: ${post.title}`);
  console.log(`Category: ${post.category}`);
  console.log(`Content length: ${post.content.length} characters`);
  console.log('');

  // Step 6: Append to blogData.ts
  console.log('Step 6: Appending to blogData.ts...');
  try {
    appendToBlogData(post);
  } catch (err) {
    console.error('Failed to append blog post:', err.message);
    process.exit(1);
  }
  console.log('');

  // Step 7: Regenerate sitemap
  console.log('Step 7: Regenerating sitemap...');
  regenerateSitemap();
  console.log('');

  console.log('=== Blog generation complete! ===');
  console.log(`New post: "${post.title}" (${post.slug})`);
  console.log(`Posts remaining in queue: ${TOPIC_QUEUE.length - existingSlugs.size - 1}`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
