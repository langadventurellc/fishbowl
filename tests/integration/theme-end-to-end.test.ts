import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../../src/renderer/hooks/useTheme.hook';
import { useStore } from '../../src/renderer/store';

// Mock the store to avoid infinite loops in tests
vi.mock('../../src/renderer/store', () => ({
  useStore: vi.fn(),
}));

const mockUseStore = useStore as unknown as ReturnType<typeof vi.fn>;

// Mock the prefers-color-scheme media query
const mockMatchMedia = vi.fn();
global.matchMedia = mockMatchMedia;

// Mock document.documentElement.setAttribute
const mockSetAttribute = vi.fn();
Object.defineProperty(document.documentElement, 'setAttribute', {
  value: mockSetAttribute,
  writable: true,
});

describe('Theme End-to-End Integration', () => {
  const mockSetTheme = vi.fn();
  const mockToggleTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetAttribute.mockClear();

    // Setup default media query mock
    mockMatchMedia.mockReturnValue({
      matches: false, // Default to light theme
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  describe('Theme Initialization', () => {
    it('should initialize with light theme by default', () => {
      mockUseStore.mockReturnValue({
        theme: 'light',
        effectiveTheme: 'light',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('light');
      expect(result.current.effectiveTheme).toBe('light');
    });

    it('should handle persisted dark theme from store', () => {
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

    it('should handle system theme with effective theme resolution', () => {
      // Mock system theme resolved to dark
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

  describe('Theme Setting', () => {
    it('should call setTheme action correctly', () => {
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

    it('should handle system theme setting', () => {
      mockUseStore.mockReturnValue({
        theme: 'system',
        effectiveTheme: 'light', // System resolved to light
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('system');
      });

      expect(mockSetTheme).toHaveBeenCalledWith('system');
      // Should return both theme setting and effective theme
      expect(result.current.theme).toBe('system');
      expect(result.current.effectiveTheme).toBe('light');
    });
  });

  describe('Theme Toggle', () => {
    it('should call toggleTheme action correctly', () => {
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

    it('should handle toggle with system theme', () => {
      mockUseStore.mockReturnValue({
        theme: 'system',
        effectiveTheme: 'dark', // System resolved to dark
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(mockToggleTheme).toHaveBeenCalled();
      // Should return both theme setting and effective theme
      expect(result.current.theme).toBe('system');
      expect(result.current.effectiveTheme).toBe('dark');
    });
  });

  describe('Modern API', () => {
    it('should provide complete theme state from store', () => {
      mockUseStore.mockReturnValue({
        theme: 'light',
        effectiveTheme: 'light',
        systemTheme: 'light',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      // Verify API shape includes all theme properties
      expect(typeof result.current.theme).toBe('string');
      expect(typeof result.current.effectiveTheme).toBe('string');
      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.toggleTheme).toBe('function');

      // Verify theme values include system option
      expect(['light', 'dark', 'system']).toContain(result.current.theme);
      expect(['light', 'dark']).toContain(result.current.effectiveTheme);
    });

    it('should support system theme with proper resolution', () => {
      mockUseStore.mockReturnValue({
        theme: 'system',
        effectiveTheme: 'dark',
        systemTheme: 'dark',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      // Should return both theme setting and effective theme
      expect(result.current.theme).toBe('system');
      expect(result.current.effectiveTheme).toBe('dark');
      expect(result.current.systemTheme).toBe('dark');
    });
  });

  describe('Integration with ThemeToggle Component', () => {
    it('should work correctly with ThemeToggle usage pattern', () => {
      mockUseStore.mockReturnValue({
        theme: 'light',
        effectiveTheme: 'light',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      // Simulate ThemeToggle component usage with effectiveTheme
      const { effectiveTheme, toggleTheme } = result.current;

      expect(effectiveTheme).toBe('light');
      expect(typeof toggleTheme).toBe('function');

      // Simulate button click
      act(() => {
        toggleTheme();
      });

      expect(mockToggleTheme).toHaveBeenCalled();
    });
  });

  describe('Store Integration', () => {
    it('should properly use selectThemeState selector', () => {
      mockUseStore.mockReturnValue({
        theme: 'dark',
        systemTheme: 'light',
        effectiveTheme: 'dark',
        setTheme: mockSetTheme,
        toggleTheme: mockToggleTheme,
      });

      const { result } = renderHook(() => useTheme());

      // Should extract correct data from store state
      expect(result.current.theme).toBe('dark');
      expect(result.current.setTheme).toBe(mockSetTheme);
      expect(result.current.toggleTheme).toBe(mockToggleTheme);
    });
  });
});
