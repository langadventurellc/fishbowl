/**
 * TabContainerProps interface for component props.
 *
 * Defines all the properties that can be passed to TabContainer,
 * including tab configurations, state management, and customization options.
 *
 * @module types/ui/components/TabContainerProps
 */

import type { SettingsSubTab } from "../../../stores/settings/settingsSubTab";
import type { TabConfiguration } from "../../ui/settings/TabConfiguration";

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
  /** Currently active tab ID (optional when useStore=true) */
  activeTab?: SettingsSubTab;
  /** Callback fired when user changes tabs (optional when useStore=true) */
  onTabChange?: (tabId: SettingsSubTab) => void;
  /** Whether to use Zustand store for state management (default: true) */
  useStore?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Duration in milliseconds for content transitions (default: 200ms) */
  animationDuration?: number;
  /** Tab orientation for keyboard navigation (default: 'horizontal') */
  orientation?: "horizontal" | "vertical";
  /** Tab activation mode (default: 'automatic') */
  activationMode?: "automatic" | "manual";
  /** Whether tab navigation is disabled */
  disabled?: boolean;
}
