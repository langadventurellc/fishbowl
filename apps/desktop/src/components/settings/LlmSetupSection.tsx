/**
 * LLM Setup Settings component for managing LLM provider configurations.
 *
 * Features:
 * - Empty state with provider selection dropdown
 * - Modal-based configuration for adding/editing APIs
 * - List view of configured APIs with edit/delete actions
 * - Component-local state management (no persistence)
 *
 * @module components/settings/LlmSetupSection
 */
import React, { useState, useCallback } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { EmptyLlmState, LlmConfigModal, LlmProviderCard } from "./llm-setup";
import type { LlmConfigData } from "@fishbowl-ai/ui-shared";
import { generateId } from "../../utils/generateId";

interface LlmProviderConfig extends LlmConfigData {
  id: string;
  provider: "openai" | "anthropic";
}

/**
 * LLM Setup section component that manages LLM configurations.
 *
 * Provides UI for adding, editing, and deleting LLM provider API configurations
 * through a modal-based interface with component-local state management.
 *
 * @param className - Optional CSS class name for styling
 * @returns LLM Setup section component
 */
export function LlmSetupSection({ className }: { className?: string }) {
  // State for configured APIs
  const [configuredApis, setConfiguredApis] = useState<LlmProviderConfig[]>([]);

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    provider: "openai" | "anthropic";
    editingId?: string;
    initialData?: LlmConfigData & { id?: string };
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

  // Handle setup from empty state
  const handleSetupProvider = useCallback(
    (provider: "openai" | "anthropic") => {
      setModalState({
        isOpen: true,
        mode: "add",
        provider,
      });
    },
    [],
  );

  // Handle saving API configuration
  const handleSaveApi = useCallback(
    (data: LlmConfigData & { id?: string }) => {
      if (modalState.mode === "edit" && modalState.editingId) {
        // Update existing API
        setConfiguredApis((prev) =>
          prev.map((api) =>
            api.id === modalState.editingId ? { ...api, ...data } : api,
          ),
        );
      } else {
        // Add new API
        const newApi: LlmProviderConfig = {
          ...data,
          id: generateId(),
          provider: modalState.provider,
        };
        setConfiguredApis((prev) => [...prev, newApi]);
      }

      // Close modal after saving
      setModalState((prev) => ({ ...prev, isOpen: false }));
    },
    [modalState.mode, modalState.editingId, modalState.provider],
  );

  // Handle edit click
  const handleEdit = useCallback((api: LlmProviderConfig) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      provider: api.provider,
      editingId: api.id,
      initialData: {
        id: api.id,
        customName: api.customName,
        apiKey: api.apiKey,
        baseUrl: api.baseUrl,
        useAuthHeader: api.useAuthHeader,
      },
    });
  }, []);

  // Handle delete click
  const handleDeleteClick = useCallback((apiId: string) => {
    setDeleteConfirmation({
      isOpen: true,
      apiId,
    });
  }, []);

  // Confirm delete
  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmation.apiId) {
      setConfiguredApis((prev) =>
        prev.filter((api) => api.id !== deleteConfirmation.apiId),
      );
    }
    setDeleteConfirmation({ isOpen: false, apiId: null });
  }, [deleteConfirmation.apiId]);

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h1 className="text-2xl font-bold mb-2">LLM Setup</h1>
        <p className="text-muted-foreground">
          Configure AI language model providers for your conversations
        </p>
      </div>

      {configuredApis.length === 0 ? (
        <EmptyLlmState onSetupProvider={handleSetupProvider} />
      ) : (
        <>
          <div className="space-y-4">
            {configuredApis.map((api) => (
              <LlmProviderCard
                key={api.id}
                api={api}
                onEdit={() => handleEdit(api)}
                onDelete={() => handleDeleteClick(api.id)}
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
