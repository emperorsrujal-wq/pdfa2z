# PDF Editor - World Class Implementation Plan

## Current Status: Competent MVP ➡️ Professional Grade Tool

---

## TIER 1: CRITICAL FIXES (This Session)

### 1. **Fix TypeScript Type Safety**
- [ ] Remove 5 `as any` casts in pdfHelpers.ts
- [ ] Fix EditElementType to include all modes
- [ ] Proper error typing instead of `catch (err: any)`
- [ ] Add proper event handler types
- **Impact**: Better IDE support, fewer runtime errors, production-ready

### 2. **Implement Duplicate Function**
- [ ] Fix `onDuplicate()` stub in ObjectToolbar.tsx
- [ ] Clone element with new position offset (10px right, 10px down)
- [ ] Preserve all properties (color, size, font, etc.)
- [ ] Add to undo history
- **Impact**: Actually usable "Duplicate" button

### 3. **Add Bounds Checking**
- [ ] Text size: 8-96px
- [ ] Stroke width: 1-20px
- [ ] Opacity: 0-1
- [ ] Font size must be positive integer
- [ ] Page index must be valid (0 to totalPages-1)
- **Impact**: Prevent broken PDFs, better validation

### 4. **Replace Fake "Smart Redact"**
- [ ] Remove hardcoded fake rectangle redaction
- [ ] Replace with real feature:
  - Option A: Integrate with actual ML privacy detection
  - Option B: Show smart suggestion tool (clickable areas to redact)
  - Option C: Remove if not implementing properly
- **Impact**: No misleading "AI" features

### 5. **Proper Error Recovery**
- [ ] Catch PDF parsing errors with specific messages
- [ ] Show user-friendly error dialogs
- [ ] Suggest solutions (try another file, check format, etc.)
- [ ] Add error telemetry
- **Impact**: Professional error handling

---

## TIER 2: ESSENTIAL FEATURES (Next Priority)

### 6. **Keyboard Shortcuts**
```
Ctrl+Z / Cmd+Z     → Undo
Ctrl+Shift+Z / Cmd+Shift+Z → Redo
Delete            → Delete selected element
Escape            → Deselect / Cancel mode
Arrow Keys        → Move selected element (5px)
Ctrl+D            → Duplicate element
Ctrl+C            → Copy element
Ctrl+V            → Paste element
Ctrl+F            → Find text in document
Ctrl+A            → Select all elements
+ / -             → Zoom in/out
0                 → Fit to page
1                 → 100% zoom
```
- **Impact**: Professional power-user experience

### 7. **Element Resizing from UI**
- [ ] Add width/height sliders in ObjectToolbar
- [ ] Show current dimensions
- [ ] Maintain aspect ratio option
- [ ] Visual preview on canvas while resizing
- **Impact**: Easy element sizing without manual position calc

### 8. **Layer Ordering Controls**
- [ ] Add "Bring to Front", "Send to Back" buttons
- [ ] Z-index management
- [ ] Layer panel showing all objects with preview
- [ ] Click layer to select element
- **Impact**: Professional layering like Figma/Adobe

### 9. **Real Signature Support**
- [ ] Integrate signature pad (Signature_Pad.js)
- [ ] Allow drawing signature on canvas
- [ ] Save signature as image element
- [ ] Signature timestamps
- [ ] Clear signature button
- **Impact**: Professional document signing

### 10. **Page Manipulation UI**
- [ ] Drag-drop page reordering in thumbnail panel
- [ ] Right-click context menu: Rotate, Delete, Duplicate page
- [ ] Page insertion (blank page or imported)
- [ ] Show page number in thumbnail
- **Impact**: Full page-level control

### 11. **Text Search (Find)**
- [ ] Ctrl+F opens find dialog
- [ ] Highlights all matches on page
- [ ] Navigate through matches (next/prev)
- [ ] Case-sensitive option
- [ ] Close on Escape
- **Impact**: Find specific text quickly

---

## TIER 3: POLISH & ENHANCEMENT

