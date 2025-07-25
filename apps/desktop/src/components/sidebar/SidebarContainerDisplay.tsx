import React from "react";
import { SidebarContainerDisplayProps } from "@fishbowl-ai/shared";

/**
 * SidebarContainerDisplay component renders the main sidebar layout wrapper
 * that handles collapsed/expanded visual states.
 *
 * Extracted from DesignPrototype.tsx lines 258-267 (sidebar styles) as a pure display component
 * showing the visual layout of the sidebar wrapper with smooth transitions and theme integration.
 *
 * Key Features:
 * - Collapsible width states with smooth 0.3s ease transitions
 * - Theme variable integration for consistent styling
 * - Flexible width variants (narrow/default/wide)
 * - Border visibility control
 * - Proper overflow handling for collapsed state
 *
 * Visual States:
 * - Collapsed: width 0px, padding 0, overflow hidden
 * - Expanded: configurable width based on variant, 16px padding
 */
export function SidebarContainerDisplay({
  collapsed = false,
  widthVariant = "default",
  showBorder = true,
  className = "",
  children,
  style = {},
}: SidebarContainerDisplayProps) {
  // Width configurations matching design requirements
  const getWidthForVariant = (variant: typeof widthVariant) => {
    switch (variant) {
      case "narrow":
        return "180px";
      case "wide":
        return "240px";
      case "default":
      default:
        return "200px"; // Matches DesignPrototype original width
    }
  };

  // Core sidebar container styles extracted from DesignPrototype lines 258-267
  const containerStyles: React.CSSProperties = {
    width: collapsed ? "0px" : getWidthForVariant(widthVariant),
    backgroundColor: "var(--sidebar)",
    borderRight: showBorder ? `1px solid var(--border)` : "none",
    display: "flex",
    flexDirection: "column",
    padding: collapsed ? "0" : "16px",
    overflow: "hidden",
    transition: "width 0.3s ease, padding 0.3s ease",
    ...style, // Custom styles take precedence
  };

  return (
    <div className={className} style={containerStyles}>
      {!collapsed && children}
    </div>
  );
}
