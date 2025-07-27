/**
 * SubNavigationTab component for sub-tabs within navigation sections.
 *
 * Features:
 * - Smaller styling appropriate for sub-level navigation
 * - Consistent interactive states with main navigation
 * - Proper indentation and visual hierarchy
 * - Accessibility support with ARIA attributes
 * - Smooth hover and active state transitions
 *
 * @module components/settings/SubNavigationTab
 */

import React from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import type { SettingsSubTab } from "@fishbowl-ai/shared";

interface SubNavigationTabProps {
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
}

export function SubNavigationTab({
  id,
  label,
  active,
  onClick,
  isCompact = false,
  className,
}: SubNavigationTabProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        // Smaller dimensions for sub-level navigation
        "h-[32px] px-3 rounded-[4px]",
        "w-full justify-start",
        // Smaller text for visual hierarchy
        isCompact ? "text-xs" : "text-sm",
        "font-normal", // Less emphasis than main navigation
        // Base state: subtle styling for sub-level
        "bg-transparent text-muted-foreground",
        // Hover state: light background tint
        "hover:bg-accent/60 hover:text-accent-foreground",
        "transition-all duration-200 ease-in-out",
        // Focus state: keyboard focus indicators
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Active state: more prominent styling with left border
        active && [
          "bg-accent/80 text-accent-foreground",
          "border-l-[2px] border-l-primary", // Thinner border than main nav
          "pl-[10px]", // Adjust padding for 2px border (12px - 2px = 10px)
          "font-medium", // More emphasis when active
        ],
        className,
      )}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      role="tab"
      aria-selected={active}
      data-subtab-id={id}
    >
      {label}
    </Button>
  );
}
