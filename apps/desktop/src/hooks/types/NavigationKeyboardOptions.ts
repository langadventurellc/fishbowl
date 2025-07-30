import { SettingsSection, SettingsSubTab } from "@fishbowl-ai/ui-shared";
import type { SettingsNavigationSection } from "./SettingsNavigationSection";

/**
 * Options for settings navigation keyboard handling
 */
export interface NavigationKeyboardOptions {
  /** Array of navigation sections */
  sections: readonly SettingsNavigationSection[];
  /** Currently active section identifier */
  activeSection: SettingsSection;
  /** Currently active sub-tab identifier (null if none) */
  activeSubTab: SettingsSubTab;
  /** Callback when section changes */
  onSectionChange: (section: SettingsSection) => void;
  /** Callback when sub-tab changes */
  onSubTabChange: (subTab: SettingsSubTab) => void;
  /** Whether navigation is disabled */
  disabled?: boolean;
}
