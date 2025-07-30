/**
 * Configuration for tab sections in complex settings.
 *
 * @module types/ui/settings/TabSectionConfiguration
 */

import type { SettingsSubTab } from "../stores/settings/settingsSubTab";
import type { TabConfiguration } from "./TabConfiguration";

/**
 * Configuration for tab sections in complex settings.
 */
export interface TabSectionConfiguration {
  /** Section identifier */
  sectionId: string;
  /** Display name for the section */
  sectionLabel: string;
  /** Tab configurations for this section */
  tabs: TabConfiguration[];
  /** Default active tab for this section */
  defaultActiveTab: SettingsSubTab;
}
