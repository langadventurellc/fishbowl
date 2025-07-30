/**
 * Props for navigation item component
 *
 * @module types/ui/components/NavigationItemProps
 */

import React from "react";
import type { SettingsSection } from "../../../stores/settings";

export interface NavigationItemProps {
  /** Unique section identifier */
  id: SettingsSection;
  /** Display label for the navigation item */
  label: string;
  /** Whether this item is currently active */
  active: boolean;
  /** Click handler for section selection */
  onClick: () => void;
  /** Whether this section has sub-tabs */
  hasSubTabs?: boolean;
  /** Whether sub-navigation is expanded (for sections with sub-tabs) */
  isExpanded?: boolean;
  /** Whether to use compact styling for mobile */
  isCompact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Children for sub-navigation rendering */
  children?: React.ReactNode;
  /** Whether this item is focused for keyboard navigation */
  isFocused?: boolean;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
  /** Keyboard event handler for navigation */
  onKeyDown?: (event: React.KeyboardEvent) => void;
}
