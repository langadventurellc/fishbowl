/**
 * LibraryTab component for displaying and managing agent library.
 *
 * Features:
 * - Agent grid display with responsive layout
 * - Create new agent functionality
 * - Edit/Delete agent actions
 * - Empty state handling
 * - Keyboard navigation support
 * - Accessibility compliance
 *
 * @module components/settings/agents/LibraryTab
 */

import {
  type AgentSettingsViewModel,
  useAgentsStore,
} from "@fishbowl-ai/ui-shared";
import { AlertCircle, Loader2, Plus, RefreshCw } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { cn } from "../../../lib/utils";
import { announceToScreenReader } from "../../../utils/announceToScreenReader";
import { useGridNavigation } from "../../../utils/gridNavigation";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { AgentCard, EmptyLibraryState } from "./";
import { useServices } from "../../../contexts";

/**
 * Responsive grid layout for agent cards with keyboard navigation.
 */
interface AgentGridProps {
  agents: AgentSettingsViewModel[];
  openEditModal: (agent: AgentSettingsViewModel) => void;
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
 * Library tab component displaying agent cards without search functionality.
 */
interface LibraryTabProps {
  openCreateModal: () => void;
  openEditModal: (agent: AgentSettingsViewModel) => void;
}

export const LibraryTab: React.FC<LibraryTabProps> = ({
  openCreateModal,
  openEditModal,
}) => {
  const {
    agents,
    isLoading,
    error,
    isInitialized,
    retryLastOperation,
    clearErrorState,
  } = useAgentsStore();

  // Loading state - show loading indicator while agents are being loaded
  if (isLoading || !isInitialized) {
    return (
      <div className="space-y-6 lg:space-y-8 p-6 lg:p-8 xl:p-10">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">
            {!isInitialized ? "Initializing agents..." : "Loading agents..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state - show error message with retry option
  if (error?.message) {
    return (
      <div className="space-y-6 lg:space-y-8 p-6 lg:p-8 xl:p-10">
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              Failed to load agents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-destructive">{error.message}</p>
            {error.isRetryable && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    retryLastOperation();
                    announceToScreenReader("Retrying agent load", "polite");
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearErrorState();
                    announceToScreenReader("Error cleared", "polite");
                  }}
                >
                  Dismiss
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Content with Enhanced Empty States */}
      <main
        id="agents-main-content"
        role="main"
        aria-label="Agents library content"
      >
        {agents.length === 0 ? (
          <EmptyLibraryState
            onAction={() => {
              openCreateModal();
              announceToScreenReader("Opening agent creation dialog", "polite");
            }}
          />
        ) : (
          <AgentGrid agents={agents} openEditModal={openEditModal} />
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
