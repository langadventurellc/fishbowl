/**
 * ConversationItemDisplay component for sidebar conversation items.
 *
 * Pure display component that renders individual conversation entries with
 * visual states for active, inactive, unread, and hover appearances. Extracted
 * from DesignPrototype lines 274-306 to provide reusable conversation item display.
 *
 * @module components/sidebar/ConversationItemDisplay
 */

import type React from "react";
import { useState } from "react";
import type { ConversationItemDisplayProps } from "@fishbowl-ai/shared";
import { ConversationContextMenu } from "./ConversationContextMenu";

/**
 * ConversationItemDisplay component.
 *
 * Renders a conversation item with proper styling and visual states extracted
 * from DesignPrototype. Supports active, inactive, unread, and hover visual
 * states without interactive functionality. Shows conversation name, timestamp,
 * and optional unread indicator.
 *
 * The component maintains exact visual fidelity with the original DesignPrototype
 * conversation item styling while providing a reusable, display-only interface.
 *
 * @param props - Component props interface
 * @returns React functional component
 */
export function ConversationItemDisplay({
  conversation,
  appearanceState = "inactive",
  showUnreadIndicator = false,
  className = "",
  style = {},
}: ConversationItemDisplayProps) {
  const [isHovered, setIsHovered] = useState(false);
  // Core conversation item styles extracted from DesignPrototype lines 274-286
  const baseItemStyles: React.CSSProperties = {
    position: "relative",
    padding: "8px 12px",
    paddingRight: "32px", // Make room for ellipsis (visual space preserved)
    borderRadius: "6px",
    cursor: "pointer", // Make it look interactive
    marginBottom: "4px",
    fontSize: "13px",
    transition: "all 0.15s ease",
    display: "flex",
    flexDirection: "column",
    zIndex: 1,
  };

  // Visual state styles based on appearanceState and conversation.isActive
  const getStateStyles = (
    state: typeof appearanceState,
  ): React.CSSProperties => {
    const isActiveConversation = conversation.isActive;

    switch (state) {
      case "active":
        // Active conversation item styles from DesignPrototype lines 287-294
        return {
          backgroundColor: "var(--sidebar-accent)",
          color: "var(--sidebar-accent-foreground)",
        };

      case "hover":
        // Hover appearance (visual only, no actual hover behavior)
        return {
          backgroundColor: "var(--sidebar-accent)",
          color: "var(--sidebar-accent-foreground)",
          opacity: 0.8, // Slightly less prominent than truly active
        };

      case "unread":
        // Unread conversation with enhanced visibility
        return {
          backgroundColor: isActiveConversation
            ? "var(--sidebar-accent)"
            : "rgba(var(--sidebar-primary), 0.1)",
          color: isActiveConversation
            ? "var(--sidebar-accent-foreground)"
            : "var(--sidebar-foreground)",
          fontWeight: "500", // Slightly bolder for unread
        };

      case "inactive":
      default:
        // Inactive conversation item styles from DesignPrototype lines 295-297
        return {
          backgroundColor: isActiveConversation
            ? "var(--sidebar-accent)"
            : "transparent",
          color: isActiveConversation
            ? "var(--sidebar-accent-foreground)"
            : "var(--muted-foreground)",
        };
    }
  };

  // Unread indicator styles
  const unreadIndicatorStyles: React.CSSProperties = {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "var(--sidebar-primary)",
    opacity: showUnreadIndicator ? 1 : 0,
    transition: "opacity 0.15s",
  };

  // Conversation name styles
  const conversationNameStyles: React.CSSProperties = {
    fontWeight: appearanceState === "unread" ? "500" : "400",
    marginBottom: "2px",
    lineHeight: "1.2",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  // Last activity timestamp styles
  const lastActivityStyles: React.CSSProperties = {
    fontSize: "11px",
    opacity: 0.7,
    lineHeight: "1.2",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  // Ellipses trigger styles - positioned in top-right area
  const ellipsesStyles: React.CSSProperties = {
    position: "absolute",
    top: "8px",
    right: "8px",
    opacity: isHovered ? 1 : 0,
    transition: "opacity 0.15s ease",
    zIndex: 2,
  };

  // Combine all styles with custom styles taking precedence
  const combinedStyles: React.CSSProperties = {
    ...baseItemStyles,
    ...getStateStyles(appearanceState),
    ...style, // Custom styles override defaults
  };

  return (
    <div
      className={className}
      style={combinedStyles}
      onMouseEnter={(e) => {
        // Add hover effect
        const target = e.currentTarget;
        target.style.backgroundColor =
          appearanceState === "active"
            ? "var(--sidebar-accent)"
            : "rgba(var(--sidebar-primary), 0.08)";
        target.style.transform = "translateX(2px)";
        target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";

        // Show ellipses on hover
        setIsHovered(true);
      }}
      onMouseLeave={(e) => {
        // Remove hover effect
        const target = e.currentTarget;
        const originalStyles = getStateStyles(appearanceState);
        target.style.backgroundColor =
          originalStyles.backgroundColor || "transparent";
        target.style.transform = "translateX(0)";
        target.style.boxShadow = "none";

        // Hide ellipses when not hovering
        setIsHovered(false);
      }}
    >
      {/* Unread indicator dot */}
      {showUnreadIndicator && <div style={unreadIndicatorStyles} />}

      {/* Context menu with ellipses trigger - appears on hover */}
      <div style={ellipsesStyles}>
        <ConversationContextMenu
          conversation={conversation}
          position="below"
          onRename={() => {
            /* Placeholder for rename action */
          }}
          onDuplicate={() => {
            /* Placeholder for duplicate action */
          }}
          onDelete={() => {
            /* Placeholder for delete action */
          }}
        />
      </div>

      {/* Conversation name */}
      <div style={conversationNameStyles}>{conversation.name}</div>

      {/* Last activity timestamp */}
      <div style={lastActivityStyles}>{conversation.lastActivity}</div>
    </div>
  );
}
