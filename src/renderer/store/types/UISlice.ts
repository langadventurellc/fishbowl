/**
 * UI slice state definition
 */

export interface UISlice {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  windowDimensions: {
    width: number;
    height: number;
  };
  layoutPreferences: {
    sidebarWidth: number;
    mainContentHeight: number;
  };
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setActiveModal: (modal: string | null) => void;
  setWindowDimensions: (dimensions: { width: number; height: number }) => void;
  setLayoutPreferences: (preferences: Partial<UISlice['layoutPreferences']>) => void;
}
