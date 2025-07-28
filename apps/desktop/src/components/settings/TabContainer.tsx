/**
 * TabContainer component for reusable tab navigation in settings sections.
 *
 * Provides a consistent interface for complex settings sections that need
 * tab-based navigation (Agents, Personalities, and Roles). Built on top of
 * shadcn/ui Tabs primitives with enhanced accessibility and performance.
 *
 * Features:
 * - Configuration-driven tab rendering
 * - Smooth transitions with configurable duration
 * - Keyboard navigation and ARIA compliance
 * - Integration with existing focus management patterns
 * - Responsive design compatibility
 * - Performance optimization with React.memo
 *
 * @module components/settings/TabContainer
 */

import React, { useMemo } from "react";
import { cn } from "../../lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { COMMON_FOCUS_CLASSES } from "../../styles/focus";
import type { SettingsSubTab } from "@fishbowl-ai/shared";
import type { TabContainerProps } from "./types";

/**
 * Reusable tab container component for settings sections.
 *
 * Wraps shadcn/ui Tabs primitives to provide consistent tab functionality
 * across complex settings sections. Handles tab state management, accessibility,
 * and smooth transitions between content.
 *
 * @param props - TabContainer configuration and event handlers
 * @returns Rendered tab container with navigation and content areas
 *
 * @example
 * ```tsx
 * const agentTabs: TabConfiguration[] = [
 *   { id: "library", label: "Library", content: AgentLibrary },
 *   { id: "templates", label: "Templates", content: AgentTemplates },
 *   { id: "defaults", label: "Defaults", content: AgentDefaults },
 * ];
 *
 * <TabContainer
 *   tabs={agentTabs}
 *   activeTab={activeSubTab}
 *   onTabChange={setActiveSubTab}
 *   className="mt-4"
 * />
 * ```
 */
export const TabContainer = React.memo(function TabContainer({
  tabs,
  activeTab,
  onTabChange,
  className,
  animationDuration = 200,
}: TabContainerProps) {
  // Filter out tabs with null IDs and ensure we have valid tabs
  const validTabs = useMemo(() => {
    return tabs.filter((tab) => tab.id !== null);
  }, [tabs]);

  // Ensure we have a valid active tab that exists in the valid tabs array
  const validActiveTab = useMemo(() => {
    if (activeTab && validTabs.some((tab) => tab.id === activeTab)) {
      return activeTab;
    }
    // Fallback to first available valid tab
    return validTabs[0]?.id || null;
  }, [activeTab, validTabs]);

  // Don't render if no valid tabs are provided
  if (!validActiveTab || validTabs.length === 0) {
    return null;
  }

  // Handle tab change with proper type conversion
  const handleTabChange = (value: string) => {
    onTabChange(value as SettingsSubTab);
  };

  return (
    <Tabs
      value={validActiveTab}
      onValueChange={handleTabChange}
      className={cn("w-full", className)}
    >
      {/* Tab navigation triggers */}
      <TabsList className={cn("grid w-full", `grid-cols-${validTabs.length}`)}>
        {validTabs.map((tab) => (
          <TabsTrigger
            key={tab.id!}
            value={tab.id!}
            disabled={tab.disabled}
            aria-label={tab.ariaLabel || tab.label}
            className={cn(
              // Enhanced focus styling consistent with existing patterns
              COMMON_FOCUS_CLASSES.removeOutline,
              COMMON_FOCUS_CLASSES.backgroundOffset,
              COMMON_FOCUS_CLASSES.transition,
              // Navigation-specific focus with accent color
              "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
              // Active state enhancement
              "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
              // Consistent hover behavior
              "hover:bg-accent/60 hover:text-accent-foreground",
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Tab content panels */}
      {validTabs.map((tab) => (
        <TabsContent
          key={tab.id!}
          value={tab.id!}
          className={cn(
            // Base content styling
            "mt-4 outline-none",
            // Smooth transition for content changes
            COMMON_FOCUS_CLASSES.transition,
            // Custom transition duration
            `transition-opacity duration-[${animationDuration}ms] ease-in-out`,
          )}
        >
          {/* Render the tab content component */}
          <tab.content />
        </TabsContent>
      ))}
    </Tabs>
  );
});
