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
import type {
  PersonalityViewModel,
  PersonalityFormData,
} from "@fishbowl-ai/ui-shared";
import { usePersonalitiesStore } from "@fishbowl-ai/ui-shared";
import { AlertCircle, Plus } from "lucide-react";
import React, { useCallback, useState } from "react";
import { DeletePersonalityDialog } from "./DeletePersonalityDialog";
import { PersonalitiesList } from "./PersonalitiesList";
import { PersonalityFormModal } from "./PersonalityFormModal";

const logger = createLoggerSync({
  config: { name: "PersonalitiesSection", level: "info" },
});

// Mock personality data for testing the list integration
const mockPersonalities: PersonalityViewModel[] = [
  {
    id: "mock-1",
    name: "Creative Brainstormer",
    bigFive: {
      openness: 4.2,
      conscientiousness: 3.1,
      extraversion: 3.8,
      agreeableness: 4.0,
      neuroticism: 2.3,
    },
    behaviors: {
      enthusiasm: 0.8,
      creativity: 0.9,
      collaboration: 0.7,
    },
    customInstructions:
      "Focus on generating innovative ideas and thinking outside the box. Encourage wild ideas and build upon others' suggestions.",
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-20T15:30:00.000Z",
  },
  {
    id: "mock-2",
    name: "Analytical Researcher",
    bigFive: {
      openness: 3.9,
      conscientiousness: 4.5,
      extraversion: 2.8,
      agreeableness: 3.2,
      neuroticism: 2.1,
    },
    behaviors: {
      precision: 0.9,
      skepticism: 0.7,
      thoroughness: 0.8,
      factChecking: 0.9,
    },
    customInstructions:
      "Always verify facts and provide evidence-based responses. Question assumptions and dig deep into details.",
    createdAt: "2024-01-10T09:00:00.000Z",
    updatedAt: "2024-01-25T14:45:00.000Z",
  },
  {
    id: "mock-3",
    name: "Empathetic Facilitator",
    bigFive: {
      openness: 3.7,
      conscientiousness: 3.8,
      extraversion: 4.1,
      agreeableness: 4.6,
      neuroticism: 2.0,
    },
    behaviors: {
      empathy: 0.9,
      patience: 0.8,
      encouragement: 0.9,
    },
    customInstructions:
      "Listen actively and help others feel heard. Provide emotional support and create inclusive environments for all participants.",
    createdAt: "2024-01-12T11:30:00.000Z",
    updatedAt: "2024-01-18T16:20:00.000Z",
  },
];

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

  // Modal opening handlers - will connect to modals in future features
  const handleCreatePersonality = useCallback(() => {
    logger.info("Create personality button clicked");
    setFormMode("create");
    setSelectedPersonality(undefined);
    setDeleteDialogOpen(false);
    setFormModalOpen(true);
  }, []);

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
    [],
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
    [],
  );

  // Form save handler - connects to store operations
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
          createPersonality(data);
          logger.info("Personality created successfully");
        } else if (selectedPersonality?.id) {
          // Update existing personality
          updatePersonality(selectedPersonality.id, data);
          logger.info("Personality updated successfully", {
            personalityId: selectedPersonality.id,
          });
        }

        // Modal closes automatically via PersonalityFormModal's onSave handler
        setSelectedPersonality(undefined);
      } catch (error) {
        // Error handling - modal stays open for retry
        logger.error(
          "Failed to save personality",
          error instanceof Error ? error : new Error(String(error)),
        );
        // PersonalityFormModal will handle showing the error to user
      }
    },
    [
      formMode,
      selectedPersonality,
      createPersonality,
      updatePersonality,
      clearError,
    ],
  );

  // Delete confirmation handler - executes personality deletion
  const handleConfirmDelete = useCallback(
    async (personality: PersonalityViewModel) => {
      logger.info("Confirming personality deletion", {
        personalityId: personality.id,
        personalityName: personality.name,
      });

      try {
        // Clear any existing errors
        clearError();

        // Execute deletion
        deletePersonality(personality.id);
        logger.info("Personality deleted successfully", {
          personalityId: personality.id,
        });

        // Close dialog and clear selection
        setDeleteDialogOpen(false);
        setSelectedPersonality(undefined);
      } catch (error) {
        // Error handling - dialog stays open for retry
        logger.error(
          "Failed to delete personality",
          error instanceof Error ? error : new Error(String(error)),
        );
        // DeletePersonalityDialog will handle showing the error to user
      }
    },
    [deletePersonality, clearError],
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

      {/* Content area with PersonalitiesList integration */}
      <div className="space-y-6">
        {/* New List Component for testing */}
        <div>
          <h3 className="text-lg font-medium mb-4">
            Personalities List (Preview)
          </h3>
          <PersonalitiesList
            personalities={mockPersonalities}
            onEdit={handleEditPersonality}
            onDelete={handleDeletePersonality}
            onCreateClick={handleCreatePersonality}
          />
        </div>

        {/* Original content remains for now */}
        <div className="min-h-[400px]">
          {personalities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">
                No personalities yet (Store Data)
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-md leading-relaxed">
                Create your first personality to define unique agent behaviors
                and characteristics
              </p>
              <Button onClick={handleCreatePersonality} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Personality
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Store-based personality list will be connected in future tasks
            </div>
          )}
        </div>
      </div>

      {/* Personality Form Modal */}
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
