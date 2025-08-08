/**
 * LLM Setup Settings component for managing LLM provider configurations.
 *
 * Features:
 * - Empty state with provider selection dropdown
 * - Modal-based configuration for adding/editing APIs
 * - List view of configured APIs with edit/delete actions
 * - Service layer integration with persistent storage
 * - Support for all provider types (OpenAI, Anthropic)
 *
 * @module components/settings/LlmSetupSection
 */
import type {
  LlmConfigInput,
  LlmConfigMetadata,
  Provider,
} from "@fishbowl-ai/shared";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { EmptyLlmState, LlmConfigModal, LlmProviderCard } from ".";
import { useLlmConfig } from "../../../hooks/useLlmConfig";
import { cn } from "../../../lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";

/**
 * LLM Setup section component that manages LLM configurations.
 *
 * Provides UI for adding, editing, and deleting LLM provider API configurations
 * through a modal-based interface with service layer integration.
 *
 * @param className - Optional CSS class name for styling
 * @returns LLM Setup section component
 */
export function LlmSetupSection({ className }: { className?: string }) {
  // Use service layer hook
  const {
    configurations,
    isLoading,
    error,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    getConfiguration,
    clearError,
  } = useLlmConfig();

  // Modal state with Provider type
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    provider: Provider;
    editingId?: string;
    initialData?: LlmConfigInput & { id?: string };
  }>({
    isOpen: false,
    mode: "add",
    provider: "openai",
  });

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    apiId: string | null;
  }>({
    isOpen: false,
    apiId: null,
  });

  const handleSetupProvider = useCallback((provider: Provider) => {
    setModalState({
      isOpen: true,
      mode: "add",
      provider,
    });
  }, []);

  const handleSaveApi = useCallback(
    async (data: LlmConfigInput & { id?: string }) => {
      try {
        if (modalState.mode === "edit" && modalState.editingId) {
          await updateConfiguration(modalState.editingId, data);
        } else {
          await createConfiguration(data);
        }
        // Only close modal if save succeeds
        setModalState((prev) => ({ ...prev, isOpen: false }));
      } catch (err) {
        console.error("Failed to save configuration:", err);
        // Re-throw the error so the modal can handle it
        throw err;
      }
    },
    [
      modalState.mode,
      modalState.editingId,
      createConfiguration,
      updateConfiguration,
    ],
  );

  const handleEdit = useCallback(
    async (config: LlmConfigMetadata) => {
      try {
        // First open modal with basic metadata
        setModalState({
          isOpen: true,
          mode: "edit",
          provider: config.provider,
          editingId: config.id,
          initialData: {
            id: config.id,
            customName: config.customName,
            provider: config.provider,
            apiKey: "", // Will be fetched below
            baseUrl: config.baseUrl,
            useAuthHeader: config.useAuthHeader,
          },
        });

        // Then fetch the full configuration including API key
        const fullConfig = await getConfiguration(config.id);
        if (fullConfig) {
          setModalState((prev) => ({
            ...prev,
            initialData: {
              id: fullConfig.id,
              customName: fullConfig.customName,
              provider: fullConfig.provider,
              apiKey: fullConfig.apiKey,
              baseUrl: fullConfig.baseUrl,
              useAuthHeader: fullConfig.useAuthHeader,
            },
          }));
        }
      } catch (error) {
        console.error("Failed to load configuration for editing:", error);
        // Modal will still open with basic data, just no API key
      }
    },
    [getConfiguration],
  );

  const handleDeleteClick = useCallback((apiId: string) => {
    setDeleteConfirmation({
      isOpen: true,
      apiId,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteConfirmation.apiId) {
      try {
        await deleteConfiguration(deleteConfirmation.apiId);
      } catch (err) {
        console.error("Failed to delete configuration:", err);
      }
    }
    setDeleteConfirmation({ isOpen: false, apiId: null });
  }, [deleteConfirmation.apiId, deleteConfiguration]);

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div>
          <h1 className="text-2xl font-bold mb-2">LLM Setup</h1>
          <p className="text-muted-foreground">
            Configure AI language model providers for your conversations
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2
            className="h-6 w-6 animate-spin mr-2"
            role="progressbar"
            aria-label="Loading"
          />
          <span className="text-muted-foreground">
            Loading configurations...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-bold mb-2">LLM Setup</h1>
        <p className="text-muted-foreground">
          Configure AI language model providers for your conversations
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="ml-2 text-red-600 hover:text-red-700"
          >
            Dismiss
          </Button>
        </div>
      )}

      {configurations.length === 0 ? (
        <EmptyLlmState onSetupProvider={handleSetupProvider} />
      ) : (
        <>
          <div className="space-y-4">
            {configurations.map((config) => (
              <LlmProviderCard
                key={config.id}
                configuration={config}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => handleSetupProvider("openai")}
              className="gap-2"
            >
              Add Another Provider
            </Button>
          </div>
        </>
      )}

      <LlmConfigModal
        isOpen={modalState.isOpen}
        onOpenChange={(open) =>
          setModalState((prev) => ({ ...prev, isOpen: open }))
        }
        provider={modalState.provider}
        mode={modalState.mode}
        initialData={modalState.initialData}
        onSave={handleSaveApi}
      />

      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the API configuration. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
