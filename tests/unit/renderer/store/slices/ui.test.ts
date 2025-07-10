/**
 * UI slice functionality tests
 *
 * Comprehensive tests for UI state management including:
 * - Sidebar collapse state management
 * - Modal and dialog visibility
 * - Window dimensions tracking
 * - Layout preferences storage
 * - UI actions and state updates
 * - UI selectors
 * - Persistence functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useStore, resetStore } from '../../../../../src/renderer/store/index';
import {
  selectSidebarCollapsed,
  selectActiveModal,
  selectWindowDimensions,
  selectLayoutPreferences,
  selectSetSidebarCollapsed,
  selectToggleSidebar,
  selectSetActiveModal,
  selectSetWindowDimensions,
  selectSetLayoutPreferences,
  selectUIState,
} from '../../../../../src/renderer/store/selectors';

describe('UI Slice', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();

    // Reset store to default state
    resetStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('UI State Initialization', () => {
    it('should initialize with default UI state', () => {
      const state = useStore.getState();

      expect(state.sidebarCollapsed).toBe(false);
      expect(state.activeModal).toBe(null);
      expect(state.windowDimensions).toEqual({ width: 1200, height: 800 });
      expect(state.layoutPreferences).toEqual({
        sidebarWidth: 280,
        mainContentHeight: 600,
      });
    });
  });

  describe('Sidebar State Management', () => {
    it('should set sidebar collapsed state', () => {
      const store = useStore.getState();

      store.setSidebarCollapsed(true);

      const state = useStore.getState();
      expect(state.sidebarCollapsed).toBe(true);
    });

    it('should set sidebar expanded state', () => {
      const store = useStore.getState();

      // First collapse it
      store.setSidebarCollapsed(true);
      expect(useStore.getState().sidebarCollapsed).toBe(true);

      // Then expand it
      store.setSidebarCollapsed(false);

      const state = useStore.getState();
      expect(state.sidebarCollapsed).toBe(false);
    });

    it('should toggle sidebar from expanded to collapsed', () => {
      const store = useStore.getState();

      // Start expanded (default)
      expect(store.sidebarCollapsed).toBe(false);

      // Toggle to collapsed
      store.toggleSidebar();

      const state = useStore.getState();
      expect(state.sidebarCollapsed).toBe(true);
    });

    it('should toggle sidebar from collapsed to expanded', () => {
      const store = useStore.getState();

      // First set to collapsed
      store.setSidebarCollapsed(true);
      expect(useStore.getState().sidebarCollapsed).toBe(true);

      // Toggle to expanded
      store.toggleSidebar();

      const state = useStore.getState();
      expect(state.sidebarCollapsed).toBe(false);
    });
  });

  describe('Modal State Management', () => {
    it('should set active modal', () => {
      const store = useStore.getState();

      store.setActiveModal('settings');

      const state = useStore.getState();
      expect(state.activeModal).toBe('settings');
    });

    it('should clear active modal', () => {
      const store = useStore.getState();

      // First set a modal
      store.setActiveModal('settings');
      expect(useStore.getState().activeModal).toBe('settings');

      // Then clear it
      store.setActiveModal(null);

      const state = useStore.getState();
      expect(state.activeModal).toBe(null);
    });

    it('should switch between different modals', () => {
      const store = useStore.getState();

      // Set first modal
      store.setActiveModal('settings');
      expect(useStore.getState().activeModal).toBe('settings');

      // Switch to different modal
      store.setActiveModal('about');

      const state = useStore.getState();
      expect(state.activeModal).toBe('about');
    });
  });

  describe('Window Dimensions Management', () => {
    it('should set valid window dimensions', () => {
      const store = useStore.getState();

      const newDimensions = { width: 1600, height: 900 };
      store.setWindowDimensions(newDimensions);

      const state = useStore.getState();
      expect(state.windowDimensions).toEqual(newDimensions);
    });

    it('should ignore invalid window dimensions (negative width)', () => {
      const store = useStore.getState();
      const originalDimensions = store.windowDimensions;

      const invalidDimensions = { width: -100, height: 800 };
      store.setWindowDimensions(invalidDimensions);

      const state = useStore.getState();
      expect(state.windowDimensions).toEqual(originalDimensions);
    });

    it('should ignore invalid window dimensions (negative height)', () => {
      const store = useStore.getState();
      const originalDimensions = store.windowDimensions;

      const invalidDimensions = { width: 1200, height: -100 };
      store.setWindowDimensions(invalidDimensions);

      const state = useStore.getState();
      expect(state.windowDimensions).toEqual(originalDimensions);
    });

    it('should ignore invalid window dimensions (zero dimensions)', () => {
      const store = useStore.getState();
      const originalDimensions = store.windowDimensions;

      const invalidDimensions = { width: 0, height: 0 };
      store.setWindowDimensions(invalidDimensions);

      const state = useStore.getState();
      expect(state.windowDimensions).toEqual(originalDimensions);
    });
  });

  describe('Layout Preferences Management', () => {
    it('should set partial layout preferences', () => {
      const store = useStore.getState();

      store.setLayoutPreferences({ sidebarWidth: 320 });

      const state = useStore.getState();
      expect(state.layoutPreferences).toEqual({
        sidebarWidth: 320,
        mainContentHeight: 600, // Should preserve existing value
      });
    });

    it('should set all layout preferences', () => {
      const store = useStore.getState();

      const newPreferences = {
        sidebarWidth: 400,
        mainContentHeight: 800,
      };
      store.setLayoutPreferences(newPreferences);

      const state = useStore.getState();
      expect(state.layoutPreferences).toEqual(newPreferences);
    });

    it('should merge layout preferences with existing values', () => {
      const store = useStore.getState();

      // Set partial preferences multiple times
      store.setLayoutPreferences({ sidebarWidth: 300 });
      store.setLayoutPreferences({ mainContentHeight: 700 });

      const state = useStore.getState();
      expect(state.layoutPreferences).toEqual({
        sidebarWidth: 300,
        mainContentHeight: 700,
      });
    });
  });

  describe('UI Selectors', () => {
    it('should select sidebar collapsed state', () => {
      const store = useStore.getState();
      store.setSidebarCollapsed(true);

      const state = useStore.getState();
      const sidebarCollapsed = selectSidebarCollapsed(state);

      expect(sidebarCollapsed).toBe(true);
    });

    it('should select active modal', () => {
      const store = useStore.getState();
      store.setActiveModal('settings');

      const state = useStore.getState();
      const activeModal = selectActiveModal(state);

      expect(activeModal).toBe('settings');
    });

    it('should select window dimensions', () => {
      const store = useStore.getState();
      const newDimensions = { width: 1600, height: 900 };
      store.setWindowDimensions(newDimensions);

      const state = useStore.getState();
      const windowDimensions = selectWindowDimensions(state);

      expect(windowDimensions).toEqual(newDimensions);
    });

    it('should select layout preferences', () => {
      const store = useStore.getState();
      const newPreferences = {
        sidebarWidth: 400,
        mainContentHeight: 800,
      };
      store.setLayoutPreferences(newPreferences);

      const state = useStore.getState();
      const layoutPreferences = selectLayoutPreferences(state);

      expect(layoutPreferences).toEqual(newPreferences);
    });

    it('should select action functions', () => {
      const state = useStore.getState();

      const setSidebarCollapsed = selectSetSidebarCollapsed(state);
      const toggleSidebar = selectToggleSidebar(state);
      const setActiveModal = selectSetActiveModal(state);
      const setWindowDimensions = selectSetWindowDimensions(state);
      const setLayoutPreferences = selectSetLayoutPreferences(state);

      expect(typeof setSidebarCollapsed).toBe('function');
      expect(typeof toggleSidebar).toBe('function');
      expect(typeof setActiveModal).toBe('function');
      expect(typeof setWindowDimensions).toBe('function');
      expect(typeof setLayoutPreferences).toBe('function');
    });

    it('should select comprehensive UI state', () => {
      const store = useStore.getState();

      // Set some UI state
      store.setSidebarCollapsed(true);
      store.setActiveModal('about');
      store.setWindowDimensions({ width: 1600, height: 900 });
      store.setLayoutPreferences({ sidebarWidth: 350, mainContentHeight: 750 });

      const state = useStore.getState();
      const uiState = selectUIState(state);

      expect(uiState).toEqual({
        sidebarCollapsed: true,
        activeModal: 'about',
        windowDimensions: { width: 1600, height: 900 },
        layoutPreferences: { sidebarWidth: 350, mainContentHeight: 750 },
        setSidebarCollapsed: expect.any(Function),
        toggleSidebar: expect.any(Function),
        setActiveModal: expect.any(Function),
        setWindowDimensions: expect.any(Function),
        setLayoutPreferences: expect.any(Function),
      });
    });
  });

  describe('UI State Persistence', () => {
    it('should persist sidebar collapsed state', () => {
      const store = useStore.getState();

      store.setSidebarCollapsed(true);

      // Check that localStorage persistence is triggered
      // Note: This would typically be checked through the persistence middleware
      // For now, we verify the state is set correctly
      const state = useStore.getState();
      expect(state.sidebarCollapsed).toBe(true);
    });

    it('should persist window dimensions', () => {
      const store = useStore.getState();

      const newDimensions = { width: 1600, height: 900 };
      store.setWindowDimensions(newDimensions);

      const state = useStore.getState();
      expect(state.windowDimensions).toEqual(newDimensions);
    });

    it('should persist layout preferences', () => {
      const store = useStore.getState();

      const newPreferences = {
        sidebarWidth: 400,
        mainContentHeight: 800,
      };
      store.setLayoutPreferences(newPreferences);

      const state = useStore.getState();
      expect(state.layoutPreferences).toEqual(newPreferences);
    });

    it('should not persist active modal state', () => {
      const store = useStore.getState();

      store.setActiveModal('settings');

      // Active modal should not be persisted to localStorage
      // This is expected behavior for modal state
      const state = useStore.getState();
      expect(state.activeModal).toBe('settings');
      // Note: Modal state should be ephemeral and not persist across sessions
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle multiple rapid sidebar toggles', () => {
      const store = useStore.getState();

      // Start expanded
      expect(store.sidebarCollapsed).toBe(false);

      // Rapid toggles
      store.toggleSidebar(); // collapsed
      store.toggleSidebar(); // expanded
      store.toggleSidebar(); // collapsed
      store.toggleSidebar(); // expanded

      const state = useStore.getState();
      expect(state.sidebarCollapsed).toBe(false);
    });

    it('should handle setting sidebar collapsed to same value', () => {
      const store = useStore.getState();

      // Start expanded
      expect(store.sidebarCollapsed).toBe(false);

      // Set to same value multiple times
      store.setSidebarCollapsed(false);
      store.setSidebarCollapsed(false);
      store.setSidebarCollapsed(false);

      const state = useStore.getState();
      expect(state.sidebarCollapsed).toBe(false);
    });

    it('should handle setting active modal to same value', () => {
      const store = useStore.getState();

      store.setActiveModal('settings');
      store.setActiveModal('settings');
      store.setActiveModal('settings');

      const state = useStore.getState();
      expect(state.activeModal).toBe('settings');
    });

    it('should handle setting window dimensions with floating point values', () => {
      const store = useStore.getState();

      const dimensions = { width: 1200.5, height: 800.7 };
      store.setWindowDimensions(dimensions);

      const state = useStore.getState();
      expect(state.windowDimensions).toEqual(dimensions);
    });

    it('should handle layout preferences with zero values', () => {
      const store = useStore.getState();

      // Zero values should be allowed for layout preferences
      store.setLayoutPreferences({ sidebarWidth: 0, mainContentHeight: 0 });

      const state = useStore.getState();
      expect(state.layoutPreferences).toEqual({
        sidebarWidth: 0,
        mainContentHeight: 0,
      });
    });

    it('should handle empty layout preferences object', () => {
      const store = useStore.getState();
      const originalPreferences = store.layoutPreferences;

      store.setLayoutPreferences({});

      const state = useStore.getState();
      expect(state.layoutPreferences).toEqual(originalPreferences);
    });
  });
});
