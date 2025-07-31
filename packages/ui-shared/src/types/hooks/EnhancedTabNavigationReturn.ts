/**
 * Return type for the enhanced tab navigation hook.
 *
 * Defines the interface returned by useEnhancedTabNavigation, including
 * event handlers, state accessors, and prop generators for tab elements.
 *
 * @module types/hooks/EnhancedTabNavigationReturn
 */

import type { KeyboardEvent } from "react";
import type { SettingsSubTab } from "../../stores/settings/settingsSubTab";

/**
 * Return type for the enhanced tab navigation hook.
 */
export interface EnhancedTabNavigationReturn {
  /** Keyboard event handler for tab navigation */
  handleTabKeyDown: (event: KeyboardEvent) => void;
  /** Currently focused tab index */
  focusedTabIndex: number;
  /** Set the focused tab index programmatically */
  setFocusedTabIndex: (index: number) => void;
  /** Get props for individual tab elements */
  getTabProps: (
    tabId: SettingsSubTab,
    index: number,
  ) => {
    tabIndex: number;
    "aria-selected": boolean;
    onKeyDown: (event: KeyboardEvent) => void;
    onFocus: () => void;
    id: string;
    "aria-controls": string;
  };
  /** Get props for tab content panels */
  getTabPanelProps: (tabId: SettingsSubTab) => {
    id: string;
    "aria-labelledby": string;
    tabIndex: number;
    role: string;
  };
}
