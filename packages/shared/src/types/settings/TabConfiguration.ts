/**
 * Configuration for a single tab in the interactive tab system.
 *
 * @module types/settings/TabConfiguration
 */

import type { ComponentType } from "react";
import type { SettingsSubTab } from "../../stores/settings/settingsSubTab";

/**
 * Configuration for a single tab in the interactive tab system.
 */
export interface TabConfiguration {
  /** Unique identifier matching SettingsSubTab values */
  id: SettingsSubTab;
  /** Display label for the tab trigger */
  label: string;
  /** Content component to render when tab is active */
  content: ComponentType;
  /** Whether this tab is disabled */
  disabled?: boolean;
  /** Additional CSS classes for tab trigger */
  className?: string;
  /** Icon component to display alongside label */
  icon?: ComponentType;
  /** Custom ARIA label for accessibility (overrides label) */
  ariaLabel?: string;
}
