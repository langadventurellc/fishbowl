import React, { useState } from "react";
import { ConversationLayoutDisplayProps } from "@fishbowl-ai/shared";
import { SidebarContainerDisplay, SidebarToggleDisplay } from "../sidebar";
import { MainContentPanelDisplay } from "./MainContentPanelDisplay";

/**
 * ConversationLayoutDisplay - Complete conversation interface layout component
 *
 * Top-level layout component that combines the sidebar navigation with the main
 * conversation content area. Manages sidebar collapse state and provides the
 * overall structure for the conversation interface with proper flex organization.
 */
export const ConversationLayoutDisplay: React.FC<
  ConversationLayoutDisplayProps
> = ({
  conversations,
  agents,
  messages,
  defaultSidebarCollapsed = false,
  className,
  style,
}) => {
  // Internal state management for sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    defaultSidebarCollapsed,
  );

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Container styles for the main conversation layout
  const containerStyles: React.CSSProperties = {
    flex: 1,
    display: "flex",
    overflow: "hidden",
    // Merge custom styles
    ...style,
  };

  return (
    <div className={className} style={containerStyles}>
      {/* Sidebar Toggle Button */}
      <div onClick={handleSidebarToggle} style={{ cursor: "pointer" }}>
        <SidebarToggleDisplay
          isCollapsed={isSidebarCollapsed}
          showHoverState={false}
        />
      </div>

      {/* Sidebar */}
      <SidebarContainerDisplay
        collapsed={isSidebarCollapsed}
        widthVariant="default"
        showBorder={true}
        conversations={conversations}
      />

      {/* Main Content */}
      <MainContentPanelDisplay agents={agents} messages={messages} />
    </div>
  );
};
