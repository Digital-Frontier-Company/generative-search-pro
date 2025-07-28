// Shared security utilities for Supabase Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

export interface SecurityConfig {
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
  requireAuth?: boolean;
  allowedOrigins?: string[];
  maxRequestSize?: number;
}

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'url' | 'uuid';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Rate limiting store (in-memory for Edge Functions)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export class SecurityError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'SECURITY_ERROR'
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class RateLimitError extends SecurityError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

export class ValidationError extends SecurityError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends SecurityError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

// Input sanitization
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 10000); // Limit length
}

export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';
  
  // Only allow http/https URLs
  const urlPattern = /^https?:\/\/[^\s<>"{}|\\^`\[\]]+$/i;
  if (!urlPattern.test(url)) {
    throw new ValidationError('Invalid URL format');
  }
  
  return url.trim();
}

export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw new ValidationError('Invalid email format');
  }
  
  return email.toLowerCase().trim();
}

// Input validation
export function validateInput(data: any, schema: ValidationSchema): Record<string, any> {
  const validated: Record<string, any> = {};
  const errors: string[] = [];

  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field];

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip validation if field is not required and empty
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    if (rule.type) {
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`);
            continue;
          }
          validated[field] = sanitizeString(value);
          break;
        
        case 'number':
          const num = typeof value === 'string' ? parseFloat(value) : value;
          if (isNaN(num)) {
            errors.push(`${field} must be a number`);
            continue;
          }
          validated[field] = num;
          break;
        
        case 'email':
          try {
            validated[field] = sanitizeEmail(value);
          } catch (e) {
            errors.push(`${field} must be a valid email`);
            continue;
          }
          break;
        
        case 'url':
          try {
            validated[field] = sanitizeUrl(value);
          } catch (e) {
            errors.push(`${field} must be a valid URL`);
            continue;
          }
          break;
        
        case 'uuid':
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidPattern.test(value)) {
            errors.push(`${field} must be a valid UUID`);
            continue;
          }
          validated[field] = value;
          break;
      }
    } else {
      validated[field] = value;
    }

    // Length validation
    if (rule.minLength && validated[field].length < rule.minLength) {
      errors.push(`${field} must be at least ${rule.minLength} characters`);
      continue;
    }

    if (rule.maxLength && validated[field].length > rule.maxLength) {
      errors.push(`${field} must be no more than ${rule.maxLength} characters`);
      continue;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(validated[field])) {
      errors.push(`${field} format is invalid`);
      continue;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(validated[field]);
      if (customError) {
        errors.push(customError);
        continue;
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  return validated;
}

// Rate limiting
export function checkRateLimit(
  identifier: string,
  config: { requests: number; windowMs: number }
): void {
  const now = Date.now();
  const key = `rateLimit:${identifier}`;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // New window or expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return;
  }

  if (current.count >= config.requests) {
    throw new RateLimitError(`Rate limit exceeded. Max ${config.requests} requests per ${config.windowMs}ms`);
  }

  current.count++;
  rateLimitStore.set(key, current);
}

// CORS validation
export function validateOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  
  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true;
    if (allowed === origin) return true;
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return origin.endsWith(domain);
    }
    return false;
  });
}

// Authentication helper
export async function authenticateRequest(req: Request): Promise<any> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    throw new AuthenticationError('Missing authentication token');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new SecurityError('Server configuration error', 500);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new AuthenticationError('Invalid authentication token');
  }

  return user;
}

// Secure request handler wrapper
export function createSecureHandler(
  handler: (req: Request, user?: any) => Promise<Response>,
  config: SecurityConfig = {}
) {
  return async (req: Request): Promise<Response> => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };

    try {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Validate origin if specified
      if (config.allowedOrigins && config.allowedOrigins.length > 0) {
        const origin = req.headers.get('Origin');
        if (!validateOrigin(origin, config.allowedOrigins)) {
          return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Check request size
      if (config.maxRequestSize) {
        const contentLength = req.headers.get('Content-Length');
        if (contentLength && parseInt(contentLength) > config.maxRequestSize) {
          return new Response(JSON.stringify({ error: 'Request too large' }), {
            status: 413,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Rate limiting
      if (config.rateLimit) {
        const clientIP = req.headers.get('X-Forwarded-For') || 
                        req.headers.get('X-Real-IP') || 
                        'unknown';
        checkRateLimit(clientIP, config.rateLimit);
      }

      // Authentication
      let user = null;
      if (config.requireAuth) {
        user = await authenticateRequest(req);
      }

      // Call the actual handler
      return await handler(req, user);

    } catch (error) {
      console.error('Security handler error:', error);

      let statusCode = 500;
      let errorCode = 'INTERNAL_ERROR';
      let message = 'Internal server error';

      if (error instanceof SecurityError) {
        statusCode = error.statusCode;
        errorCode = error.code;
        message = error.message;
      }

      return new Response(JSON.stringify({ 
        error: message,
        code: errorCode,
        timestamp: new Date().toISOString()
      }), {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  };
}

// Environment variable validation
export function validateEnvVars(required: string[]): void {
  const missing = required.filter(name => !Deno.env.get(name));
  if (missing.length > 0) {
    throw new SecurityError(
      `Missing required environment variables: ${missing.join(', ')}`,
      500,
      'CONFIGURATION_ERROR'
    );
  }
}

// SQL injection prevention helpers
export function escapeSQLString(str: string): string {
  return str.replace(/'/g, "''");
}

export function validateSQLIdentifier(identifier: string): string {
  // Only allow alphanumeric characters and underscores
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new ValidationError('Invalid SQL identifier');
  }
  return identifier;
}

// Common validation schemas
export const commonSchemas = {
  domain: {
    required: true,
    type: 'string' as const,
    maxLength: 255,
    pattern: /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
  },
  
  email: {
    required: true,
    type: 'email' as const,
    maxLength: 320,
  },
  
  userId: {
    required: true,
    type: 'uuid' as const,
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
};

export default {
  SecurityError,
  RateLimitError,
  ValidationError,
  AuthenticationError,
  sanitizeString,
  sanitizeUrl,
  sanitizeEmail,
  validateInput,
  checkRateLimit,
  validateOrigin,
  authenticateRequest,
  createSecureHandler,
  validateEnvVars,
  escapeSQLString,
  validateSQLIdentifier,
  commonSchemas,
}; 