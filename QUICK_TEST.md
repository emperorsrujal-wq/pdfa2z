# Quick Test Guide - Blog Automation & Sitemap

Run these commands to verify the integration is working.

---

## 1-Minute Verification ⚡

```bash
# Navigate to project
cd C:\Users\w\Downloads\pdfa2z

# Run verification
npm run sitemap:verify

# Expected: ✅ All checks passed!
```

---

## 5-Minute Full Test 🧪

### Step 1: Verify Sitemap Script (1 min)

```bash
cd C:\Users\w\Downloads\pdfa2z

# Regenerate sitemap
npm run sitemap

# Expected output:
# Generating sitemap for 103 total URLs.
# Sitemap generated at C:\Users\w\Downloads\pdfa2z\public\sitemap.xml with 103 URLs.
```

### Step 2: Verify Blog Posts in Sitemap (1 min)

```bash
# Check if blog URLs exist
grep "blog/" public/sitemap.xml | head -5

# Expected: Multiple blog URLs like:
# <loc>https://pdfa2z.com/blog/how-to-merge-pdf-files</loc>
# <loc>https://pdfa2z.com/blog/compress-pdf-without-losing-quality</loc>
```

### Step 3: Count Blog URLs (1 min)

```bash
# Count total blog URLs
grep -c "blog/" public/sitemap.xml

# Expected: At least 32 (8 static blogs × 4 languages)
# If you see 32, the integration is working!
```

### Step 4: View Verification Report (1 min)

```bash
# Full verification report
npm run sitemap:verify

# Should show:
# ✓ Check 1: Blog Index File
# ✓ Check 2: Blog Content Directory
# ✓ Check 3: Generated Sitemap
# ✓ Check 4: Static Blog Data
# ✅ All checks passed!
```

### Step 5: View Actual Blog Index (1 min)

```bash
# View current blog index
cat src/content/blog-index.json | jq '.' | head -30

# Expected: Either empty [] or list of blog posts
```

---

## 10-Minute Full Test (With Blog Generation) 🧪🧪

### Step 1-4: Do all steps from 5-minute test above

Then continue...

### Step 5: Test Blog Generation (5 min)

Open PowerShell as Administrator:

```powershell
cd C:\Users\w\Downloads\pdfa2z

# Run blog generation manually
ts-node ..\..\Users\w\.antigravity\extensions\scripts\blog-automation\generateDailyBlog-gemini.ts

# Watch for these messages:
# 🚀 Starting daily blog generation (Gemini API)...
# 📅 Today's focus: "[keyword]"
# ✍️  Generating blog post with Google Gemini API...
# 💾 Saving blog post...
# 📑 Updating blog index...
# 🔄 Regenerating sitemap...
# ✅ Sitemap regenerated successfully
# ✨ Blog generation completed successfully!
```

### Step 6: Verify New Blog in Sitemap (2 min)

```bash
# Check new blog was created
ls -la src/content/blog/

# Should show new directory, e.g.:
# drwxr-xr-x how-to-merge-pdf-files/

# Verify in sitemap
grep "how-to-merge-pdf-files" public/sitemap.xml

# Expected: Multiple entries (English + 3 language versions)
```

---

## Manual Verification Checklist ✅

Run each command and check the result:

```bash
cd C:\Users\w\Downloads\pdfa2z

# 1. Check blog directory exists
[ -d "src/content/blog" ] && echo "✓ Blog directory exists" || echo "✗ Missing"

# 2. Check blog-index.json exists
[ -f "src/content/blog-index.json" ] && echo "✓ Blog index exists" || echo "✗ Missing"

# 3. Check sitemap exists
[ -f "public/sitemap.xml" ] && echo "✓ Sitemap exists" || echo "✗ Missing"

# 4. Count tools in sitemap
echo "Tools in sitemap: $(grep 'merge-pdf\|compress-pdf\|remove-bg' public/sitemap.xml | wc -l)"
# Expected: 9 (3 tools × 3 entries each)

# 5. Count blog URLs in sitemap
echo "Blog URLs in sitemap: $(grep -c 'blog/' public/sitemap.xml)"
# Expected: At least 32 (8 blogs × 4 languages)

# 6. Count total URLs
echo "Total URLs in sitemap: $(grep -c '<url>' public/sitemap.xml)"
# Expected: ~103 or more
```

