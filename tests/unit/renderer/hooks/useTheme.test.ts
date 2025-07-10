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
    it('should return effective theme when theme is light', () => {
      mockUseStore.mockReturnValue({
        theme: 'light',
        effectiveTheme: 'light',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');
      expect(result.current.setTheme).toBe(mockSetTheme);
      expect(result.current.toggleTheme).toBe(mockToggleTheme);
    });

    it('should return effective theme when theme is dark', () => {
      mockUseStore.mockReturnValue({
        theme: 'dark',
        effectiveTheme: 'dark',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
    });

    it('should return effective theme when theme is system', () => {
      mockUseStore.mockReturnValue({
        theme: 'system',
        effectiveTheme: 'dark', // System resolved to dark
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      // Should return effective theme for backward compatibility
      expect(result.current.theme).toBe('dark');
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
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');
    });

    it('should handle system theme with dark effective theme', () => {
      mockUseStore.mockReturnValue({
        theme: 'system',
        effectiveTheme: 'dark',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
    });
  });

  describe('Type Safety', () => {
    it('should maintain ThemeContextType interface compatibility', () => {
      mockUseStore.mockReturnValue({
        theme: 'light',
        effectiveTheme: 'light',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      // Verify the return type matches ThemeContextType
      expect(typeof result.current.theme).toBe('string');
      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.toggleTheme).toBe('function');

      // Verify only expected properties are present
      expect(Object.keys(result.current)).toEqual(['theme', 'setTheme', 'toggleTheme']);
    });
  });
});
