import React from "react";
import { SidebarHeaderDisplayProps } from "@fishbowl-ai/shared";

/**
 * SidebarHeaderDisplay component renders the top section of the sidebar
 * with title and optional controls.
 *
 * Extracted from DesignPrototype.tsx lines 268-273 (sidebarTitle styles) as a pure display component
 * showing the visual layout of the sidebar header area with consistent typography and spacing.
 *
 * Key Features:
 * - Title text display with proper typography (14px, weight 600)
 * - Theme variable integration for consistent styling
 * - Show/hide controls state support
 * - Collapsed state visibility handling
 * - Proper spacing and margin management (12px bottom margin)
 *
 * Visual States:
 * - Default: title displayed with controls if enabled
 * - Collapsed: header may be hidden or styled differently
 * - With/without controls: flexible control visibility
 */
export function SidebarHeaderDisplay({
  title = "Conversations",
  showControls = true,
  collapsed = false,
  className = "",
  style = {},
}: SidebarHeaderDisplayProps) {
  // Return null when collapsed to hide the header completely
  if (collapsed) {
    return null;
  }

  // Core sidebar header styles extracted from DesignPrototype lines 268-273
  const headerStyles: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "var(--sidebar-foreground)",
    ...style, // Custom styles take precedence
  };

  return (
    <div className={className} style={headerStyles}>
      {title}
      {showControls && (
        <span style={{ opacity: 0.7, marginLeft: "8px", fontSize: "12px" }}>
          {/* Placeholder for future controls - could be icons or buttons */}
        </span>
      )}
    </div>
  );
}
