/**
 * SettingsNavigation component provides navigation panel for settings modal.
 *
 * Features:
 * - Fixed width navigation for desktop app
 * - Navigation width: 200px on large screens, 180px on medium screens
 * - Supports keyboard navigation and accessibility
 */

import { useAccessibilityAnnouncements } from "@/utils";
import {
  useActiveSection,
  useActiveSubTab,
  useSettingsActions,
  type EnhancedNavigationListProps,
  type SettingsNavigationProps,
  type SettingsSection,
  type SettingsSubTab,
} from "@fishbowl-ai/ui-shared";
import React, { useCallback, useEffect, useRef } from "react";
import { useNavigationKeyboard } from "../../hooks/useNavigationKeyboard";
import { cn } from "../../lib/utils";
import { NavigationItem } from "./NavigationItem";
import { SubNavigationTab } from "./SubNavigationTab";

const navigationSections = [
  { id: "general" as const, label: "General", hasSubTabs: false },
  { id: "llm-setup" as const, label: "LLM Setup", hasSubTabs: false },
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
        // Default width for medium screens
        "w-[var(--dt-nav-width-medium)]",
        // Desktop: exactly 200px width (≥ 1024px)
        "lg:w-[var(--dt-nav-width-desktop)]",
        // Padding: 10px internal padding
        "p-[var(--dt-nav-padding)]",
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
      {/* Navigation content - always visible for desktop app */}
      <div className="flex-1">
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
              <div className="mt-2 ml-4 space-y-1 pb-2">
                {section.subTabs
                  .filter((subTab) => subTab.id)
                  .map((subTab) => {
                    const subTabId = subTab.id as string; // Safe assertion after filter
                    return (
                      <SubNavigationTab
                        key={subTabId}
                        ref={(el) => setRef(`subtab-${subTabId}`, el)}
                        id={subTabId as SettingsSubTab}
                        label={subTab.label}
                        active={activeSubTab === subTabId}
                        onClick={() =>
                          onSubTabChange(subTabId as SettingsSubTab)
                        }
                        isCompact={isCompact}
                        isFocused={isItemFocused(subTabId, "subtab")}
                        tabIndex={isItemFocused(subTabId, "subtab") ? 0 : -1}
                      />
                    );
                  })}
              </div>
            )}
        </NavigationItem>
      ))}
    </nav>
  );
});
