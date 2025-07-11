/**
 * Select all UI-related state and actions
 * Useful for components that need comprehensive UI access
 */

import type { AppState } from '../types';

export const selectUIState = (state: AppState) => ({
  sidebarCollapsed: state.sidebarCollapsed,
  activeModal: state.activeModal,
  windowDimensions: state.windowDimensions,
  layoutPreferences: state.layoutPreferences,
  setSidebarCollapsed: state.setSidebarCollapsed,
  toggleSidebar: state.toggleSidebar,
  setActiveModal: state.setActiveModal,
  setWindowDimensions: state.setWindowDimensions,
  setLayoutPreferences: state.setLayoutPreferences,
});
