/**
 * Brand Configuration Component for PDF Journey Builder
 * Allows users to customize colors, logo, fonts, and messaging
 */

import * as React from 'react';
import { useState } from 'react';
import {
  BrandConfig,
  DEFAULT_BRAND_CONFIG,
  mergeBrandConfig,
  saveBrandConfig,
  loadBrandConfig,
  validateBrandConfig,
} from '../utils/journeyBranding';

interface JourneyBrandConfigProps {
  onConfigChange?: (config: BrandConfig) => void;
  onSave?: (config: BrandConfig) => void;
  initialConfig?: BrandConfig;
}

const GOOGLE_FONTS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Lato',
  'Playfair Display',
  'Montserrat',
  'Ubuntu',
  'Source Sans Pro',
  'Raleway',
];

export const JourneyBrandConfig: React.FC<JourneyBrandConfigProps> = ({
  onConfigChange,
  onSave,
  initialConfig,
}) => {
  const [config, setConfig] = useState<BrandConfig>(
    initialConfig || loadBrandConfig() || DEFAULT_BRAND_CONFIG
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'messaging' | 'legal'>('colors');
  const [saved, setSaved] = useState(false);

  const handleConfigChange = (field: keyof BrandConfig, value: any) => {
    const updated = { ...config, [field]: value };
    setConfig(updated);
    onConfigChange?.(updated);
    setSaved(false);
  };

  const handleSave = () => {
    const validationErrors = validateBrandConfig(config);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    saveBrandConfig(config);
    onSave?.(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setConfig(DEFAULT_BRAND_CONFIG);
    setErrors([]);
    setSaved(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <style>{`
        .brand-config-container {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .brand-config-title {
          font-size: 24px;
          font-weight: 700;
          color: #e2e8f0;
          margin-bottom: 8px;
        }

        .brand-config-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 24px;
        }

        .brand-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(71, 85, 105, 0.2);
          padding-bottom: 12px;
        }

        .brand-tab {
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .brand-tab:hover {
          color: #cbd5e1;
        }

        .brand-tab.active {
          color: #f59e0b;
          border-bottom-color: #f59e0b;
        }

        .brand-form-group {
          margin-bottom: 20px;
        }

        .brand-form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .brand-form-description {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        .brand-input {
          width: 100%;
          padding: 12px;
          background: rgba(51, 65, 85, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .brand-input:focus {
          outline: none;
          border-color: #f59e0b;
          background: rgba(51, 65, 85, 0.8);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        .brand-input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .brand-color-picker {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-color-input {
          width: 60px;
          height: 44px;
          padding: 4px;
          background: rgba(51, 65, 85, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 8px;
          cursor: pointer;
        }

        .brand-color-swatch {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .brand-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(99, 102, 241, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.1);
          border-radius: 8px;
          cursor: pointer;
        }

        .brand-checkbox input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #f59e0b;
        }

        .brand-checkbox-label {
          font-size: 14px;
          color: #cbd5e1;
          cursor: pointer;
        }

        .brand-select {
          width: 100%;
          padding: 12px;
          background: rgba(51, 65, 85, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
        }

        .brand-select:focus {
          outline: none;
          border-color: #f59e0b;
          background: rgba(51, 65, 85, 0.8);
        }

        .brand-button-group {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(71, 85, 105, 0.2);
        }

        .brand-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .brand-button-primary {
          background: #f59e0b;
          color: #000;
          flex: 1;
        }

        .brand-button-primary:hover {
          background: #f8b817;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .brand-button-secondary {
          background: rgba(148, 163, 184, 0.1);
          color: #cbd5e1;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .brand-button-secondary:hover {
          background: rgba(148, 163, 184, 0.15);
        }

        .brand-errors {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        }

        .brand-error-item {
          font-size: 13px;
          color: #f87171;
          margin-bottom: 6px;
        }

        .brand-error-item:last-child {
          margin-bottom: 0;
        }

        .brand-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          padding: 12px;
          color: #6ee7b7;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .brand-preview {
          background: rgba(99, 102, 241, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.1);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .brand-preview-title {
          font-size: 12px;
          font-weight: 700;
          color: #6366f1;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .brand-preview-colors {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .brand-preview-color {
          text-align: center;
        }

        .brand-preview-swatch {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          margin-bottom: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .brand-preview-label {
          font-size: 12px;
          color: #94a3b8;
        }
      `}</style>

      <div className="brand-config-container">
        <h2 className="brand-config-title">🎨 Brand Configuration</h2>
        <p className="brand-config-subtitle">
          Customize colors, fonts, logo, and messaging to match your brand identity
        </p>

        {errors.length > 0 && (
          <div className="brand-errors">
            {errors.map((error, idx) => (
              <div key={idx} className="brand-error-item">
                ⚠ {error}
              </div>
            ))}
          </div>
        )}

        {saved && (
          <div className="brand-success">
            ✓ Brand configuration saved successfully!
          </div>
        )}

        <div className="brand-tabs">
          <button
            className={`brand-tab ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
          >
            Colors
          </button>
          <button
            className={`brand-tab ${activeTab === 'fonts' ? 'active' : ''}`}
            onClick={() => setActiveTab('fonts')}
          >
            Fonts
          </button>
          <button
            className={`brand-tab ${activeTab === 'messaging' ? 'active' : ''}`}
            onClick={() => setActiveTab('messaging')}
          >
            Messaging
          </button>
          <button
            className={`brand-tab ${activeTab === 'legal' ? 'active' : ''}`}
            onClick={() => setActiveTab('legal')}
          >
            Legal & Links
          </button>
        </div>

        {/* COLORS TAB */}
        {activeTab === 'colors' && (
          <>
            <div className="brand-preview">
              <div className="brand-preview-title">Color Preview</div>
              <div className="brand-preview-colors">
                <div className="brand-preview-color">
                  <div
                    className="brand-preview-swatch"
                    style={{ backgroundColor: config.primaryColor }}
                  />
                  <div className="brand-preview-label">Primary</div>
                </div>
                <div className="brand-preview-color">
                  <div
                    className="brand-preview-swatch"
                    style={{ backgroundColor: config.successColor }}
                  />
                  <div className="brand-preview-label">Success</div>
                </div>
                <div className="brand-preview-color">
                  <div
                    className="brand-preview-swatch"
                    style={{ backgroundColor: config.errorColor }}
                  />
                  <div className="brand-preview-label">Error</div>
                </div>
              </div>
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Primary Color</label>
              <div className="brand-color-picker">
                <input
                  type="color"
                  className="brand-color-input"
                  value={config.primaryColor || DEFAULT_BRAND_CONFIG.primaryColor!}
                  onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                />
                <input
                  type="text"
                  className="brand-input"
                  value={config.primaryColor || DEFAULT_BRAND_CONFIG.primaryColor!}
                  onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                  placeholder="#f59e0b"
                />
              </div>
              <p className="brand-form-description">
                Used for buttons, links, and primary actions
              </p>
            </div>

            <div className="brand-input-row">
              <div className="brand-form-group">
                <label className="brand-form-label">Accent Color</label>
                <input
                  type="color"
                  className="brand-color-input"
                  value={config.accentColor || DEFAULT_BRAND_CONFIG.accentColor!}
                  onChange={(e) => handleConfigChange('accentColor', e.target.value)}
                />
              </div>
              <div className="brand-form-group">
                <label className="brand-form-label">Success Color</label>
                <input
                  type="color"
                  className="brand-color-input"
                  value={config.successColor || DEFAULT_BRAND_CONFIG.successColor!}
                  onChange={(e) => handleConfigChange('successColor', e.target.value)}
                />
              </div>
            </div>

            <div className="brand-input-row">
              <div className="brand-form-group">
                <label className="brand-form-label">Error Color</label>
                <input
                  type="color"
                  className="brand-color-input"
                  value={config.errorColor || DEFAULT_BRAND_CONFIG.errorColor!}
                  onChange={(e) => handleConfigChange('errorColor', e.target.value)}
                />
              </div>
              <div className="brand-form-group">
                <label className="brand-form-label">Background Color</label>
                <input
                  type="color"
                  className="brand-color-input"
                  value={config.backgroundColor || DEFAULT_BRAND_CONFIG.backgroundColor!}
                  onChange={(e) => handleConfigChange('backgroundColor', e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* FONTS TAB */}
        {activeTab === 'fonts' && (
          <>
            <div className="brand-form-group">
              <label className="brand-form-label">Body Font Family</label>
              <select
                className="brand-select"
                value={config.fontFamily || DEFAULT_BRAND_CONFIG.fontFamily!}
                onChange={(e) => handleConfigChange('fontFamily', e.target.value)}
              >
                <option value="system">System Font</option>
                {GOOGLE_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
              <p className="brand-form-description">
                Font used for form fields and body text
              </p>
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Heading Font Family</label>
              <select
                className="brand-select"
                value={config.headingFontFamily || DEFAULT_BRAND_CONFIG.fontFamily!}
                onChange={(e) => handleConfigChange('headingFontFamily', e.target.value)}
              >
                <option value="system">System Font</option>
                {GOOGLE_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
              <p className="brand-form-description">
                Optional separate font for headings
              </p>
            </div>
          </>
        )}

        {/* MESSAGING TAB */}
        {activeTab === 'messaging' && (
          <>
            <div className="brand-form-group">
              <label className="brand-form-label">Company Name</label>
              <input
                type="text"
                className="brand-input"
                value={config.companyName || DEFAULT_BRAND_CONFIG.companyName!}
                onChange={(e) => handleConfigChange('companyName', e.target.value)}
                placeholder="Your Company Name"
              />
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Journey Title</label>
              <input
                type="text"
                className="brand-input"
                value={config.journeyTitle || ''}
                onChange={(e) => handleConfigChange('journeyTitle', e.target.value)}
                placeholder="e.g., Client Intake Form"
              />
              <p className="brand-form-description">
                Override the default journey title (optional)
              </p>
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Success Message</label>
              <input
                type="text"
                className="brand-input"
                value={config.successMessage || DEFAULT_BRAND_CONFIG.successMessage!}
                onChange={(e) => handleConfigChange('successMessage', e.target.value)}
                placeholder="Thank you!"
              />
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Success Subtitle</label>
              <input
                type="text"
                className="brand-input"
                value={config.successSubtitle || DEFAULT_BRAND_CONFIG.successSubtitle!}
                onChange={(e) => handleConfigChange('successSubtitle', e.target.value)}
                placeholder="Your form has been submitted successfully."
              />
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Footer Text</label>
              <input
                type="text"
                className="brand-input"
                value={config.footerText || DEFAULT_BRAND_CONFIG.footerText!}
                onChange={(e) => handleConfigChange('footerText', e.target.value)}
                placeholder="Secure. Fast. Easy."
              />
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Logo URL</label>
              <input
                type="text"
                className="brand-input"
                value={config.logoUrl || ''}
                onChange={(e) => handleConfigChange('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <p className="brand-form-description">
                URL to your company logo (PNG or SVG recommended)
              </p>
            </div>

            <div className="brand-checkbox">
              <input
                type="checkbox"
                id="show-branding"
                checked={config.showPdfa2zBranding !== false}
                onChange={(e) => handleConfigChange('showPdfa2zBranding', e.target.checked)}
              />
              <label htmlFor="show-branding" className="brand-checkbox-label">
                Show "PDFA2Z · Journey Builder" branding
              </label>
            </div>
          </>
        )}

        {/* LEGAL TAB */}
        {activeTab === 'legal' && (
          <>
            <div className="brand-form-group">
              <label className="brand-form-label">Privacy Policy URL</label>
              <input
                type="text"
                className="brand-input"
                value={config.privacyUrl || ''}
                onChange={(e) => handleConfigChange('privacyUrl', e.target.value)}
                placeholder="https://example.com/privacy"
              />
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Terms of Service URL</label>
              <input
                type="text"
                className="brand-input"
                value={config.termsUrl || ''}
                onChange={(e) => handleConfigChange('termsUrl', e.target.value)}
                placeholder="https://example.com/terms"
              />
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Support Email</label>
              <input
                type="email"
                className="brand-input"
                value={config.supportEmail || ''}
                onChange={(e) => handleConfigChange('supportEmail', e.target.value)}
                placeholder="support@example.com"
              />
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Support URL</label>
              <input
                type="text"
                className="brand-input"
                value={config.supportUrl || ''}
                onChange={(e) => handleConfigChange('supportUrl', e.target.value)}
                placeholder="https://example.com/support"
              />
            </div>
          </>
        )}

        <div className="brand-button-group">
          <button className="brand-button brand-button-secondary" onClick={handleReset}>
            Reset to Defaults
          </button>
          <button className="brand-button brand-button-primary" onClick={handleSave}>
            Save Configuration ✓
          </button>
        </div>
      </div>
    </div>
  );
};
