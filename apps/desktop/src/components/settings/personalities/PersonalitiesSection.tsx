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

import React, { useState } from "react";
import { usePersonalitiesStore } from "@fishbowl-ai/ui-shared";
import type { PersonalityViewModel } from "@fishbowl-ai/ui-shared";
import { AlertCircle } from "lucide-react";

export const PersonalitiesSection: React.FC = () => {
  // Subscribe to store state
  const _personalities = usePersonalitiesStore((state) => state.personalities);
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
  const [_selectedPersonality, _setSelectedPersonality] = useState<
    PersonalityViewModel | undefined
  >(undefined);
  const [_formModalOpen, _setFormModalOpen] = useState(false);
  const [_deleteDialogOpen, _setDeleteDialogOpen] = useState(false);
  const [_formMode, _setFormMode] = useState<"create" | "edit">("create");

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Personalities</h1>
          <p className="text-muted-foreground mb-6">
            Manage agent personalities and their characteristics.
          </p>
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Personalities</h1>
          <p className="text-muted-foreground mb-6">
            Manage agent personalities and their characteristics.
          </p>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Personalities</h1>
        <p className="text-muted-foreground mb-6">
          Manage agent personalities and their characteristics.
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

      {/* Content area will be added in next task */}
      <div className="text-center py-8 text-muted-foreground">
        Content area placeholder - will be implemented in next feature
      </div>
    </div>
  );
};
