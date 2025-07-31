/**
 * Props for enhanced navigation list component
 *
 * @module types/ui/components/EnhancedNavigationListProps
 */

import type { SettingsSection } from "../../stores/settings/settingsSection";
import type { SettingsSubTab } from "../../stores/settings/settingsSubTab";

export interface EnhancedNavigationListProps {
  sections: readonly (
    | {
        readonly id: SettingsSection;
        readonly label: string;
        readonly hasSubTabs: false;
      }
    | {
        readonly id: SettingsSection;
        readonly label: string;
        readonly hasSubTabs: true;
        readonly subTabs: readonly {
          readonly id: SettingsSubTab;
          readonly label: string;
        }[];
      }
  )[];
  activeSection: SettingsSection;
  activeSubTab: SettingsSubTab;
  onSectionChange: (section: SettingsSection) => void;
  onSubTabChange: (tab: SettingsSubTab) => void;
  isCompact: boolean;
}
