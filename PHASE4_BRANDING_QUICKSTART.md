# Phase 4: White-Label & Branding - Quick Start Guide

## Overview

Phase 4 implements a comprehensive white-label and branding system that allows the PDF Journey Builder to be customized for enterprise customers (law firms, insurance agencies, mortgage brokers, banks, etc.).

**Status**: ✅ Complete and Production-Ready
**Commit**: `00c010c`

---

## Features Implemented

### 1. **Branding Utilities** (`utils/journeyBranding.ts`)

Core utilities for managing brand configuration:

```typescript
import {
  BrandConfig,
  DEFAULT_BRAND_CONFIG,
  mergeBrandConfig,
  saveBrandConfig,
  loadBrandConfig,
  applyBrandConfig,
  validateBrandConfig
} from '../utils/journeyBranding';
```

**Key Functions**:
- `mergeBrandConfig(custom)` - Merge custom with defaults
- `saveBrandConfig(config)` - Save to localStorage
- `loadBrandConfig()` - Load from localStorage
- `applyBrandConfig(config)` - Apply styles to document
- `validateBrandConfig(config)` - Validate configuration
- `getBrandCssVariables(config)` - Get CSS variable map
- `getGoogleFontsUrl(...)` - Generate Google Fonts URL

### 2. **Brand Configuration Component** (`components/JourneyBrandConfig.tsx`)

Professional UI for customizing branding:

```typescript
<JourneyBrandConfig
  onConfigChange={(config) => console.log(config)}
  onSave={(config) => saveBrandConfig(config)}
  initialConfig={loadedConfig}
/>
```

**Features**:
- 4 tabbed sections: Colors, Fonts, Messaging, Legal
- Live color preview
- Font family selector (10+ Google Fonts)
- Logo upload
- Custom messages and footer text
- Validation with error display
- Save/Reset functionality

### 3. **PDFJourneyBuilder Integration**

The main component now supports branding:

```typescript
// Load saved branding on mount
const [brandConfig, setBrandConfig] = useState<BrandConfig>(() => {
  const saved = loadBrandConfig();
  return mergeBrandConfig(saved);
});

// Apply branding when config changes
useEffect(() => {
  applyBrandConfig(brandConfig);
}, [brandConfig]);
```

---

## BrandConfig Interface

```typescript
interface BrandConfig {
  // Logo & Visual Identity
  logoUrl?: string;           // Custom company logo
  logoHeight?: number;        // Logo height in pixels (default: 32)
  faviconUrl?: string;        // Favicon URL

  // Colors
  primaryColor?: string;      // Primary action color (default: #f59e0b)
  accentColor?: string;       // Secondary/accent color
  successColor?: string;      // Success state color (default: #10b981)
  errorColor?: string;        // Error state color (default: #f87171)
  backgroundColor?: string;   // Page background color
  textColor?: string;         // Primary text color
  secondaryTextColor?: string; // Secondary text color

  // Typography
  fontFamily?: string;        // Google Font family name (default: 'Inter')
  headingFontFamily?: string; // Optional separate heading font

  // Branding & Messaging
  companyName?: string;       // Display company name
  journeyTitle?: string;      // Override journey title
  footerText?: string;        // Custom footer text
  successMessage?: string;    // Custom thank you/success message
  successSubtitle?: string;   // Success screen subtitle

  // Legal & Links
  privacyUrl?: string;        // Custom privacy policy URL
  termsUrl?: string;          // Custom terms of service URL
  supportEmail?: string;      // Support contact email
  supportUrl?: string;        // Support/help page URL

  // Branding Control
  showPdfa2zBranding?: boolean;    // Show "pdfa2z · Journey Builder"
  showPdfa2zLogo?: boolean;        // Show PDFA2Z logo
  brandingPosition?: 'top' | 'bottom';

  // Email Configuration
  fromEmail?: string;         // Email to send from
  emailTemplate?: string;     // Custom email template (HTML)

  // Additional Customization
  customCss?: string;         // Custom CSS for advanced styling
  customScriptUrl?: string;   // Custom tracking/analytics script
}
```

---

## Usage Examples

### Example 1: Law Firm

```typescript
const lawFirmConfig: BrandConfig = {
  primaryColor: '#1e40af',           // Professional blue
  fontFamily: 'Poppins',
  companyName: 'Acme Law Firm',
  logoUrl: 'https://acme-law.com/logo.png',
  journeyTitle: 'Client Intake Form',
  successMessage: 'Your case intake has been received.',
  privacyUrl: 'https://acme-law.com/privacy',
  termsUrl: 'https://acme-law.com/terms',
  supportEmail: 'intake@acme-law.com',
  showPdfa2zBranding: false  // White-label
};

saveBrandConfig(lawFirmConfig);
applyBrandConfig(lawFirmConfig);
```

### Example 2: Insurance Agency

```typescript
const insuranceConfig: BrandConfig = {
  primaryColor: '#dc2626',           // Insurance red
  accentColor: '#991b1b',
  fontFamily: 'Roboto',
  companyName: 'TrustedCare Insurance',
  logoUrl: 'https://trusted-care.com/logo.svg',
  successMessage: 'Claim submitted successfully!',
  footerText: 'Your trusted partner in protection',
  privacyUrl: 'https://trusted-care.com/privacy'
};

applyBrandConfig(insuranceConfig);
```

### Example 3: Mortgage Broker

```typescript
const mortgageConfig: BrandConfig = {
  primaryColor: '#059669',           // Financial green
  fontFamily: 'Open Sans',
  headingFontFamily: 'Playfair Display',
  companyName: 'Mortgage Masters',
  successMessage: 'Application submitted! We\'ll be in touch within 24 hours.',
  supportEmail: 'applications@mortgagemasters.com',
  customCss: `
    .jb-title { letter-spacing: -0.02em; }
    .jb-btn-gold { border-radius: 6px; }
  `
};

saveBrandConfig(mortgageConfig);
```

