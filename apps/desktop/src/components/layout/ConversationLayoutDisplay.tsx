import React, { useState } from "react";
import { ConversationLayoutDisplayProps } from "@fishbowl-ai/shared";
import { Button } from "../input/Button";
import {
  ConversationItemDisplay,
  SidebarContainerDisplay,
  SidebarHeaderDisplay,
  SidebarToggleDisplay,
} from "../sidebar";
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
      >
        <SidebarHeaderDisplay
          title="Conversations"
          showControls={true}
          collapsed={isSidebarCollapsed}
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
          {conversations.map((conv, index) => (
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
      </SidebarContainerDisplay>

      {/* Main Content */}
      <MainContentPanelDisplay agents={agents} messages={messages} />
    </div>
  );
};
