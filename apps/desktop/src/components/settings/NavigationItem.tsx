/**
 * NavigationItem component with exact specifications for the settings modal.
 *
 * Features:
 * - Exact 40px height with 12px horizontal padding
 * - 4px border radius for each item
 * - Interactive states: default, hover, active (with 3px left accent border), focus
 * - Support for sub-navigation with expandable chevron indicator
 * - Accessibility features with proper ARIA attributes
 * - Smooth transitions for all state changes
 *
 * @module components/settings/NavigationItem
 */

import type { NavigationItemProps } from "@fishbowl-ai/ui-shared";
import { ChevronDown, ChevronRight } from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils";
import { COMMON_FOCUS_CLASSES, getNavigationFocus } from "../../styles/focus";
import { Button } from "../ui/button";

export const NavigationItem = React.forwardRef<
  HTMLButtonElement,
  NavigationItemProps
>(function NavigationItem(
  {
    id,
    label,
    active,
    onClick,
    hasSubTabs = false,
    isExpanded = false,
    isCompact = false,
    className,
    children,
    isFocused = false,
    tabIndex,
    onKeyDown,
  },
  ref,
) {
  return (
    <div className={cn("space-y-1", className)}>
      <Button
        ref={ref}
        variant="ghost"
        className={cn(
          // Exact specifications: 40px height, 12px horizontal padding, 4px border radius
          "h-[var(--dt-nav-item-height)] px-[var(--dt-nav-item-padding-horizontal)] rounded-[var(--dt-border-radius-small)]",
          "w-full justify-start items-center",
          // Text styling
          isCompact ? "text-xs" : "text-sm",
          "font-medium",
          // Base state: no background, standard text color
          "bg-transparent text-foreground",
          // Hover state: light background tint with smooth transition
          "hover:bg-accent/80 hover:text-accent-foreground",
          // Enhanced focus indicators for accessibility and keyboard navigation
          COMMON_FOCUS_CLASSES.removeOutline,
          COMMON_FOCUS_CLASSES.backgroundOffset,
          COMMON_FOCUS_CLASSES.transition,
          getNavigationFocus(active),
          // Enhanced focus state for keyboard navigation
          isFocused && "ring-2 ring-accent ring-offset-1",
          // Active state: darker background with accent color and 3px left accent border
          active && [
            "bg-accent text-accent-foreground",
            "border-l-[var(--dt-nav-active-border)] border-l-primary",
            "pl-[calc(var(--dt-nav-item-padding-horizontal)-var(--dt-nav-active-border))]", // Adjust left padding to account for active border
          ],
          // Flex layout for icon positioning
          hasSubTabs && "justify-between",
        )}
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        aria-current={active ? "page" : undefined}
        aria-expanded={hasSubTabs ? isExpanded : undefined}
        aria-controls={hasSubTabs ? `${id}-subtabs` : undefined}
      >
        <span className="text-left">{label}</span>
        {hasSubTabs && (
          <div className="ml-2 flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        )}
      </Button>

      {/* Sub-navigation rendering */}
      {hasSubTabs && children && (
        <div
          id={`${id}-subtabs`}
          className={cn(
            "overflow-hidden transition-all duration-[var(--dt-animation-accordion-transition)] ease-in-out",
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="pl-3 space-y-1 mt-1">{children}</div>
        </div>
      )}
    </div>
  );
});