### 12. **Visual Enhancements**
- [ ] Guide lines (snap to grid)
- [ ] Alignment tools (align left/center/right, distribute)
- [ ] Rulers showing pixel positions
- [ ] Snap-to-edge for overlapping elements
- [ ] Smart guides showing spacing between objects

### 13. **Batch Operations**
- [ ] Select multiple elements (Shift+click)
- [ ] Bulk color change
- [ ] Bulk delete
- [ ] Group/ungroup elements

### 14. **Color & Style Presets**
- [ ] Save custom color palette
- [ ] Recent colors history
- [ ] Preset text styles (heading, body, note, etc.)
- [ ] Pen style presets (thin, medium, thick)

### 15. **Export Options**
- [ ] Flatten vs. Keep as PDF
- [ ] Compress before export
- [ ] Image quality slider (50-100%)
- [ ] PDF/A format for archival

### 16. **Performance Optimization**
- [ ] Memoize EditElement components
- [ ] Lazy load page thumbnails
- [ ] Virtualize large documents (only render visible pages)
- [ ] Debounce drawing updates
- [ ] Cap undo history at 100 items

---

## TIER 4: ADVANCED FEATURES

### 17. **Real OCR Integration**
- [ ] Use Google Cloud Vision or Tesseract.js
- [ ] Extract text from scanned PDFs
- [ ] Make extracted text editable
- [ ] Language auto-detection

### 18. **Form Filling**
- [ ] Detect form fields automatically
- [ ] Map to input types (text, checkbox, radio, dropdown)
- [ ] Auto-fill with user data
- [ ] Calculate field values

### 19. **Commenting System**
- [ ] Add comment annotations to elements
- [ ] Show comment bubble on hover
- [ ] Reply to comments
- [ ] Resolve comments

### 20. **Accessibility Features**
- [ ] Alt text for images
- [ ] Tagging for screen readers
- [ ] High contrast mode
- [ ] Keyboard-only navigation

---

## IMPLEMENTATION ORDER

**Session 1 (Today):**
1. Fix TypeScript errors
2. Implement duplicate function
3. Add bounds checking
4. Fix Smart Redact
5. Improve error handling
6. Deploy to production

**Session 2:**
7. Add keyboard shortcuts
8. Implement element resizing
9. Add layer ordering
10. Deploy

**Session 3:**
11. Signature support
12. Page manipulation
13. Text search
14. Deploy

**Session 4+:**
15-20. Polish and advanced features

---

## Success Metrics

| Feature | Before | After |
|---------|--------|-------|
| **Type Safety** | 5 `as any` casts | 0 `as any` casts |
| **Buttons That Work** | 2/10 toolbar buttons | 10/10 functional |
| **Keyboard Usage** | Not supported | 15+ shortcuts |
| **Max Document Size** | 20 pages (slugs at 50) | 500+ pages (fast) |
| **Error Recovery** | Generic messages | Helpful solutions |
| **Professional Features** | 6/20 | 15/20 |
| **User Rating** | ⭐⭐⭐ (3/5) | ⭐⭐⭐⭐⭐ (5/5) |

---

## Code Quality Standards

```typescript
// ✅ GOOD
const fontSize = Math.max(8, Math.min(96, proposedSize)); // Bounds checked
try {
  const doc = await PDFDocument.load(pdfBytes);
} catch (error: PDFParseError) {
  showError("Could not load PDF. Try another file.");
}

// ❌ BAD - Remove these patterns
const element = response as any;  // Use proper typing instead
catch (err: any) {}               // Use proper error types
```

---

## Testing Checklist

- [ ] Draw on every page
- [ ] Undo/Redo through all modes
- [ ] Duplicate element multiple times
- [ ] Resize and rotate elements
- [ ] Navigate pages smoothly
- [ ] Save and reload edited PDF
- [ ] Test on 50+ page document
- [ ] Test all keyboard shortcuts
- [ ] Error handling (bad file, etc.)
- [ ] Mobile responsiveness

---

**Estimated Time to Production-Ready:** 2-3 weeks (Tier 1-2)
**Estimated Time to Best-in-Class:** 4-6 weeks (Tier 1-3)

Generated: April 10, 2026
