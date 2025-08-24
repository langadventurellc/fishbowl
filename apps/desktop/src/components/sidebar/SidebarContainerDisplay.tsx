import { SidebarContainerDisplayProps } from "@fishbowl-ai/ui-shared";
import React from "react";
import { cn } from "../../lib/utils";
import { ConversationItemDisplay } from "./ConversationItemDisplay";
import { SidebarHeaderDisplay } from "./SidebarHeaderDisplay";
import { NewConversationButton } from "../conversations/NewConversationButton";
import { useCreateConversation } from "../../hooks/conversations/useCreateConversation";
import { useConversations } from "../../hooks/conversations/useConversations";

/**
 * SidebarContainerDisplay component renders the main sidebar layout wrapper
 * that handles collapsed/expanded visual states with conversation list rendering.
 *
 * When conversations prop is provided, automatically renders complete sidebar with:
 * - SidebarHeaderDisplay with "Conversations" title
 * - Scrollable conversation list using ConversationItemDisplay components
 * - "New Conversation" button at the bottom
 *
 * When conversations prop is omitted, renders empty sidebar container.
 *
 * Key Features:
 * - Collapsible width states with smooth 0.3s ease transitions
 * - Theme variable integration for consistent styling
 * - Flexible width variants (narrow/default/wide)
 * - Border visibility control
 * - Proper overflow handling for collapsed state
 * - Self-contained conversation list rendering
 *
 * Visual States:
 * - Collapsed: width 0px, padding 0, overflow hidden
 * - Expanded: configurable width based on variant, 16px padding
 */
export function SidebarContainerDisplay({
  collapsed = false,
  widthVariant = "default",
  showBorder = true,
  className = "",
  style = {},
  conversations,
}: SidebarContainerDisplayProps) {
  // Initialize hooks for conversation management
  const {
    conversations: realConversations,
    isLoading: _listLoading,
    error: _listError,
    refetch,
  } = useConversations();

  const {
    createConversation,
    isCreating,
    error: _error,
    reset: _reset,
  } = useCreateConversation();

  // Format timestamp as relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  // Map database conversations to UI format
  const mapConversationsToViewModel = (convs: typeof realConversations) => {
    return convs.map((conv) => ({
      name: conv.title,
      lastActivity: formatRelativeTime(conv.updated_at),
      isActive: false, // TODO: Add active conversation tracking
    }));
  };

  // Use real conversations when available, fall back to props
  const conversationsToDisplay = realConversations
    ? mapConversationsToViewModel(realConversations)
    : conversations || [];

  // Handle new conversation creation
  const handleNewConversation = async () => {
    try {
      const result = await createConversation();
      console.log("Created conversation:", result);
      // Refresh the list to show new conversation
      await refetch();
    } catch (err) {
      console.error("Failed to create conversation:", err);
      // Error handling will be improved in Feature 2
    }
  };
  // Width configurations matching design requirements
  const getWidthForVariant = (variant: typeof widthVariant) => {
    switch (variant) {
      case "narrow":
        return "180px";
      case "wide":
        return "240px";
      case "default":
      default:
        return "200px"; // Default sidebar width
    }
  };

  // Dynamic styles that need to remain as CSS properties
  const dynamicStyles: React.CSSProperties = {
    width: collapsed ? "0px" : getWidthForVariant(widthVariant),
    backgroundColor: "var(--sidebar)",
    borderRight: showBorder ? `1px solid var(--border)` : "none",
    padding: collapsed ? "0" : "16px",
    ...style, // Custom styles take precedence
  };

  // Render self-contained sidebar when conversations are provided
  const renderSelfContainedContent = () => (
    <>
      <SidebarHeaderDisplay
        title="Conversations"
        showControls={true}
        collapsed={collapsed}
      />

      {/* Conversation items with interactive behavior */}
      <div className="flex flex-1 flex-col gap-1 min-h-[120px]">
        {conversationsToDisplay.length === 0 ? (
          <div className="text-sm text-muted-foreground p-2">
            No conversations yet
          </div>
        ) : (
          conversationsToDisplay.map((conv, index) => (
            <ConversationItemDisplay
              key={index}
              conversation={conv}
              appearanceState={conv.isActive ? "active" : "inactive"}
              showUnreadIndicator={false}
            />
          ))
        )}
      </div>

      <div className="mt-auto">
        <NewConversationButton
          onClick={handleNewConversation}
          loading={isCreating}
          disabled={isCreating}
        />
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
        className,
      )}
      style={dynamicStyles}
    >
      {!collapsed &&
        (realConversations || conversations) &&
        renderSelfContainedContent()}
    </div>
  );
}
