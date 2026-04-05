# PDFA2Z — Project Master Memory

This file serves as the "Long Term Memory" for the PDFA2Z platform. It should be read by the AI assistant at the start of every session and updated at the end of every session to ensure continuity.

---

## 🛠️ Technical Architecture

- **Frontend:** React (TypeScript) + Vite
- **Styling:** Vanilla CSS + Tailwind (Legacy support)
- **Backend:** Firebase (Authentication, Firestore, Storage, Hosting, Functions)
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
- [x] Pushed all changes to Git `main` branch.

### ⏳ Unfinished / Next Steps
- **Apple Sign-In Credentials:** Waiting on Team ID, Key ID, and Private Key from the user to finish the Firebase Console configuration.
- **PDF Editor Polish:** The user mentioned the PDF editor needs more work (zoom, usability).
- **Tool Organization:** Ongoing UX improvements to group tools logically as the suite grows.

---

## 📂 Key Files to Watch
- `App.tsx`: Routing and Global Providers.
- `context/AuthContext.tsx`: Identity source of truth.
- `utils/seoData.ts`: The central tool registry.
- `services/authService.ts`: Core logic for sign-in/up.
- `pages/Home.tsx`: Main discovery navigation.
