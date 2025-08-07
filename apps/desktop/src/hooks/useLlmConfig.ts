/**
 * Hook for managing LLM configurations in the desktop application.
 *
 * Provides CRUD operations, state management, and error handling for LLM
 * provider configurations. Integrates with IPC communication layer to
 * interact with the main process service.
 *
 * @module hooks/useLlmConfig
 */

import { useCallback, useEffect, useState } from "react";
import {
  createLoggerSync,
  type LlmConfig,
  type LlmConfigInput,
  type LlmConfigMetadata,
} from "@fishbowl-ai/shared";
import type { UseLlmConfigHook } from "./types/UseLlmConfigHook";

const logger = createLoggerSync({
  config: { name: "useLlmConfig", level: "info" },
});

/**
 * Custom hook for managing LLM configurations.
 *
 * @returns {UseLlmConfigHook} Hook interface with data, operations, and state helpers
 *
 * @example
 * ```typescript
 * function LlmSettings() {
 *   const {
 *     configurations,
 *     isLoading,
 *     error,
 *     createConfiguration,
 *     updateConfiguration,
 *     deleteConfiguration,
 *     clearError
 *   } = useLlmConfig();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} onDismiss={clearError} />;
 *
 *   return (
 *     <LlmConfigList
 *       configurations={configurations}
 *       onUpdate={updateConfiguration}
 *       onDelete={deleteConfiguration}
 *     />
 *   );
 * }
 * ```
 */
export function useLlmConfig(): UseLlmConfigHook {
  const [configurations, setConfigurations] = useState<LlmConfigMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load configurations on mount
  const loadConfigurations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if running in Electron environment
      if (
        typeof window === "undefined" ||
        !window.electronAPI?.llmConfig?.list ||
        typeof window.electronAPI.llmConfig.list !== "function"
      ) {
        logger.warn(
          "Not running in Electron environment, skipping LLM config load",
        );
        setConfigurations([]);
        return;
      }

      const configs = await window.electronAPI.llmConfig.list();
      setConfigurations(configs);

      logger.debug(`Loaded ${configs.length} LLM configurations`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load configurations";
      logger.error("Failed to load LLM configurations:", err as Error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  // Create configuration with optimistic update
  const createConfiguration = useCallback(
    async (config: LlmConfigInput): Promise<LlmConfig> => {
      try {
        setError(null);

        // Check if running in Electron environment
        if (
          typeof window === "undefined" ||
          !window.electronAPI?.llmConfig?.create ||
          typeof window.electronAPI.llmConfig.create !== "function"
        ) {
          throw new Error("LLM configuration operations not available");
        }

        logger.debug("Creating LLM configuration", {
          provider: config.provider,
          customName: config.customName,
        });

        const createdConfig = await window.electronAPI.llmConfig.create(config);

        // Update local state with metadata (exclude API key)
        const metadata: LlmConfigMetadata = {
          id: createdConfig.id,
          customName: createdConfig.customName,
          provider: createdConfig.provider,
          baseUrl: createdConfig.baseUrl,
          useAuthHeader: createdConfig.useAuthHeader,
          createdAt: createdConfig.createdAt,
          updatedAt: createdConfig.updatedAt,
        };

        setConfigurations((prev) => [...prev, metadata]);

        logger.info("Successfully created LLM configuration", {
          id: createdConfig.id,
        });
        return createdConfig;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create configuration";
        logger.error("Failed to create LLM configuration:", err as Error);
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  // Update configuration with optimistic update
  const updateConfiguration = useCallback(
    async (
      id: string,
      updates: Partial<LlmConfigInput>,
    ): Promise<LlmConfig> => {
      try {
        setError(null);

        // Check if running in Electron environment
        if (
          typeof window === "undefined" ||
          !window.electronAPI?.llmConfig?.update ||
          typeof window.electronAPI.llmConfig.update !== "function"
        ) {
          throw new Error("LLM configuration operations not available");
        }

        logger.debug("Updating LLM configuration", { id, updates });

        // Optimistic update
        setConfigurations((prev) =>
          prev.map((config) =>
            config.id === id
              ? {
                  ...config,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : config,
          ),
        );

        const updatedConfig = await window.electronAPI.llmConfig.update(
          id,
          updates,
        );

        // Update with server response
        const metadata: LlmConfigMetadata = {
          id: updatedConfig.id,
          customName: updatedConfig.customName,
          provider: updatedConfig.provider,
          baseUrl: updatedConfig.baseUrl,
          useAuthHeader: updatedConfig.useAuthHeader,
          createdAt: updatedConfig.createdAt,
          updatedAt: updatedConfig.updatedAt,
        };

        setConfigurations((prev) =>
          prev.map((config) => (config.id === id ? metadata : config)),
        );

        logger.info("Successfully updated LLM configuration", { id });
        return updatedConfig;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update configuration";
        logger.error("Failed to update LLM configuration:", err as Error);
        setError(errorMessage);

        // Revert optimistic update on error
        await loadConfigurations();
        throw err;
      }
    },
    [loadConfigurations],
  );

  // Delete configuration with optimistic update
  const deleteConfiguration = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);

        // Check if running in Electron environment
        if (
          typeof window === "undefined" ||
          !window.electronAPI?.llmConfig?.delete ||
          typeof window.electronAPI.llmConfig.delete !== "function"
        ) {
          throw new Error("LLM configuration operations not available");
        }

        logger.debug("Deleting LLM configuration", { id });

        // Optimistic update
        setConfigurations((prev) => prev.filter((config) => config.id !== id));

        await window.electronAPI.llmConfig.delete(id);

        logger.info("Successfully deleted LLM configuration", { id });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete configuration";
        logger.error("Failed to delete LLM configuration:", err as Error);
        setError(errorMessage);

        // Revert optimistic update on error
        await loadConfigurations();
        throw err;
      }
    },
    [loadConfigurations],
  );

  // Refresh configurations
  const refreshConfigurations = useCallback(async () => {
    await loadConfigurations();
  }, [loadConfigurations]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    configurations,
    isLoading,
    error,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    refreshConfigurations,
    clearError,
  };
}
