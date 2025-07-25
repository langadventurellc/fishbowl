import { SidebarContainerDisplayProps } from "@fishbowl-ai/shared";
import React from "react";
import { Button } from "../input/Button";
import { ConversationItemDisplay } from "./ConversationItemDisplay";
import { SidebarHeaderDisplay } from "./SidebarHeaderDisplay";

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

  // Core sidebar container styles with theme integration and responsive behavior
  const containerStyles: React.CSSProperties = {
    width: collapsed ? "0px" : getWidthForVariant(widthVariant),
    backgroundColor: "var(--sidebar)",
    borderRight: showBorder ? `1px solid var(--border)` : "none",
    display: "flex",
    flexDirection: "column",
    padding: collapsed ? "0" : "16px",
    overflow: "hidden",
    transition: "width 0.3s ease, padding 0.3s ease",
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
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          minHeight: "120px",
        }}
      >
        {conversations!.map((conv, index) => (
          <ConversationItemDisplay
            key={index}
            conversation={conv}
            appearanceState={conv.isActive ? "active" : "inactive"}
            showUnreadIndicator={false}
          />
        ))}
      </div>

      <div style={{ marginTop: "auto" }}>
        <Button
          variant="primary"
          size="small"
          onClick={() => console.log("Demo: New conversation")}
          aria-label="Create new conversation"
        >
          New Conversation
        </Button>
      </div>
    </>
  );

  return (
    <div className={className} style={containerStyles}>
      {!collapsed && conversations && renderSelfContainedContent()}
    </div>
  );
}
