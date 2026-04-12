# PDFA2Z Deployment Naming Registry

This document clarifies the naming conventions for the PDFA2Z production environment to prevent deployment failures.

## 📍 Environment Details

| Component | Value | Notes |
| :--- | :--- | :--- |
| **GCP Project ID** | `gen-lang-client-0072471951` | "PDF PROJECT FINAL" |
| **Cloud Run Service** | `easytools` | **IMPORTANT**: Documentation previously cited `pdfa2z`. |
| **Primary Region** | `us-west1` | Oregon. Documentation previously cited `us-central1`. |
| **Staging URL** | `https://gen-lang-client-0072471951.web.app` | Firebase Hosting |
| **Production URL** | `https://pdfa2z.com` | Custom domain on Cloud Run |

## 🚀 Deployment Pipeline

The production deployment is managed via **GitHub Actions** (`google-cloud-run.yml`). 

### Common Failure Points
1. **Service Name Mismatch**: The workflow MUST target `easytools`.
2. **Region Mismatch**: The workflow MUST target `us-west1`.
3. **IAM Permissions**: The service account `508597263694-compute@developer.gserviceaccount.com` (or similar) must have `roles/run.admin`.

---
*Created: April 12, 2026*
