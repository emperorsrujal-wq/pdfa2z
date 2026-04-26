This file serves as the "Long Term Memory" for the PDFA2Z platform. It should be read by the AI assistant at the start of every session and updated at the end of every session to ensure continuity.

> [!IMPORTANT]
> **CONTEXT ISOLATION NOTICE**
> This project (PDFA2Z) is distinct and independent from the `LocalDeals` project.
> NEVER mix code, configuration, or logic between these two environments. 
> PDFA2Z is a PDF/AI utility platform; LocalDeals is a marketplace ecosystem.

---

## 🛠️ Technical Architecture

- **Frontend:** React (TypeScript) + Vite
- **Styling:** Vanilla CSS + Tailwind (Legacy support)
- **Backend:** Firebase (Authentication, Firestore, Storage, Hosting, Functions) — Project ID: `gen-lang-client-0072471951` (Unified)
- **Internationalization:** `i18next` with locales in `/locales`

---

## 🚀 Key Modules & Features

### 1. Global Authentication (NEW)
- **Provider:** `context/AuthContext.tsx`
- **UI:** Global `AuthModal.tsx` accessible from the top-level `App.tsx`.
- **Providers Enabled:**
  - ✅ Google Sign-In (Fully Configured)
  - ✅ Apple Sign-In (Code implemented, configuration in progress)
  - ✅ Email/Password (Fully Configured)

### 2. Remote Online Notarization (RON)
- **Entry Point:** `/notarize` handled by `NotarizeApp.tsx`.
- **Architecture:** Wizard-based flow synchronized with global Auth.
- **Database:** Firestore collection `users/{uid}` and `sessions/{sessionId}`.

### 3. PDF & AI Tool Suites
- **PDF Suite:** Managed by `PdfSuite.tsx`, handles Merge, Split, Sign, etc.
- **AI Tools:** AI Writer, Vision, and Image Generation tools.
- **Registry:** `utils/seoData.ts` contains the MASTER registry for all tools, routing, and SEO data.

---

## 📍 Current State (As of April 5, 2026)

### ✅ Recently Completed
- [x] Unified platform-wide authentication.
- [x] Implemented "Continue with Apple" frontend and service logic.
- [x] Enabled Google and Email/Password providers in Firebase Console.
- [x] High-visibility "Online Notary" integration in Header and Home Hero.
- [x] **QA Fixes (April 26, 2026):**
    - [x] Global History (Undo/Redo) across pages.
    - [x] Smart OCR Text Extraction.
    - [x] Find & Replace text layering.
    - [x] Text formatting enhancements (Bold/Italic/Underline).
    - [x] Dynamic cursors and tooltips.
- [x] Pushed all changes to Git `main` branch.

### ⏳ Unfinished / Next Steps
- **Apple Sign-In Credentials:** Waiting on Team ID, Key ID, and Private Key from the user to finish the Firebase Console configuration.
- **Form Field Detection:** Automatically detect existing fillable fields in PDFs.
- **Mobile Responsive Polish:** Ensure the new toolbars are fully usable on small screens.

---

## 📂 Key Files to Watch
- `App.tsx`: Routing and Global Providers.
- `context/AuthContext.tsx`: Identity source of truth.
- `utils/seoData.ts`: The central tool registry.
- `services/authService.ts`: Core logic for sign-in/up.
- `pages/Home.tsx`: Main discovery navigation.
