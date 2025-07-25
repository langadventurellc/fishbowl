import React, { useState } from "react";
import { ConversationLayoutDisplayProps } from "@fishbowl-ai/shared";
import { SidebarContainerDisplay, SidebarToggleDisplay } from "../sidebar";
import { MainContentPanelDisplay } from "./MainContentPanelDisplay";

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

  // Container styles extracted from DesignPrototype.tsx lines 241-245 (mainLayout)
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
