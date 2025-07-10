/**
 * UI slice for Zustand store
 *
 * Manages UI-related state including:
 * - Sidebar collapse state
 * - Modal and dialog visibility
 * - Window dimensions tracking
 * - Layout preferences
 * - General UI state management
 */

import type { StoreSlice, UISlice } from '../types';

/**
 * UI slice default values
 */
const defaultSidebarCollapsed = false;
const defaultWindowDimensions = { width: 1200, height: 800 };
const defaultLayoutPreferences = {
  sidebarWidth: 280,
  mainContentHeight: 600,
};

/**
 * Create UI slice with all UI-related state and actions
 */
export const createUISlice: StoreSlice<UISlice> = (set, _get) => ({
  // UI state
  sidebarCollapsed: defaultSidebarCollapsed,
  activeModal: null,
  windowDimensions: defaultWindowDimensions,
  layoutPreferences: defaultLayoutPreferences,

  // Sidebar actions
  setSidebarCollapsed: (collapsed: boolean) => {
    set(state => {
      state.sidebarCollapsed = collapsed;
    });
  },

  toggleSidebar: () => {
    set(state => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    });
  },

  // Modal actions
  setActiveModal: (modal: string | null) => {
    set(state => {
      state.activeModal = modal;
    });
  },

  // Window dimensions actions
  setWindowDimensions: (dimensions: { width: number; height: number }) => {
    set(state => {
      // Validate dimensions
      if (dimensions.width > 0 && dimensions.height > 0) {
        state.windowDimensions = dimensions;
      }
    });
  },

  // Layout preferences actions
  setLayoutPreferences: (preferences: Partial<UISlice['layoutPreferences']>) => {
    set(state => {
      state.layoutPreferences = {
        ...state.layoutPreferences,
        ...preferences,
      };
    });
  },
});
