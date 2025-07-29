/**
 * AgentsSection component provides agent management functionality with tab navigation.
 *
 * Features:
 * - Three-tab navigation: Library, Templates, Defaults
 * - Integration with TabContainer for consistent tab behavior
 * - Settings modal navigation state integration
 * - Responsive design and accessibility compliance
 * - 200ms animation transitions for smooth UX
 *
 * @module components/settings/AgentsSection
 */

import React from "react";
import { cn } from "../../lib/utils";
import { TabContainer } from "./TabContainer";
import type { AgentsSectionProps, TabConfiguration } from "@fishbowl-ai/shared";

/**
 * Library tab placeholder component for agent library management.
 */
const LibraryTab: React.FC = () => (
  <div className="space-y-4 p-6">
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold mb-2">Agent Library</h3>
      <p className="text-muted-foreground">
        Browse and manage your collection of AI agents.
      </p>
    </div>
  </div>
);

/**
 * Templates tab placeholder component for agent template management.
 */
const TemplatesTab: React.FC = () => (
  <div className="space-y-4 p-6">
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold mb-2">Agent Templates</h3>
      <p className="text-muted-foreground">
        Create and manage pre-configured agent templates.
      </p>
    </div>
  </div>
);

/**
 * Defaults tab placeholder component for agent default settings.
 */
const DefaultsTab: React.FC = () => (
  <div className="space-y-4 p-6">
    <div className="text-center py-8">
      <h3 className="text-lg font-semibold mb-2">Agent Defaults</h3>
      <p className="text-muted-foreground">
        Configure default settings for new agents.
      </p>
    </div>
  </div>
);

export const AgentsSection: React.FC<AgentsSectionProps> = ({ className }) => {
  // Tab configuration following established patterns
  const tabs: TabConfiguration[] = [
    {
      id: "library",
      label: "Library",
      content: () => <LibraryTab />,
    },
    {
      id: "templates",
      label: "Templates",
      content: () => <TemplatesTab />,
    },
    {
      id: "defaults",
      label: "Defaults",
      content: () => <DefaultsTab />,
    },
  ];

  return (
    <div className={cn("agents-section", className)}>
      <TabContainer
        tabs={tabs}
        useStore={true}
        animationDuration={200}
        className="agents-tabs"
      />
    </div>
  );
};
