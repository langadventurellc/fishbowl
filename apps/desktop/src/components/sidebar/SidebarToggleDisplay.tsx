import React from "react";
import { SidebarToggleDisplayProps } from "@fishbowl-ai/shared";
import { cn } from "@/lib/utils";

/**
 * SidebarToggleDisplay component renders the visual appearance of the sidebar
 * toggle button without interactive functionality.
 *
 * A pure display component showing the visual appearance of the collapse/expand button
 * for component library showcase purposes.
 *
 * Key Features:
 * - Visual representation of collapsed/expanded states
 * - Smooth transition animation styling (left positioning)
 * - Theme variable integration for consistent styling
 * - Hover appearance state support for demonstration
 * - Circular button with arrow indicators (← for expanded, → for collapsed)
 * - Proper positioning with absolute layout and z-index management
 * - Box shadow and border styling for visual depth
 *
 * Visual States:
 * - Collapsed: button positioned at left: -12px with "→" arrow
 * - Expanded: button positioned at left: 188px with "←" arrow
 * - Hover: background changes to accent color with accent-foreground text
 * - Normal: uses background and foreground theme variables
 *
 * Animation: 0.3s ease transition for left position changes
 */
export function SidebarToggleDisplay({
  isCollapsed = false,
  showHoverState = false,
  className = "",
  style = {},
}: SidebarToggleDisplayProps) {
  // Tailwind classes for sidebar toggle styling
  const toggleClasses = cn(
    // Base positioning and layout
    "absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full",
    "border border-border bg-background cursor-pointer",
    "flex items-center justify-center text-micro-default text-foreground",
    "z-[1000] transition-[left] duration-300 ease-out shadow-sm",
    // Dynamic left positioning based on collapsed state
    isCollapsed ? "left-[-12px]" : "left-[188px]",
    // Conditional hover state styling
    showHoverState && "bg-accent text-accent-foreground",
    className,
  );

  // Arrow indicator based on collapsed state
  const arrowIndicator = isCollapsed ? "→" : "←";

  // Accessibility title for screen readers (preserved from original)
  const accessibilityTitle = isCollapsed
    ? "Expand sidebar"
    : "Collapse sidebar";

  return (
    <button
      className={toggleClasses}
      style={style} // Custom styles override defaults
      title={accessibilityTitle}
      // No onClick handler - pure display component
      aria-label={accessibilityTitle}
      tabIndex={-1} // Remove from tab order since non-interactive
    >
      {arrowIndicator}
    </button>
  );
}
