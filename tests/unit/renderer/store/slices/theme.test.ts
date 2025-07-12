/**
 * Theme slice functionality tests
 *
 * Comprehensive tests for theme state management including:
 * - Theme setting and toggling
 * - System theme detection and following
 * - Document attribute application
 * - Theme selectors
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initializeStore, resetStore, useStore } from '../../../../../src/renderer/store/index';
import {
  selectEffectiveTheme,
  selectIsDarkTheme,
  selectIsLightTheme,
  selectIsSystemTheme,
  selectSystemTheme,
  selectTheme,
  selectThemeState,
} from '../../../../../src/renderer/store/selectors';

// Mock document.documentElement.setAttribute
const setAttributeMock = vi.fn();
Object.defineProperty(document.documentElement, 'setAttribute', {
  value: setAttributeMock,
  writable: true,
});

// Mock window.matchMedia for system theme detection
const createMatchMediaMock = (matches: boolean) => {
  const listeners: Array<(event: MediaQueryListEvent) => void> = [];

  return vi.fn().mockImplementation(query => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        listeners.push(listener);
      }
    }),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    // Helper to simulate theme change
    _triggerChange: (newMatches: boolean) => {
      listeners.forEach(listener => {
        listener({
          matches: newMatches,
          media: query,
        } as MediaQueryListEvent);
      });
    },
  }));
};

describe('Theme Slice', () => {
  let matchMediaMock: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    // Reset DOM attribute mock
    setAttributeMock.mockClear();

    // Reset localStorage
    localStorage.clear();

    // Reset store to default state
    resetStore();

    // Create fresh matchMedia mock
    matchMediaMock = createMatchMediaMock(false); // Default to light system theme
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Theme State Management', () => {
    it('should initialize with default theme (system)', () => {
      const state = useStore.getState();

      expect(state.theme).toBe('system');
      expect(state.systemTheme).toBe('light');
      expect(state.effectiveTheme).toBe('light');
    });

    it('should set theme to light', () => {
      const store = useStore.getState();

      store.setTheme('light');

      const state = useStore.getState();
      expect(state.theme).toBe('light');
      expect(state.effectiveTheme).toBe('light');
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('should set theme to dark', () => {
      const store = useStore.getState();

      store.setTheme('dark');

      const state = useStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.effectiveTheme).toBe('dark');
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should set theme to system and use system theme', () => {
      const store = useStore.getState();

      // Set system theme to dark first
      store.updateSystemTheme('dark');
      store.setTheme('system');

      const state = useStore.getState();
      expect(state.theme).toBe('system');
      expect(state.systemTheme).toBe('dark');
      expect(state.effectiveTheme).toBe('dark');
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });

  describe('Theme Toggle Functionality', () => {
    it('should toggle from light to dark', () => {
      const store = useStore.getState();
      store.setTheme('light');

      store.toggleTheme();

      const state = useStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.effectiveTheme).toBe('dark');
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should toggle from dark to light', () => {
      const store = useStore.getState();
      store.setTheme('dark');

      store.toggleTheme();

      const state = useStore.getState();
      expect(state.theme).toBe('light');
      expect(state.effectiveTheme).toBe('light');
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('should toggle from system to opposite of current system theme', () => {
      const store = useStore.getState();

      // Set system theme to light
      store.updateSystemTheme('light');
      store.setTheme('system');

      store.toggleTheme();

      const state = useStore.getState();
      expect(state.theme).toBe('dark'); // Should toggle to dark (opposite of light)
      expect(state.effectiveTheme).toBe('dark');
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should toggle from system (dark) to light', () => {
      const store = useStore.getState();

      // Set system theme to dark
      store.updateSystemTheme('dark');
      store.setTheme('system');

      store.toggleTheme();

      const state = useStore.getState();
      expect(state.theme).toBe('light'); // Should toggle to light (opposite of dark)
      expect(state.effectiveTheme).toBe('light');
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'light');
    });
  });

  describe('System Theme Detection', () => {
    it('should update system theme and effective theme when using system', () => {
      const store = useStore.getState();
      store.setTheme('system');

      store.updateSystemTheme('dark');

      const state = useStore.getState();
      expect(state.systemTheme).toBe('dark');
      expect(state.effectiveTheme).toBe('dark');
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should update system theme but not effective theme when not using system', () => {
      const store = useStore.getState();
      store.setTheme('light');

      store.updateSystemTheme('dark');

      const state = useStore.getState();
      expect(state.systemTheme).toBe('dark');
      expect(state.effectiveTheme).toBe('light'); // Should remain light
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('should initialize system theme detection on store initialization', () => {
      // Mock system theme as dark
      matchMediaMock = createMatchMediaMock(true);
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaMock,
      });

      void initializeStore();

      const state = useStore.getState();
      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(state.systemTheme).toBe('dark');
    });

    it('should respond to system theme changes', () => {
      const store = useStore.getState();
      store.setTheme('system');

      // Setup matchMedia mock to capture listeners
      const mediaQueryList = matchMediaMock('(prefers-color-scheme: dark)');

      void initializeStore();

      // Simulate system theme change to dark
      if (mediaQueryList._triggerChange) {
        mediaQueryList._triggerChange(true);
      }

      const state = useStore.getState();
      expect(state.systemTheme).toBe('dark');
      expect(state.effectiveTheme).toBe('dark');
    });
  });

  describe('Document Attribute Application', () => {
    it('should apply data-theme attribute when setting theme', () => {
      const store = useStore.getState();

      store.setTheme('dark');
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'dark');

      store.setTheme('light');
      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('should apply data-theme attribute when toggling theme', () => {
      const store = useStore.getState();
      store.setTheme('light');
      setAttributeMock.mockClear();

      store.toggleTheme();

      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should apply data-theme attribute when system theme changes', () => {
      const store = useStore.getState();
      store.setTheme('system');
      setAttributeMock.mockClear();

      store.updateSystemTheme('dark');

      expect(setAttributeMock).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });

  describe('Theme Selectors', () => {
    it('should select theme correctly', () => {
      const store = useStore.getState();
      store.setTheme('dark');

      const state = useStore.getState();
      expect(selectTheme(state)).toBe('dark');
    });

    it('should select system theme correctly', () => {
      const store = useStore.getState();
      store.updateSystemTheme('dark');

      const state = useStore.getState();
      expect(selectSystemTheme(state)).toBe('dark');
    });

    it('should select effective theme correctly', () => {
      const store = useStore.getState();
      store.setTheme('dark');

      const state = useStore.getState();
      expect(selectEffectiveTheme(state)).toBe('dark');
    });

    it('should select isSystemTheme correctly', () => {
      const store = useStore.getState();

      store.setTheme('system');
      let state = useStore.getState();
      expect(selectIsSystemTheme(state)).toBe(true);

      store.setTheme('dark');
      state = useStore.getState();
      expect(selectIsSystemTheme(state)).toBe(false);
    });

    it('should select isDarkTheme correctly', () => {
      const store = useStore.getState();

      store.setTheme('dark');
      let state = useStore.getState();
      expect(selectIsDarkTheme(state)).toBe(true);

      store.setTheme('light');
      state = useStore.getState();
      expect(selectIsDarkTheme(state)).toBe(false);
    });

    it('should select isLightTheme correctly', () => {
      const store = useStore.getState();

      store.setTheme('light');
      let state = useStore.getState();
      expect(selectIsLightTheme(state)).toBe(true);

      store.setTheme('dark');
      state = useStore.getState();
      expect(selectIsLightTheme(state)).toBe(false);
    });

    it('should select complete theme state correctly', () => {
      const store = useStore.getState();
      store.setTheme('dark');
      store.updateSystemTheme('light');

      const state = useStore.getState();
      const themeState = selectThemeState(state);

      expect(themeState.theme).toBe('dark');
      expect(themeState.systemTheme).toBe('light');
      expect(themeState.effectiveTheme).toBe('dark');
      expect(themeState.isSystemTheme).toBe(false);
      expect(themeState.isDarkTheme).toBe(true);
      expect(themeState.isLightTheme).toBe(false);
      expect(typeof themeState.setTheme).toBe('function');
      expect(typeof themeState.toggleTheme).toBe('function');
      expect(typeof themeState.updateSystemTheme).toBe('function');
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme changes to localStorage', () => {
      const store = useStore.getState();

      store.setTheme('dark');

      // Check localStorage
      const persistedData = localStorage.getItem('fishbowl-store');
      expect(persistedData).toBeTruthy();

      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        expect(parsed.state.theme).toBe('dark');
        expect(parsed.state.effectiveTheme).toBe('dark');
      }
    });

    it('should persist system theme updates to localStorage', () => {
      const store = useStore.getState();

      store.updateSystemTheme('dark');

      // Check localStorage
      const persistedData = localStorage.getItem('fishbowl-store');
      expect(persistedData).toBeTruthy();

      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        expect(parsed.state.systemTheme).toBe('dark');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid theme changes', () => {
      const store = useStore.getState();

      // Rapid theme changes
      store.setTheme('dark');
      store.setTheme('light');
      store.setTheme('system');
      store.toggleTheme();

      const state = useStore.getState();
      // Should end with a non-system theme due to toggle
      expect(['light', 'dark']).toContain(state.theme);
      expect(['light', 'dark']).toContain(state.effectiveTheme);
    });

    it('should handle system theme updates during system mode', () => {
      const store = useStore.getState();
      store.setTheme('system');

      // Multiple system theme updates
      store.updateSystemTheme('dark');
      store.updateSystemTheme('light');
      store.updateSystemTheme('dark');

      const state = useStore.getState();
      expect(state.theme).toBe('system');
      expect(state.systemTheme).toBe('dark');
      expect(state.effectiveTheme).toBe('dark');
    });

    it('should maintain theme consistency across store operations', () => {
      const store = useStore.getState();

      // Set initial state
      store.setTheme('dark');
      store.updateSystemTheme('light');

      // Get initial state
      const initialState = useStore.getState();

      // Perform non-theme operations (shouldn't affect theme)
      store.setSidebarCollapsed(true);
      store.setActiveModal('settings');

      // Theme state should remain unchanged
      const finalState = useStore.getState();
      expect(finalState.theme).toBe(initialState.theme);
      expect(finalState.systemTheme).toBe(initialState.systemTheme);
      expect(finalState.effectiveTheme).toBe(initialState.effectiveTheme);
    });
  });
});
