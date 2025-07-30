/**
 * Configuration options for enhanced tab navigation.
 *
 * Defines all parameters needed to configure the useEnhancedTabNavigation hook
 * including tab data, event handlers, and navigation behavior options.
 *
 * @module types/hooks/EnhancedTabNavigationOptions
 */

import type { TabConfiguration } from "../settings/TabConfiguration";
// SettingsSubTab is now defined in stores - temporarily using string type
type SettingsSubTab = string;

/**
 * Configuration options for enhanced tab navigation.
 */
export interface EnhancedTabNavigationOptions {
  /** Array of tab configurations defining available tabs */
  tabs: TabConfiguration[];
  /** Currently active tab ID */
  activeTab: SettingsSubTab;
  /** Callback fired when user changes tabs */
  onTabChange: (tabId: SettingsSubTab) => void;
  /** Tab orientation for keyboard navigation (default: 'horizontal') */
  orientation?: "horizontal" | "vertical";
  /** Whether tab navigation is disabled */
  disabled?: boolean;
  /** Tab activation mode (default: 'automatic') */
  activationMode?: "automatic" | "manual";
}
