// Adjust/extend as we discover your exact API fields.
export interface Vendor {
  id: number | string;
  name?: string;
  store_name?: string;
  email?: string;
  phone?: string;
  // ...anything else we find later
}

export interface Product {
  id: number | string;
  name: string;
  price: number;
  imageUrl?: string;
  vendorId?: number | string;
  stock?: number;
  created_at?: string;
  updated_at?: string;
  // Keep optional until we lock backend fields
  [key: string]: unknown;
}

export interface PagedResponse<T> {
  results: T[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}
