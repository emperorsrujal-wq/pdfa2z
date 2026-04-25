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
  THEME_PRESETS,
} from '../utils/journeyBranding';

interface JourneyBrandConfigProps {
  onConfigChange?: (config: BrandConfig) => void;
  onSave?: (config: BrandConfig) => void;
  initialConfig?: BrandConfig;
  availableFields?: { id: string; label: string }[];
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
  availableFields = [],
}) => {
  const [config, setConfig] = useState<BrandConfig>(
    initialConfig || loadBrandConfig() || DEFAULT_BRAND_CONFIG
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'messaging' | 'email' | 'security' | 'legal' | 'integrations' | 'advanced' | 'layout' | 'industry'>('colors');
  const [saved, setSaved] = useState(false);

  const handleConfigChange = (field: keyof BrandConfig, value: any) => {
    const updated = { ...config, [field]: value };
    setConfig(updated);
    onConfigChange?.(updated);
    setSaved(false);
  };

  const updateMapping = (fieldId: string, alias: string) => {
    const mappings = { ...(config.fieldMappings || {}) };
    if (alias) mappings[fieldId] = alias;
    else delete mappings[fieldId];
    handleConfigChange('fieldMappings', mappings);
  };

  const handleTestWebhook = async () => {
    if (!config.webhookUrl) {
      alert('Please provide a Webhook URL first');
      return;
    }
    console.log('Testing webhook with dummy payload...');
    alert(`Mock test sent to ${config.webhookUrl}. Check console for details.`);
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

  const loadDefaultEmailTemplate = () => {
    const defaultTemplate = `
<div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
  <div style="padding: 40px; background: #1e3a8a; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">New Lead Captured</h1>
    <p style="margin: 8px 0 0 0; opacity: 0.8; font-size: 14px;">{{journey_title}}</p>
  </div>
  <div style="padding: 40px;">
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">A new lead has completed your digital journey. Here is a summary of the captured data:</p>
    
    <div style="background: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
      {{lead_data}}
    </div>
    
    <div style="text-align: center; margin: 40px 0 20px;">
      <a href="{{pdf_url}}" style="background: #1e3a8a; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(30, 58, 138, 0.2);">
        View Completed PDF →
      </a>
    </div>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
      Powered by <strong>PDFA2Z Enterprise</strong> · Secure & Encrypted
    </div>
  </div>
</div>`.trim();
    handleConfigChange('emailTemplate', defaultTemplate);
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

        .brand-textarea {
          width: 100%;
          min-height: 120px;
          padding: 12px;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 13px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
          resize: vertical;
          margin-bottom: 8px;
        }

        .brand-helper-btn {
          background: rgba(245,158,11,0.1);
          color: #f59e0b;
          border: 1px solid rgba(245,158,11,0.2);
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 16px;
          transition: all 0.2s;
        }

        .brand-helper-btn:hover {
          background: rgba(245,158,11,0.2);
        }
        .brand-helper-btn {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .brand-helper-btn:hover {
          background: #f59e0b;
          color: #000;
          transform: translateY(-1px);
        }

        .brand-textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px 14px;
          color: #fff;
          font-size: 14px;
          margin-bottom: 16px;
          outline: none;
          resize: vertical;
          min-height: 100px;
        }

        .brand-textarea:focus {
          border-color: #f59e0b;
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
            className={`brand-tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            Email
          </button>
          <button
            className={`brand-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={`brand-tab ${activeTab === 'legal' ? 'active' : ''}`}
            onClick={() => setActiveTab('legal')}
          >
            Legal
          </button>
          <button
            className={`brand-tab ${activeTab === 'layout' ? 'active' : ''}`}
            onClick={() => setActiveTab('layout')}
          >
            Layout
          </button>
          <button
            className={`brand-tab ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            Integrations
          </button>
          <button
            className={`brand-tab ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
          <button
            className={`brand-tab ${activeTab === 'industry' ? 'active' : ''}`}
            onClick={() => setActiveTab('industry')}
          >
            Industry
          </button>
        </div>

        {/* COLORS TAB */}
        {activeTab === 'colors' && (
          <>
            <div className="brand-form-group">
              <label className="brand-form-label">Theme Presets</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
                {Object.entries(THEME_PRESETS).map(([id, preset]) => (
                  <button
                    key={id}
                    onClick={() => {
                      const updated = { ...config, ...preset };
                      setConfig(updated);
                      onConfigChange?.(updated);
                    }}
                    style={{
                      padding: '10px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = preset.primaryColor || 'var(--brand-primary)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  >
                    <div style={{ width: '100%', height: '30px', background: preset.primaryColor, borderRadius: '6px', marginBottom: '8px' }} />
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>
                      {id.replace('-', ' ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
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

        {/* EMAIL TAB */}
        {activeTab === 'email' && (
          <>
            <div className="brand-form-group">
              <label className="brand-form-label">Default Email Settings</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                 <div>
                    <label className="brand-form-label" style={{ fontSize: 10 }}>From Email</label>
                    <input 
                      type="email" 
                      className="brand-input" 
                      value={config.fromEmail || ''} 
                      onChange={e => handleConfigChange('fromEmail', e.target.value)}
                      placeholder="notifications@yourdomain.com"
                    />
                 </div>
                 <div>
                    <label className="brand-form-label" style={{ fontSize: 10 }}>Support Email</label>
                    <input 
                      type="email" 
                      className="brand-input" 
                      value={config.supportEmail || ''} 
                      onChange={e => handleConfigChange('supportEmail', e.target.value)}
                      placeholder="support@yourdomain.com"
                    />
                 </div>
              </div>
            </div>

            <div className="brand-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <label className="brand-form-label">Email Notification Template (HTML)</label>
                <button className="brand-helper-btn" onClick={loadDefaultEmailTemplate}>Reset to Elite Default</button>
              </div>
              <textarea
                className="brand-textarea"
                style={{ height: 250, fontFamily: 'monospace', fontSize: 12 }}
                value={config.emailTemplate || ''}
                onChange={e => handleConfigChange('emailTemplate', e.target.value)}
                placeholder="<html>...</html>"
              />
              <p className="brand-form-description">
                Use <code>{"{{lead_data}}"}</code> for the data list and <code>{"{{pdf_url}}"}</code> for the file link.
              </p>
            </div>

            <div className="brand-preview" style={{ background: '#1e293b' }}>
               <div className="brand-preview-title">Live Preview</div>
               <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', height: 400, border: '4px solid #334155' }}>
                  <iframe 
                    title="Email Preview"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    srcDoc={
                      (config.emailTemplate || '')
                        .replace(/\{\{lead_data\}\}/g, '<ul style="color: #000"><li><strong>Full Name:</strong> John Doe</li><li><strong>Email:</strong> john@example.com</li></ul>')
                        .replace(/\{\{pdf_url\}\}/g, '#')
                        .replace(/\{\{journey_title\}\}/g, config.journeyTitle || 'Sample Journey')
                    }
                  />
               </div>
            </div>
          </>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <>
            <div className="brand-form-group">
              <label className="brand-form-label">Trust Signals</label>
              <div className="brand-checkbox" style={{ marginBottom: 12 }}>
                <input
                  type="checkbox"
                  id="show-security-badges-new"
                  checked={config.showSecurityBadges !== false}
                  onChange={(e) => handleConfigChange('showSecurityBadges', e.target.checked)}
                />
                <label htmlFor="show-security-badges-new" className="brand-checkbox-label">
                  <strong>Show Security Trust Badges</strong>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Displays professional trust signals (Encryption, SOC 2, etc.) in the wizard footer.
                  </div>
                </label>
              </div>
            </div>

            {config.showSecurityBadges !== false && (
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20 }}>
                <label className="brand-form-label" style={{ fontSize: 11, marginBottom: 12 }}>Enabled Badges</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { id: 'encryption', label: '256-bit Encryption' },
                    { id: 'soc2', label: 'SOC 2 Compliant' },
                    { id: 'hipaa', label: 'HIPAA Ready' },
                    { id: 'gdpr', label: 'GDPR / CCPA' }
                  ].map(badge => (
                    <label key={badge.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                      <input 
                        type="checkbox" 
                        checked={(config.enabledSecurityBadges || []).includes(badge.id as any)} 
                        onChange={(e) => {
                          const current = config.enabledSecurityBadges || [];
                          const updated = e.target.checked 
                            ? [...current, badge.id] 
                            : current.filter(id => id !== badge.id);
                          handleConfigChange('enabledSecurityBadges', updated);
                        }}
                      />
                      <span style={{ fontSize: 12, color: '#cbd5e1' }}>{badge.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="brand-form-group">
              <div className="brand-checkbox" style={{ marginBottom: 12 }}>
                <input
                  type="checkbox"
                  id="audit-trail-security-enhanced"
                  checked={config.includeAuditTrail !== false}
                  onChange={(e) => handleConfigChange('includeAuditTrail', e.target.checked)}
                />
                <label htmlFor="audit-trail-security-enhanced" className="brand-checkbox-label">
                  <strong>Include Completion Certificate</strong>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Appends a professional audit trail with timestamps and IDs to the final PDF.
                  </div>
                </label>
              </div>

              <div className="brand-checkbox">
                <input
                  type="checkbox"
                  id="allow-type-sig-security"
                  checked={config.allowTypeSignature !== false}
                  onChange={(e) => handleConfigChange('allowTypeSignature', e.target.checked)}
                />
                <label htmlFor="allow-type-sig-security" className="brand-checkbox-label">
                  <strong>Allow Type-to-Sign</strong>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Enable users to sign using professional cursive fonts.
                  </div>
                </label>
              </div>
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
          </>
        )}

        {/* LAYOUT TAB */}
        {activeTab === 'layout' && (
          <>
            <div className="brand-form-group">
              <label className="brand-form-label">Journey Mode</label>
              <div className="brand-checkbox" style={{ marginBottom: 12 }}>
                <input
                  type="checkbox"
                  id="focused-mode"
                  checked={config.isFocusedMode || false}
                  onChange={(e) => handleConfigChange('isFocusedMode', e.target.checked)}
                />
                <label htmlFor="focused-mode" className="brand-checkbox-label">
                  <strong>Focused Mode (Typeform style)</strong>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Shows one field at a time for higher mobile conversion rates.
                  </div>
                </label>
              </div>
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Logo Height</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min="16"
                  max="120"
                  value={config.logoHeight || 32}
                  onChange={(e) => handleConfigChange('logoHeight', parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: '#f59e0b' }}
                />
                <span style={{ fontSize: 13, color: '#cbd5e1', width: 40 }}>{config.logoHeight || 32}px</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '20px 0' }} />

            <div className="brand-form-group">
              <label className="brand-form-label">Digital Trust & Signing</label>
              <div className="brand-checkbox" style={{ marginBottom: 12 }}>
                <input
                  type="checkbox"
                  id="audit-trail"
                  checked={config.includeAuditTrail !== false}
                  onChange={(e) => handleConfigChange('includeAuditTrail', e.target.checked)}
                />
                <label htmlFor="audit-trail" className="brand-checkbox-label">
                  <strong>Include Completion Certificate</strong>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Appends a professional audit trail with timestamps and IDs to the final PDF.
                  </div>
                </label>
              </div>

              <div className="brand-checkbox">
                <input
                  type="checkbox"
                  id="allow-type"
                  checked={config.allowTypeSignature !== false}
                  onChange={(e) => handleConfigChange('allowTypeSignature', e.target.checked)}
                />
                <label htmlFor="allow-type" className="brand-checkbox-label">
                  <strong>Allow Type-to-Sign</strong>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    Enable users to sign using professional cursive fonts.
                  </div>
                </label>
              </div>
            </div>
          </>
        )}

        {/* INTEGRATIONS TAB */}
        {activeTab === 'integrations' && (
          <>
            <div className="brand-form-group">
              <label className="brand-form-label">Webhook URL</label>
              <input
                type="text"
                className="brand-input"
                value={config.webhookUrl || ''}
                onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                placeholder="https://your-crm.com/webhooks/pdfa2z"
              />
              <p className="brand-form-description">
                POST request sent when a journey is completed
              </p>
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Webhook Secret</label>
              <input
                type="password"
                className="brand-input"
                value={config.webhookSecret || ''}
                onChange={(e) => handleConfigChange('webhookSecret', e.target.value)}
                placeholder="Optional signing secret"
              />
            </div>

            {availableFields.length > 0 && (
              <div className="brand-form-group" style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <label className="brand-form-label" style={{ color: '#f59e0b', fontSize: 13, margin: 0 }}>
                    CRM Field Aliases (Zapier / Webhook Mapping)
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button 
                      className="brand-helper-btn" 
                      style={{ margin: 0, padding: '2px 8px', fontSize: 9 }}
                      onClick={() => {
                        const newMappings = { ...config.fieldMappings };
                        availableFields.forEach(f => {
                          if (f.label.toLowerCase().includes('name')) newMappings[f.id] = 'FirstName';
                          if (f.label.toLowerCase().includes('email')) newMappings[f.id] = 'Email';
                          if (f.label.toLowerCase().includes('phone')) newMappings[f.id] = 'Phone';
                        });
                        handleConfigChange('fieldMappings', newMappings);
                      }}
                    >
                      Salesforce
                    </button>
                    <button 
                      className="brand-helper-btn" 
                      style={{ margin: 0, padding: '2px 8px', fontSize: 9 }}
                      onClick={() => {
                        const newMappings = { ...config.fieldMappings };
                        availableFields.forEach(f => {
                          if (f.label.toLowerCase().includes('name')) newMappings[f.id] = 'firstname';
                          if (f.label.toLowerCase().includes('email')) newMappings[f.id] = 'email';
                        });
                        handleConfigChange('fieldMappings', newMappings);
                      }}
                    >
                      HubSpot
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {availableFields.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {f.label}
                      </div>
                      <input
                        type="text"
                        className="brand-input"
                        style={{ flex: 1, marginBottom: 0, height: 32, fontSize: 12 }}
                        value={config.fieldMappings?.[f.id] || ''}
                        onChange={(e) => updateMapping(f.id, e.target.value)}
                        placeholder={f.id}
                      />
                    </div>
                  ))}
                </div>
                <p className="brand-form-description" style={{ marginTop: 12 }}>
                  Map journey fields to specific keys in your CRM payload.
                </p>
              </div>
            )}

            <button 
              className="brand-helper-btn" 
              style={{ marginTop: 10, width: '100%', height: 40 }}
              onClick={handleTestWebhook}
            >
              Send Test Webhook →
            </button>
          </>
        )}

        {/* ADVANCED TAB */}
        {activeTab === 'advanced' && (
          <>
            <div className="brand-form-group">
              <label className="brand-form-label">Custom CSS</label>
              <textarea
                className="brand-textarea"
                value={config.customCss || ''}
                onChange={(e) => handleConfigChange('customCss', e.target.value)}
                placeholder=".jb-title { font-size: 40px; }"
              />
              <p className="brand-form-description">
                Inject custom styles into your journey builder
              </p>
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Custom Script (Tracking)</label>
              <input
                type="text"
                className="brand-input"
                value={config.customScriptUrl || ''}
                onChange={(e) => handleConfigChange('customScriptUrl', e.target.value)}
                placeholder="https://example.com/analytics.js"
              />
              <p className="brand-form-description">
                URL of external script (GTM, Meta Pixel, etc.)
              </p>
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Email Template (HTML)</label>
              <button className="brand-helper-btn" onClick={loadDefaultEmailTemplate}>
                Reset to Default Template
              </button>
              <textarea
                className="brand-textarea"
                style={{ minHeight: 200 }}
                value={config.emailTemplate || ''}
                onChange={(e) => handleConfigChange('emailTemplate', e.target.value)}
                placeholder="<html>...{{lead_data}}...</html>"
              />
              <p className="brand-form-description">
                Use {"{{lead_data}}"} and {"{{pdf_url}}"} as placeholders
              </p>
            </div>
          </>
        )}

        {/* INDUSTRY TAB */}
        {activeTab === 'industry' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="brand-form-group">
              <label className="brand-form-label">Professional Vertical</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { id: 'mortgage', label: 'Mortgage & Lending', icon: '🏠' },
                  { id: 'legal', label: 'Legal & Compliance', icon: '⚖️' },
                  { id: 'real-estate', label: 'Real Estate', icon: '🏢' },
                  { id: 'banking', label: 'Banking & KYC', icon: '🏦' },
                  { id: 'business', label: 'General Business', icon: '💼' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleConfigChange('industryPreset', item.id)}
                    style={{
                      padding: '16px',
                      background: config.industryPreset === item.id ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)',
                      border: config.industryPreset === item.id ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '16px',
                      color: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="brand-form-group">
              <label className="brand-form-label">Compliance & Security</label>
              <div style={{ display: 'grid', gap: 12 }}>
                <label className="brand-checkbox">
                  <input
                    type="checkbox"
                    checked={config.isPipedaCompliant}
                    onChange={(e) => handleConfigChange('isPipedaCompliant', e.target.checked)}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="brand-checkbox-label">PIPEDA / GDPR Compliance Mode</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Enforce strict data purge and encrypted audit logs.</div>
                  </div>
                </label>

                <label className="brand-checkbox">
                  <input
                    type="checkbox"
                    checked={config.isAuditEnabled}
                    onChange={(e) => handleConfigChange('isAuditEnabled', e.target.checked)}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="brand-checkbox-label">Enhanced Audit Trail</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Append a legally-binding Certificate of Completion with IP/GPS data.</div>
                  </div>
                </label>

                <label className="brand-checkbox">
                  <input
                    type="checkbox"
                    checked={config.showSecurityBadges}
                    onChange={(e) => handleConfigChange('showSecurityBadges', e.target.checked)}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="brand-checkbox-label">Display Trust Badges</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Show SOC2, HIPAA, and Encryption badges to clients.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
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
