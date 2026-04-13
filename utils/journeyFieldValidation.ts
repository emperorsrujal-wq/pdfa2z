/**
 * Field Validation System for PDF Journey Builder
 * Supports email, phone, SSN, ZIP, dates, currency, URLs, and custom patterns
 */

export type ValidationRule = 'email' | 'phone' | 'ssn' | 'nationalId' | 'zip' | 'postalCode' | 'date' | 'url' | 'currency' | 'text' | 'number';

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
  locale?: string; // e.g. 'en-GB'
  currencySymbol?: string; // e.g. '£'
}

const VALIDATORS: Record<string, (value: any, config?: FieldValidationConfig) => boolean> = {
  email: (v) => {
    if (!v) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(v));
  },

  phone: (v) => {
    if (!v) return false;
    // Generic international phone regex: + prefix optional, 7-15 digits, allows spaces/dashes/parens
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{3,9}$/;
    return phoneRegex.test(String(v).replace(/\s/g, ''));
  },

  nationalId: (v) => {
    if (!v) return false;
    // Flexible for SSN, SIN (Canada), NI (UK), etc. (7-12 chars)
    return String(v).replace(/[-\s]/g, '').length >= 7;
  },
  
  ssn: (v) => VALIDATORS.nationalId(v),

  postalCode: (v) => {
    if (!v) return false;
    // Flexible for ZIP (US), UK (AA1 1AA), Canada (A1A 1A1), etc.
    const postalRegex = /^[A-Z0-9\s-]{3,10}$/i;
    return postalRegex.test(String(v).trim());
  },

  zip: (v) => VALIDATORS.postalCode(v),

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

  currency: (v, config) => {
    if (!v) return false;
    const symbol = config?.currencySymbol || '$';
    const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Flexible currency: optional symbol, thousands separators, decimal
    const currencyRegex = new RegExp(`^${escapedSymbol}?\\s?[0-9]{1,3}([,\\s][0-9]{3})*(\\.[0-9]{2})?$|^[0-9]+(\\.[0-9]{2})?$`);
    return currencyRegex.test(String(v).trim());
  },

  text: (v) => {
    return typeof v === 'string' && v.length > 0;
  },

  number: (v) => {
    const num = Number(v);
    return !isNaN(num) && isFinite(num);
  },
};

const ERROR_MESSAGES: Record<string, string> = {
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  nationalId: 'Please enter a valid National ID / Tax ID',
  ssn: 'Please enter a valid SSN',
  postalCode: 'Please enter a valid Postal Code',
  zip: 'Please enter a valid ZIP code',
  date: 'Please enter a valid date',
  url: 'Please enter a valid URL',
  currency: 'Please enter a valid amount',
  text: 'This field is required',
  number: 'Please enter a valid number',
};

export const getFormatHint = (type: ValidationRule, config?: FieldValidationConfig): string => {
  const symbol = config?.currencySymbol || '$';
  const hints: Record<string, string> = {
    email: 'e.g., john.doe@example.com',
    phone: 'e.g., +1 123 456 7890',
    nationalId: 'Enter your ID (Confidential)',
    ssn: 'e.g., 123-45-6789',
    postalCode: 'Enter your postal/zip code',
    zip: 'e.g., 12345',
    date: 'Select or enter date',
    url: 'e.g., https://example.com',
    currency: `e.g., ${symbol}1,234.56`,
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
    if (!validator(value, config)) {
      return {
        field: fieldName,
        message: config.customMessage || ERROR_MESSAGES[config.type],
        type: config.type,
      };
    }
  }

  // Check min/max for numbers
  if (config.type === 'number' || config.type === 'currency') {
    const num = parseFloat(stringValue.replace(/[^\d.-]/g, ''));
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
export const formatFieldDisplay = (value: any, config?: FieldValidationConfig): string => {
  if (!value) return '';
  const type = config?.type;

  switch (type) {
    case 'phone': {
      const cleaned = String(value).replace(/[^\d+]/g, '');
      return cleaned; // International format usually kept as is or formatted by lib
    }
    case 'ssn':
    case 'nationalId': {
      const cleaned = String(value).replace(/[-\s]/g, '');
      if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
      }
      return value;
    }
    case 'zip':
    case 'postalCode': {
      return String(value).toUpperCase().trim();
    }
    case 'currency': {
      const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
      if (!isNaN(num)) {
        try {
          return new Intl.NumberFormat(config?.locale || 'en-US', {
            style: 'currency',
            currency: (config as any).currencyCode || 'USD',
            currencyDisplay: 'symbol'
          }).format(num);
        } catch (e) {
          return `${config?.currencySymbol || '$'}${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        }
      }
      return value;
    }
    default:
      return String(value);
  }
};
