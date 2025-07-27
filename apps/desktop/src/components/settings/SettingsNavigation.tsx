/**
 * SettingsNavigation component provides responsive navigation panel for settings modal.
 *
 * Features:
 * - Responsive behavior: full navigation above 800px, collapsible below
 * - Navigation width: 200px on larger screens, 180px on medium screens < 1000px
 * - Supports keyboard navigation and accessibility
 */

import React, { useState } from "react";
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
  useSettingsActions,
  type SettingsSection,
} from "@fishbowl-ai/shared";

interface SettingsNavigationProps {
  activeSection?: SettingsSection;
  onSectionChange?: (section: SettingsSection) => void;
  className?: string;
}

const navigationSections = [
  { id: "general" as const, label: "General Preferences" },
  { id: "api-keys" as const, label: "API Keys" },
  { id: "appearance" as const, label: "Appearance" },
  { id: "agents" as const, label: "Agents" },
  { id: "personalities" as const, label: "Personalities" },
  { id: "roles" as const, label: "Roles" },
  { id: "advanced" as const, label: "Advanced Options" },
] as const;

export function SettingsNavigation({
  activeSection: propActiveSection,
  onSectionChange: propOnSectionChange,
  className,
}: SettingsNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Use Zustand store for navigation state and actions
  const storeActiveSection = useActiveSection();
  const { setActiveSection: storeSetActiveSection } = useSettingsActions();

  // Use store values unless props are provided (for backward compatibility)
  const activeSection = propActiveSection ?? storeActiveSection;
  const onSectionChange = propOnSectionChange ?? storeSetActiveSection;

  return (
    <div
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
    >
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
            <NavigationList
              sections={navigationSections}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
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
        <NavigationList
          sections={navigationSections}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          isCompact={false}
        />
      </div>
    </div>
  );
}

interface NavigationListProps {
  sections: readonly { readonly id: SettingsSection; readonly label: string }[];
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  isCompact: boolean;
}

const NavigationList = React.memo(function NavigationList({
  sections,
  activeSection,
  onSectionChange,
  isCompact,
}: NavigationListProps) {
  return (
    <nav
      className={cn("space-y-1", isCompact ? "p-2" : "p-4")}
      role="navigation"
      aria-label="Settings navigation"
    >
      {sections.map((section) => (
        <Button
          key={section.id}
          variant={activeSection === section.id ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start",
            isCompact ? "text-xs p-2" : "text-sm p-3",
            "relative",
            // Active state with left border
            activeSection === section.id && [
              "bg-accent text-accent-foreground",
              "before:absolute before:left-0 before:top-0 before:bottom-0",
              "before:w-1 before:bg-primary before:rounded-r",
            ],
            // Hover and focus states
            "hover:bg-accent/80 hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "transition-colors duration-200",
          )}
          onClick={() => onSectionChange(section.id)}
          aria-current={activeSection === section.id ? "page" : undefined}
        >
          {section.label}
        </Button>
      ))}
    </nav>
  );
});
