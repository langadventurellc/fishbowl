import React from "react";
import { InputContainerDisplayProps } from "@fishbowl-ai/shared";
import { MessageInputDisplay } from "./MessageInputDisplay";
import { SendButtonDisplay } from "./SendButtonDisplay";
import { ConversationModeToggleDisplay } from "./ConversationModeToggleDisplay";

/**
 * InputContainerDisplay component renders the complete message input area for the conversation interface.
 * Composes MessageInputDisplay, SendButtonDisplay, and ConversationModeToggleDisplay components
 * within a flexible container that provides proper layout, spacing, and theming.
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

  // Base container styles for the input area
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
