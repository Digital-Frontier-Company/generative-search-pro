import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: string) => string | null;
}

interface ValidationRules {
  [field: string]: ValidationRule;
}

interface FormErrors {
  [field: string]: string;
}

interface FormTouched {
  [field: string]: boolean;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback((field: string, value: string): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || value.trim() === '')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') return null;

    // Email validation
    if (rule.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const validateAllFields = useCallback((formData: Record<string, string>): boolean => {
    setIsValidating(true);
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const error = validateField(field, formData[field] || '');
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setIsValidating(false);
    return isValid;
  }, [validateField, rules]);

  const validateSingleField = useCallback((field: string, value: string) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));
    return !error;
  }, [validateField]);

  const markFieldTouched = useCallback((field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
  }, []);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
    setIsValidating(false);
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    return touched[field] ? errors[field] : undefined;
  }, [errors, touched]);

  const hasFieldError = useCallback((field: string): boolean => {
    return touched[field] && !!errors[field];
  }, [errors, touched]);

  return {
    errors,
    touched,
    isValidating,
    validateAllFields,
    validateSingleField,
    markFieldTouched,
    resetValidation,
    getFieldError,
    hasFieldError,
  };
};

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    email: true,
  },
  password: {
    required: true,
    minLength: 6,
  },
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  company: {
    maxLength: 100,
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
  },
};