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

import React, { useMemo, useCallback } from "react";
import { cn } from "../../lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { COMMON_FOCUS_CLASSES } from "../../styles/focus";
import {
  useEnhancedTabNavigation,
  type SettingsSubTab,
  type TabContainerProps,
} from "@fishbowl-ai/shared";
import { useAccessibilityAnnouncements } from "../../utils/useAccessibilityAnnouncements";

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
  orientation = "horizontal",
  activationMode = "automatic",
  disabled = false,
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

  // Initialize accessibility announcements (must be before early return)
  const { announceStateChange } = useAccessibilityAnnouncements();

  // Initialize enhanced tab navigation (must be before early return)
  const { getTabProps, getTabPanelProps } = useEnhancedTabNavigation({
    tabs: validTabs,
    activeTab: validActiveTab || "library", // Provide fallback for hook
    onTabChange,
    orientation,
    activationMode,
    disabled,
  });

  // Enhanced tab change handler with announcements (must be before early return)
  const handleEnhancedTabChange = useCallback(
    (value: string) => {
      const newTab = value as SettingsSubTab;
      onTabChange(newTab);

      // Announce tab change for screen readers
      const tabLabel = validTabs.find((tab) => tab.id === newTab)?.label;
      if (tabLabel) {
        announceStateChange(`${tabLabel} tab selected`);
      }
    },
    [onTabChange, validTabs, announceStateChange],
  );

  // Don't render if no valid tabs are provided
  if (!validActiveTab || validTabs.length === 0) {
    return null;
  }

  return (
    <Tabs
      value={validActiveTab}
      onValueChange={handleEnhancedTabChange}
      orientation={orientation}
      className={cn("w-full", className)}
    >
      {/* Tab navigation triggers */}
      <TabsList
        className={cn(
          "grid w-full",
          `grid-cols-${validTabs.length}`,
          // Enhanced ARIA attributes
        )}
        role="tablist"
        aria-orientation={orientation}
      >
        {validTabs.map((tab, index) => {
          const tabProps = getTabProps(tab.id!, index);

          return (
            <TabsTrigger
              key={tab.id!}
              value={tab.id!}
              disabled={tab.disabled}
              {...tabProps}
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
                // Enhanced focus for accessibility
                tabProps["aria-selected"] && "ring-2 ring-accent ring-offset-1",
              )}
            >
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Tab content panels */}
      {validTabs.map((tab) => {
        const panelProps = getTabPanelProps(tab.id!);

        return (
          <TabsContent
            key={tab.id!}
            value={tab.id!}
            {...panelProps}
            className={cn(
              // Base content styling
              "mt-4 outline-none",
              // Smooth transition for content changes
              COMMON_FOCUS_CLASSES.transition,
              // Custom transition duration
              `transition-opacity duration-[${animationDuration}ms] ease-in-out`,
              // Screen reader support
              "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            )}
          >
            {/* Render the tab content component */}
            <tab.content />
          </TabsContent>
        );
      })}
    </Tabs>
  );
});
