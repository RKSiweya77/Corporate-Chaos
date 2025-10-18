// src/hooks/useFetch.js
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { errorLogger, extractErrorMessage } from "../utils/errors";

/**
 * Enhanced fetch hook with better error handling, caching, and retry logic
 */
export function useFetch(url, options = {}, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const abortRef = useRef(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const doFetch = useCallback(async (isRetry = false) => {
    if (!url) {
      setLoading(false);
      return;
    }

    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!isRetry) setLoading(true);
      setError(null);

      const res = await api.request({
        url,
        method: optionsRef.current.method || "GET",
        params: optionsRef.current.params,
        data: optionsRef.current.body,
        headers: optionsRef.current.headers,
        ...optionsRef.current,
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        setData(res?.data ?? null);
        setRetryCount(0); // Reset retry count on success
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      
      const message = extractErrorMessage(err);
      setError(message);
      
      // Log error for monitoring
      errorLogger.capture(err, { url, options: optionsRef.current, retryCount });
      
      // Auto-retry for network errors (max 3 times)
      if (err.code === 'NETWORK_ERROR' && retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          doFetch(true);
        }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
      }
    } finally {
      if (!controller.signal.aborted && !loading) {
        setLoading(false);
      }
    }
  }, [url, retryCount, loading]);

  useEffect(() => {
    doFetch();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, doFetch, ...deps]);

  const refetch = useCallback(() => {
    setRetryCount(0);
    doFetch();
  }, [doFetch]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refetch, 
    setData,
    clearError,
    retryCount 
  };
}

/**
 * Enhanced lazy fetch hook with better error handling
 */
export function useLazyFetch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetch = useCallback(async (url, options = {}) => {
    if (!url) return null;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const res = await api.request({
        url,
        method: options.method || "GET",
        params: options.params,
        data: options.body,
        headers: options.headers,
        ...options,
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        const responseData = res?.data ?? null;
        setData(responseData);
        return responseData;
      }
      
      return null;
    } catch (err) {
      if (controller.signal.aborted) return null;
      
      const message = extractErrorMessage(err);
      setError(message);
      errorLogger.capture(err, { url, options });
      throw err;
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { 
    data, 
    loading, 
    error, 
    fetch, 
    setData,
    clearError,
    clearData
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate() {
  const [isUpdating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback(async (asyncFn, optimisticData, onSuccess, onError) => {
    setUpdating(true);
    setError(null);

    try {
      // Apply optimistic update first
      if (optimisticData) {
        optimisticData();
      }

      // Perform actual update
      const result = await asyncFn();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(extractErrorMessage(err));
      errorLogger.capture(err);
      
      // Revert optimistic update on error
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    update,
    isUpdating,
    error,
    clearError
  };
}

export default useFetch;