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

interface SettingsNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
}

const navigationSections = [
  { id: "general", label: "General Preferences" },
  { id: "api-keys", label: "API Keys" },
  { id: "appearance", label: "Appearance" },
  { id: "agents", label: "Agents" },
  { id: "personalities", label: "Personalities" },
  { id: "roles", label: "Roles" },
  { id: "advanced", label: "Advanced Options" },
];

export function SettingsNavigation({
  activeSection,
  onSectionChange,
  className,
}: SettingsNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        // Base navigation styling
        "bg-muted/50 border-r border-border flex flex-col",
        // Responsive width behavior
        "w-full", // Full width on mobile when collapsed
        "sm:w-64", // 256px on small screens and up (640px+)
        "lg:w-48", // 192px on large screens (1024px+)
        // Custom breakpoint: 180px width on screens < 1000px but > 800px
        "max-[1000px]:w-[180px]", // 180px width for medium screens
        // Collapsible behavior on screens < 800px
        "max-[800px]:w-auto max-[800px]:border-r-0 max-[800px]:border-b",
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
  sections: Array<{ id: string; label: string }>;
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCompact: boolean;
}

function NavigationList({
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
}
