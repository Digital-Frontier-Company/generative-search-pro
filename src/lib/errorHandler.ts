// Comprehensive Error Handling and Logging System
// Secure error reporting with user-friendly messages and detailed logging

import { toast } from 'sonner';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  API = 'api',
  UI = 'ui',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  UNKNOWN = 'unknown'
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  userMessage: string;
  shouldReport: boolean;
  retryable: boolean;
}

export class AppError extends Error {
  public readonly id: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly userMessage: string;
  public readonly shouldReport: boolean;
  public readonly retryable: boolean;
  public readonly context: ErrorContext;

  constructor(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    userMessage?: string,
    context: ErrorContext = {},
    shouldReport: boolean = true,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.id = this.generateErrorId();
    this.severity = severity;
    this.category = category;
    this.userMessage = userMessage || this.getDefaultUserMessage(category);
    this.shouldReport = shouldReport;
    this.retryable = retryable;
    this.context = {
      ...context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultUserMessage(category: ErrorCategory): string {
    const messages = {
      [ErrorCategory.NETWORK]: 'Connection error. Please check your internet connection and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Authentication failed. Please sign in again.',
      [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
      [ErrorCategory.PERMISSION]: 'You don\'t have permission to perform this action.',
      [ErrorCategory.API]: 'Service temporarily unavailable. Please try again later.',
      [ErrorCategory.UI]: 'Something went wrong. Please refresh the page.',
      [ErrorCategory.SECURITY]: 'Security error detected. Please contact support.',
      [ErrorCategory.PERFORMANCE]: 'The request is taking longer than expected.',
      [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.'
    };
    return messages[category];
  }
}

// Error metrics tracking
interface ErrorMetrics {
  count: number;
  lastOccurrence: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
}

class ErrorTracker {
  private metrics = new Map<string, ErrorMetrics>();
  private maxMetrics = 1000;

  track(error: ErrorReport): void {
    const key = `${error.category}:${error.message}`;
    const existing = this.metrics.get(key);

    if (existing) {
      existing.count++;
      existing.lastOccurrence = error.context.timestamp || new Date().toISOString();
    } else {
      this.metrics.set(key, {
        count: 1,
        lastOccurrence: error.context.timestamp || new Date().toISOString(),
        category: error.category,
        severity: error.severity
      });
    }

    // Clean up old metrics
    if (this.metrics.size > this.maxMetrics) {
      const oldestKey = this.metrics.keys().next().value;
      if (oldestKey) {
        this.metrics.delete(oldestKey);
      }
    }
  }

  getMetrics(): Array<{ error: string; metrics: ErrorMetrics }> {
    return Array.from(this.metrics.entries()).map(([error, metrics]) => ({
      error,
      metrics
    }));
  }

  getFrequentErrors(limit: number = 10): Array<{ error: string; count: number }> {
    return Array.from(this.metrics.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, limit)
      .map(([error, metrics]) => ({ error, count: metrics.count }));
  }
}

const errorTracker = new ErrorTracker();

// Secure error logging
class SecureLogger {
  private logs: ErrorReport[] = [];
  private maxLogs = 100;

  log(error: ErrorReport): void {
    // Add to local logs
    this.logs.push(error);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Track metrics
    errorTracker.track(error);

    // Console logging (development only)
    if (process.env.NODE_ENV === 'development') {
      const logMethod = this.getLogMethod(error.severity);
      logMethod(`[${error.category.toUpperCase()}] ${error.message}`, {
        id: error.id,
        severity: error.severity,
        context: error.context,
        stack: error.stack
      });
    }

    // Report critical errors immediately
    if (error.severity === ErrorSeverity.CRITICAL && error.shouldReport) {
      this.reportError(error);
    }
  }

  private getLogMethod(severity: ErrorSeverity): typeof console.log {
    switch (severity) {
      case ErrorSeverity.LOW:
        return console.info;
      case ErrorSeverity.MEDIUM:
        return console.warn;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private async reportError(error: ErrorReport): Promise<void> {
    try {
      // In production, you would send this to your error reporting service
      // For now, we'll just store it locally
      const reports = this.getStoredReports();
      reports.push({
        ...error,
        // Remove sensitive information
        context: {
          ...error.context,
          userId: error.context.userId ? '[REDACTED]' : undefined,
          sessionId: error.context.sessionId ? '[REDACTED]' : undefined
        }
      });
      
      // Keep only last 50 reports
      const recentReports = reports.slice(-50);
      localStorage.setItem('errorReports', JSON.stringify(recentReports));
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  private getStoredReports(): ErrorReport[] {
    try {
      const stored = localStorage.getItem('errorReports');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getLogs(): ErrorReport[] {
    return [...this.logs];
  }

  getReports(): ErrorReport[] {
    return this.getStoredReports();
  }

  clearLogs(): void {
    this.logs = [];
  }

  clearReports(): void {
    localStorage.removeItem('errorReports');
  }
}

const secureLogger = new SecureLogger();

// Main error handler
export class ErrorHandler {
  static handle(error: unknown, context: ErrorContext = {}): ErrorReport {
    const errorReport = this.createErrorReport(error, context);
    
    // Log the error
    secureLogger.log(errorReport);
    
    // Show user notification
    this.showUserNotification(errorReport);
    
    return errorReport;
  }

  static handleAsync(promise: Promise<any>, context: ErrorContext = {}): Promise<any> {
    return promise.catch(error => {
      this.handle(error, context);
      throw error; // Re-throw to allow caller to handle
    });
  }

  static createErrorReport(error: unknown, context: ErrorContext = {}): ErrorReport {
    if (error instanceof AppError) {
      return {
        id: error.id,
        message: error.message,
        stack: error.stack,
        severity: error.severity,
        category: error.category,
        context: { ...error.context, ...context },
        userMessage: error.userMessage,
        shouldReport: error.shouldReport,
        retryable: error.retryable
      };
    }

    if (error instanceof Error) {
      const category = this.categorizeError(error);
      const severity = this.determineSeverity(error, category);
      
      return {
        id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: error.message,
        stack: error.stack,
        severity,
        category,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : undefined
        },
        userMessage: this.getUserMessage(category, error),
        shouldReport: severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL,
        retryable: this.isRetryable(category, error)
      };
    }

    // Handle non-Error objects
    return {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: String(error),
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.UNKNOWN,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined
      },
      userMessage: 'An unexpected error occurred. Please try again.',
      shouldReport: true,
      retryable: false
    };
  }

  private static categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes('network') || message.includes('fetch') || name.includes('network')) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (message.includes('validation') || message.includes('invalid') || name.includes('validation')) {
      return ErrorCategory.VALIDATION;
    }
    if (message.includes('permission') || message.includes('access denied')) {
      return ErrorCategory.PERMISSION;
    }
    if (message.includes('api') || message.includes('server') || message.includes('service')) {
      return ErrorCategory.API;
    }
    if (message.includes('security') || message.includes('xss') || message.includes('csrf')) {
      return ErrorCategory.SECURITY;
    }
    if (message.includes('timeout') || message.includes('slow') || message.includes('performance')) {
      return ErrorCategory.PERFORMANCE;
    }

    return ErrorCategory.UNKNOWN;
  }

  private static determineSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    // Security errors are always critical
    if (category === ErrorCategory.SECURITY) {
      return ErrorSeverity.CRITICAL;
    }

    // Network errors are usually medium severity
    if (category === ErrorCategory.NETWORK) {
      return ErrorSeverity.MEDIUM;
    }

    // Authentication errors are high severity
    if (category === ErrorCategory.AUTHENTICATION) {
      return ErrorSeverity.HIGH;
    }

    // Check error message for severity indicators
    const message = error.message.toLowerCase();
    if (message.includes('critical') || message.includes('fatal')) {
      return ErrorSeverity.CRITICAL;
    }
    if (message.includes('warning') || message.includes('deprecated')) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }

  private static getUserMessage(category: ErrorCategory, error: Error): string {
    const defaultMessages = {
      [ErrorCategory.NETWORK]: 'Connection error. Please check your internet connection and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Authentication failed. Please sign in again.',
      [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
      [ErrorCategory.PERMISSION]: 'You don\'t have permission to perform this action.',
      [ErrorCategory.API]: 'Service temporarily unavailable. Please try again later.',
      [ErrorCategory.UI]: 'Something went wrong. Please refresh the page.',
      [ErrorCategory.SECURITY]: 'Security error detected. Please contact support.',
      [ErrorCategory.PERFORMANCE]: 'The request is taking longer than expected.',
      [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.'
    };

    return defaultMessages[category];
  }

  private static isRetryable(category: ErrorCategory, error: Error): boolean {
    const retryableCategories = [
      ErrorCategory.NETWORK,
      ErrorCategory.API,
      ErrorCategory.PERFORMANCE
    ];

    if (retryableCategories.includes(category)) {
      return true;
    }

    // Check for specific retryable errors
    const message = error.message.toLowerCase();
    return message.includes('timeout') || 
           message.includes('temporary') || 
           message.includes('retry');
  }

  private static showUserNotification(errorReport: ErrorReport): void {
    const { severity, userMessage, retryable } = errorReport;

    switch (severity) {
      case ErrorSeverity.LOW:
        // Don't show notifications for low severity errors
        break;
      case ErrorSeverity.MEDIUM:
        toast.warning(userMessage);
        break;
      case ErrorSeverity.HIGH:
        toast.error(userMessage, {
          action: retryable ? {
            label: 'Retry',
            onClick: () => window.location.reload()
          } : undefined
        });
        break;
      case ErrorSeverity.CRITICAL:
        toast.error(userMessage, {
          duration: Infinity,
          action: {
            label: 'Reload Page',
            onClick: () => window.location.reload()
          }
        });
        break;
    }
  }

  // Utility methods for getting error information
  static getErrorMetrics() {
    return errorTracker.getMetrics();
  }

  static getFrequentErrors(limit?: number) {
    return errorTracker.getFrequentErrors(limit);
  }

  static getErrorLogs() {
    return secureLogger.getLogs();
  }

  static getErrorReports() {
    return secureLogger.getReports();
  }

  static clearErrorData() {
    secureLogger.clearLogs();
    secureLogger.clearReports();
  }
}

// Global error handlers
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.handle(event.reason, {
      component: 'global',
      action: 'unhandledrejection'
    });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    ErrorHandler.handle(event.error || event.message, {
      component: 'global',
      action: 'uncaughterror',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  });

  // Handle React error boundaries (if using)
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Check if this is a React error
    if (args[0] && typeof args[0] === 'string' && args[0].includes('React')) {
      ErrorHandler.handle(new Error(args[0]), {
        component: 'react',
        action: 'error-boundary'
      });
    }
    originalConsoleError.apply(console, args);
  };
}

// Utility functions for common error types
export const createNetworkError = (message: string, context?: ErrorContext) =>
  new AppError(message, ErrorSeverity.MEDIUM, ErrorCategory.NETWORK, undefined, context, true, true);

export const createAuthError = (message: string, context?: ErrorContext) =>
  new AppError(message, ErrorSeverity.HIGH, ErrorCategory.AUTHENTICATION, undefined, context, true, false);

export const createValidationError = (message: string, userMessage?: string, context?: ErrorContext) =>
  new AppError(message, ErrorSeverity.LOW, ErrorCategory.VALIDATION, userMessage, context, false, false);

export const createSecurityError = (message: string, context?: ErrorContext) =>
  new AppError(message, ErrorSeverity.CRITICAL, ErrorCategory.SECURITY, 'Security error detected. Please contact support.', context, true, false);

// Error boundary hook for React components
export function useErrorHandler() {
  return {
    handleError: (error: unknown, context?: ErrorContext) => ErrorHandler.handle(error, context),
    handleAsyncError: (promise: Promise<any>, context?: ErrorContext) => ErrorHandler.handleAsync(promise, context)
  };
}

export default ErrorHandler; 