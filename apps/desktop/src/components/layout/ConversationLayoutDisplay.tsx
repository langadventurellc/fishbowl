import { ConversationLayoutDisplayProps } from "@fishbowl-ai/ui-shared";
import { PanelLeft } from "lucide-react";
import React, { useCallback, useState } from "react";
import { cn } from "../../lib/utils";
import { SidebarContainerDisplay } from "../sidebar";
import { ResizeHandle } from "../sidebar";
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
  // Sidebar width state with defaults and bounds
  const MIN_WIDTH = 100;
  const DEFAULT_WIDTH = 200;
  const MAX_WIDTH = 400;

  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTH);
  const [lastExpandedWidth, setLastExpandedWidth] =
    useState<number>(DEFAULT_WIDTH);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleToggle = useCallback(() => {
    if (collapsed) {
      // Expand to last known width or default
      const width = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, lastExpandedWidth || DEFAULT_WIDTH),
      );
      setSidebarWidth(width);
      setCollapsed(false);
    } else {
      // Collapse and remember current width
      if (sidebarWidth > 0) setLastExpandedWidth(sidebarWidth);
      setSidebarWidth(0);
      setCollapsed(true);
    }
  }, [collapsed, lastExpandedWidth, sidebarWidth]);

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      // Clamp for safety even though handle already clamps
      const clamped = Math.min(MAX_WIDTH, Math.max(0, newWidth));
      setSidebarWidth(clamped);
      if (clamped === 0) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
        setLastExpandedWidth(clamped);
      }
    },
    [setSidebarWidth],
  );

  return (
    <div
      className={cn("flex flex-1 overflow-hidden relative", className)}
      style={style}
    >
      <button
        onClick={handleToggle}
        className="absolute top-2 left-20 p-1 bg-background hover:bg-accent hover:text-accent-foreground transition-colors rounded-[4px] z-50"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        aria-label="Toggle sidebar"
      >
        <PanelLeft size={20} />
      </button>
      {/* Sidebar wrapper to host absolute-positioned resize handle */}
      <div className="relative flex-none">
        <SidebarContainerDisplay
          collapsed={collapsed}
          selectedConversationId={selectedConversationId}
          onConversationSelect={onConversationSelect}
          // Override internal fixed width with live width
          style={{ width: collapsed ? 0 : sidebarWidth }}
          className={cn(isDragging && "transition-none")}
        />
        {!collapsed && (
          <ResizeHandle
            onWidthChange={handleWidthChange}
            currentWidth={sidebarWidth}
            onDraggingChange={setIsDragging}
            minWidth={MIN_WIDTH}
            maxWidth={MAX_WIDTH}
            snapThreshold={50}
          />
        )}
      </div>
      <MainContentPanelDisplay
        selectedConversationId={selectedConversationId}
      />
    </div>
  );
};
