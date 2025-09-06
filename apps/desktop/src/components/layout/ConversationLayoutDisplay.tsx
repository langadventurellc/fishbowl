import { ConversationLayoutDisplayProps } from "@fishbowl-ai/ui-shared";
import React from "react";
import { cn } from "../../lib/utils";
import { SidebarContainerDisplay } from "../sidebar";
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
> = ({ selectedConversationId, onConversationSelect, className, style }) => {
  return (
    <div className={cn("flex flex-1 overflow-hidden", className)} style={style}>
      <SidebarContainerDisplay
        collapsed={false}
        selectedConversationId={selectedConversationId}
        onConversationSelect={onConversationSelect}
      />
      <MainContentPanelDisplay
        selectedConversationId={selectedConversationId}
      />
    </div>
  );
};
