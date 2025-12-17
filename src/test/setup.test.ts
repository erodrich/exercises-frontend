import { describe, it, expect } from 'vitest';

describe('Test Setup', () => {
  it('should run basic assertions', () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
  });

  it('should have access to jsdom', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });

  it('should have localStorage mock', () => {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
    localStorage.clear();
    expect(localStorage.getItem('test')).toBeNull();
  });

  it('should have clipboard mock', () => {
    expect(navigator.clipboard).toBeDefined();
    expect(typeof navigator.clipboard.writeText).toBe('function');
  });

  it('should have window.alert mock', () => {
    expect(() => window.alert('test')).not.toThrow();
  });
});
