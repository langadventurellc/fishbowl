import { useState, useEffect, useCallback } from "react";
import type { LlmModel } from "@fishbowl-ai/ui-shared";
import { useServices } from "@/contexts/useServices";

/**
 * Hook to get available LLM models from configured providers.
 * Returns models based on the user's actual LLM provider configurations.
 */
export function useLlmModels() {
  const [models, setModels] = useState<LlmModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | Error | null>(null);

  const services = useServices();

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
              vision: true,
              functionCalling: true,
            },
            {
              id: "gpt-4",
              name: "GPT-4",
              provider: providerName,
              contextLength: 8192,
              vision: false,
              functionCalling: true,
            },
            {
              id: "gpt-3.5-turbo",
              name: "GPT-3.5 Turbo",
              provider: providerName,
              contextLength: 16385,
              vision: false,
              functionCalling: true,
            },
          ];

        case "anthropic":
          return [
            {
              id: "claude-3-opus",
              name: "Claude 3 Opus",
              provider: providerName,
              contextLength: 200000,
              vision: true,
              functionCalling: false,
            },
            {
              id: "claude-3-sonnet",
              name: "Claude 3 Sonnet",
              provider: providerName,
              contextLength: 200000,
              vision: true,
              functionCalling: false,
            },
            {
              id: "claude-3-haiku",
              name: "Claude 3 Haiku",
              provider: providerName,
              contextLength: 200000,
              vision: true,
              functionCalling: false,
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
   * This will be enhanced once the LLM provider service is integrated into renderer services.
   */
  const loadModels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual LLM config repository once integrated into renderer services
      // For now, return empty array since we need the LLM config repository to be available
      // const configs = await services.llmConfigRepository.getAllConfigs();
      // const availableModels = configs.flatMap(config =>
      //   _getModelsForProvider(config.provider, config.customName)
      // );

      // Temporary: Return empty models until LLM config repository is integrated
      const availableModels: LlmModel[] = [];

      setModels(availableModels);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError("Failed to load models");
      }
      services.logger.error(
        "Failed to load LLM models",
        err instanceof Error ? err : new Error(String(err)),
      );
    } finally {
      setLoading(false);
    }
  }, [services]);

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
