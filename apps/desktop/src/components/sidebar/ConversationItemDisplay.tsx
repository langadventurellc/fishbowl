/**
 * ConversationItemDisplay component for sidebar conversation items.
 *
 * Pure display component that renders individual conversation entries with
 * visual states for active, inactive, unread, and hover appearances. Provides
 * reusable conversation item display functionality for the sidebar.
 *
 * @module components/sidebar/ConversationItemDisplay
 */

import type React from "react";
import { useState } from "react";
import type { ConversationItemDisplayProps } from "@fishbowl-ai/shared";
import { ConversationContextMenu } from "./ConversationContextMenu";
import { cn } from "@/lib/utils";

/**
 * ConversationItemDisplay component.
 *
 * Renders a conversation item with proper styling and visual states.
 * Supports active, inactive, unread, and hover visual states with interactive
 * functionality. Shows conversation name, timestamp, and optional unread indicator.
 *
 * The component provides a consistent conversation item interface with theme
 * integration and responsive hover effects.
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

  // Visual state styles based on appearanceState and conversation.isActive
  const getStateStyles = (
    state: typeof appearanceState,
  ): React.CSSProperties => {
    const isActiveConversation = conversation.isActive;

    switch (state) {
      case "active":
        // Active conversation item styles with accent coloring
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
        // Inactive conversation item styles with muted appearance
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

  // Combine dynamic styles only
  const dynamicStyles: React.CSSProperties = {
    ...getStateStyles(appearanceState),
    ...style, // Custom styles override defaults
  };

  return (
    <div
      className={cn(
        "relative px-3 py-2 pr-8 rounded-md cursor-pointer mb-1 text-[13px] transition-all duration-150 ease-out flex flex-col z-[1]",
        className,
      )}
      style={dynamicStyles}
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
      {showUnreadIndicator && (
        <div
          className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-sidebar-primary transition-opacity duration-150"
          style={{ opacity: showUnreadIndicator ? 1 : 0 }}
        />
      )}

      {/* Context menu with ellipses trigger - appears on hover */}
      <div
        className="absolute top-2 right-2 z-[2] transition-opacity duration-150 ease-out"
        style={{ opacity: isHovered ? 1 : 0 }}
      >
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
      <div
        className="mb-0.5 leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ fontWeight: appearanceState === "unread" ? "500" : "400" }}
      >
        {conversation.name}
      </div>

      {/* Last activity timestamp */}
      <div className="text-[11px] opacity-70 leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
        {conversation.lastActivity}
      </div>
    </div>
  );
}
