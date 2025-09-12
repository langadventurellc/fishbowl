/**
 * PersonalitiesSection component displays a unified list of personalities.
 *
 * Features:
 * - Single unified list view of all personalities (no tab distinction)
 * - Displays sample personalities data for demonstration
 * - Modal infrastructure preserved for future functionality
 * - Integration with settings modal navigation state
 * - Responsive design and accessibility compliance
 * - Edit/Delete buttons present but functional with store operations
 *
 * @module components/settings/PersonalitiesSection
 */

import type {
  PersonalitiesSectionProps,
  PersonalityFormData,
  PersonalityViewModel,
} from "@fishbowl-ai/ui-shared";
import { usePersonalitiesStore } from "@fishbowl-ai/ui-shared";
import { AlertCircle, Plus, RotateCcw, X } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { useServices } from "../../../contexts";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { DeletePersonalityDialog } from "./DeletePersonalityDialog";
import { PersonalitiesList } from "./PersonalitiesList";
import { PersonalityFormModal } from "./PersonalityFormModal";

export const PersonalitiesSection: React.FC<PersonalitiesSectionProps> = ({
  className,
}) => {
  const { logger } = useServices();
  // Subscribe to store state
  const personalities = usePersonalitiesStore((state) => state.personalities);
  const isLoading = usePersonalitiesStore((state) => state.isLoading);
  const error = usePersonalitiesStore((state) => state.error);
  const isSaving = usePersonalitiesStore((state) => state.isSaving);

  // Subscribe to store methods
  const createPersonality = usePersonalitiesStore(
    (state) => state.createPersonality,
  );
  const updatePersonality = usePersonalitiesStore(
    (state) => state.updatePersonality,
  );
  const deletePersonality = usePersonalitiesStore(
    (state) => state.deletePersonality,
  );
  const clearError = usePersonalitiesStore((state) => state.clearError);
  const retryLastOperation = usePersonalitiesStore(
    (state) => state.retryLastOperation,
  );

  // Modal state management - centralized to ensure only one modal open
  const [selectedPersonality, setSelectedPersonality] = useState<
    PersonalityViewModel | undefined
  >(undefined);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Modal opening handlers - opens modals with appropriate data
  const handleCreatePersonality = useCallback(() => {
    logger.info("Opening create personality modal");
    setFormMode("create");
    setSelectedPersonality(undefined);
    setDeleteDialogOpen(false); // Ensure only one modal open
    setFormModalOpen(true);
  }, [logger]);

  const handleEditPersonality = useCallback(
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
    [logger],
  );

  const handleDeletePersonality = useCallback(
    (personality: PersonalityViewModel) => {
      logger.info("Delete personality requested", {
        personalityId: personality.id,
        personalityName: personality.name,
      });
      setSelectedPersonality(personality);
      setFormModalOpen(false);
      setDeleteDialogOpen(true);
    },
    [logger],
  );

  // Helper to detect which fields changed for verification and logging
  const getChangedFields = useCallback(
    (
      original: PersonalityViewModel,
      updated: PersonalityFormData,
    ): string[] => {
      const changed: string[] = [];

      if (original.name !== updated.name) changed.push("name");
      // Compare behaviors if they exist
      if (original.behaviors || updated.behaviors) {
        const originalBehaviors = original.behaviors || {};
        const updatedBehaviors = updated.behaviors || {};

        const allBehaviorKeys = new Set([
          ...Object.keys(originalBehaviors),
          ...Object.keys(updatedBehaviors),
        ]);

        for (const key of allBehaviorKeys) {
          if (originalBehaviors[key] !== updatedBehaviors[key]) {
            changed.push(`behaviors.${key}`);
          }
        }
      }

      if (original.customInstructions !== updated.customInstructions)
        changed.push("customInstructions");

      return changed;
    },
    [],
  );

  // Real save handler using store operations
  const handleFormSave = useCallback(
    async (data: PersonalityFormData) => {
      logger.info("Saving personality", {
        mode: formMode,
        personalityId: selectedPersonality?.id,
      });

      try {
        // Clear any existing errors
        clearError();

        if (formMode === "create") {
          // Create new personality
          const newPersonalityId = createPersonality(data);

          if (newPersonalityId) {
            logger.info("Personality created successfully", {
              personalityId: newPersonalityId,
            });
            // Close modal only on successful creation
            setFormModalOpen(false);
            setSelectedPersonality(undefined);
          } else {
            // Creation failed - error is already set in store
            logger.warn(
              "Personality creation failed - name might not be unique",
            );
          }
        } else if (selectedPersonality?.id) {
          // Track changes for performance measurement and verification
          const startTime = performance.now();
          const changedFields = getChangedFields(selectedPersonality, data);

          // Update existing personality
          updatePersonality(selectedPersonality.id, data);

          // Check if update succeeded by checking error state
          const currentError = usePersonalitiesStore.getState().error;
          const updateTime = performance.now() - startTime;

          if (!currentError?.message) {
            // Verify timestamp was updated
            const updatedPersonality = usePersonalitiesStore
              .getState()
              .personalities.find((p) => p.id === selectedPersonality.id);
            const timestampUpdated =
              updatedPersonality &&
              updatedPersonality.updatedAt &&
              selectedPersonality.updatedAt
                ? new Date(updatedPersonality.updatedAt) >
                  new Date(selectedPersonality.updatedAt)
                : false;

            logger.info("Personality updated successfully", {
              personalityId: selectedPersonality.id,
              updateTime: `${updateTime.toFixed(2)}ms`,
              fieldsChanged: changedFields,
              timestampUpdated,
              changedFieldCount: changedFields.length,
            });

            // Close modal only on successful update
            setFormModalOpen(false);
            setSelectedPersonality(undefined);
          } else {
            logger.warn("Personality update failed", {
              error: currentError.message,
              updateTime: `${updateTime.toFixed(2)}ms`,
              attemptedChanges: changedFields,
            });
          }
        }
      } catch (error) {
        // Handle unexpected errors
        logger.error(
          "Failed to save personality",
          error instanceof Error ? error : new Error(String(error)),
        );
        // Keep modal open on error
      }
    },
    [
      formMode,
      selectedPersonality,
      createPersonality,
      updatePersonality,
      clearError,
      getChangedFields,
      logger,
    ],
  );

  const handleConfirmDelete = useCallback(
    async (personality: PersonalityViewModel) => {
      logger.info("Deleting personality", {
        personalityId: personality.id,
        personalityName: personality.name,
      });

      try {
        // Clear any existing errors
        clearError();

        // Perform the actual deletion
        deletePersonality(personality.id);

        // Check if deletion succeeded by checking error state
        const currentError = usePersonalitiesStore.getState().error;
        if (!currentError?.message) {
          logger.info("Personality deleted successfully", {
            personalityId: personality.id,
            personalityName: personality.name,
          });
          // Close dialog only on successful deletion
          setDeleteDialogOpen(false);
          setSelectedPersonality(undefined);
        } else {
          logger.warn("Personality deletion failed", {
            error: currentError.message,
            personalityId: personality.id,
          });
          // Keep dialog open on error
        }
      } catch (error) {
        // Handle unexpected errors
        logger.error(
          "Failed to delete personality",
          error instanceof Error ? error : new Error(String(error)),
        );
        // Keep dialog open on error
      }
    },
    [deletePersonality, clearError, logger],
  );

  // Render empty state when no personalities exist
  const renderEmptyState = useMemo(() => {
    if (!isLoading && personalities.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <h3 className="text-xl font-semibold mb-2 text-center">
            No personalities configured
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-md leading-relaxed">
            Create your first personality to define custom agent behaviors and
            characteristics
          </p>
          <Button
            onClick={handleCreatePersonality}
            className="gap-2"
            aria-label="Create your first personality"
          >
            <Plus className="h-4 w-4" />
            Create First Personality
          </Button>
        </div>
      );
    }
    return null;
  }, [isLoading, personalities.length, handleCreatePersonality]);

  // Early return for loading state
  if (isLoading) {
    return (
      <div className={cn("personalities-section space-y-6", className)}>
        <div>
          <h1 className="text-2xl font-bold mb-2">Personalities</h1>
          <p className="text-muted-foreground mb-6">
            Define and configure agent personalities and characteristics.
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div
              className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"
              aria-label="Loading personalities..."
            />
            <p className="text-sm text-muted-foreground">
              Loading personalities...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("personalities-section space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Personalities</h1>
        <p className="text-muted-foreground mb-6">
          Define and configure agent personalities and characteristics.
        </p>
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
                  {error.retryCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Retry attempt {error.retryCount}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {error.isRetryable && error.operation && (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryLastOperation}
                    className="h-7 text-xs border-destructive/20 text-destructive hover:bg-destructive/10"
                    disabled={isSaving || isLoading}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conditionally render empty state or personalities list */}
      {renderEmptyState || (
        <PersonalitiesList
          personalities={personalities}
          onCreateClick={handleCreatePersonality}
          onEdit={handleEditPersonality}
          onDelete={handleDeletePersonality}
        />
      )}

      {/* Personality creation/editing modal */}
      <PersonalityFormModal
        isOpen={formModalOpen}
        onOpenChange={setFormModalOpen}
        mode={formMode}
        personality={selectedPersonality}
        onSave={handleFormSave}
        isLoading={isSaving}
      />

      {/* Personality deletion confirmation dialog */}
      <DeletePersonalityDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        personality={selectedPersonality || null}
        onConfirm={handleConfirmDelete}
        isLoading={isSaving}
      />
    </div>
  );
};
