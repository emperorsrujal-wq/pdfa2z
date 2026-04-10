/**
 * Review Step Component for PDF Journey Builder
 * Summary of all filled data before final submission
 */

import * as React from 'react';
import { FileData } from './JourneyFileUpload';

interface Step {
  id: string;
  title: string;
  fields: any[];
}

interface JourneyReviewStepProps {
  steps: Step[];
  formData: Record<string, any>;
  fileData: Record<string, FileData[]>;
  onEdit: (stepIndex: number) => void;
  onConfirm: (consent: boolean) => void;
  isProcessing: boolean;
}

const formatValue = (value: any, fieldType?: string): string => {
  if (!value) return '—';

  if (fieldType === 'signature') {
    return '✓ Signed';
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'boolean') {
    return value ? '✓ Yes' : '✗ No';
  }

  return String(value);
};

export const JourneyReviewStep: React.FC<JourneyReviewStepProps> = ({
  steps,
  formData,
  fileData,
  onEdit,
  onConfirm,
  isProcessing,
}) => {
  const [consent, setConsent] = React.useState(false);

  const totalFields = steps.reduce((sum, step) => sum + step.fields.length, 0);
  const filledFields = Object.values(formData).filter((v) => v && v !== '').length;
  const completionPercent = Math.round((filledFields / totalFields) * 100);

  return (
    <>
      <style>{`
        .jb-review-card {
          background: rgba(245,158,11,0.02);
          border: 1px solid rgba(245,158,11,0.1);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .jb-review-section {
          margin-bottom: 28px;
        }

        .jb-review-section-title {
          font-size: 12px;
          font-weight: 700;
          color: #f59e0b;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .jb-review-item {
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(71,85,105,0.15);
        }

        .jb-review-item:last-child {
          border-bottom: none;
        }

        .jb-review-label {
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
        }

        .jb-review-value {
          font-size: 13px;
          color: #e2e8f0;
          font-weight: 600;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }

        .jb-review-edit-btn {
          font-size: 11px;
          color: #64748b;
          background: transparent;
          border: 1px solid rgba(148,163,184,0.3);
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          margin-left: 8px;
        }

        .jb-review-edit-btn:hover {
          color: #f59e0b;
          border-color: rgba(245,158,11,0.5);
          background: rgba(245,158,11,0.05);
        }

        .jb-file-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: rgba(99,102,241,0.05);
          border-radius: 8px;
          margin-bottom: 8px;
          font-size: 12px;
          color: #cbd5e1;
        }

        .jb-file-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99,102,241,0.2);
          border-radius: 6px;
          font-size: 12px;
        }

        .jb-consent-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(99,102,241,0.05);
          border: 1px solid rgba(99,102,241,0.1);
          border-radius: 12px;
          margin: 20px 0;
        }

        .jb-consent-checkbox input {
          margin-top: 3px;
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #f59e0b;
          flex-shrink: 0;
        }

        .jb-consent-text {
          font-size: 13px;
          color: #cbd5e1;
          line-height: 1.5;
        }

        .jb-progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(71,85,105,0.2);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .jb-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
          transition: width 0.3s ease;
        }
      `}</style>

      <div className="jb-card">
        <div className="jb-brand">
          <span className="jb-brand-pip" />
          pdfa2z · Journey Builder
        </div>

        <h1 className="jb-title">
          Review your <em>submission</em>
        </h1>
        <p className="jb-sub">
          Please review all information below. Make sure everything is correct before submitting.
        </p>

        {/* Progress indicator */}
        <div className="jb-progress-bar">
          <div className="jb-progress-fill" style={{ width: `${completionPercent}%` }} />
        </div>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>
          {filledFields} of {totalFields} fields completed ({completionPercent}%)
        </p>

        {/* Review sections */}
        {steps.map((step, stepIndex) => (
          <div key={step.id} className="jb-review-section">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <div className="jb-review-section-title">
                {/* Step number indicator */}
                <span
                  style={{
                    display: 'inline-block',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#f59e0b',
                    color: '#000',
                    textAlign: 'center',
                    lineHeight: '20px',
                    fontSize: 11,
                    fontWeight: 700,
                    marginRight: 8,
                  }}
                >
                  {stepIndex + 1}
                </span>
                {step.title}
              </div>
              <button
                className="jb-review-edit-btn"
                onClick={() => onEdit(stepIndex)}
                style={{ marginLeft: 'auto' }}
              >
                Edit
              </button>
            </div>

            <div className="jb-review-card">
              {step.fields.map((field) => (
                <div key={field.id} className="jb-review-item">
                  <span className="jb-review-label">{field.label}</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* File attachments */}
                    {field.type === 'file' && fileData[field.id]?.length > 0 && (
                      <div style={{ marginRight: 12 }}>
                        {fileData[field.id].map((file, idx) => (
                          <div key={idx} className="jb-file-item">
                            <div className="jb-file-icon">
                              {file.type.startsWith('image/') ? '🖼️' : '📄'}
                            </div>
                            <span>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Form value */}
                    {field.type !== 'file' && (
                      <span className="jb-review-value">{formatValue(formData[field.id], field.type)}</span>
                    )}

                    {/* File indicator if no other content */}
                    {field.type === 'file' && !fileData[field.id]?.length && (
                      <span className="jb-review-value" style={{ color: '#f87171' }}>
                        Not attached
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Consent checkbox */}
        <div className="jb-consent-checkbox">
          <input
            type="checkbox"
            id="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <label htmlFor="consent" className="jb-consent-text" style={{ cursor: 'pointer' }}>
            I confirm that all information provided is accurate and complete. I understand this data will be
            processed according to our privacy policy.
          </label>
        </div>

        {/* Action buttons */}
        <div className="jb-btn-row">
          <button className="jb-btn jb-btn-ghost" onClick={() => onEdit(steps.length - 1)}>
            ← Back to Edit
          </button>
          <button
            className="jb-btn jb-btn-gold"
            style={{ flex: 2, opacity: consent && !isProcessing ? 1 : 0.5, cursor: consent && !isProcessing ? 'pointer' : 'not-allowed' }}
            onClick={() => onConfirm(consent)}
            disabled={!consent || isProcessing}
          >
            {isProcessing ? 'Submitting...' : 'Submit & Download ✓'}
          </button>
        </div>

        {!consent && (
          <p style={{ fontSize: 12, color: '#f87171', textAlign: 'center', marginTop: 12 }}>
            ⚠ Please confirm the information above to continue
          </p>
        )}
      </div>
    </>
  );
};
