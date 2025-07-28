/**
 * SettingsNavigation component provides responsive navigation panel for settings modal.
 *
 * Features:
 * - Responsive behavior: full navigation above 800px, collapsible below
 * - Navigation width: 200px on larger screens, 180px on medium screens < 1000px
 * - Supports keyboard navigation and accessibility
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  useActiveSection,
  useActiveSubTab,
  useSettingsActions,
  type SettingsSection,
  type SettingsSubTab,
} from "@fishbowl-ai/shared";
import { NavigationItem } from "./NavigationItem";
import { TabContainer } from "./TabContainer";
import { useNavigationKeyboard } from "../../hooks/useNavigationKeyboard";
import { useAccessibilityAnnouncements } from "@/utils";

interface SettingsNavigationProps {
  activeSection?: SettingsSection;
  onSectionChange?: (section: SettingsSection) => void;
  className?: string;
  navigationId?: string; // New prop for ARIA relationships
}

const navigationSections = [
  { id: "general" as const, label: "General", hasSubTabs: false },
  { id: "api-keys" as const, label: "API Keys", hasSubTabs: false },
  { id: "appearance" as const, label: "Appearance", hasSubTabs: false },
  {
    id: "agents" as const,
    label: "Agents",
    hasSubTabs: true,
    subTabs: [
      { id: "library" as const, label: "Library" },
      { id: "templates" as const, label: "Templates" },
      { id: "defaults" as const, label: "Defaults" },
    ],
  },
  {
    id: "personalities" as const,
    label: "Personalities",
    hasSubTabs: true,
    subTabs: [
      { id: "saved" as const, label: "Saved" },
      { id: "create-new" as const, label: "Create New" },
    ],
  },
  {
    id: "roles" as const,
    label: "Roles",
    hasSubTabs: true,
    subTabs: [
      { id: "predefined" as const, label: "Predefined" },
      { id: "custom" as const, label: "Custom" },
    ],
  },
  { id: "advanced" as const, label: "Advanced", hasSubTabs: false },
] as const;

export function SettingsNavigation({
  activeSection: propActiveSection,
  onSectionChange: propOnSectionChange,
  className,
  navigationId = "settings-navigation", // Default ID
}: SettingsNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Accessibility announcements
  const { announceSection } = useAccessibilityAnnouncements();

  // Use Zustand store for navigation state and actions
  const storeActiveSection = useActiveSection();
  const activeSubTab = useActiveSubTab();
  const { setActiveSection: storeSetActiveSection, setActiveSubTab } =
    useSettingsActions();

  // Use store values unless props are provided (for backward compatibility)
  const activeSection = propActiveSection ?? storeActiveSection;
  const onSectionChange = propOnSectionChange ?? storeSetActiveSection;

  // Announce section changes with accessibility hook
  const handleSectionChange = useCallback(
    (section: SettingsSection) => {
      onSectionChange(section);
      announceSection(section);
    },
    [onSectionChange, announceSection],
  );

  return (
    <nav
      className={cn(
        // Base navigation styling
        "bg-muted/50 border-r border-solid border-border flex flex-col",
        // Desktop: exactly 200px width (≥ 1000px)
        "min-[1000px]:w-[200px]",
        // Medium screens: exactly 180px width (< 1000px, ≥ 800px)
        "min-[800px]:max-[999px]:w-[180px]",
        // Mobile: collapsible hamburger menu (< 800px)
        "max-[799px]:w-auto max-[799px]:border-r-0 max-[799px]:border-b",
        // Padding: 10px internal padding
        "p-[10px]",
        // Scrollable when content exceeds height
        "overflow-y-auto",
        className,
      )}
      role="navigation"
      aria-label="Settings navigation"
      aria-describedby={`${navigationId}-description`}
      id={navigationId}
    >
      {/* Hidden description for screen readers */}
      <div id={`${navigationId}-description`} className="sr-only">
        Navigate between different settings sections using arrow keys or Tab.
        Press Enter or Space to select a section.
      </div>
      {/* Collapsible trigger for small screens */}
      <div className="max-[800px]:block hidden">
        <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between p-4 rounded-none"
              aria-expanded={!isCollapsed}
              aria-controls="navigation-content"
            >
              <span className="font-medium">Navigation</span>
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent id="navigation-content">
            <EnhancedNavigationList
              sections={navigationSections}
              activeSection={activeSection}
              activeSubTab={activeSubTab}
              onSectionChange={handleSectionChange}
              onSubTabChange={setActiveSubTab}
              isCompact={true}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Full navigation for larger screens */}
      <div className="min-[801px]:block hidden flex-1">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Settings
          </h3>
        </div>
        <EnhancedNavigationList
          sections={navigationSections}
          activeSection={activeSection}
          activeSubTab={activeSubTab}
          onSectionChange={handleSectionChange}
          onSubTabChange={setActiveSubTab}
          isCompact={false}
        />
      </div>
    </nav>
  );
}

