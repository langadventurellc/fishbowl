/**
 * ConversationListDisplay component for the sidebar conversation list.
 *
 * Pure display component that renders a scrollable container for conversation items
 * with proper spacing, layout, and visual state support. Extracted from DesignPrototype
 * lines 783-906 to provide a reusable conversation list container.
 *
 * @module components/sidebar/ConversationListDisplay
 */

import type React from "react";
import type { ConversationListDisplayProps } from "@fishbowl-ai/shared";

/**
 * ConversationListDisplay component.
 *
 * Renders a scrollable container area for conversation items with proper spacing
 * and layout extracted from DesignPrototype. Supports empty, populated, and scrolled
 * visual states without interactive functionality.
 *
 * The component focuses on the container layout and spacing, providing the
 * scrollable area that would hold individual conversation items.
 *
 * @param props - Component props interface
 * @returns React functional component
 */
export function ConversationListDisplay({
  conversations = [],
  activeConversationId = "",
  scrollState = "none",
  className = "",
  style = {},
}: ConversationListDisplayProps) {
  // Core conversation list container styles extracted from DesignPrototype
  const baseContainerStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flex: 1, // Takes available space between title and new conversation button
    minHeight: "120px", // Minimum height to show empty/scrolled states
    maxHeight: "100%", // Prevent overflow of parent container
    overflow: "hidden", // Container manages its own overflow
    gap: "4px", // Spacing between conversation items (from marginBottom in conversationItem)
  };

  // Scrollable area styles based on scroll state
  const getScrollStyles = (state: typeof scrollState): React.CSSProperties => {
    switch (state) {
      case "scrollable":
        return {
          overflowY: "auto" as const,
          paddingRight: "2px", // Space for scroll indicator
        };
      case "scrolled":
        return {
          overflowY: "auto" as const,
          paddingRight: "2px",
          // Visual indication that content has been scrolled
          background: `linear-gradient(
            var(--sidebar) 30%, 
            rgba(0,0,0,0.05) 100%
          )`,
        };
      case "none":
      default:
        return {
          overflowY: "hidden" as const,
        };
    }
  };

  // Empty state styles when no conversations are present
  const emptyStateStyles: React.CSSProperties =
    conversations.length === 0
      ? {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted-foreground)",
          fontSize: "13px",
          fontStyle: "italic",
          opacity: 0.7,
          minHeight: "80px",
        }
      : {};

  // Combine all styles with custom styles taking precedence
  const combinedStyles: React.CSSProperties = {
    ...baseContainerStyles,
    ...getScrollStyles(scrollState),
    ...emptyStateStyles,
    ...style, // Custom styles override defaults
  };

  // Render empty state message
  if (conversations.length === 0) {
    return (
      <div className={className} style={combinedStyles}>
        No conversations yet
      </div>
    );
  }

  // Render conversation list container with visual conversation placeholders
  // This shows the spacing and layout that would contain actual conversation items
  return (
    <div className={className} style={combinedStyles}>
      {conversations.map((conversation, index) => {
        // Determine if this conversation is active based on activeConversationId
        const isActive = conversation.name === activeConversationId;

        // Conversation item placeholder styles extracted from DesignPrototype lines 274-297
        const conversationItemStyles: React.CSSProperties = {
          position: "relative",
          padding: "8px 12px",
          paddingRight: "32px", // Make room for ellipsis
          borderRadius: "6px",
          marginBottom: "4px", // Last item will have this margin, which is fine
          fontSize: "13px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: isActive ? "var(--sidebar-accent)" : "transparent",
          color: isActive
            ? "var(--sidebar-accent-foreground)"
            : "var(--muted-foreground)",
          transition: "background-color 0.15s",
          cursor: "default", // Visual only, no interaction
        };

        return (
          <div key={index} style={conversationItemStyles}>
            <div>🗨 {conversation.name}</div>
            <div
              style={{
                fontSize: "11px",
                opacity: 0.7,
                marginTop: "2px",
              }}
            >
              {conversation.lastActivity}
            </div>
          </div>
        );
      })}
    </div>
  );
}
