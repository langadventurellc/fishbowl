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

import React, { type KeyboardEvent } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import type { SettingsSection } from "@fishbowl-ai/shared";

interface NavigationItemProps {
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
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

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
          "h-[40px] px-3 rounded-[4px]",
          "w-full justify-start items-center",
          // Text styling
          isCompact ? "text-xs" : "text-sm",
          "font-medium",
          // Base state: no background, standard text color
          "bg-transparent text-foreground",
          // Hover state: light background tint with smooth transition
          "hover:bg-accent/80 hover:text-accent-foreground",
          "transition-all duration-200 ease-in-out",
          // Focus state: keyboard focus indicators for accessibility
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Enhanced focus state for keyboard navigation
          isFocused && "ring-2 ring-ring ring-offset-2",
          // Active state: darker background with accent color and 3px left accent border
          active && [
            "bg-accent text-accent-foreground",
            "border-l-[3px] border-l-primary",
            "pl-[9px]", // Adjust left padding to account for 3px border (12px - 3px = 9px)
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
            "overflow-hidden transition-all duration-200 ease-in-out",
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="pl-3 space-y-1 mt-1">{children}</div>
        </div>
      )}
    </div>
  );
});
