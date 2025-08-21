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
   * Get available models for a specific provider type.
   * This maps provider configurations to their available models.
   * Currently unused but will be used when LLM config repository is integrated.
   */
  const _getModelsForProvider = useCallback(
    (providerType: string, providerName: string): LlmModel[] => {
      switch (providerType.toLowerCase()) {
        case "openai":
          return [
            {
              id: "gpt-4-turbo",
              name: "GPT-4 Turbo",
              provider: providerName,
              contextLength: 128000,
            },
            {
              id: "gpt-4",
              name: "GPT-4",
              provider: providerName,
              contextLength: 8192,
            },
            {
              id: "gpt-3.5-turbo",
              name: "GPT-3.5 Turbo",
              provider: providerName,
              contextLength: 16385,
            },
          ];

        case "anthropic":
          return [
            {
              id: "claude-3-opus",
              name: "Claude 3 Opus",
              provider: providerName,
              contextLength: 200000,
            },
            {
              id: "claude-3-sonnet",
              name: "Claude 3 Sonnet",
              provider: providerName,
              contextLength: 200000,
            },
            {
              id: "claude-3-haiku",
              name: "Claude 3 Haiku",
              provider: providerName,
              contextLength: 200000,
            },
          ];

        default:
          return [];
      }
    },
    [],
  );

  /**
   * Load models from configured LLM providers.
   * Uses the useLlmConfig hook to get actual LLM configurations.
   */
  const loadModels = useCallback(() => {
    setLoading(configsLoading);
    setError(configsError);

    if (configsError) {
      services.logger.error(
        "Failed to load LLM configurations",
        new Error(configsError),
      );
      return;
    }

    if (!configsLoading) {
      try {
        // Map configurations to available models
        const availableModels = configurations.flatMap((config) =>
          _getModelsForProvider(
            config.provider,
            config.customName || config.provider,
          ),
        );

        setModels(availableModels);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to load models");
        setError(error);
        services.logger.error("Failed to load LLM models", error);
      }
    }
  }, [
    configurations,
    configsLoading,
    configsError,
    services,
    _getModelsForProvider,
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
