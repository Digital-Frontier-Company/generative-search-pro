// Frontend Security Utilities
// Comprehensive security measures for client-side application

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'url' | 'uuid' | 'domain';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  sanitize?: boolean;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, any>;
}

export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string = 'SECURITY_ERROR',
    public field?: string
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class ValidationError extends SecurityError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', field);
  }
}

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

/**
 * Sanitizes string input to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: URLs
    .replace(/vbscript:/gi, '') // Remove vbscript: URLs
    .trim()
    .slice(0, 10000); // Limit length
}

/**
 * Sanitizes HTML content while preserving safe tags
 */
export function sanitizeHTML(html: string, allowedTags: string[] = []): string {
  if (typeof html !== 'string') return '';
  
  const allowedTagsSet = new Set(allowedTags.map(tag => tag.toLowerCase()));
  
  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous attributes
  html = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  html = html.replace(/\s*javascript:\s*[^"'\s>]*/gi, '');
  html = html.replace(/\s*data:\s*[^"'\s>]*/gi, '');
  html = html.replace(/\s*vbscript:\s*[^"'\s>]*/gi, '');
  
  // If no allowed tags, strip all HTML
  if (allowedTagsSet.size === 0) {
    return html.replace(/<[^>]*>/g, '');
  }
  
  // Remove disallowed tags
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi, (match, tagName) => {
    return allowedTagsSet.has(tagName.toLowerCase()) ? match : '';
  });
}

/**
 * Sanitizes URL to ensure it's safe
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';
  
  // Only allow http/https URLs
  const urlPattern = /^https?:\/\/[^\s<>"{}|\\^`\[\]]+$/i;
  if (!urlPattern.test(url)) {
    throw new ValidationError('Invalid URL format');
  }
  
  // Check for dangerous protocols
  if (/^(javascript|data|vbscript|file|ftp):/i.test(url)) {
    throw new ValidationError('Unsafe URL protocol');
  }
  
  return url.trim();
}

/**
 * Sanitizes email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = email.toLowerCase().trim();
  
  if (!emailPattern.test(sanitized)) {
    throw new ValidationError('Invalid email format');
  }
  
  return sanitized;
}

/**
 * Sanitizes domain name
 */
export function sanitizeDomain(domain: string): string {
  if (typeof domain !== 'string') return '';
  
  // Remove protocol and www
  let sanitized = domain.toLowerCase().trim();
  sanitized = sanitized.replace(/^https?:\/\//, '');
  sanitized = sanitized.replace(/^www\./, '');
  sanitized = sanitized.replace(/\/.*$/, '');
  
  // Validate domain format
  const domainPattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;
  if (!domainPattern.test(sanitized)) {
    throw new ValidationError('Invalid domain format');
  }
  
  if (sanitized.length > 255) {
    throw new ValidationError('Domain name too long');
  }
  
  return sanitized;
}

// =============================================================================
// INPUT VALIDATION
// =============================================================================

/**
 * Validates a single field against a rule
 */
export function validateField(field: string, value: any, rule: ValidationRule): string | null {
  // Check required fields
  if (rule.required && (value === undefined || value === null || value === '')) {
    return `${field} is required`;
  }
  
  // Skip other validations if field is empty and not required
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return null;
  }
  
  // Type validation and sanitization
  try {
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          return `${field} must be a string`;
        }
        break;
      
      case 'number':
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) {
          return `${field} must be a number`;
        }
        break;
      
      case 'email':
        sanitizeEmail(value);
        break;
      
      case 'url':
        sanitizeUrl(value);
        break;
      
      case 'domain':
        sanitizeDomain(value);
        break;
      
      case 'uuid':
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidPattern.test(value)) {
          return `${field} must be a valid UUID`;
        }
        break;
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return error.message;
    }
    return `${field} validation failed`;
  }
  
  // Length validation
  if (rule.minLength && value.length < rule.minLength) {
    return `${field} must be at least ${rule.minLength} characters`;
  }
  
  if (rule.maxLength && value.length > rule.maxLength) {
    return `${field} must be no more than ${rule.maxLength} characters`;
  }
  
  // Pattern validation
  if (rule.pattern && !rule.pattern.test(value)) {
    return `${field} format is invalid`;
  }
  
  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(value);
    if (customError) {
      return customError;
    }
  }
  
  return null;
}

/**
 * Validates an object against a schema
 */
