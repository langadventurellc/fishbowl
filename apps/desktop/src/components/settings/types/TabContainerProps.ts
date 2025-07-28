/**
 * TabContainerProps interface for component props.
 *
 * Defines all the properties that can be passed to TabContainer,
 * including tab configurations, state management, and customization options.
 *
 * @module components/settings/types/TabContainerProps
 */

import type { SettingsSubTab } from "@fishbowl-ai/shared";
import type { TabConfiguration } from "./TabConfiguration";

/**
 * Props interface for the TabContainer component.
 *
 * Defines all the properties that can be passed to TabContainer,
 * including tab configurations, state management, and customization
 * options for consistent behavior across settings sections.
 */
export interface TabContainerProps {
  /** Array of tab configurations defining available tabs */
  tabs: TabConfiguration[];
  /** Currently active tab ID */
  activeTab: SettingsSubTab;
  /** Callback fired when user changes tabs */
  onTabChange: (tabId: SettingsSubTab) => void;
  /** Additional CSS classes for the container */
  className?: string;
  /** Duration in milliseconds for content transitions (default: 200ms) */
  animationDuration?: number;
}
