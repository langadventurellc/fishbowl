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
   * Load models from the LLM models repository and transform to LlmModel format.
   * This replaces the hard-coded _getModelsForProvider function.
   */
  const loadModelsFromRepository = useCallback(async (): Promise<
    LlmModel[]
  > => {
    try {
      const { llmModelsRepositoryManager } = await import(
        "../data/repositories/llmModelsRepositoryManager"
      );
      const repository = llmModelsRepositoryManager.get();

      // Handle case where repository is not initialized
      if (!repository) {
        services.logger.warn(
          "LLM models repository not initialized, using empty models list",
        );
        return [];
      }

      const modelsData = await repository.loadLlmModels();

      // Transform repository data to LlmModel format
      const transformedModels: LlmModel[] = [];
      for (const provider of modelsData.providers) {
        for (const model of provider.models) {
          transformedModels.push({
            id: model.id,
            name: model.name,
            provider: provider.name,
            contextLength: model.contextLength,
          });
        }
      }

      return transformedModels;
    } catch (error) {
      services.logger.error(
        "Failed to load LLM models from repository",
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
            provider: config.customName || config.provider, // Use custom name if available
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
