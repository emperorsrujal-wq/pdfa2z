# PDFA2Z API Keys & Authentication Setup

## ✅ What Has Been Fixed

1. **Security Fix**: Removed hardcoded Gemini API key from source code
2. **Environment Variables**: Updated to use `VITE_GEMINI_API_KEY` (proper Vite environment variable)
3. **Error Messages**: Improved error messages that guide users to get API keys
4. **API Key Configuration**: Supports three ways to provide API keys:
   - Environment variables (.env.local)
   - Browser localStorage (for testing)
   - Production secrets (via CI/CD)

---

## ⚙️ Required API Keys & Setup

### 1. **Gemini API Key** (For AI Tools & Blog Generator)

**Status**: ⚠️ Re-configuration Required (Old key leaked and revoked)

Get your free API key:
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API key" 
3. Copy the API key

**Add to .env.local**:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**How it works now**:
- The blog generator script (`scripts/generateDailyBlog.js`) now securely reads from this `.env.local` file.
- Hardcoded keys have been removed to prevent future leaks.

**Or set in browser**:
```javascript
// Paste in browser console while on pdfa2z.com
localStorage.setItem('gemini_api_key', 'your_actual_api_key_here')
// Reload the page
location.reload()
```

**Supported Models** (as of April 2026):
- `gemini-2.5-flash` - Fast, multimodal (images, PDFs, videos)
- `gemini-2.5-pro` - Highest quality for complex tasks
- `veo-2.0-generate-001` - Video generation

---

### 2. **Firebase Authentication** (For Notarization Module)

**Status**: ✅ Configured in .env.local

**Project**: `gen-lang-client-0072471951`

**Required Firebase Console Setup**:

1. **Enable Authentication Methods**:
   - Go to https://console.firebase.google.com/project/gen-lang-client-0072471951/authentication
   - Click "Sign-in method"
   - Enable these providers:
     - ✅ Email/Password
     - ✅ Google
     - ✅ Apple

2. **Add Authorized Domains**:
   - Go to "Settings" > "Authorized domains"
   - Add:
     - `pdfa2z.com` (production)
     - `localhost:5173` (development)
     - Any Firebase Hosting domain

3. **Create Firestore Database** (if not exists):
   - Go to "Firestore Database"
   - Click "Create database"
   - Start in "Test mode" for development
   - Location: `us-central1`

4. **Set Firestore Rules** (for user data):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only read/write their own profile
       match /users/{userId} {
         allow read, write: if request.auth.uid == userId;
       }
     }
   }
   ```

---

### 3. **Stripe** (For Payment Processing - Optional)

**Status**: ❌ Not configured

If you need payment processing:

1. Get keys from https://dashboard.stripe.com/apikeys
2. Add to .env.local:
   ```env
   VITE_STRIPE_PUBLIC_KEY=pk_test_...
   VITE_STRIPE_SECRET_KEY=sk_test_... (backend only)
   ```

---

### 4. **OneNotary** (For Notarization Services - Optional)

**Status**: ❌ Not configured

If you integrate OneNotary notarization:

1. Get API key from OneNotary developer portal
2. Add to .env.local:
   ```env
   VITE_ONENOTARY_API_KEY=your_key_here
   VITE_ONENOTARY_WEBHOOK_SECRET=your_secret_here
   ```

---

## 🚀 Testing Locally

### Setup:
```bash
cd /c/Users/w/Downloads/pdfa2z

# 1. Update .env.local with your Gemini API key
# Edit .env.local and replace PLACEHOLDER_API_KEY

# 2. Install dependencies (if needed)
npm ci --legacy-peer-deps

# 3. Start development server
npm run dev
```

### Test Scenarios:

**✅ AI Writer Tool**:
1. Navigate to "AI Writer"
2. Select "Grammar Fixer"
3. Enter text: "the qwick brown fox jumps over the lazi dog"
4. Click "Grammar Fixer"
5. Should show corrected text

**✅ Image Generator**:
1. Navigate to "AI Image Generator"
2. Enter prompt: "A sunset over mountains"
3. Click "Generate"
4. Should generate and display image

**✅ Login/Notarization**:
1. Click "Sign In" button
2. Choose "Google" or "Email"
3. Complete authentication
4. Should redirect to notarization dashboard

**❌ Expected Errors (before API key)**:
- "Gemini API key not configured. Please..."
- "API Key not found..."

---

## 📝 Production Deployment

### GitHub Actions Secrets:

Set these in GitHub repository settings:
```
GCP_BACKEND_SA_KEY = [Service account JSON from GCP]
VITE_GEMINI_API_KEY = [Your Gemini API key]
VITE_FIREBASE_* = [Already in code, from .env.local]
```

### Deployment Flow:

1. **Merge to main** → GitHub Actions runs
2. **Build**: `npm run build` + TypeScript check
3. **Deploy to Firebase Hosting**: `firebase deploy --only hosting`
4. **Deploy to Cloud Run**: Docker build + push to GCR

### Check Deployment Status:

```bash
# View GitHub Actions
gh run list --repo emperorsrujal-wq/pdfa2z

# Check Cloud Run
gcloud run services describe easytools \
  --region us-west1 \
  --project gen-lang-client-0072471951

# View Firebase logs
firebase deploy:log --project gen-lang-client-0072471951
```

---

## 🔍 Troubleshooting

### Issue: "Gemini API key not configured"
**Fix**: 
- Add `VITE_GEMINI_API_KEY=your_key` to `.env.local`
- Or use browser: `localStorage.setItem('gemini_api_key', 'your_key')`
- Restart dev server or reload page

### Issue: "Failed to authenticate, have you run firebase login?"
**Fix**:
- Check Firebase project ID in `.firebaserc` matches console
- Verify API keys in `config/firebase.ts` are correct
- Ensure domain is in Firebase "Authorized domains"

### Issue: "Cannot read properties of undefined (reading 'useState')"
**Status**: ✅ Fixed in previous commit
- This was caused by incorrect React bundle splitting
- Now React + react-router stay in main chunk

### Issue: Build fails with "tsc error"
**Fix**:
```bash
npm run build  # Runs tsc check automatically
# Fix any TypeScript errors shown
git add .
git commit -m "Fix TypeScript errors"
git push origin main
```

---

## 📋 Checklist

- [ ] Get Gemini API key from ai.google.dev
- [ ] Add `VITE_GEMINI_API_KEY` to `.env.local`
- [ ] Enable Email/Password auth in Firebase Console
- [ ] Enable Google auth in Firebase Console  
- [ ] Enable Apple auth in Firebase Console
- [ ] Add `pdfa2z.com` to Firebase authorized domains
- [ ] Add `localhost:5173` to Firebase authorized domains
- [ ] Test AI Writer locally
- [ ] Test Image Generator locally
- [ ] Test Login locally
- [ ] Push changes to trigger deployment
- [ ] Verify site at pdfa2z.com

---

## 📚 Resources

- **Gemini API**: https://ai.google.dev/gemini-api
- **Firebase Console**: https://console.firebase.google.com
- **Firebase Auth Docs**: https://firebase.google.com/docs/auth
- **Stripe**: https://stripe.com/docs/stripe-js
- **OneNotary**: https://onenotary.com/api/docs

---

**Last Updated**: April 10, 2026
**Status**: Ready for API key configuration