export function validateData(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, any> = {};
  
  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field];
    const error = validateField(field, value, rule);
    
    if (error) {
      errors[field] = error;
      continue;
    }
    
    // Sanitize the value if needed
    if (rule.sanitize !== false && value !== undefined && value !== null) {
      try {
        switch (rule.type) {
          case 'string':
            sanitizedData[field] = sanitizeString(value);
            break;
          case 'email':
            sanitizedData[field] = sanitizeEmail(value);
            break;
          case 'url':
            sanitizedData[field] = sanitizeUrl(value);
            break;
          case 'domain':
            sanitizedData[field] = sanitizeDomain(value);
            break;
          default:
            sanitizedData[field] = value;
        }
      } catch {
        sanitizedData[field] = value;
      }
    } else {
      sanitizedData[field] = value;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
}

// =============================================================================
// SECURE DATA HANDLING
// =============================================================================

/**
 * Securely stores sensitive data in sessionStorage with encryption
 */
export function secureStore(key: string, data: any, encrypt: boolean = true): void {
  try {
    let dataToStore = JSON.stringify(data);
    
    if (encrypt) {
      // Simple obfuscation (in production, use proper encryption)
      dataToStore = btoa(dataToStore);
    }
    
    sessionStorage.setItem(`secure_${key}`, dataToStore);
  } catch (error) {
    console.error('Failed to store secure data:', error);
  }
}

/**
 * Retrieves and decrypts sensitive data from sessionStorage
 */
export function secureRetrieve(key: string, decrypt: boolean = true): any {
  try {
    const stored = sessionStorage.getItem(`secure_${key}`);
    if (!stored) return null;
    
    let dataToRetrieve = stored;
    
    if (decrypt) {
      try {
        dataToRetrieve = atob(stored);
      } catch {
        // If decoding fails, return null
        return null;
      }
    }
    
    return JSON.parse(dataToRetrieve);
  } catch (error) {
    console.error('Failed to retrieve secure data:', error);
    return null;
  }
}

/**
 * Securely removes data from storage
 */
export function secureRemove(key: string): void {
  try {
    sessionStorage.removeItem(`secure_${key}`);
  } catch (error) {
    console.error('Failed to remove secure data:', error);
  }
}

/**
 * Clears all secure storage
 */
export function clearSecureStorage(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('secure_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear secure storage:', error);
  }
}

// =============================================================================
// CONTENT SECURITY POLICY
// =============================================================================

/**
 * Sets up Content Security Policy headers (for development)
 */
export function setupCSP(): void {
  if (typeof document === 'undefined') return;
  
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co https://serpapi.com https://api.openai.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  document.head.appendChild(meta);
}

// =============================================================================
// COMMON VALIDATION SCHEMAS
// =============================================================================

export const commonSchemas = {
  email: {
    required: true,
    type: 'email' as const,
    maxLength: 320,
  },
  
  password: {
    required: true,
    type: 'string' as const,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    custom: (value: string) => {
      if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
      if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
      if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
      return null;
    }
  },
  
  domain: {
    required: true,
    type: 'domain' as const,
    maxLength: 255,
  },
  
  query: {
    required: true,
    type: 'string' as const,
    minLength: 1,
    maxLength: 500,
  },
  
  url: {
    required: true,
    type: 'url' as const,
    maxLength: 2048,
  },
  
  name: {
    required: true,
    type: 'string' as const,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-']+$/,
  },
  
  company: {
    required: false,
    type: 'string' as const,
    maxLength: 200,
  },
  
  phone: {
    required: false,
    type: 'string' as const,
    pattern: /^\+?[\d\s\-\(\)]{10,15}$/,
  }
};

// =============================================================================
// RATE LIMITING (CLIENT-SIDE)
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class ClientRateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  
  checkLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);
    
    if (!entry || now > entry.resetTime) {
      this.limits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (entry.count >= maxRequests) {
      return false;
    }
    
    entry.count++;
    return true;
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

export const clientRateLimiter = new ClientRateLimiter();

// Cleanup rate limiter every 5 minutes
setInterval(() => clientRateLimiter.cleanup(), 300000);

// =============================================================================
// SECURITY HEADERS
// =============================================================================

/**
 * Validates response headers for security
 */
export function validateSecurityHeaders(response: Response): void {
  const headers = response.headers;
  
  // Check for security headers
  const securityHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security'
  ];
  
  const missingHeaders = securityHeaders.filter(header => !headers.get(header));
  
  if (missingHeaders.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('Missing security headers:', missingHeaders);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Validation
  validateField,
  validateData,
  ValidationError,
  SecurityError,
  
  // Sanitization
  sanitizeString,
  sanitizeHTML,
  sanitizeUrl,
  sanitizeEmail,
  sanitizeDomain,
  
  // Secure storage
  secureStore,
  secureRetrieve,
  secureRemove,
  clearSecureStorage,
  
  // Security setup
  setupCSP,
  validateSecurityHeaders,
  
  // Rate limiting
  clientRateLimiter,
  
  // Common schemas
  commonSchemas
}; 