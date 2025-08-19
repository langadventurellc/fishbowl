/**
 * AgentsSection component provides agent management functionality with tab navigation.
 *
 * Features:
 * - Two-tab navigation: Library, Defaults
 * - Integration with TabContainer for consistent tab behavior
 * - Settings modal navigation state integration
 * - Responsive design and accessibility compliance
 * - 200ms animation transitions for smooth UX
 *
 * @module components/settings/AgentsSection
 */

import {
  useAgentSearch,
  type AgentCard as AgentCardType,
  type AgentFormData,
  type AgentsSectionProps,
  type TabConfiguration,
} from "@fishbowl-ai/ui-shared";
import { Loader2, Plus, Search, X } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { cn } from "../../../lib/utils";
import { announceToScreenReader } from "../../../utils/announceToScreenReader";
import { useGridNavigation } from "../../../utils/gridNavigation";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { TabContainer } from "../TabContainer";
import { AgentCard, EmptyLibraryState } from "./";
import { AgentFormModal } from "./AgentFormModal";
import { DefaultsTab } from "./DefaultsTab";
import { useServices } from "../../../contexts";

// Mock agent data for demonstration
const mockAgents: AgentCardType[] = [
  {
    id: "1",
    name: "Research Assistant",
    model: "Claude 3.5 Sonnet",
    role: "Research and Analysis",
  },
  {
    id: "2",
    name: "Code Reviewer",
    model: "GPT-4",
    role: "Code Analysis",
  },
  {
    id: "3",
    name: "Creative Writer",
    model: "Claude 3.5 Sonnet",
    role: "Content Creation",
  },
  {
    id: "4",
    name: "Data Analyst",
    model: "GPT-4",
    role: "Data Analysis",
  },
  {
    id: "5",
    name: "Project Manager",
    model: "Claude 3.5 Sonnet",
    role: "Project Coordination",
  },
  {
    id: "6",
    name: "UX Designer",
    model: "GPT-4",
    role: "User Experience Design",
  },
  {
    id: "7",
    name: "Technical Writer",
    model: "Claude 3.5 Sonnet",
    role: "Documentation",
  },
  {
    id: "8",
    name: "Marketing Strategist",
    model: "GPT-4",
    role: "Marketing and Strategy",
  },
];

/**
 * Responsive grid layout for agent cards with keyboard navigation.
 */
interface AgentGridProps {
  agents: AgentCardType[];
  openEditModal: (agent: AgentCardType) => void;
}