---

## CSS Variables

The branding system automatically creates CSS variables:

```css
:root {
  --brand-primary: #f59e0b;
  --brand-accent: #fbbf24;
  --brand-success: #10b981;
  --brand-error: #f87171;
  --brand-bg: #0f172a;
  --brand-text: #e2e8f0;
  --brand-text-secondary: #94a3b8;
  --brand-font-family: Inter, sans-serif;
  --brand-heading-font: Bricolage Grotesque, sans-serif;
}
```

Use in custom CSS:

```css
.my-button {
  background-color: var(--brand-primary);
  color: var(--brand-text);
  font-family: var(--brand-font-family);
}
```

---

## Integration Checklist

- [ ] Import branding utilities: `import { ... } from '../utils/journeyBranding'`
- [ ] Add brand config state to component
- [ ] Load config on mount: `const saved = loadBrandConfig()`
- [ ] Apply config with useEffect: `applyBrandConfig(brandConfig)`
- [ ] Update CSS to use CSS variables
- [ ] Test with sample configurations
- [ ] Deploy branding UI component

---

## Demo Server

Run the Phase 4 demo:

```bash
node serve-pdfa2z-phase4-demo.js
```

Then open: `http://localhost:5174/phase4`

The demo includes:
- Feature overview
- Integration guide
- Use case examples
- Success metrics
- Next steps roadmap

---

## LocalStorage Persistence

Brand configs are automatically saved to browser localStorage:

```typescript
// Save
saveBrandConfig(config);

// Load
const config = loadBrandConfig();

// Clear
clearBrandConfig();
```

Storage key: `pdfa2z_journey_brand_config`

---

## Validation

Validate configurations before saving:

```typescript
const errors = validateBrandConfig(config);

if (errors.length > 0) {
  console.error('Config invalid:', errors);
  // Display errors to user
} else {
  saveBrandConfig(config);
}
```

**Validates**:
- URLs (logo, privacy, terms, support)
- Colors (hex format)
- Emails (format)
- Custom CSS (syntax)

---

## White-Label Setup

For white-label enterprise deployments:

```typescript
const whitelabelConfig: BrandConfig = {
  showPdfa2zBranding: false,      // Hide "pdfa2z" branding
  showPdfa2zLogo: false,          // Hide PDFA2Z logo
  brandingPosition: 'bottom',     // (Optional) Move remaining branding

  // Your branding
  logoUrl: 'https://customer.com/logo.png',
  primaryColor: '#...',
  companyName: 'Customer Name',
  // ... other config
};
```

---

## Revenue Opportunities

### Pricing Tiers

**Tier 2: Professional ($29/month)**
- Basic branding (colors only)
- Custom company name

**Tier 3: Enterprise ($199/month)**
- Full white-label
- Custom fonts
- Logo upload
- Custom messages
- All legal links
- Email templates
- Advanced CSS

**Tier 4: Reseller (Custom)**
- Complete white-label platform
- Revenue share (40-60%)
- Dedicated API access
- Custom integrations

### Market Size
- Lawyers: 1.3M (target 10,000 = $290K/month)
- Insurance agents: 500K (target 5,000 = $145K/month)
- Mortgage brokers: 100K (target 2,000 = $58K/month)
- Banks/Credit unions: 8,000 (target 500 = $99K/month)

**Year 1 Conservative Estimate**: $500K-1M ARR

---

## Next Steps (Phase 5)

**Phase 5: Analytics Dashboard**
- Track completion rates
- Drop-off analysis by step/field
- Field-level error tracking
- Time-to-completion metrics
- Device/browser breakdown
- Real-time completion tracking
- Export reports (CSV/PDF)

---

## Testing the Branding System

### Test Configuration

```typescript
const testConfig: BrandConfig = {
  primaryColor: '#FF6B6B',
  successColor: '#51CF66',
  errorColor: '#FF922B',
  fontFamily: 'Poppins',
  headingFontFamily: 'Playfair Display',
  companyName: 'Test Company',
  successMessage: 'Test submission successful!',
  footerText: 'Test footer text',
  showPdfa2zBranding: false
};

saveBrandConfig(testConfig);
applyBrandConfig(testConfig);

// Verify in browser DevTools:
// - Colors changed in all UI elements
// - Fonts applied correctly
// - Logo appears (if provided)
// - Footer text updated
// - PDFA2Z branding hidden
```

---

## Troubleshooting

**Issue**: Config not persisting
**Solution**: Check localStorage is enabled; verify BRAND_CONFIG_STORAGE_KEY

**Issue**: Fonts not loading
**Solution**: Verify Google Fonts API is accessible; check font names spelling

**Issue**: Colors not applying
**Solution**: Check CSS variable syntax; verify browser supports CSS variables

**Issue**: Logo not showing
**Solution**: Verify URL is accessible and CORS-enabled; check file format (PNG/SVG)

---

## Files Reference

| File | Purpose |
|------|---------|
| `utils/journeyBranding.ts` | Core branding utilities |
| `components/JourneyBrandConfig.tsx` | Branding configuration UI |
| `components/PDFJourneyBuilder.tsx` | Updated with branding integration |
| `serve-pdfa2z-phase4-demo.js` | Interactive demo server |

---

## Support & Questions

For implementation questions or issues:
1. Check the demo: `node serve-pdfa2z-phase4-demo.js`
2. Review example configurations in this guide
3. Check validation errors: `validateBrandConfig(config)`
4. Inspect browser console for CSS variable application

---

**Status**: Phase 4 Complete ✅
**Production Ready**: Yes
**Last Updated**: 2026-04-10
