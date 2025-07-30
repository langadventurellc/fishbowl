/**
 * Props for the enhanced InteractiveTabs component.
 *
 * @module types/ui/settings/InteractiveTabsProps
 */

import type { SettingsSubTab } from "../stores/settings/settingsSubTab";
import type { TabConfiguration } from "./TabConfiguration";

/**
 * Props for the enhanced InteractiveTabs component.
 */
export interface InteractiveTabsProps {
  /** Array of tab configurations */
  tabs: TabConfiguration[];
  /** Currently active tab ID */
  activeTab: SettingsSubTab;
  /** Handler for tab change events */
  onTabChange: (tabId: SettingsSubTab) => void;
  /** Additional CSS classes for root tabs container */
  className?: string;
  /** Whether to use compact styling for mobile */
  isCompact?: boolean;
  /** Default tab to activate if activeTab is null */
  defaultTab?: SettingsSubTab;
}
