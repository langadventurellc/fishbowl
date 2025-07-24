import React from "react";
import { MessageInputDisplayProps, ComponentSize } from "@fishbowl-ai/shared";

/**
 * MessageInputDisplay component renders a visual representation of the message input textarea
 * with basic HTML functionality for visual testing. No React event handlers or state management.
 *
 * Extracted from DesignPrototype.tsx lines 406-421 with theme variable integration.
 */
export function MessageInputDisplay({
  placeholder = "Type your message here...",
  content = "",
  disabled = false,
  size = "medium",
  className = "",
}: MessageInputDisplayProps) {
  // Size-specific height adjustments
  const getSizeStyles = (size: ComponentSize) => {
    switch (size) {
      case "small":
        return {
          minHeight: "32px",
          maxHeight: "120px",
          padding: "8px 12px",
          fontSize: "13px",
        };
      case "large":
        return {
          minHeight: "48px",
          maxHeight: "240px",
          padding: "16px",
          fontSize: "16px",
        };
      case "medium":
      default:
        return {
          minHeight: "40px",
          maxHeight: "180px",
          padding: "12px",
          fontSize: "14px",
        };
    }
  };

  const sizeStyles = getSizeStyles(size);

  // Base styles extracted from DesignPrototype.tsx lines 406-421
  const textareaStyles: React.CSSProperties = {
    // Layout
    flex: 1,
    width: "100%",
    height: "auto",

    // Sizing - adjusted per size variant
    ...sizeStyles,

    // Border and background using theme variables
    border: "1px solid var(--border)",
    borderRadius: "8px",
    backgroundColor: "var(--background)",

    // Typography
    color: "inherit",
    fontFamily: "inherit",

    // Behavior
    resize: "none" as const,
    overflow: "hidden",
    // @ts-ignore - fieldSizing is a modern CSS property not yet in React's CSSProperties
    fieldSizing: "content", // Modern CSS property for auto-sizing

    // Remove default styling
    outline: "none",
    boxSizing: "border-box" as const,

    // Disabled state
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "text",

    // Focus appearance (visual only - no actual focus behavior)
    boxShadow: content ? "0 0 0 1px var(--ring)" : "none",
  };

  return (
    <textarea
      defaultValue={content}
      placeholder={placeholder}
      disabled={disabled}
      style={textareaStyles}
      className={className}
    />
  );
}
