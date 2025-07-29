/**
 * Props for sub-navigation tab component
 *
 * @module types/ui/components/SubNavigationTabProps
 */

import React from "react";
import type { SettingsSubTab } from "../../../stores/settings";

export interface SubNavigationTabProps {
  /** Unique sub-tab identifier */
  id: SettingsSubTab;
  /** Display label for the sub-tab */
  label: string;
  /** Whether this sub-tab is currently active */
  active: boolean;
  /** Click handler for sub-tab selection */
  onClick: () => void;
  /** Whether to use compact styling for mobile */
  isCompact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether this item is focused for keyboard navigation */
  isFocused?: boolean;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
  /** Keyboard event handler for navigation */
  onKeyDown?: (event: React.KeyboardEvent) => void;
}
