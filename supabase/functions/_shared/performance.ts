// Shared performance utilities for Supabase Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

export interface ConnectionPoolConfig {
  maxConnections: number;
  idleTimeout: number;
}

// In-memory cache for Edge Functions
class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number): void {
    // Clean up expired entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    // If still full after cleanup, remove oldest entry
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

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
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

  stats(): { size: number; hits: number; misses: number } {
    // Simple stats - in production, you'd track hits/misses
    return {
      size: this.cache.size,
      hits: 0,
      misses: 0
    };
  }
}

// Global cache instance
const globalCache = new MemoryCache(1000);

// Connection pool for Supabase clients
class ConnectionPool {
  private pool: Array<{ client: any; lastUsed: number; inUse: boolean }> = [];
  private maxConnections: number;
  private idleTimeout: number;

  constructor(config: ConnectionPoolConfig) {
    this.maxConnections = config.maxConnections;
    this.idleTimeout = config.idleTimeout;
  }

  getConnection(): any {
    // Find an available connection
    const available = this.pool.find(conn => !conn.inUse);
    if (available) {
      available.inUse = true;
      available.lastUsed = Date.now();
      return available.client;
    }

    // Create new connection if under limit
    if (this.pool.length < this.maxConnections) {
      const client = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const connection = {
        client,
        lastUsed: Date.now(),
        inUse: true
      };

      this.pool.push(connection);
      return client;
    }

    // Return the least recently used connection
    const lru = this.pool.reduce((oldest, current) => 
      current.lastUsed < oldest.lastUsed ? current : oldest
    );

    lru.inUse = true;
    lru.lastUsed = Date.now();
    return lru.client;
  }

  releaseConnection(client: any): void {
    const connection = this.pool.find(conn => conn.client === client);
    if (connection) {
      connection.inUse = false;
      connection.lastUsed = Date.now();
    }
  }

  cleanup(): void {
    const now = Date.now();
    this.pool = this.pool.filter(conn => {
      if (!conn.inUse && now - conn.lastUsed > this.idleTimeout) {
        // Close connection if needed
        return false;
      }
      return true;
    });
  }

  stats(): { total: number; inUse: number; idle: number } {
    const inUse = this.pool.filter(conn => conn.inUse).length;
    return {
      total: this.pool.length,
      inUse,
      idle: this.pool.length - inUse
    };
  }
}

// Global connection pool
const connectionPool = new ConnectionPool({
  maxConnections: 10,
  idleTimeout: 300000 // 5 minutes
});

// Performance monitoring
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();

  startTimer(operation: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
      return duration;
    };
  }

  recordMetric(operation: string, value: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const values = this.metrics.get(operation)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getStats(operation: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(operation);
    if (!values || values.length === 0) return null;

    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    for (const [operation, values] of this.metrics.entries()) {
      if (values.length > 0) {
        stats[operation] = {
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    }
    return stats;
  }
}

// Global performance monitor
const performanceMonitor = new PerformanceMonitor();

// Cache utilities
export function getCached<T>(key: string): T | null {
  return globalCache.get<T>(key);
}

export function setCached<T>(key: string, data: T, ttl: number = 300000): void {
  globalCache.set(key, data, ttl);
}

export function deleteCached(key: string): boolean {
  return globalCache.delete(key);
}

export function clearCache(): void {
  globalCache.clear();
}

// Cache key generators
export function generateCacheKey(...parts: (string | number)[]): string {
  return parts.map(part => String(part)).join(':');
}

export function generateHashKey(data: any): string {
  const str = JSON.stringify(data);
  return btoa(str).replace(/[+/=]/g, '').substring(0, 16);
}

// Memoization decorator
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 300000,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : generateCacheKey('memoize', fn.name, ...args);
    
    let cached = getCached(key);
    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);
    setCached(key, result, ttl);
    return result;
  }) as T;
}

// Database connection utilities
export function getSupabaseClient(): any {
  return connectionPool.getConnection();
}

export function releaseSupabaseClient(client: any): void {
  connectionPool.releaseConnection(client);
}

// Batch processing utilities
export async function batchProcess<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 10,
  delayMs: number = 100
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
    
    // Add delay between batches to prevent overwhelming
    if (i + batchSize < items.length && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

// Retry with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Parallel execution with concurrency limit
export async function parallelLimit<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 5
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  const executing: Promise<void>[] = [];
  
  for (let i = 0; i < items.length; i++) {
    const promise = processor(items[i]).then(result => {
      results[i] = result;
    });
    
    executing.push(promise);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }
  
  await Promise.all(executing);
  return results;
}

// Performance wrapper for functions
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  operationName?: string
): T {
  const name = operationName || fn.name || 'anonymous';
  
  return ((...args: Parameters<T>) => {
    const endTimer = performanceMonitor.startTimer(name);
    
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          endTimer();
        });
      }
      
      endTimer();
      return result;
    } catch (error) {
      endTimer();
      throw error;
    }
  }) as T;
}

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

export async function deduplicate<T>(
  key: string,
  operation: () => Promise<T>
): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  const promise = operation().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

// Resource cleanup
export function setupCleanupInterval(): void {
  // Clean up cache every 5 minutes
  setInterval(() => {
    globalCache.cleanup();
    connectionPool.cleanup();
  }, 300000);
}

// Performance metrics
export function getPerformanceStats(): {
  cache: any;
  connections: any;
  operations: any;
} {
  return {
    cache: globalCache.stats(),
    connections: connectionPool.stats(),
    operations: performanceMonitor.getAllStats()
  };
}

// Database query optimization helpers
export function optimizeQuery(query: string): string {
  // Basic query optimization
  return query
    .replace(/SELECT \*/g, 'SELECT id, created_at, updated_at') // Avoid SELECT *
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

export function addQueryHints(query: string, hints: string[]): string {
  const hintString = hints.map(hint => `/*+ ${hint} */`).join(' ');
  return `${hintString} ${query}`;
}

// Export everything
export default {
  MemoryCache,
  ConnectionPool,
  PerformanceMonitor,
  getCached,
  setCached,
  deleteCached,
  clearCache,
  generateCacheKey,
  generateHashKey,
  memoize,
  getSupabaseClient,
  releaseSupabaseClient,
  batchProcess,
  retryWithBackoff,
  parallelLimit,
  withPerformanceMonitoring,
  deduplicate,
  setupCleanupInterval,
  getPerformanceStats,
  optimizeQuery,
  addQueryHints,
}; 