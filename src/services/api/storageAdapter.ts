/**
 * Storage Adapter
 * Abstracts storage operations to easily switch between localStorage, IndexedDB, or remote storage
 */

// Storage interface
export interface StorageInterface {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(prefix?: string): Promise<string[]>;
}

// Local Storage implementation
export class LocalStorageAdapter implements StorageInterface {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing data for key ${key}:`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      throw error;
    }
  }

  async getAllKeys(prefix?: string): Promise<string[]> {
    try {
      const keys = Object.keys(localStorage);
      return prefix ? keys.filter(key => key.startsWith(prefix)) : keys;
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  }
}

// API cache adapter
export class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private maxSize: number;
  private defaultTtl: number;

  constructor(maxSize: number = 100, defaultTtl: number = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache entry is expired
    if (Date.now() - cached.timestamp > this.defaultTtl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  set<T>(key: string, data: T): void {
    // Evict oldest entries if at max size
    if (this.cache.size >= this.maxSize) {
      const oldestKey = [...this.cache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  invalidate(keyPrefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Create and export singleton instances
export const storage = new LocalStorageAdapter();
export const apiCache = new ApiCache();
