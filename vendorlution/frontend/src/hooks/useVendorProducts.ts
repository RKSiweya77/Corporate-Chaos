import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { Product } from "../types";

function normalizeProduct(raw: any): Product {
  // Be forgiving about field names until we read your exact models
  return {
    id: raw.id,
    name: raw.name ?? raw.title ?? "Untitled",
    price: Number(raw.price ?? raw.unit_price ?? 0),
    imageUrl: raw.image ?? raw.thumbnail_url ?? raw.imageUrl,
    vendorId: raw.vendor ?? raw.vendor_id ?? raw.store ?? raw.vendorId,
    stock: raw.stock ?? raw.quantity,
    created_at: raw.created_at ?? raw.created,
    updated_at: raw.updated_at ?? raw.updated,
    ...raw,
  };
}

export function useVendorProducts(vendorId?: number | string) {
  const [data, setData] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    // Prefer server-side filter if vendorId provided
    const params = vendorId ? { vendor: vendorId } : undefined;

    api.getProducts(params)
      .then((res) => {
        // Support both paged and list responses
        const list = Array.isArray(res) ? res : (res.results ?? []);
        const normalized = list.map(normalizeProduct);
        setData(normalized);
      })
      .catch((e: any) => setError(String(e)))
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [vendorId]);

  // If API can’t filter yet, fallback client-side
  const products = useMemo(() => {
    if (!data) return null;
    if (!vendorId) return data;
    return data.filter(p => String(p.vendorId) === String(vendorId));
  }, [data, vendorId]);

  return { products, loading, error };
}
