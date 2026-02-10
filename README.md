<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Q3RP_rjWPjUEa_CnIturS_b2d_eBqVUF


## Features & Known Limitations

- **PDF Utilities**: Includes Merge, Split, Protect, and more.
  - *Note*: PDF protection now uses standard encryption.
- **AI Tools**: Requires a valid `GEMINI_API_KEY` in `.env.local`.
- **Video Downloader**: Currently in **Demo Mode**. Real downloading requires a backend service.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
   `npm install`
2. **API Key Setup**:
   - **Method A (Recommended for Dev)**: Create `.env.local` and add `GEMINI_API_KEY=your_key`.
   - **Method B (Manual)**: Click the **Settings (Sliders)** icon in the app header and paste your key.
3. Run the app:
   `npm run dev`

## Deployment

To deploy with working AI features:
1.  Add `GEMINI_API_KEY` to your **GitHub Repository Secrets**.
2.  Push to `main`.
3.  If the secret fails, use **Method B** (Manual Entry) in the deployed app.
