/**
 * PersonalitiesSection component provides personalities management interface.
 *
 * Features:
 * - Store integration with usePersonalitiesStore
 * - Modal state management for forms and dialogs
 * - Loading and error state handling with retry functionality
 * - Foundation layout ready for personality list implementation
 *
 * @module components/settings/PersonalitiesSection
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createLoggerSync } from "@fishbowl-ai/shared";
import type { PersonalityViewModel } from "@fishbowl-ai/ui-shared";
import { usePersonalitiesStore } from "@fishbowl-ai/ui-shared";
import { AlertCircle, Plus } from "lucide-react";
import React, { useCallback, useState } from "react";

const logger = createLoggerSync({
  config: { name: "PersonalitiesSection", level: "info" },
});

interface PersonalitiesSectionProps {
  className?: string;
}

export const PersonalitiesSection: React.FC<PersonalitiesSectionProps> = ({
  className,
}) => {
  // Subscribe to store state
  const personalities = usePersonalitiesStore((state) => state.personalities);
  const isLoading = usePersonalitiesStore((state) => state.isLoading);
  const error = usePersonalitiesStore((state) => state.error);
  const _isSaving = usePersonalitiesStore((state) => state.isSaving);

  // Subscribe to store methods
  const _createPersonality = usePersonalitiesStore(
    (state) => state.createPersonality,
  );
  const _updatePersonality = usePersonalitiesStore(
    (state) => state.updatePersonality,
  );
  const _deletePersonality = usePersonalitiesStore(
    (state) => state.deletePersonality,
  );
  const _clearError = usePersonalitiesStore((state) => state.clearError);
  const retryLastOperation = usePersonalitiesStore(
    (state) => state.retryLastOperation,
  );

  // Modal state management - centralized to ensure only one modal open
  const [_selectedPersonality, setSelectedPersonality] = useState<
    PersonalityViewModel | undefined
  >(undefined);
  const [_formModalOpen, setFormModalOpen] = useState(false);
  const [_deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [_formMode, setFormMode] = useState<"create" | "edit">("create");

  // Modal opening handlers - will connect to modals in future features
  const handleCreatePersonality = useCallback(() => {
    logger.info("Create personality button clicked");
    setFormMode("create");
    setSelectedPersonality(undefined);
    setDeleteDialogOpen(false);
    setFormModalOpen(true);
  }, []);

  const _handleEditPersonality = useCallback(
    (personality: PersonalityViewModel) => {
      logger.info("Edit personality requested", {
        personalityId: personality.id,
        personalityName: personality.name,
      });
      setFormMode("edit");
      setSelectedPersonality(personality);
      setDeleteDialogOpen(false);
      setFormModalOpen(true);
    },
    [],
  );

  const _handleDeletePersonality = useCallback(
    (personality: PersonalityViewModel) => {
      logger.info("Delete personality requested", {
        personalityId: personality.id,
        personalityName: personality.name,
      });
      setSelectedPersonality(personality);
      setFormModalOpen(false);
      setDeleteDialogOpen(true);
    },
    [],
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-6 p-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Personalities</h2>
            <p className="text-muted-foreground">
              Manage agent personalities and their characteristics.
            </p>
          </div>
          <Button onClick={handleCreatePersonality} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Personality
          </Button>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading personalities...</div>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error?.message) {
    return (
      <div className={cn("space-y-6 p-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Personalities</h2>
            <p className="text-muted-foreground">
              Manage agent personalities and their characteristics.
            </p>
          </div>
          <Button onClick={handleCreatePersonality} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Personality
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="text-destructive">Error: {error.message}</div>
          <button
            onClick={retryLastOperation}
            className="text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Header section with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Personalities</h2>
          <p className="text-muted-foreground">
            Manage agent personalities and their characteristics.
          </p>
        </div>
        <Button onClick={handleCreatePersonality} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Personality
        </Button>
      </div>

      {/* Error state display */}
      {error?.message && (
        <div
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive mb-1">
                    {error.operation
                      ? `${error.operation.charAt(0).toUpperCase() + error.operation.slice(1)} Failed`
                      : "Error"}
                  </p>
                  <p className="text-sm text-destructive/80">{error.message}</p>
                </div>
                <button
                  onClick={retryLastOperation}
                  className="text-sm text-destructive hover:text-destructive/80 underline"
                  aria-label="Retry last operation"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content area - will hold PersonalitiesList in next feature */}
      <div className="min-h-[400px]">
        {personalities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">
              No personalities yet
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md leading-relaxed">
              Create your first personality to define unique agent behaviors and
              characteristics
            </p>
            <Button onClick={handleCreatePersonality} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Personality
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Personality list will be implemented in next feature
          </div>
        )}
      </div>
    </div>
  );
};
