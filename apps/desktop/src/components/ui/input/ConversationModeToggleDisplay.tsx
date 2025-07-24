import React from "react";
import { ConversationModeToggleDisplayProps } from "@fishbowl-ai/shared";

/**
 * ConversationModeToggleDisplay component renders a visual representation of the Manual/Auto mode toggle
 * without any interactive functionality. Pure display component for showcase purposes.
 *
 * Extracted from DesignPrototype.tsx lines 436-456 (modeToggle and modeOption styles).
 * Shows the current mode state visually with proper active/inactive styling and supports
 * disabled state for reduced opacity presentation.
 *
 * Visual States:
 * - Manual mode active: "Manual" highlighted with primary background, "Auto" normal
 * - Auto mode active: "Auto" highlighted with primary background, "Manual" normal
 * - Disabled state: Entire toggle shown with reduced opacity (0.6)
 */
export function ConversationModeToggleDisplay({
  currentMode,
  disabled = false,
  className = "",
}: ConversationModeToggleDisplayProps) {
  // Base container styles extracted from DesignPrototype.tsx lines 436-447
  const containerStyles: React.CSSProperties = {
    height: "40px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 12px",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    backgroundColor: "var(--background)",
    fontSize: "12px",
    fontWeight: "500",
    // Disabled state styling
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "default",
  };

  // Mode option base styles extracted from DesignPrototype.tsx lines 448-452
  const modeOptionBaseStyles: React.CSSProperties = {
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: disabled ? "not-allowed" : "pointer",
  };

  // Active mode styling extracted from DesignPrototype.tsx lines 453-456
  const modeOptionActiveStyles: React.CSSProperties = {
    backgroundColor: "var(--primary)",
    color: "var(--primary-foreground)",
  };

  // Manual mode styling - active if currentMode is "manual"
  const manualModeStyles: React.CSSProperties = {
    ...modeOptionBaseStyles,
    ...(currentMode === "manual" ? modeOptionActiveStyles : {}),
  };

  // Auto mode styling - active if currentMode is "auto"
  const autoModeStyles: React.CSSProperties = {
    ...modeOptionBaseStyles,
    ...(currentMode === "auto" ? modeOptionActiveStyles : {}),
  };

  return (
    <div style={containerStyles} className={className}>
      <span style={manualModeStyles}>Manual</span>
      <span style={autoModeStyles}>Auto</span>
    </div>
  );
}
