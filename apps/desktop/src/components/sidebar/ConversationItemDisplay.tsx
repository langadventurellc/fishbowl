/**
 * ConversationItemDisplay component for sidebar conversation items.
 *
 * Pure display component that renders individual conversation entries with
 * visual states for active, inactive, unread, and hover appearances. Provides
 * reusable conversation item display functionality for the sidebar.
 *
 * @module components/sidebar/ConversationItemDisplay
 */

import { cn } from "@/lib/utils";
import type { ConversationItemDisplayProps } from "@fishbowl-ai/ui-shared";
import { useState } from "react";
import { ConversationContextMenu } from "./ConversationContextMenu";

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
  onClick,
  onRename,
  onDelete,
}: ConversationItemDisplayProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get Tailwind classes based on appearanceState and conversation.isActive
  const getStateClasses = (state: typeof appearanceState) => {
    const isActiveConversation = conversation.isActive;

    switch (state) {
      case "active":
        return "bg-sidebar-accent text-sidebar-accent-foreground";

      case "hover":
        return "bg-sidebar-accent text-sidebar-accent-foreground opacity-80";

      case "unread":
        return isActiveConversation
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "bg-sidebar-primary/10 text-sidebar-foreground font-medium";

      case "inactive":
      default:
        return isActiveConversation
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "bg-transparent text-muted-foreground";
    }
  };

  return (
    <div
      className={cn(
        "relative px-3 py-2 pr-8 rounded-md cursor-pointer mb-1 text-description transition-all duration-150 ease-out flex flex-col z-[1]",
        "hover:bg-sidebar-primary/8 hover:translate-x-0.5 hover:shadow-sm",
        getStateClasses(appearanceState),
        className,
      )}
      style={style}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Unread indicator dot */}
      {showUnreadIndicator && (
        <div
          className={cn(
            "absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-sidebar-primary transition-opacity duration-150",
            showUnreadIndicator ? "opacity-100" : "opacity-0",
          )}
        />
      )}

      {/* Context menu with ellipses trigger - appears on hover */}
      <div
        className={cn(
          "absolute top-2 right-2 z-[2] transition-opacity duration-150 ease-out",
          isHovered ? "opacity-100" : "opacity-0",
        )}
      >
        <ConversationContextMenu
          conversation={conversation}
          position="below"
          onRename={onRename || (() => {})}
          onDelete={onDelete || (() => {})}
        />
      </div>

      {/* Conversation name */}
      <div
        className={cn(
          "mb-0.5 leading-tight overflow-hidden text-ellipsis whitespace-nowrap",
          appearanceState === "unread" ? "font-medium" : "font-normal",
        )}
      >
        {conversation.name}
      </div>

      {/* Last activity timestamp */}
      <div className="text-tiny-default opacity-70 leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
        {conversation.lastActivity}
      </div>
    </div>
  );
}
