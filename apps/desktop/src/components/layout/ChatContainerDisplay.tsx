import { ChatContainerDisplayProps } from "@fishbowl-ai/ui-shared";
import React from "react";
import { cn } from "../../lib/utils";
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
  // Dynamic styles using CSS custom properties
  const dynamicStyles: React.CSSProperties = {
    "--container-padding": containerPadding,
    "--message-spacing": messageSpacing,
    "--max-height": maxHeight || "none",
    // Merge custom styles
    ...style,
  } as React.CSSProperties;

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
    <div
      className={cn(
        "flex flex-1 flex-col overflow-y-auto",
        "p-[var(--container-padding)] gap-[var(--message-spacing)]",
        maxHeight && "max-h-[var(--max-height)]",
        className,
      )}
      style={dynamicStyles}
      onScroll={onScroll}
    >
      {renderContent()}
    </div>
  );
};
