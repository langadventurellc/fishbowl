import { useState, useEffect } from "react";
import type { Provider } from "@fishbowl-ai/shared";

interface ModelOption {
  id: string;
  name: string;
  provider: Provider;
  providerName: string;
  configId: string;
}

interface UseLlmModelsResult {
  models: ModelOption[];
  loading: boolean;
  error: Error | null;
}

// Available models for each provider
const PROVIDER_MODELS: Record<Provider, Array<{ id: string; name: string }>> = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    { id: "gpt-4", name: "GPT-4" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  ],
  anthropic: [
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
    { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet" },
    { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
  ],
};

const PROVIDER_DISPLAY_NAMES: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
};

export function useLlmModels(): UseLlmModelsResult {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);

        // Check if running in Electron environment
        if (
          typeof window === "undefined" ||
          !window.electronAPI?.llmConfig?.list ||
          typeof window.electronAPI.llmConfig.list !== "function"
        ) {
          setModels([]);
          return;
        }

        // Fetch LLM configurations
        const configs = await window.electronAPI.llmConfig.list();

        // Build model options from configured providers
        const modelOptions: ModelOption[] = [];

        configs.forEach((config) => {
          const providerModels = PROVIDER_MODELS[config.provider];
          const providerName = PROVIDER_DISPLAY_NAMES[config.provider];

          if (providerModels) {
            providerModels.forEach((model) => {
              modelOptions.push({
                id: `${config.id}:${model.id}`,
                name: model.name,
                provider: config.provider,
                providerName,
                configId: config.id,
              });
            });
          }
        });

        setModels(modelOptions);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load models"),
        );
      } finally {
        setLoading(false);
      }
    };

    void loadModels();
  }, []);

  return { models, loading, error };
}
