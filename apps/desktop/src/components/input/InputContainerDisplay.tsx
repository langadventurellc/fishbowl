import React from "react";
import { InputContainerDisplayProps } from "@fishbowl-ai/shared";
import { MessageInputDisplay } from "./MessageInputDisplay";
import { SendButtonDisplay } from "./SendButtonDisplay";
import { ConversationModeToggleDisplay } from "./ConversationModeToggleDisplay";

/**
 * InputContainerDisplay component renders a visual representation of the input area container
 * that composes MessageInputDisplay, SendButtonDisplay, and ConversationModeToggleDisplay internally.
 *
 * Extracted from DesignPrototype.tsx lines 397-405 (inputArea styles) as a composition component
 * that provides proper flex layout, spacing, and border styling for all input components.
 *
 * Layout Variants:
 * - Default: Standard spacing (16px padding, 12px gap) for normal use
 * - Compact: Reduced spacing (12px padding, 8px gap) for smaller screens
 */
export function InputContainerDisplay({
  layoutVariant = "default",
  className = "",
  messageInputProps = {},
  sendButtonProps = {},
  modeToggleProps = {},
}: InputContainerDisplayProps) {
  // Layout variant styling adjustments
  const getLayoutVariantStyles = (variant: "default" | "compact") => {
    switch (variant) {
      case "compact":
        return {
          padding: "12px",
          gap: "8px",
        };
      case "default":
      default:
        return {
          padding: "16px",
          gap: "12px",
        };
    }
  };

  const variantStyles = getLayoutVariantStyles(layoutVariant);

  // Base container styles extracted from DesignPrototype.tsx lines 397-405
  const containerStyles: React.CSSProperties = {
    // Layout and sizing
    minHeight: "72px",
    display: "flex",
    alignItems: "flex-end",

    // Spacing - adjusted per layout variant
    ...variantStyles,

    // Background and border using theme variables
    backgroundColor: "var(--card)",
    borderTop: "1px solid var(--border)",

    // Box model
    boxSizing: "border-box",
  };

  // Default props for child components based on layout variant
  const defaultMessageInputProps = {
    placeholder: "Type your message here...",
    size:
      layoutVariant === "compact" ? ("small" as const) : ("medium" as const),
    ...messageInputProps,
  };

  const defaultSendButtonProps = {
    disabled: false,
    loading: false,
    "aria-label": "Send message",
    ...sendButtonProps,
  };

  const defaultModeToggleProps = {
    currentMode: "manual" as const,
    disabled: false,
    ...modeToggleProps,
  };

  return (
    <div style={containerStyles} className={className}>
      <MessageInputDisplay {...defaultMessageInputProps} />
      <SendButtonDisplay {...defaultSendButtonProps} />
      <ConversationModeToggleDisplay {...defaultModeToggleProps} />
    </div>
  );
}
