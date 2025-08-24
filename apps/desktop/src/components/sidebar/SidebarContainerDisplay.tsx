import { SidebarContainerDisplayProps } from "@fishbowl-ai/ui-shared";
import React from "react";
import { cn } from "../../lib/utils";
import { ConversationItemDisplay } from "./ConversationItemDisplay";
import { SidebarHeaderDisplay } from "./SidebarHeaderDisplay";
import { NewConversationButton } from "../conversations/NewConversationButton";

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
  // Temporary onClick handler for NewConversationButton
  const handleNewConversation = async () => {
    console.log("New conversation clicked");
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
        {conversations!.map((conv, index) => (
          <ConversationItemDisplay
            key={index}
            conversation={conv}
            appearanceState={conv.isActive ? "active" : "inactive"}
            showUnreadIndicator={false}
          />
        ))}
      </div>

      <div className="mt-auto">
        <NewConversationButton
          onClick={handleNewConversation}
          loading={false}
          disabled={false}
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
      {!collapsed && conversations && renderSelfContainedContent()}
    </div>
  );
}
