// Centralized fetcher so we don't repeat boilerplate in each Vendor component.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

type Query = Record<string, string | number | boolean | undefined>;

function buildQuery(params?: Query): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  return entries.length ? "?" + new URLSearchParams(entries as any).toString() : "";
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // GET /products[?vendor=<id>]
  getProducts(params?: Query) {
    return request<any>(`/products/${buildQuery(params)}`);
  },
  // GET /vendors
  getVendors(params?: Query) {
    return request<any>(`/vendors/${buildQuery(params)}`);
  },
  // For later (keep here so refactors can import without changing signatures)
  createProduct(body: unknown) {
    return request<any>(`/products/`, { method: "POST", body: JSON.stringify(body) });
  },
  updateProduct(id: number | string, body: unknown) {
    return request<any>(`/products/${id}/`, { method: "PATCH", body: JSON.stringify(body) });
  },
  deleteProduct(id: number | string) {
    return request<any>(`/products/${id}/`, { method: "DELETE" });
  },
};
