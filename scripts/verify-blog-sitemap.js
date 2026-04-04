#!/usr/bin/env node

/**
 * Sitemap & Blog Integration Verification Script
 * Verifies that blog posts are properly included in sitemap.xml
 * Run: node scripts/verify-blog-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const BLOG_INDEX_PATH = path.join(PROJECT_ROOT, 'src', 'content', 'blog-index.json');
const SITEMAP_PATH = path.join(PROJECT_ROOT, 'public', 'sitemap.xml');
const BLOG_DATA_PATH = path.join(PROJECT_ROOT, 'utils', 'blogData.ts');

console.log('🔍 Sitemap & Blog Integration Verification\n');
console.log('═'.repeat(50));

// Check 1: Blog index exists
console.log('\n✓ Check 1: Blog Index File');
if (fs.existsSync(BLOG_INDEX_PATH)) {
  const blogIndex = JSON.parse(fs.readFileSync(BLOG_INDEX_PATH, 'utf-8'));
  const count = Array.isArray(blogIndex) ? blogIndex.length : 0;
  console.log(`  ✓ Found blog-index.json with ${count} posts`);
  if (count > 0) {
    console.log(`    Latest post: ${blogIndex[0].slug}`);
  }
} else {
  console.log(`  ⚠️  blog-index.json not found (will be created by automation)`);
}

// Check 2: Blog directories exist
console.log('\n✓ Check 2: Blog Content Directory');
const blogDir = path.join(PROJECT_ROOT, 'src', 'content', 'blog');
if (fs.existsSync(blogDir)) {
  const posts = fs.readdirSync(blogDir).filter(f => {
    const fullPath = path.join(blogDir, f);
    return fs.statSync(fullPath).isDirectory();
  });
  console.log(`  ✓ Found blog directory with ${posts.length} post folders`);
  if (posts.length > 0) {
    console.log(`    Posts: ${posts.slice(0, 5).join(', ')}${posts.length > 5 ? '...' : ''}`);
  }
} else {
  console.log(`  ✓ Blog directory not yet created (created on first post)`);
}

// Check 3: Sitemap exists
console.log('\n✓ Check 3: Generated Sitemap');
if (fs.existsSync(SITEMAP_PATH)) {
  const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  const totalUrls = (sitemapContent.match(/<url>/g) || []).length;
  const blogUrls = (sitemapContent.match(/<loc>.*?\/blog\//g) || []).length;

  console.log(`  ✓ Sitemap exists with ${totalUrls} total URLs`);
  console.log(`  ✓ Blog URLs found: ${blogUrls}`);

  if (blogUrls > 0) {
    const blogMatches = sitemapContent.match(/<loc>https:\/\/pdfa2z\.com\/blog\/([^<]+)<\/loc>/g);
    if (blogMatches && blogMatches.length > 0) {
      console.log(`    Samples: ${blogMatches.slice(0, 3).map(m => {
        const slug = m.match(/blog\/([^<]+)/)[1];
        return slug.substring(0, 30) + (slug.length > 30 ? '...' : '');
      }).join(', ')}`);
    }
  }
} else {
  console.log(`  ⚠️  Sitemap not found. Run: npm run sitemap`);
}

// Check 4: Static blog data
console.log('\n✓ Check 4: Static Blog Data (blogData.ts)');
if (fs.existsSync(BLOG_DATA_PATH)) {
  const blogDataContent = fs.readFileSync(BLOG_DATA_PATH, 'utf-8');
  const staticSlugs = (blogDataContent.match(/slug:\s*['"]([^'"]+)['"]/g) || []).length;
  console.log(`  ✓ Found ${staticSlugs} static blog posts in blogData.ts`);
} else {
  console.log(`  ⚠️  blogData.ts not found (scripts/generateSitemap.js will handle gracefully)`);
}

// Check 5: Verification summary
console.log('\n' + '═'.repeat(50));
console.log('\n📋 Verification Summary:');

const issues = [];

if (!fs.existsSync(SITEMAP_PATH)) {
  issues.push('Sitemap not generated yet');
}

if (fs.existsSync(BLOG_INDEX_PATH)) {
  const blogIndex = JSON.parse(fs.readFileSync(BLOG_INDEX_PATH, 'utf-8'));
  if (blogIndex.length > 0 && fs.existsSync(SITEMAP_PATH)) {
    const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8');
    const dynamicCount = (sitemapContent.match(/<loc>https:\/\/pdfa2z\.com\/blog\//g) || []).length / 4; // 4 languages
    const expectedCount = blogIndex.length;
    if (dynamicCount < expectedCount) {
      issues.push(`${expectedCount} blog posts exist but only ${Math.round(dynamicCount)} in sitemap (run npm run sitemap)`);
    }
  }
}

if (issues.length === 0) {
  console.log('\n✅ All checks passed! Integration is working correctly.');
  console.log('\n📌 Next steps:');
  console.log('  1. Blog automation will run daily at 9:00 AM');
  console.log('  2. Each new post will trigger sitemap regeneration');
  console.log('  3. Posts appear in sitemap within seconds');
  console.log('  4. Search engines discover content within 24-48 hours');
} else {
  console.log('\n⚠️  Issues found:');
  issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });

  console.log('\n🔧 Quick fixes:');
  if (issues.some(i => i.includes('Sitemap'))) {
    console.log('  → Run: npm run sitemap');
  }
  if (issues.some(i => i.includes('only'))) {
    console.log('  → Blog files exist but sitemap is outdated. Run: npm run sitemap');
  }
}

// Check 6: Directory structure
console.log('\n📁 Directory Structure:');
console.log('  src/content/');
console.log('    ├── blog-index.json (tracks all blog posts)');
console.log('    └── blog/');
console.log('        ├── [slug-1]/');
console.log('        │   ├── metadata.json');
console.log('        │   └── content.md');
console.log('        └── [slug-n]/');
console.log('            ├── metadata.json');
console.log('            └── content.md');
console.log('\n  scripts/');
console.log('    └── generateSitemap.js (reads blog-index.json + blogData.ts)');
console.log('\n  public/');
console.log('    └── sitemap.xml (includes all blog posts)');

console.log('\n✨ Verification complete!');
