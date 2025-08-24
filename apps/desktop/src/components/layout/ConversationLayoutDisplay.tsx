import { ConversationLayoutDisplayProps } from "@fishbowl-ai/ui-shared";
import React, { useState } from "react";
import { cn } from "../../lib/utils";
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

  return (
    <div className={cn("flex flex-1 overflow-hidden", className)} style={style}>
      {/* Sidebar Toggle Button */}
      <div onClick={handleSidebarToggle} className="cursor-pointer">
        <SidebarToggleDisplay
          isCollapsed={isSidebarCollapsed}
          showHoverState={false}
        />
      </div>

      {/* Sidebar */}
      <SidebarContainerDisplay
        collapsed={isSidebarCollapsed}
        showBorder={true}
      />

      {/* Main Content */}
      <MainContentPanelDisplay agents={agents} messages={messages} />
    </div>
  );
};
