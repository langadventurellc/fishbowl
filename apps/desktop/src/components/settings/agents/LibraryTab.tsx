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

import { AgentGrid } from "@/components/settings/agents/AgentGrid";
import {
  type AgentSettingsViewModel,
  useAgentsStore,
} from "@fishbowl-ai/ui-shared";
import { AlertCircle, Loader2, Plus, RefreshCw } from "lucide-react";
import React from "react";
import { announceToScreenReader } from "../../../utils/announceToScreenReader";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { EmptyLibraryState } from "./";

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
    <div className="flex flex-col">
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

      <div className="my-[16px]">
        <Button
          onClick={openCreateModal}
          className="w-full gap-2"
          size="lg"
          aria-label="Create a new role"
        >
          <Plus className="h-4 w-4" />
          Create Agent
        </Button>
      </div>

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
    </div>
  );
};
