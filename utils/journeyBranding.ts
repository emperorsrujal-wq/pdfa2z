/**
 * White-Label & Branding Configuration for PDF Journey Builder
 * Enables enterprise customers to customize the entire journey experience
 */

export interface BrandConfig {
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
  showPdfa2zBranding?: boolean;     // Show "pdfa2z · Journey Builder" (default: true)
  showPdfa2zLogo?: boolean;         // Show PDFA2Z logo (default: true)
  brandingPosition?: 'top' | 'bottom'; // Where to show branding (default: 'top')

  // Email Configuration
  fromEmail?: string;         // Email to send from
  emailTemplate?: string;     // Custom email template (HTML)

  // Additional Customization
  customCss?: string;         // Custom CSS for advanced styling
  customScriptUrl?: string;   // Custom tracking/analytics script
  isFocusedMode?: boolean;    // Single field per screen mode (default: false)

  // Regional Settings (Auto-detected if null)
  locale?: string;            // e.g., 'en-US', 'en-GB'
  currencyCode?: string;      // e.g., 'USD', 'GBP'
  currencySymbol?: string;    // e.g., '$', '£'
  dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

  // Integration Settings
  webhookUrl?: string;        // External endpoint for automated delivery
  webhookSecret?: string;     // Secret key for payload signing

  // Account Tier
  isPro?: boolean;            // Whether the account has Pro/Enterprise features
}

/**
 * Detect regional settings based on browser defaults
 */
export const autoDetectRegionalSettings = (): Partial<BrandConfig> => {
  try {
    const locale = navigator.language || 'en-US';
    const currency = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' })
      .resolvedOptions().currency || 'USD';
    
    // Simple symbol detection
    const symbol = new Intl.NumberFormat(locale, { style: 'currency', currency })
      .formatToParts(1)
      .find(p => p.type === 'currency')?.value || '$';

    // Date format detection (rough)
    let dateFormat: BrandConfig['dateFormat'] = 'MM/DD/YYYY';
    const dateStr = new Intl.DateTimeFormat(locale).format(new Date(2022, 11, 31));
    if (dateStr.startsWith('31')) dateFormat = 'DD/MM/YYYY';
    else if (dateStr.startsWith('2022')) dateFormat = 'YYYY-MM-DD';

    return { locale, currencyCode: currency, currencySymbol: symbol, dateFormat };
  } catch (e) {
    return { locale: 'en-US', currencyCode: 'USD', currencySymbol: '$', dateFormat: 'MM/DD/YYYY' };
  }
};

/**
 * Default branding configuration
 */
export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  logoHeight: 32,
  primaryColor: '#f59e0b',
  accentColor: '#fbbf24',
  successColor: '#10b981',
  errorColor: '#f87171',
  backgroundColor: '#0f172a',
  textColor: '#e2e8f0',
  secondaryTextColor: '#94a3b8',
  fontFamily: 'Inter',
  companyName: 'PDFA2Z',
  footerText: 'Secure. Fast. Easy.',
  successMessage: 'Submission successful!',
  successSubtitle: 'Your form has been submitted successfully.',
  showPdfa2zBranding: true,
  showPdfa2zLogo: true,
  brandingPosition: 'top',
  webhookUrl: '',
  webhookSecret: '',
  ...autoDetectRegionalSettings(),
};

/**
 * Merge custom config with defaults
 */
export const mergeBrandConfig = (custom?: Partial<BrandConfig>): BrandConfig => {
  return { ...DEFAULT_BRAND_CONFIG, ...custom };
};

/**
 * Get CSS variable declarations for a brand config
 * Useful for applying branding across components
 */
export const getBrandCssVariables = (config: BrandConfig): Record<string, string> => {
  return {
    '--brand-primary': config.primaryColor || DEFAULT_BRAND_CONFIG.primaryColor!,
    '--brand-accent': config.accentColor || DEFAULT_BRAND_CONFIG.accentColor!,
    '--brand-success': config.successColor || DEFAULT_BRAND_CONFIG.successColor!,
    '--brand-error': config.errorColor || DEFAULT_BRAND_CONFIG.errorColor!,
    '--brand-bg': config.backgroundColor || DEFAULT_BRAND_CONFIG.backgroundColor!,
    '--brand-text': config.textColor || DEFAULT_BRAND_CONFIG.textColor!,
    '--brand-text-secondary': config.secondaryTextColor || DEFAULT_BRAND_CONFIG.secondaryTextColor!,
    '--brand-font-family': config.fontFamily || DEFAULT_BRAND_CONFIG.fontFamily!,
    '--brand-heading-font': config.headingFontFamily || (config.fontFamily || DEFAULT_BRAND_CONFIG.fontFamily!),
  };
};

