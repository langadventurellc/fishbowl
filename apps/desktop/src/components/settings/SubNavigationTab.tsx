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
        "h-[var(--dt-sub-nav-item-height)] px-[var(--dt-nav-item-padding-horizontal)] rounded-[var(--dt-border-radius-small)]",
        "w-[calc(100%-4px)] justify-start", // Reduce width to account for focus ring overflow
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
          "border-l-[var(--dt-nav-sub-active-border)] border-l-primary", // Thinner border than main nav
          "pl-[calc(var(--dt-nav-item-padding-horizontal)-var(--dt-nav-sub-active-border))]", // Adjust padding for sub-nav border
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
