// src/utils/media.js
import { API_BASE_URL } from "../api/endpoints";

// Derive API root (strip trailing '/api' if present) so media links hit Django at 8000
function getApiRoot() {
  const envRoot =
    import.meta.env.VITE_API_ROOT ||
    process.env.REACT_APP_API_ROOT ||
    API_BASE_URL;

  // If API_BASE_URL is like http://127.0.0.1:8000/api -> strip /api
  return (envRoot || "http://127.0.0.1:8000")
    .replace(/\/api\/?$/i, "");
}

// Build absolute URL for any relative path (/media/..., /static/..., or plain filename)
export function toMediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const root = getApiRoot();
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${root}${clean}`;
}

// Keep toMedia for backward compatibility - it's the same function
export const toMedia = toMediaUrl;

// Pick the best-guess image field from a product object and return absolute URL
export function getProductImage(product) {
  if (!product) return "";
  const path =
    product.image ||
    product.thumbnail ||
    product.main_image ||
    product.cover ||
    product.photo ||
    // common nested structures:
    product.primary_image ||
    product.featured_image ||
    (Array.isArray(product.images) && (
      product.images[0]?.image ||
      product.images[0]?.url ||
      product.images[0]
    )) ||
    product.image_url;

  return toMediaUrl(path);
}

// (Optional) helpers some components might call later
export function getVendorLogo(vendor) {
  const path = vendor?.logo || vendor?.image || vendor?.avatar || vendor?.logo_url;
  return toMediaUrl(path);
}

export function getUserAvatar(user) {
  const path = user?.avatar || user?.image || user?.photo || user?.avatar_url;
  return toMediaUrl(path);
}

// Export both as default for different import styles
export default toMediaUrl;