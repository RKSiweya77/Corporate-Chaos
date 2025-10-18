// src/utils/api.js
// API-related utility functions

import { storage } from './storage';
import { errorLogger, extractErrorMessage } from './errors';

/**
 * Generic API response handler
 */
export async function handleApiResponse(response) {
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.response = response;
    
    try {
      const errorData = await response.json();
      error.data = errorData;
    } catch {
      // Ignore JSON parse errors
    }
    
    throw error;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error('Invalid JSON response');
  }
}

/**
 * Create headers for API requests
 */
export function createHeaders(options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = storage.getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Generic API call wrapper with error handling
 */
export async function apiCall(url, options = {}) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: createHeaders(options),
    });

    const data = await handleApiResponse(response);
    
    // Log successful API call (development only)
    if (import.meta.env.DEV) {
      console.log(`API Call: ${options.method || 'GET'} ${url}`, {
        duration: Date.now() - startTime,
        status: response.status,
      });
    }

    return data;
  } catch (error) {
    // Log error
    errorLogger.capture(error, { url, options });
    
    // Re-throw with friendly message
    error.userMessage = extractErrorMessage(error);
    throw error;
  }
}

/**
 * API call with timeout
 */
export async function apiCallWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await apiCall(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Pagination helper
 */
export function buildPaginationParams(page = 1, pageSize = 20, filters = {}) {
  return {
    page,
    page_size: pageSize,
    ...filters,
  };
}

/**
 * Search params helper
 */
export function buildSearchParams(params = {}) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  return searchParams.toString();
}

/**
 * File upload helper
 */
export async function uploadFile(file, uploadUrl, onProgress = null) {
  const formData = new FormData();
  formData.append('file', file);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = (event.loaded / event.total) * 100;
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (error) {
          resolve(xhr.responseText);
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', uploadUrl);
    
    const token = storage.getAuthToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    xhr.send(formData);
  });
}

/**
 * Cache helper for API responses
 */
export class ApiCache {
  constructor(defaultTtl = 5 * 60 * 1000) { // 5 minutes default
    this.defaultTtl = defaultTtl;
    this.cache = new Map();
  }

  set(key, data, ttl = this.defaultTtl) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

// Global cache instance
export const apiCache = new ApiCache();