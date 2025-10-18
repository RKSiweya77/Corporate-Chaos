// src/api/hooks.js
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import api from "./axios";

/**
 * Normalizes error objects from axios/HTTP into a stable shape.
 */
function normalizeError(err) {
  if (!err) return { message: "Unknown error" };
  if (err.response) {
    const status = err.response.status;
    const data = err.response.data;
    const detail =
      (typeof data === "string" && data) ||
      data?.detail ||
      data?.message ||
      JSON.stringify(data);
    return { status, message: detail || `HTTP ${status}` };
  }
  if (err.request) return { message: "No response from server" };
  return { message: err.message || "Request failed" };
}

/**
 * useFetch
 * GET data with loading/error states.
 * Re-runs when url/params/deps change. Cancels safely on unmount.
 */
export function useFetch(url, { params, enabled = true, transform, initialData = null, deps = [] } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);

  const stableParams = useMemo(() => params || undefined, [JSON.stringify(params || {})]);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!enabled || !url) return;

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    cancelRef.current = controller;

    api
      .get(url, { params: stableParams, signal: controller.signal })
      .then((res) => {
        const payload = res?.data;
        setData(transform ? transform(payload) : payload);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(normalizeError(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, JSON.stringify(stableParams), enabled, ...deps]);

  return { data, loading, error, setData, reloadKey: JSON.stringify(stableParams) };
}

/**
 * useMutation
 * Generic mutate helper: call(method, url, body, config)
 */
export function useMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(async (method, url, body = undefined, config = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api({ method, url, data: body, ...config });
      return res.data;
    } catch (err) {
      const e = normalizeError(err);
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error };
}

/**
 * usePost / usePut / useDelete convenience wrappers
 */
export function usePost(url) {
  const { call, loading, error } = useMutation();
  const mutate = useCallback((body, config) => call("post", url, body, config), [call, url]);
  return { mutate, loading, error };
}

export function usePut(url) {
  const { call, loading, error } = useMutation();
  const mutate = useCallback((body, config) => call("put", url, body, config), [call, url]);
  return { mutate, loading, error };
}

export function usePatch(url) {
  const { call, loading, error } = useMutation();
  const mutate = useCallback((body, config) => call("patch", url, body, config), [call, url]);
  return { mutate, loading, error };
}

export function useDelete(url) {
  const { call, loading, error } = useMutation();
  const mutate = useCallback((config) => call("delete", url, undefined, config), [call, url]);
  return { mutate, loading, error };
}

/**
 * usePaginatedFetch
 * Assumes DRF pagination: { results, next, previous, count }
 */
export function usePaginatedFetch(url, { params, enabled = true, deps = [] } = {}) {
  const [pageUrl, setPageUrl] = useState(url);
  const { data, loading, error } = useFetch(pageUrl, { params, enabled, deps });

  const items = data?.results ?? data ?? [];
  const next = data?.next || null;
  const previous = data?.previous || null;
  const count = data?.count ?? (Array.isArray(items) ? items.length : 0);

  const goNext = useCallback(() => next && setPageUrl(next), [next]);
  const goPrev = useCallback(() => previous && setPageUrl(previous), [previous]);
  const reset = useCallback(() => setPageUrl(url), [url]);

  return { items, loading, error, next, previous, count, goNext, goPrev, reset };
}

/**
 * useAuthApi - Enhanced API hook that provides auth-aware methods
 * Note: This will be fully integrated once we have AuthContext
 */
export function useAuthApi() {
  const authApi = useMemo(() => {
    return {
      get: (url, config) => api.get(url, config),
      post: (url, data, config) => api.post(url, data, config),
      put: (url, data, config) => api.put(url, data, config),
      patch: (url, data, config) => api.patch(url, data, config),
      delete: (url, config) => api.delete(url, config),
      postMultipart: (url, formData) => api.post(url, formData, { 
        headers: { "Content-Type": "multipart/form-data" } 
      }),
    };
  }, []); // Will add token dependency when AuthContext is available

  return authApi;
}