/**
 * Generate Google Fonts import URL
 */
export const getGoogleFontsUrl = (fontFamily?: string, headingFontFamily?: string): string => {
  const fonts = [];
  if (fontFamily && fontFamily !== 'system') fonts.push(fontFamily);
  if (headingFontFamily && headingFontFamily !== 'system' && headingFontFamily !== fontFamily) {
    fonts.push(headingFontFamily);
  }

  if (fonts.length === 0) return '';

  // Convert font names to URL format (e.g., "Open Sans" → "Open+Sans")
  const fontParams = fonts.map(f => f.replace(/\s+/g, '+')).join('&family=');
  return `https://fonts.googleapis.com/css2?family=${fontParams}&display=swap`;
};

/**
 * Local storage key for brand config
 */
export const BRAND_CONFIG_STORAGE_KEY = 'pdfa2z_journey_brand_config';

/**
 * Save brand config to localStorage
 */
export const saveBrandConfig = (config: BrandConfig): void => {
  try {
    localStorage.setItem(BRAND_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save brand config:', error);
  }
};

/**
 * Load brand config from localStorage
 */
export const loadBrandConfig = (): BrandConfig | null => {
  try {
    const stored = localStorage.getItem(BRAND_CONFIG_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as BrandConfig;
  } catch (error) {
    console.error('Failed to load brand config:', error);
    return null;
  }
};

/**
 * Clear brand config from localStorage
 */
export const clearBrandConfig = (): void => {
  try {
    localStorage.removeItem(BRAND_CONFIG_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear brand config:', error);
  }
};

/**
 * Apply brand config styles to document
 */
export const applyBrandConfig = (config: BrandConfig): void => {
  const variables = getBrandCssVariables(config);
  const root = document.documentElement;

  // Apply CSS variables
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Apply Google Fonts if specified
  if (config.fontFamily || config.headingFontFamily) {
    const fontUrl = getGoogleFontsUrl(config.fontFamily, config.headingFontFamily);
    if (fontUrl && !document.querySelector(`link[href="${fontUrl}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      document.head.appendChild(link);
    }
  }

  // Apply custom CSS if provided
  if (config.customCss) {
    let styleEl = document.getElementById('pdfa2z-custom-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'pdfa2z-custom-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = config.customCss;
  }

  // Load custom tracking script if provided
  if (config.customScriptUrl && !document.querySelector(`script[src="${config.customScriptUrl}"]`)) {
    const script = document.createElement('script');
    script.src = config.customScriptUrl;
    document.head.appendChild(script);
  }
};

/**
 * Validate brand config
 */
export const validateBrandConfig = (config: BrandConfig): string[] => {
  const errors: string[] = [];

  // Validate URLs
  if (config.logoUrl && !isValidUrl(config.logoUrl)) {
    errors.push('Invalid logo URL');
  }
  if (config.faviconUrl && !isValidUrl(config.faviconUrl)) {
    errors.push('Invalid favicon URL');
  }
  if (config.privacyUrl && !isValidUrl(config.privacyUrl)) {
    errors.push('Invalid privacy URL');
  }
  if (config.termsUrl && !isValidUrl(config.termsUrl)) {
    errors.push('Invalid terms URL');
  }
  if (config.supportUrl && !isValidUrl(config.supportUrl)) {
    errors.push('Invalid support URL');
  }
  if (config.customScriptUrl && !isValidUrl(config.customScriptUrl)) {
    errors.push('Invalid custom script URL');
  }

  // Validate colors
  if (config.primaryColor && !isValidColor(config.primaryColor)) {
    errors.push('Invalid primary color');
  }
  if (config.accentColor && !isValidColor(config.accentColor)) {
    errors.push('Invalid accent color');
  }
  if (config.successColor && !isValidColor(config.successColor)) {
    errors.push('Invalid success color');
  }
  if (config.errorColor && !isValidColor(config.errorColor)) {
    errors.push('Invalid error color');
  }
  if (config.backgroundColor && !isValidColor(config.backgroundColor)) {
    errors.push('Invalid background color');
  }
  if (config.textColor && !isValidColor(config.textColor)) {
    errors.push('Invalid text color');
  }
  if (config.secondaryTextColor && !isValidColor(config.secondaryTextColor)) {
    errors.push('Invalid secondary text color');
  }

  // Validate email
  if (config.supportEmail && !isValidEmail(config.supportEmail)) {
    errors.push('Invalid support email');
  }
  if (config.fromEmail && !isValidEmail(config.fromEmail)) {
    errors.push('Invalid from email');
  }

  return errors;
};

/**
 * Helper: Check if string is valid URL
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Helper: Check if string is valid color
 */
const isValidColor = (color: string): boolean => {
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
};

/**
 * Helper: Check if string is valid email
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
