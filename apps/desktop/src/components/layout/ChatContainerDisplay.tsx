import React from "react";
import { ChatContainerDisplayProps } from "@fishbowl-ai/shared";
import { MessageItem } from "../chat/MessageItem";

/**
 * ChatContainerDisplay - Scrollable messages area layout component
 *
 * Main conversation display area that renders chat messages in a scrollable container.
 * Handles message rendering, empty states, and provides proper overflow management
 * with customizable padding and spacing between messages.
 */
export const ChatContainerDisplay: React.FC<ChatContainerDisplayProps> = ({
  messages,
  onContextMenuAction,
  maxHeight,
  messageSpacing = "12px",
  containerPadding = "16px 24px",
  emptyState,
  className,
  style,
  onScroll,
}) => {
  // Container styles for the scrollable chat messages area
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
      return messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          canRegenerate={message.type === "agent"}
          onContextMenuAction={onContextMenuAction || (() => {})}
        />
      ));
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