const AgentGrid: React.FC<AgentGridProps> = ({ agents, openEditModal }) => {
  const { logger } = useServices();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate columns based on screen size (matches Tailwind breakpoints)
  const columns = window.innerWidth >= 1024 ? 2 : 1;

  const { handleKeyDown } = useGridNavigation({
    totalItems: agents.length,
    columns,
    onFocusChange: setFocusedIndex,
    onActivate: (index) => {
      const editButton = cardRefs.current[index]?.querySelector(
        '[aria-label*="Edit"]',
      ) as HTMLButtonElement;
      editButton?.click();
    },
    announceToScreenReader,
    getItemName: (index) => agents[index]?.name || `Agent ${index + 1}`,
  });

  const handleCardFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      handleKeyDown(e, focusedIndex);
    },
    [handleKeyDown, focusedIndex],
  );

  return (
    <div
      id="agents-grid"
      ref={gridRef}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
      role="grid"
      aria-label={`Grid of ${agents.length} agents`}
      onKeyDown={handleGridKeyDown}
      tabIndex={-1}
    >
      {agents.map((agent, index) => (
        <div
          key={agent.id}
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
          role="gridcell"
          tabIndex={focusedIndex === index ? 0 : -1}
          onFocus={() => handleCardFocus(index)}
          className={cn(
            "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg",
            focusedIndex === index && "ring-2 ring-accent ring-offset-2",
          )}
          aria-rowindex={Math.floor(index / columns) + 1}
          aria-colindex={(index % columns) + 1}
        >
          <AgentCard
            agent={agent}
            onEdit={() => {
              openEditModal(agent);
              announceToScreenReader(
                `Opening edit dialog for ${agent.name}`,
                "polite",
              );
            }}
            onDelete={(agentId) => {
              logger.info("Delete agent requested", { agentId });
              announceToScreenReader(
                `Deleting agent ${agent.name}`,
                "assertive",
              );
            }}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Library tab component with search functionality and agent cards display.
 */
interface LibraryTabProps {
  openCreateModal: () => void;
  openEditModal: (agent: AgentCardType) => void;
}

const LibraryTab: React.FC<LibraryTabProps> = ({
  openCreateModal,
  openEditModal,
}) => {
  const [agents] = useState<AgentCardType[]>(mockAgents);

  const {
    searchTerm,
    setSearchTerm,
    filteredAgents,
    isSearching,
    resultsCount,
    clearSearch,
    handleKeyDown,
  } = useAgentSearch({
    agents,
    announceToScreenReader,
  });

  return (
    <div className="space-y-6 lg:space-y-8 p-6 lg:p-8 xl:p-10">
      {/* Skip Link for Keyboard Navigation */}
      <a
        href="#agents-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50 focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-[var(--dt-animation-focus-transition)]"
        onFocus={() =>
          announceToScreenReader("Skip to agents content", "polite")
        }
      >
        Skip to agents content
      </a>

      {/* Search Bar with Enhanced UI */}
      <div className="space-y-2">
        <div className="relative max-w-md lg:max-w-lg xl:max-w-xl">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="agent-search-input"
            role="searchbox"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 w-full"
            aria-label="Search agents by name, model, or role"
            aria-describedby="search-help search-results-count"
            aria-autocomplete="list"
            aria-expanded={searchTerm.length > 0}
            aria-controls="agents-grid"
          />

          {/* Hidden helper text for screen readers */}
          <div id="search-help" className="sr-only">
            Search will filter agents as you type. Use arrow keys to navigate
            results, Enter to interact with agents.
          </div>

          {/* Clear Button */}
          {searchTerm && (
            <Button
              onClick={clearSearch}
              variant="ghost"
              size="sm"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 p-0 hover:bg-transparent"
              aria-label="Clear search"
              type="button"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}

          {/* Loading Indicator */}
          {isSearching && (
            <div
              className="absolute right-8 top-1/2 transform -translate-y-1/2"
              role="status"
              aria-label="Searching agents"
            >
              <Loader2
                className="h-4 w-4 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Enhanced Results Count with Live Region */}
        {searchTerm && !isSearching && (
          <div
            id="search-results-count"
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
            role="status"
          >
            {resultsCount === 0
              ? `No agents found for "${searchTerm}". Try different search terms.`
              : `${resultsCount} agent${resultsCount === 1 ? "" : "s"} found for "${searchTerm}"`}
          </div>
        )}
      </div>

      {/* Content with Enhanced Empty States */}
      <main
        id="agents-main-content"
        role="main"
        aria-label="Agents library content"
      >
        {filteredAgents.length === 0 ? (
          searchTerm ? (
            <div
              className="flex flex-col items-center justify-center py-16 px-4"
              role="status"
            >
              <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
                <Search
                  className="h-8 w-8 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No agents found for "{searchTerm}"
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                Try adjusting your search terms or browse all agents.
              </p>
              <Button variant="outline" onClick={clearSearch}>
                Clear Search
              </Button>
            </div>
          ) : (
            <EmptyLibraryState
              onAction={() => {
                openCreateModal();
                announceToScreenReader(
                  "Opening agent creation dialog",
                  "polite",
                );
              }}
            />
          )
        ) : (
          <AgentGrid agents={filteredAgents} openEditModal={openEditModal} />
        )}
      </main>

      {/* Create Button */}
      <div className="flex justify-center pt-4">
        <Button className="gap-2" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Create New Agent
        </Button>
      </div>
    </div>
  );
};

export const AgentsSection: React.FC<AgentsSectionProps> = ({ className }) => {
  // Get services for logger
  const { logger } = useServices();

  // Modal state management
  const [agentModalState, setAgentModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    agent?: AgentCardType;
  }>({
    isOpen: false,
    mode: "create",
  });

  // Modal control functions
  const openCreateModal = useCallback(() => {
    setAgentModalState({
      isOpen: true,
      mode: "create",
    });
  }, []);

  const openEditModal = useCallback((agent: AgentCardType) => {
    setAgentModalState({
      isOpen: true,
      mode: "edit",
      agent,
    });
  }, []);

  const closeModal = useCallback(() => {
    setAgentModalState({
      isOpen: false,
      mode: "create",
    });
  }, []);

  // Form save handler
  const handleAgentSave = useCallback(
    async (data: AgentFormData) => {
      // UI-only implementation as per project requirements
      logger.info("Agent save operation (UI-only)", {
        mode: agentModalState.mode,
        agentName: data.name,
        timestamp: new Date().toISOString(),
      });

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Show user feedback
      const actionWord =
        agentModalState.mode === "edit" ? "updated" : "created";

      announceToScreenReader(
        `Agent ${data.name} ${actionWord} successfully`,
        "polite",
      );
    },
    [agentModalState.mode, logger],
  );

  // Tab configuration following established patterns
  const tabs: TabConfiguration[] = [
    {
      id: "library",
      label: "Library",
      content: () => (
        <LibraryTab
          openCreateModal={openCreateModal}
          openEditModal={openEditModal}
        />
      ),
    },
    {
      id: "defaults",
      label: "Defaults",
      content: () => <DefaultsTab />,
    },
  ];

  return (
    <div className={cn("agents-section space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Agents</h1>
        <p className="text-muted-foreground mb-6">
          Configure AI agents and their behavior settings.
        </p>
      </div>
      <TabContainer
        tabs={tabs}
        useStore={true}
        animationDuration={200}
        className="agents-tabs"
      />

      <AgentFormModal
        isOpen={agentModalState.isOpen}
        onOpenChange={closeModal}
        mode={agentModalState.mode}
        agent={agentModalState.agent}
        onSave={handleAgentSave}
        isLoading={false}
      />
    </div>
  );
};
