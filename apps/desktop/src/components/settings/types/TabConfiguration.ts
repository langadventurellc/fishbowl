/**
 * TabConfiguration interface for tab definition.
 *
 * Defines the structure for individual tabs within the TabContainer,
 * including identity, display properties, and content component.
 *
 * @module components/settings/types/TabConfiguration
 */

import React from "react";
import type { SettingsSubTab } from "@fishbowl-ai/shared";

/**
 * Configuration object for individual tabs within the TabContainer.
 *
 * Defines the structure for each tab including its identity, display
 * properties, and content component. Used to create consistent tab
 * configurations across different settings sections.
 */
export interface TabConfiguration {
  /** Unique identifier for the tab, matching SettingsSubTab types */
  id: SettingsSubTab;
  /** Display label shown in the tab trigger */
  label: string;
  /** React component to render as tab content */
  content: React.ComponentType;
  /** Whether the tab is disabled and non-interactive */
  disabled?: boolean;
  /** Custom ARIA label for accessibility (overrides label) */
  ariaLabel?: string;
}
