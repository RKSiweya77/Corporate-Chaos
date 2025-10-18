// src/utils/errors.js
// Centralized error handling utilities

import { storage } from './storage';

/**
 * Application error codes
 */
export const ERROR_CODES = Object.freeze({
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
});

/**
 * Extract user-friendly error message from various error formats
 */
export function extractErrorMessage(error, fallback = 'An unexpected error occurred') {
  if (!error) return fallback;

  // Axios response error
  if (error.response?.data) {
    const data = error.response.data;
    
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (data.error) return data.error;
    
    // Django REST framework style errors
    if (typeof data === 'object') {
      const firstKey = Object.keys(data)[0];
      if (firstKey) {
        const firstError = data[firstKey];
        if (Array.isArray(firstError)) return firstError[0];
        if (typeof firstError === 'string') return firstError;
      }
    }
  }

  // Native Error object
  if (error.message) return error.message;

  // String error
  if (typeof error === 'string') return error;

  return fallback;
}

/**
 * Extract error code from error object
 */
export function extractErrorCode(error) {
  if (!error) return ERROR_CODES.UNKNOWN;

  // HTTP status based codes
  if (error.response?.status) {
    const status = error.response.status;
    if (status === 401) return ERROR_CODES.UNAUTHORIZED;
    if (status === 403) return ERROR_CODES.FORBIDDEN;
    if (status === 404) return ERROR_CODES.NOT_FOUND;
    if (status >= 500) return ERROR_CODES.SERVER_ERROR;
    if (status >= 400) return ERROR_CODES.VALIDATION_ERROR;
  }

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return ERROR_CODES.NETWORK_ERROR;
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ERROR_CODES.TIMEOUT;
  }

  return ERROR_CODES.UNKNOWN;
}

/**
 * Handle authentication errors (logout user)
 */
export function handleAuthError(error) {
  const code = extractErrorCode(error);
  
  if (code === ERROR_CODES.UNAUTHORIZED || code === ERROR_CODES.FORBIDDEN) {
    storage.clearAuth();
    // Redirect to login with return url
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
    return true;
  }
  
  return false;
}

/**
 * Error logging service
 */
export class ErrorLogger {
  constructor() {
    this.enabled = import.meta.env.NODE_ENV === 'production';
  }

  log(error, context = {}) {
    if (!this.enabled) return;

    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: extractErrorMessage(error),
      code: extractErrorCode(error),
      context,
      user: storage.getUserData()?.id || 'anonymous',
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // In production, send to error tracking service
    console.error('Application Error:', errorInfo);
    
    // Here you would typically send to Sentry, LogRocket, etc.
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  capture(error, context = {}) {
    this.log(error, context);
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();

// Remove the withErrorBoundary function since it uses React and JSX
// This should be in a separate .jsx file or component