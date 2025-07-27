import type { SettingsSection, SettingsSubTab } from "@fishbowl-ai/shared";

/**
 * Navigation section structure compatible with settings modal
 */
export interface SettingsNavigationSection {
  /** Unique section identifier */
  readonly id: SettingsSection;
  /** Display label for the section */
  readonly label: string;
  /** Whether this section has sub-tabs */
  readonly hasSubTabs: boolean;
  /** Array of sub-tabs if hasSubTabs is true */
  readonly subTabs?: readonly {
    readonly id: SettingsSubTab;
    readonly label: string;
  }[];
}
