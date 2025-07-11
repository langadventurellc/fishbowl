/**
 * Tests for useTheme hook integration with Zustand store
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTheme } from '../../../../src/renderer/hooks/useTheme.hook';
import { useStore } from '../../../../src/renderer/store';

// Mock the store
vi.mock('../../../../src/renderer/store', () => ({
  useStore: vi.fn(),
}));

const mockUseStore = useStore as unknown as ReturnType<typeof vi.fn>;

describe('useTheme Hook Integration', () => {
  const mockSetTheme = vi.fn();
  const mockToggleTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Integration', () => {
    it('should return complete theme state when theme is light', () => {
      mockUseStore.mockReturnValue({
        theme: 'light',
        effectiveTheme: 'light',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');
      expect(result.current.effectiveTheme).toBe('light');
      expect(result.current.setTheme).toBe(mockSetTheme);
      expect(result.current.toggleTheme).toBe(mockToggleTheme);
    });

    it('should return complete theme state when theme is dark', () => {
      mockUseStore.mockReturnValue({
        theme: 'dark',
        effectiveTheme: 'dark',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
      expect(result.current.effectiveTheme).toBe('dark');
    });

    it('should return complete theme state when theme is system', () => {
      mockUseStore.mockReturnValue({
        theme: 'system',
        effectiveTheme: 'dark', // System resolved to dark
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      // Should return both theme setting and effective theme
      expect(result.current.theme).toBe('system');
      expect(result.current.effectiveTheme).toBe('dark');
    });
  });

  describe('Action Integration', () => {
    it('should provide setTheme action from store', () => {
      mockUseStore.mockReturnValue({
        theme: 'light',
        effectiveTheme: 'light',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('should provide toggleTheme action from store', () => {
      mockUseStore.mockReturnValue({
        theme: 'light',
        effectiveTheme: 'light',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(mockToggleTheme).toHaveBeenCalled();
    });
  });

  describe('System Theme Handling', () => {
    it('should handle system theme with light effective theme', () => {
      mockUseStore.mockReturnValue({
        theme: 'system',
        effectiveTheme: 'light',
        systemTheme: 'light',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('system');
      expect(result.current.effectiveTheme).toBe('light');
      expect(result.current.systemTheme).toBe('light');
    });

    it('should handle system theme with dark effective theme', () => {
      mockUseStore.mockReturnValue({
        theme: 'system',
        effectiveTheme: 'dark',
        systemTheme: 'dark',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('system');
      expect(result.current.effectiveTheme).toBe('dark');
      expect(result.current.systemTheme).toBe('dark');
    });
  });

  describe('Type Safety', () => {
    it('should provide complete theme state interface', () => {
      mockUseStore.mockReturnValue({
        theme: 'light',
        effectiveTheme: 'light',
        systemTheme: 'light',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
        updateSystemTheme: vi.fn(),
      });

      const { result } = renderHook(() => useTheme());

      // Verify the return type includes all theme properties
      expect(typeof result.current.theme).toBe('string');
      expect(typeof result.current.effectiveTheme).toBe('string');
      expect(typeof result.current.systemTheme).toBe('string');
      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.toggleTheme).toBe('function');

      // Verify theme supports system option
      expect(['light', 'dark', 'system']).toContain(result.current.theme);
      expect(['light', 'dark']).toContain(result.current.effectiveTheme);
    });
  });
});
