/**
 * Field Validation System for PDF Journey Builder
 * Supports email, phone, SSN, ZIP, dates, currency, URLs, and custom patterns
 */

export type ValidationRule = 'email' | 'phone' | 'ssn' | 'zip' | 'date' | 'url' | 'currency' | 'text' | 'number';

export interface ValidationError {
  field: string;
  message: string;
  type: ValidationRule;
}

export interface FieldValidationConfig {
  type?: ValidationRule;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customMessage?: string;
  min?: number;
  max?: number;
}

const VALIDATORS: Record<ValidationRule, (value: any) => boolean> = {
  email: (v) => {
    if (!v) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(v));
  },

  phone: (v) => {
    if (!v) return false;
    // Supports: (123) 456-7890, 123-456-7890, 1234567890, +1-123-456-7890
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(String(v).replace(/\s/g, ''));
  },

  ssn: (v) => {
    if (!v) return false;
    // Supports: 123-45-6789 or 123456789
    const ssnRegex = /^(?!000|666)[0-9]{3}-?(?!00)[0-9]{2}-?(?!0000)[0-9]{4}$/;
    return ssnRegex.test(String(v));
  },

  zip: (v) => {
    if (!v) return false;
    // Supports: 12345 or 12345-6789
    const zipRegex = /^[0-9]{5}(?:-[0-9]{4})?$/;
    return zipRegex.test(String(v));
  },

  date: (v) => {
    if (!v) return false;
    const timestamp = Date.parse(String(v));
    return !isNaN(timestamp);
  },

  url: (v) => {
    if (!v) return false;
    try {
      new URL(String(v));
      return true;
    } catch {
      return false;
    }
  },

  currency: (v) => {
    if (!v) return false;
    // Supports: $1,234.56 or 1234.56
    const currencyRegex = /^\$?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]{2})?$|^[0-9]+(\.[0-9]{2})?$/;
    return currencyRegex.test(String(v));
  },

  text: (v) => {
    return typeof v === 'string' && v.length > 0;
  },

  number: (v) => {
    const num = Number(v);
    return !isNaN(num) && isFinite(num);
  },
};

const ERROR_MESSAGES: Record<ValidationRule, string> = {
  email: 'Please enter a valid email address (e.g., john@example.com)',
  phone: 'Please enter a valid phone number (e.g., 123-456-7890 or (123) 456-7890)',
  ssn: 'Please enter a valid SSN (e.g., 123-45-6789)',
  zip: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)',
  date: 'Please enter a valid date',
  url: 'Please enter a valid URL (e.g., https://example.com)',
  currency: 'Please enter a valid amount (e.g., $1,234.56)',
  text: 'This field is required',
  number: 'Please enter a valid number',
};

export const getFormatHint = (type: ValidationRule): string => {
  const hints: Record<ValidationRule, string> = {
    email: 'e.g., john.doe@example.com',
    phone: 'e.g., (123) 456-7890 or 123-456-7890',
    ssn: 'e.g., 123-45-6789 (kept confidential)',
    zip: 'e.g., 12345 or 12345-6789',
    date: 'Select or enter date',
    url: 'e.g., https://example.com',
    currency: 'e.g., $1,234.56',
    text: 'Enter text',
    number: 'e.g., 1234',
  };
  return hints[type] || '';
};

/**
 * Validate a single field
 */
export const validateField = (
  value: any,
  config: FieldValidationConfig,
  fieldName: string = 'Field'
): ValidationError | null => {
  // Check required
  if (config.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      type: config.type || 'text',
    };
  }

  // If not required and empty, pass
  if (!config.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return null;
  }

  const stringValue = String(value).trim();

  // Check min length
  if (config.minLength && stringValue.length < config.minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${config.minLength} characters`,
      type: config.type || 'text',
    };
  }

  // Check max length
  if (config.maxLength && stringValue.length > config.maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must not exceed ${config.maxLength} characters`,
      type: config.type || 'text',
    };
  }

  // Check pattern
  if (config.pattern && !config.pattern.test(stringValue)) {
    return {
      field: fieldName,
      message: config.customMessage || `${fieldName} format is invalid`,
      type: config.type || 'text',
    };
  }

  // Check validation type
  if (config.type && config.type in VALIDATORS) {
    const validator = VALIDATORS[config.type];
    if (!validator(value)) {
      return {
        field: fieldName,
        message: config.customMessage || ERROR_MESSAGES[config.type],
        type: config.type,
      };
    }
  }

  // Check min/max for numbers
  if (config.type === 'number' || config.type === 'currency') {
    const num = parseFloat(stringValue.replace(/[$,]/g, ''));
    if (config.min !== undefined && num < config.min) {
      return {
        field: fieldName,
        message: `${fieldName} must be at least ${config.min}`,
        type: config.type,
      };
    }
    if (config.max !== undefined && num > config.max) {
      return {
        field: fieldName,
        message: `${fieldName} must not exceed ${config.max}`,
        type: config.type,
      };
    }
  }

  return null;
};

/**
 * Validate multiple fields
 */
export const validateFields = (
  formData: Record<string, any>,
  fieldConfigs: Record<string, FieldValidationConfig & { name?: string }>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  Object.entries(fieldConfigs).forEach(([fieldId, config]) => {
    const error = validateField(formData[fieldId], config, config.name || fieldId);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
};

/**
 * Check if a specific field has an error
 */
export const getFieldError = (
  fieldId: string,
  value: any,
  config: FieldValidationConfig,
  fieldName?: string
): string | null => {
  const error = validateField(value, config, fieldName || fieldId);
  return error ? error.message : null;
};

/**
 * Format display value based on field type
 */
export const formatFieldDisplay = (value: any, type?: ValidationRule): string => {
  if (!value) return '';

  switch (type) {
    case 'phone': {
      const cleaned = String(value).replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      return value;
    }
    case 'ssn': {
      const cleaned = String(value).replace(/\D/g, '');
      if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
      }
      return value;
    }
    case 'zip': {
      const cleaned = String(value).replace(/\D/g, '');
      if (cleaned.length === 9) {
        return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
      }
      return value;
    }
    case 'currency': {
      const num = parseFloat(String(value).replace(/[$,]/g, ''));
      if (!isNaN(num)) {
        return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return value;
    }
    default:
      return String(value);
  }
};
