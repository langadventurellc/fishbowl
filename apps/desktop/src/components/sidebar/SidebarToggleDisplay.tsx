import React from "react";
import { SidebarToggleDisplayProps } from "@fishbowl-ai/shared";

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
  // Core sidebar toggle styles with positioning and theme integration
  const baseToggleStyles: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: isCollapsed ? "-12px" : "188px",
    transform: "translateY(-50%)",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "var(--background)",
    border: "1px solid var(--border)",
    cursor: "pointer", // Preserved for visual accuracy even though non-interactive
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    color: "var(--foreground)",
    zIndex: 1000,
    transition: "left 0.3s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  // Hover state styles for visual demonstration
  const hoverStateStyles: React.CSSProperties = showHoverState
    ? {
        backgroundColor: "var(--accent)",
        color: "var(--accent-foreground)",
      }
    : {};

  // Combine all styles with custom styles taking precedence
  const combinedStyles: React.CSSProperties = {
    ...baseToggleStyles,
    ...hoverStateStyles,
    ...style, // Custom styles override defaults
  };

  // Arrow indicator based on collapsed state
  const arrowIndicator = isCollapsed ? "→" : "←";

  // Accessibility title for screen readers (preserved from original)
  const accessibilityTitle = isCollapsed
    ? "Expand sidebar"
    : "Collapse sidebar";

  return (
    <button
      className={className}
      style={combinedStyles}
      title={accessibilityTitle}
      // No onClick handler - pure display component
      aria-label={accessibilityTitle}
      tabIndex={-1} // Remove from tab order since non-interactive
    >
      {arrowIndicator}
    </button>
  );
}
