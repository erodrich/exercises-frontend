import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageAdapter } from './localStorageAdapter';
import { createExerciseLogEntry } from '../../test/factories';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('save', () => {
    it('should save data to localStorage', async () => {
      const data = { test: 'value' };
      
      await adapter.save('test-key', data);
      
      const stored = localStorage.getItem('test-key');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(data);
    });

    it('should save complex objects', async () => {
      const entry = createExerciseLogEntry();
      
      await adapter.save('exercise', entry);
      
      const stored = localStorage.getItem('exercise');
      expect(JSON.parse(stored!)).toEqual(entry);
    });

    it('should overwrite existing data', async () => {
      await adapter.save('key', { value: 1 });
      await adapter.save('key', { value: 2 });
      
      const data = await adapter.load('key');
      expect(data).toEqual({ value: 2 });
    });

    it('should handle special characters in key', async () => {
      await adapter.save('key:with:colons', { test: true });
      
      const data = await adapter.load('key:with:colons');
      expect(data).toEqual({ test: true });
    });

    it('should throw error for invalid JSON', async () => {
      const circular: any = {};
      circular.self = circular;
      
      await expect(adapter.save('circular', circular)).rejects.toThrow();
    });
  });

  describe('load', () => {
    it('should load data from localStorage', async () => {
      const data = { test: 'value' };
      localStorage.setItem('test-key', JSON.stringify(data));
      
      const loaded = await adapter.load('test-key');
      
      expect(loaded).toEqual(data);
    });

    it('should return null for non-existent key', async () => {
      const loaded = await adapter.load('non-existent');
      
      expect(loaded).toBeNull();
    });

    it('should handle corrupted data', async () => {
      localStorage.setItem('corrupted', 'invalid json{]');
      
      await expect(adapter.load('corrupted')).rejects.toThrow();
    });

    it('should handle empty string', async () => {
      localStorage.setItem('empty', '');
      
      const loaded = await adapter.load('empty');
      expect(loaded).toBeNull();
    });

    it('should load complex types correctly', async () => {
      const entry = createExerciseLogEntry();
      localStorage.setItem('exercise', JSON.stringify(entry));
      
      const loaded = await adapter.load('exercise');
      expect(loaded).toEqual(entry);
    });
  });

  describe('remove', () => {
    it('should remove data from localStorage', async () => {
      localStorage.setItem('test', JSON.stringify({ value: 1 }));
      
      await adapter.remove('test');
      
      expect(localStorage.getItem('test')).toBeNull();
    });

    it('should not throw when removing non-existent key', async () => {
      await expect(adapter.remove('non-existent')).resolves.not.toThrow();
    });

    it('should only remove specified key', async () => {
      localStorage.setItem('keep', JSON.stringify({ value: 1 }));
      localStorage.setItem('remove', JSON.stringify({ value: 2 }));
      
      await adapter.remove('remove');
      
      expect(localStorage.getItem('keep')).toBeTruthy();
      expect(localStorage.getItem('remove')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all data from localStorage', async () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      
      await adapter.clear();
      
      expect(localStorage.length).toBe(0);
    });

    it('should not throw when clearing empty storage', async () => {
      await expect(adapter.clear()).resolves.not.toThrow();
    });
  });

  describe('keys', () => {
    it('should return all keys in localStorage', async () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');
      
      const keys = await adapter.keys();
      
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should return empty array for empty storage', async () => {
      const keys = await adapter.keys();
      
      expect(keys).toEqual([]);
    });

    it('should return keys in order', async () => {
      localStorage.setItem('a', '1');
      localStorage.setItem('b', '2');
      localStorage.setItem('c', '3');
      
      const keys = await adapter.keys();
      
      expect(keys).toEqual(['a', 'b', 'c']);
    });
  });

  describe('integration', () => {
    it('should handle full CRUD cycle', async () => {
      const data = createExerciseLogEntry();
      
      // Create
      await adapter.save('exercise', data);
      expect(await adapter.load('exercise')).toEqual(data);
      
      // Update
      const updated = { ...data, failure: true };
      await adapter.save('exercise', updated);
      expect(await adapter.load('exercise')).toEqual(updated);
      
      // Delete
      await adapter.remove('exercise');
      expect(await adapter.load('exercise')).toBeNull();
    });

    it('should handle multiple items', async () => {
      await adapter.save('ex1', createExerciseLogEntry());
      await adapter.save('ex2', createExerciseLogEntry());
      await adapter.save('ex3', createExerciseLogEntry());
      
      const keys = await adapter.keys();
      expect(keys).toHaveLength(3);
      
      await adapter.remove('ex2');
      expect(await adapter.keys()).toHaveLength(2);
      
      await adapter.clear();
      expect(await adapter.keys()).toHaveLength(0);
    });
  });
});
