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

import type { SubNavigationTabProps } from "@fishbowl-ai/shared";
import React from "react";
import { cn } from "../../lib/utils";
import { COMMON_FOCUS_CLASSES, getNavigationFocus } from "../../styles/focus";
import { Button } from "../ui/button";

export const SubNavigationTab = React.forwardRef<
  HTMLButtonElement,
  SubNavigationTabProps
>(function SubNavigationTab(
  {
    id,
    label,
    active,
    onClick,
    isCompact = false,
    className,
    isFocused = false,
    tabIndex,
    onKeyDown,
  },
  ref,
) {
  return (
    <Button
      ref={ref}
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
        // Enhanced focus indicators for accessibility and keyboard navigation
        COMMON_FOCUS_CLASSES.removeOutline,
        COMMON_FOCUS_CLASSES.backgroundOffset,
        COMMON_FOCUS_CLASSES.transition,
        getNavigationFocus(active),
        // Enhanced focus state for keyboard navigation with tighter offset for sub-tabs
        isFocused && "ring-accent ring-offset-1",
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
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      aria-current={active ? "page" : undefined}
      role="tab"
      aria-selected={active}
      data-subtab-id={id}
    >
      {label}
    </Button>
  );
});
