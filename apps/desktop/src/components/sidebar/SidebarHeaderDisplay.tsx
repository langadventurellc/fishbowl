import { SidebarHeaderDisplayProps } from "@fishbowl-ai/ui-shared";
import React from "react";
import { cn } from "../../lib/utils";

/**
 * SidebarHeaderDisplay component renders the top section of the sidebar
 * with title and optional controls.
 *
 * A pure display component showing the visual layout of the sidebar header area
 * with consistent typography and spacing.
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

  // Theme variable styles that need to remain as CSS properties
  const themeStyles: React.CSSProperties = {
    color: "var(--sidebar-foreground)",
    ...style, // Custom styles take precedence
  };

  return (
    <div
      className={cn("text-sm font-semibold mb-3", className)}
      style={themeStyles}
    >
      {title}
      {showControls && (
        <span className="opacity-70 ml-2 text-xs">
          {/* Placeholder for future controls - could be icons or buttons */}
        </span>
      )}
    </div>
  );
}