interface EnhancedNavigationListProps {
  sections: readonly (
    | {
        readonly id: SettingsSection;
        readonly label: string;
        readonly hasSubTabs: false;
      }
    | {
        readonly id: SettingsSection;
        readonly label: string;
        readonly hasSubTabs: true;
        readonly subTabs: readonly {
          readonly id: SettingsSubTab;
          readonly label: string;
        }[];
      }
  )[];
  activeSection: SettingsSection;
  activeSubTab: SettingsSubTab;
  onSectionChange: (section: SettingsSection) => void;
  onSubTabChange: (tab: SettingsSubTab) => void;
  isCompact: boolean;
}

const EnhancedNavigationList = React.memo(function EnhancedNavigationList({
  sections,
  activeSection,
  activeSubTab,
  onSectionChange,
  onSubTabChange,
  isCompact,
}: EnhancedNavigationListProps) {
  const navigationRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const { handleKeyDown, isItemFocused, getFlatItems } = useNavigationKeyboard({
    sections,
    activeSection,
    activeSubTab,
    onSectionChange,
    onSubTabChange,
  });

  // Focus management effect
  useEffect(() => {
    const flatItems = getFlatItems();
    const focusedItem = flatItems.find((item) =>
      isItemFocused(item.id, item.type),
    );
    if (focusedItem) {
      const element = navigationRefs.current.get(
        `${focusedItem.type}-${focusedItem.id}`,
      );
      if (element) {
        element.focus();
      }
    }
  }, [getFlatItems, isItemFocused]);

  const setRef = (key: string, element: HTMLButtonElement | null) => {
    if (element) {
      navigationRefs.current.set(key, element);
    } else {
      navigationRefs.current.delete(key);
    }
  };

  return (
    <nav
      className={cn("space-y-1", isCompact ? "p-2" : "p-4")}
      role="navigation"
      aria-label="Settings navigation"
      onKeyDown={handleKeyDown}
    >
      {sections.map((section) => (
        <NavigationItem
          key={section.id}
          ref={(el) => setRef(`section-${section.id}`, el)}
          id={section.id}
          label={section.label}
          active={activeSection === section.id}
          onClick={() => onSectionChange(section.id)}
          hasSubTabs={section.hasSubTabs}
          isExpanded={section.hasSubTabs && activeSection === section.id}
          isCompact={isCompact}
          isFocused={isItemFocused(section.id, "section")}
          tabIndex={isItemFocused(section.id, "section") ? 0 : -1}
        >
          {section.hasSubTabs &&
            section.subTabs &&
            activeSection === section.id && (
              <div className="mt-2">
                <TabContainer
                  tabs={section.subTabs
                    .filter((tab) => tab.id)
                    .map((tab) => ({
                      id: tab.id!,
                      label: tab.label,
                      content: () => null, // Content handled elsewhere
                    }))}
                  useStore={true}
                  className="navigation-tabs"
                  orientation="vertical"
                />
              </div>
            )}
        </NavigationItem>
      ))}
    </nav>
  );
});
