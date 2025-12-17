import type { StorageAdapter } from '../adapters/StorageAdapter';

/**
 * LocalStorage implementation of StorageAdapter
 * Provides async interface over localStorage for consistency with other storage implementations
 */
export class LocalStorageAdapter implements StorageAdapter {
  /**
   * Save data to localStorage
   */
  async save(key: string, data: unknown): Promise<void> {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(key, json);
    } catch (error) {
      throw new Error(`Failed to save data to localStorage: ${error}`);
    }
  }

  /**
   * Load data from localStorage
   */
  async load<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      
      if (item === null || item === '') {
        return null;
      }

      return JSON.parse(item) as T;
    } catch (error) {
      throw new Error(`Failed to load data from localStorage: ${error}`);
    }
  }

  /**
   * Remove data from localStorage
   */
  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  /**
   * Clear all data from localStorage
   */
  async clear(): Promise<void> {
    localStorage.clear();
  }

  /**
   * Get all keys in localStorage
   */
  async keys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }
    return keys.sort(); // Sort for consistency
  }
}
