/**
 * Storage Adapter Interface
 * Abstraction over storage implementations (localStorage, IndexedDB, API, etc.)
 */

export interface StorageAdapter {
  /**
   * Save data to storage
   */
  save(key: string, data: unknown): Promise<void>;

  /**
   * Load data from storage
   */
  load<T>(key: string): Promise<T | null>;

  /**
   * Remove data from storage
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all data from storage
   */
  clear(): Promise<void>;

  /**
   * Get all keys in storage
   */
  keys(): Promise<string[]>;
}
