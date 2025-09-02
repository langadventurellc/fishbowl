import { useState, useEffect, useCallback } from "react";
import type { LlmModel } from "@fishbowl-ai/ui-shared";
import { useServices } from "@/contexts/useServices";
import { useLlmConfig } from "./useLlmConfig";

/**
 * Hook to get available LLM models from configured providers.
 * Returns models based on the user's actual LLM provider configurations.
 */
export function useLlmModels() {
  const [models, setModels] = useState<LlmModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | Error | null>(null);

  const services = useServices();
  const {
    configurations,
    isLoading: configsLoading,
    error: configsError,
  } = useLlmConfig();

  /**
   * Load models from the LLM models repository via IPC and transform to LlmModel format.
   * Uses IPC calls to avoid crypto module errors in renderer process.
   */
  const loadModelsFromRepository = useCallback(async (): Promise<
    LlmModel[]
  > => {
    try {
      // Check if running in Electron environment
      if (
        typeof window === "undefined" ||
        !window.electronAPI?.llmModels?.load ||
        typeof window.electronAPI.llmModels.load !== "function"
      ) {
        services.logger.warn(
          "Not running in Electron environment, using empty models list",
        );
        return [];
      }

      const modelsData = await window.electronAPI.llmModels.load();

      // Transform repository data to LlmModel format
      const transformedModels: LlmModel[] = [];
      for (const provider of modelsData.providers) {
        for (const model of provider.models) {
          transformedModels.push({
            id: model.id,
            name: model.name,
            provider: provider.name,
            contextLength: model.contextLength,
            // These will be populated when expanding models per configuration
            configId: "",
            configLabel: "",
          });
        }
      }

      return transformedModels;
    } catch (error) {
      services.logger.error(
        "Failed to load LLM models via IPC",
        error as Error,
      );
      return []; // Fallback to empty array
    }
  }, [services.logger]);

  /**
   * Load models from configured LLM providers.
   * Uses the repository to load models and filters based on actual LLM configurations.
   */
  const loadModels = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (configsError) {
      const error = new Error(configsError);
      setError(error);
      services.logger.error("Failed to load LLM configurations", error);
      setLoading(false);
      return;
    }

    if (configsLoading) {
      // Still loading configurations, wait
      return;
    }

    try {
      // Load all configured models from repository
      const allModels = await loadModelsFromRepository();

      // Filter models based on actual LLM provider configurations
      const availableModels = configurations.flatMap((config) => {
        return allModels
          .filter(
            (model) =>
              model.provider.toLowerCase() === config.provider.toLowerCase(),
          )
          .map((model) => ({
            ...model,
            // Keep provider as canonical provider id/name for grouping/filtering
            provider: config.provider,
            // Add configuration-specific fields
            configId: config.id,
            configLabel: config.customName || config.provider,
          }));
      });

      setModels(availableModels);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to load models");
      setError(error);
      services.logger.error("Failed to load LLM models", error);
      setModels([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, [
    configurations,
    configsLoading,
    configsError,
    services.logger,
    loadModelsFromRepository,
  ]);

  /**
   * Refresh models from configured providers.
   */
  const refresh = useCallback(() => {
    loadModels();
  }, [loadModels]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  return {
    models,
    loading,
    error,
    refresh,
  };
}
