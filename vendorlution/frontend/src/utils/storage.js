// src/utils/storage.js
// Enhanced localStorage utilities with expiration and type safety

import { STORAGE_KEYS } from './constants';

class StorageService {
  constructor() {
    this.prefix = 'vendorlution_';
  }

  _getKey(key) {
    return `${this.prefix}${key}`;
  }

  // Basic storage operations
  get(key) {
    try {
      return localStorage.getItem(this._getKey(key));
    } catch (error) {
      console.warn('Storage get failed:', error);
      return null;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(this._getKey(key), String(value));
      return true;
    } catch (error) {
      console.warn('Storage set failed:', error);
      return false;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this._getKey(key));
      return true;
    } catch (error) {
      console.warn('Storage remove failed:', error);
      return false;
    }
  }

  clear() {
    try {
      // Only clear vendorlution items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.warn('Storage clear failed:', error);
      return false;
    }
  }

  // JSON operations
  getJSON(key, fallback = null) {
    try {
      const item = this.get(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.warn('Storage JSON parse failed:', error);
      return fallback;
    }
  }

  setJSON(key, data) {
    try {
      this.set(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn('Storage JSON stringify failed:', error);
      return false;
    }
  }

  // Storage with expiration
  setWithExpiry(key, value, ttlMs) {
    try {
      const item = {
        value,
        expiry: Date.now() + ttlMs,
      };
      this.setJSON(key, item);
      return true;
    } catch (error) {
      console.warn('Storage setWithExpiry failed:', error);
      return false;
    }
  }

  getWithExpiry(key) {
    try {
      const item = this.getJSON(key);
      if (!item) return null;
      
      if (Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.warn('Storage getWithExpiry failed:', error);
      return null;
    }
  }

  // Auth token management
  getAuthToken() {
    return this.get(STORAGE_KEYS.ACCESS_TOKEN);
  }

  setAuthToken(token) {
    return this.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  getRefreshToken() {
    return this.get(STORAGE_KEYS.REFRESH_TOKEN);
  }

  setRefreshToken(token) {
    return this.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  clearAuth() {
    this.remove(STORAGE_KEYS.ACCESS_TOKEN);
    this.remove(STORAGE_KEYS.REFRESH_TOKEN);
    this.remove(STORAGE_KEYS.USER_DATA);
    return true;
  }

  // User data management
  getUserData() {
    return this.getJSON(STORAGE_KEYS.USER_DATA);
  }

  setUserData(userData) {
    return this.setJSON(STORAGE_KEYS.USER_DATA, userData);
  }

  // Cart management
  getCartItems() {
    return this.getJSON(STORAGE_KEYS.CART_ITEMS, []);
  }

  setCartItems(items) {
    return this.setJSON(STORAGE_KEYS.CART_ITEMS, items);
  }

  clearCart() {
    return this.remove(STORAGE_KEYS.CART_ITEMS);
  }

  // Preferences
  getPreferences() {
    return this.getJSON(STORAGE_KEYS.PREFERENCES, {});
  }

  setPreferences(prefs) {
    return this.setJSON(STORAGE_KEYS.PREFERENCES, prefs);
  }

  // Recent searches
  getRecentSearches() {
    return this.getJSON(STORAGE_KEYS.RECENT_SEARCHES, []);
  }

  addRecentSearch(searchTerm, maxItems = 10) {
    const searches = this.getRecentSearches();
    const filtered = searches.filter(term => term !== searchTerm);
    const updated = [searchTerm, ...filtered].slice(0, maxItems);
    this.setJSON(STORAGE_KEYS.RECENT_SEARCHES, updated);
    return updated;
  }

  clearRecentSearches() {
    return this.remove(STORAGE_KEYS.RECENT_SEARCHES);
  }

  // Utility methods
  exists(key) {
    return this.get(key) !== null;
  }

  getKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    return keys;
  }

  getSize() {
    let total = 0;
    this.getKeys().forEach(key => {
      const value = this.get(key);
      total += key.length + (value ? value.length : 0);
    });
    return total;
  }
}

// Create singleton instance
export const storage = new StorageService();

// Legacy export for backward compatibility
export default storage;