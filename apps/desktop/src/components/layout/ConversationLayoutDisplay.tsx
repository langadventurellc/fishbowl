import { ConversationLayoutDisplayProps } from "@fishbowl-ai/ui-shared";
import { PanelLeft } from "lucide-react";
import React, { useState } from "react";
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn("flex flex-1 overflow-hidden relative", className)}
      style={style}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-2 left-20 p-1 bg-background hover:bg-accent hover:text-accent-foreground transition-colors rounded-[4px] z-50"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        aria-label="Toggle sidebar"
      >
        <PanelLeft size={20} />
      </button>
      <SidebarContainerDisplay
        collapsed={collapsed}
        selectedConversationId={selectedConversationId}
        onConversationSelect={onConversationSelect}
      />
      <MainContentPanelDisplay
        selectedConversationId={selectedConversationId}
      />
    </div>
  );
};
