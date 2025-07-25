import React from "react";
import { ChatContainerDisplayProps } from "@fishbowl-ai/shared";

/**
 * ChatContainerDisplay - Scrollable messages area layout component
 *
 * Extracted from DesignPrototype.tsx lines 354-361 (styles.chatArea).
 * Provides the scrollable container layout for chat messages with
 * proper overflow handling, padding, and message spacing.
 */
export const ChatContainerDisplay: React.FC<ChatContainerDisplayProps> = ({
  messages,
  maxHeight,
  messageSpacing = "12px",
  containerPadding = "16px 24px",
  emptyState,
  className,
  style,
  onScroll,
}) => {
  // Container styles extracted from DesignPrototype.tsx lines 354-361 (chatArea)
  const containerStyles: React.CSSProperties = {
    flex: 1,
    overflowY: "auto" as const,
    padding: containerPadding,
    display: "flex",
    flexDirection: "column" as const,
    gap: messageSpacing,
    // Support custom maxHeight
    ...(maxHeight && { maxHeight }),
    // Merge custom styles
    ...style,
  };

  // Render messages or children
  const renderContent = () => {
    if (messages && messages.length > 0) {
      return messages;
    }

    if (emptyState) {
      return emptyState;
    }

    return null;
  };

  return (
    <div className={className} style={containerStyles} onScroll={onScroll}>
      {renderContent()}
    </div>
  );
};
