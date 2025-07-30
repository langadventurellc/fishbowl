/**
 * Props for settings navigation component
 *
 * @module types/ui/components/SettingsNavigationProps
 */

import type { SettingsSection } from "../stores/settings/settingsSection";

export interface SettingsNavigationProps {
  activeSection?: SettingsSection;
  onSectionChange?: (section: SettingsSection) => void;
  className?: string;
  navigationId?: string; // New prop for ARIA relationships
}