---

## Expected Test Results

### ✅ Verification Script

```
🔍 Sitemap & Blog Integration Verification
══════════════════════════════════════════

✓ Check 1: Blog Index File
  ✓ Found blog-index.json with 0 posts

✓ Check 2: Blog Content Directory
  ✓ Found blog directory with 0 post folders

✓ Check 3: Generated Sitemap
  ✓ Sitemap exists with 103 total URLs
  ✓ Blog URLs found: 32

✓ Check 4: Static Blog Data
  ✓ Found 8 static blog posts in blogData.ts

📋 Verification Summary:
✅ All checks passed! Integration is working correctly.
```

### ✅ Sitemap Generation

```
Generating sitemap for 103 total URLs.
Sitemap generated at ... with 103 URLs.
```

### ✅ Blog Generation (Manual Test)

```
🚀 Starting daily blog generation (Gemini API)...

📅 Today's focus: "how to merge pdf files"

✍️  Generating blog post with Google Gemini API...
💾 Saving blog post...
📑 Updating blog index...
🔄 Regenerating sitemap...
✅ Sitemap regenerated successfully

✨ Blog generation completed successfully!

📊 Post Statistics:
   - Title: [Blog Title]
   - Reading Time: 8 min read
   - Category: PDF Tools
   - Keywords: [keywords]
   - Published: 2026-03-14
```

---

## Troubleshooting Quick Fixes 🔧

If test fails, try these:

### Issue: Verification script not found

```bash
# Make sure you're in right directory
pwd
# Should show: /c/Users/w/Downloads/pdfa2z

# Try again
npm run sitemap:verify
```

### Issue: Sitemap has no blog URLs

```bash
# Regenerate sitemap
npm run sitemap

# Then check again
grep -c "blog/" public/sitemap.xml
```

### Issue: Blog generation fails with API error

```bash
# Check if GEMINI_API_KEY is set
echo $GEMINI_API_KEY
# Should show key starting with "AIza"

# If not set, run setup first
# See: QUICK_START_GEMINI.md
```

### Issue: "src/content" directory not found

```bash
# Create it
mkdir -p src/content/blog
echo "[]" > src/content/blog-index.json

# Regenerate sitemap
npm run sitemap
```

---

## Timeline

| Time | What Happens |
|------|--------------|
| Now | Run tests (you are here) |
| ✓ Verified | Integration working! |
| Tomorrow 9 AM | Blog automation runs automatically |
| Tomorrow 9:01 AM | New blog post created |
| Tomorrow 9:02 AM | Sitemap automatically updated |
| Next 24-48 hours | Google discovers new post |
| Week 2-4 | Post appears in search results |
| Month 2-3 | Top rankings for keywords |

---

## Success = ✅ All Tests Pass

If you see:
- ✅ Verification script passes
- ✅ Sitemap has 103+ URLs
- ✅ 32+ blog URLs found
- ✅ Blog directory exists

Then you're ready to go! 🚀

---

## Next: Wait for Tomorrow 9:00 AM

The system will automatically:
1. Generate a blog post
2. Save it to `src/content/blog/`
3. Update `blog-index.json`
4. Regenerate `sitemap.xml`
5. Make it discoverable to Google

No action needed. It's all automatic.

---

## Additional Help

- Detailed guide: `BLOG_AUTOMATION_SITEMAP_INTEGRATION.md`
- Full summary: `SITEMAP_INTEGRATION_COMPLETE.md`
- Next steps: `NEXT_STEPS.md`
- Changes made: `CHANGES_SUMMARY.md`

---

**Test Status:** Ready ✅
**Integration Status:** Complete ✅
**Production Ready:** Yes ✅
