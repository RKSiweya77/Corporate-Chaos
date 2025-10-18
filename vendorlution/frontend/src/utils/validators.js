// src/utils/validators.js
// Comprehensive validation utilities

/**
 * Email validation
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim());
}

/**
 * Password validation with strength scoring
 */
export function validatePassword(password) {
  const pwd = String(password || "");
  
  const validations = [
    { test: pwd.length >= 8, message: "At least 8 characters", weight: 1 },
    { test: /[A-Z]/.test(pwd), message: "One uppercase letter", weight: 1 },
    { test: /[a-z]/.test(pwd), message: "One lowercase letter", weight: 1 },
    { test: /[0-9]/.test(pwd), message: "One number", weight: 1 },
    { test: /[!@#$%^&*(),.?":{}|<>]/.test(pwd), message: "One special character", weight: 1 },
    { test: pwd.length >= 12, message: "12+ characters", weight: 2 },
  ];

  const errors = validations.filter(v => !v.test).map(v => v.message);
  const strength = validations.filter(v => v.test).reduce((sum, v) => sum + v.weight, 0);
  const maxStrength = validations.reduce((sum, v) => sum + v.weight, 0);
  const strengthPercent = Math.round((strength / maxStrength) * 100);

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    strengthPercent,
    strengthLevel: strengthPercent >= 80 ? 'strong' : strengthPercent >= 60 ? 'medium' : 'weak',
  };
}

/**
 * South African phone number validation
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  
  const cleaned = phone.replace(/\D/g, "");
  
  // South African formats: 0712345678 or 27712345678
  const formats = [
    /^0[6-8][0-9]{8}$/, // 0712345678
    /^27[6-8][0-9]{8}$/, // 27712345678
  ];
  
  return formats.some(format => format.test(cleaned));
}

/**
 * URL validation
 */
export function isValidUrl(url) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * File validation
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  } = options;

  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }

  // Size validation
  if (file.size > maxSize) {
    errors.push(`File too large. Maximum size: ${formatFileSize(maxSize)}`);
  }

  // Type validation
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
  }

  // Extension validation
  if (allowedExtensions.length > 0) {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    file,
  };
}

// Helper for file size formatting (copied from formatters for completeness)
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Credit card validation (basic Luhn check)
 */
export function isValidCreditCard(number) {
  const cleaned = String(number).replace(/\D/g, "");
  
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * South African ID number validation (basic)
 */
export function isValidSAID(idNumber) {
  if (!idNumber || idNumber.length !== 13) return false;
  
  // Basic format check: YYMMDDGSSSCAZ
  const regex = /^\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{7}$/;
  if (!regex.test(idNumber)) return false;
  
  // Luhn check digit validation
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let digit = parseInt(idNumber[i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(idNumber[12], 10);
}

/**
 * Comprehensive form validation system
 */
export function validateForm(values, rules) {
  const errors = {};
  const validatedValues = { ...values };

  for (const [field, fieldRules] of Object.entries(rules || {})) {
    const value = values[field];
    
    for (const rule of fieldRules) {
      let isValid = true;
      let message = rule.message;

      switch (rule.type) {
        case 'required':
          isValid = !!(value !== undefined && value !== null && value !== '');
          message = message || 'This field is required';
          break;

        case 'email':
          isValid = !value || isValidEmail(value);
          message = message || 'Please enter a valid email address';
          break;

        case 'phone':
          isValid = !value || isValidPhone(value);
          message = message || 'Please enter a valid phone number';
          break;

        case 'minLength':
          isValid = !value || String(value).length >= (rule.value || 0);
          message = message || `Minimum ${rule.value} characters required`;
          break;

        case 'maxLength':
          isValid = !value || String(value).length <= (rule.value || 0);
          message = message || `Maximum ${rule.value} characters allowed`;
          break;

        case 'minValue':
          isValid = !value || Number(value) >= (rule.value || 0);
          message = message || `Minimum value is ${rule.value}`;
          break;

        case 'maxValue':
          isValid = !value || Number(value) <= (rule.value || 0);
          message = message || `Maximum value is ${rule.value}`;
          break;

        case 'pattern':
          isValid = !value || (rule.value && rule.value.test(String(value)));
          message = message || 'Invalid format';
          break;

        case 'url':
          isValid = !value || isValidUrl(value);
          message = message || 'Please enter a valid URL';
          break;

        case 'custom':
          if (rule.validate) {
            const result = rule.validate(value, values);
            isValid = result === true || result === undefined;
            message = typeof result === 'string' ? result : message || 'Invalid value';
          }
          break;

        case 'match':
          isValid = !value || value === values[rule.field];
          message = message || `Must match ${rule.field}`;
          break;

        default:
          continue;
      }

      if (!isValid) {
        errors[field] = message;
        break; // Stop at first error for this field
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: validatedValues,
  };
}

/**
 * Quick validation helpers for common cases
 */
export const quickValidators = {
  required: (message = 'This field is required') => ({ type: 'required', message }),
  email: (message = 'Valid email required') => ({ type: 'email', message }),
  phone: (message = 'Valid phone number required') => ({ type: 'phone', message }),
  minLength: (min, message) => ({ type: 'minLength', value: min, message: message || `Minimum ${min} characters` }),
  maxLength: (max, message) => ({ type: 'maxLength', value: max, message: message || `Maximum ${max} characters` }),
  pattern: (regex, message = 'Invalid format') => ({ type: 'pattern', value: regex, message }),
  url: (message = 'Valid URL required') => ({ type: 'url', message }),
};

/**
 * Create validation rules from schema
 */
export function createValidator(schema) {
  return (values) => validateForm(values, schema);
}