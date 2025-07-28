// Secure API Client
// Comprehensive API client with security, caching, and performance optimizations

import { validateData, ValidationSchema, clientRateLimiter, validateSecurityHeaders } from './security';
import { supabase } from '@/integrations/supabase/client';

export interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  validateResponse?: boolean;
}

export interface ApiRequest {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  headers?: Record<string, string>;
  validation?: ValidationSchema;
  skipAuth?: boolean;
  skipCache?: boolean;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
  status: number;
  headers: Headers;
  cached?: boolean;
  requestId: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string = 'API_ERROR',
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network error occurred') {
    super(message, 0, 'NETWORK_ERROR');
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string = 'Request timeout') {
    super(message, 408, 'TIMEOUT_ERROR');
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

// Cache for API responses
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000;

  set(key: string, data: any, ttl: number): void {
    // Clean up if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    // If still full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// Performance monitoring
interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  cached: boolean;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getStats(endpoint?: string): {
    avgDuration: number;
    successRate: number;
    cacheHitRate: number;
    totalRequests: number;
  } {
    const relevantMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;

    if (relevantMetrics.length === 0) {
      return { avgDuration: 0, successRate: 0, cacheHitRate: 0, totalRequests: 0 };
    }

    const avgDuration = relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / relevantMetrics.length;
    const successCount = relevantMetrics.filter(m => m.status >= 200 && m.status < 300).length;
    const cacheHits = relevantMetrics.filter(m => m.cached).length;

    return {
      avgDuration,
      successRate: (successCount / relevantMetrics.length) * 100,
      cacheHitRate: (cacheHits / relevantMetrics.length) * 100,
      totalRequests: relevantMetrics.length
    };
  }
}

export class SecureApiClient {
  private config: Required<ApiClientConfig>;
  private cache = new ApiCache();
  private performanceMonitor = new PerformanceMonitor();

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || '',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      cache: config.cache !== false,
      cacheTTL: config.cacheTTL || 300000, // 5 minutes
      rateLimit: config.rateLimit || { maxRequests: 100, windowMs: 60000 },
      validateResponse: config.validateResponse !== false
    };

    // Setup cache cleanup
    setInterval(() => this.cache.cleanup(), 60000); // Every minute
  }

  async request<T = any>(request: ApiRequest): Promise<ApiResponse<T>> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    try {
      // Rate limiting check
      const rateLimitKey = `${request.endpoint}:${request.method || 'GET'}`;
      if (!clientRateLimiter.checkLimit(
        rateLimitKey,
        this.config.rateLimit.maxRequests,
        this.config.rateLimit.windowMs
      )) {
        throw new RateLimitError('Rate limit exceeded for this endpoint');
      }

      // Input validation
      if (request.validation && request.data) {
        const validation = validateData(request.data, request.validation);
        if (!validation.isValid) {
          throw new ApiError(
            `Validation failed: ${Object.values(validation.errors).join(', ')}`,
            400,
            'VALIDATION_ERROR'
          );
        }
        request.data = validation.sanitizedData;
      }

      // Check cache for GET requests
      const cacheKey = this.generateCacheKey(request);
      if (this.config.cache && !request.skipCache && request.method !== 'POST' && request.method !== 'PUT' && request.method !== 'DELETE') {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return {
            ...cached,
            cached: true,
            requestId
          };
        }
      }

      // Make the request with retry logic
      const response = await this.makeRequestWithRetry(request);
      const responseData = await this.parseResponse(response);

      // Validate security headers
      if (this.config.validateResponse) {
        validateSecurityHeaders(response);
      }

      // Cache successful responses
      if (this.config.cache && !request.skipCache && response.ok && request.method !== 'POST') {
        this.cache.set(cacheKey, {
          data: responseData,
          success: true,
          status: response.status,
          headers: response.headers
        }, this.config.cacheTTL);
      }

      // Record performance metrics
      this.performanceMonitor.recordMetric({
        endpoint: request.endpoint,
        method: request.method || 'GET',
        duration: performance.now() - startTime,
        status: response.status,
        cached: false,
        timestamp: Date.now()
      });

      return {
        data: responseData,
        success: response.ok,
        status: response.status,
        headers: response.headers,
        cached: false,
        requestId
      };

    } catch (error) {
      // Record failed request metrics
      this.performanceMonitor.recordMetric({
        endpoint: request.endpoint,
        method: request.method || 'GET',
        duration: performance.now() - startTime,
        status: error instanceof ApiError ? error.status : 0,
        cached: false,
        timestamp: Date.now()
      });

      throw error;
    }
  }

  private async makeRequestWithRetry(request: ApiRequest): Promise<Response> {
    let lastError: Error;
    const maxRetries = request.method === 'GET' ? this.config.retries : 1; // Only retry GET requests

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.makeRequest(request);
      } catch (error) {
        lastError = error as Error;

        // Don't retry client errors (4xx) or the last attempt
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          throw error;
        }

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private async makeRequest(request: ApiRequest): Promise<Response> {
    const url = this.buildUrl(request.endpoint);
    const timeout = request.timeout || this.config.timeout;

    // Get authentication headers
    const authHeaders = await this.getAuthHeaders(request.skipAuth);

    const fetchOptions: RequestInit = {
      method: request.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...request.headers
      },
      signal: AbortSignal.timeout(timeout)
    };

    if (request.data && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(request.data);
    }

    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Use default error message if parsing fails
        }

        throw new ApiError(errorMessage, response.status, 'HTTP_ERROR', response);
      }

      return response;
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new TimeoutError();
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw new NetworkError(error.message);
    }
  }

  private async getAuthHeaders(skipAuth?: boolean): Promise<Record<string, string>> {
    if (skipAuth) return {};

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return {
          'Authorization': `Bearer ${session.access_token}`
        };
      }
    } catch (error) {
      console.warn('Failed to get auth headers:', error);
    }

    return {};
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${this.config.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return await response.json();
    }
    
    if (contentType?.includes('text/')) {
      return await response.text();
    }
    
    return await response.blob();
  }

  private generateCacheKey(request: ApiRequest): string {
    const keyData = {
      endpoint: request.endpoint,
      method: request.method || 'GET',
      data: request.data
    };
    return btoa(JSON.stringify(keyData)).replace(/[+/=]/g, '').substring(0, 32);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for cache and performance management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number } {
    return { size: this.cache.size() };
  }

  getPerformanceStats(endpoint?: string) {
    return this.performanceMonitor.getStats(endpoint);
  }

  // Convenience methods for common HTTP verbs
  async get<T = any>(endpoint: string, options: Omit<ApiRequest, 'endpoint' | 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ ...options, endpoint, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, options: Omit<ApiRequest, 'endpoint' | 'method' | 'data'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ ...options, endpoint, method: 'POST', data });
  }

  async put<T = any>(endpoint: string, data?: any, options: Omit<ApiRequest, 'endpoint' | 'method' | 'data'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ ...options, endpoint, method: 'PUT', data });
  }

  async patch<T = any>(endpoint: string, data?: any, options: Omit<ApiRequest, 'endpoint' | 'method' | 'data'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ ...options, endpoint, method: 'PATCH', data });
  }

  async delete<T = any>(endpoint: string, options: Omit<ApiRequest, 'endpoint' | 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ ...options, endpoint, method: 'DELETE' });
  }
}

// Default client instance
export const secureApiClient = new SecureApiClient({
  baseUrl: import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1` : '',
  timeout: 30000,
  retries: 3,
  cache: true,
  cacheTTL: 300000, // 5 minutes
  rateLimit: { maxRequests: 100, windowMs: 60000 }
});

// Specialized clients for different services
export const citationApiClient = new SecureApiClient({
  baseUrl: import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1` : '',
  timeout: 45000, // Longer timeout for citation checks
  retries: 2,
  cache: true,
  cacheTTL: 300000,
  rateLimit: { maxRequests: 60, windowMs: 60000 } // More restrictive for citation API
});

export const seoApiClient = new SecureApiClient({
  baseUrl: import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1` : '',
  timeout: 60000, // Even longer timeout for SEO analysis
  retries: 2,
  cache: true,
  cacheTTL: 600000, // 10 minutes cache for SEO data
  rateLimit: { maxRequests: 30, windowMs: 60000 } // Most restrictive for SEO API
});

export default secureApiClient; 