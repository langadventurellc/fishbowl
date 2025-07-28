import React, { useState } from "react";
import { ProviderCard } from "../ProviderCard";
import {
  PROVIDERS,
  createInitialProviderState,
  type ProviderState,
} from "@fishbowl-ai/shared";

/**
 * Complete API Keys state interface
 */
interface ApiKeysState {
  [providerId: string]: ProviderState;
}

/**
 * API Keys Settings component that renders provider cards for OpenAI and Anthropic
 * with centralized state management for all provider configurations.
 */
export function ApiKeysSettings() {
  // Initialize state for all providers
  const [providerStates, setProviderStates] = useState<ApiKeysState>(() => {
    const initialState: ApiKeysState = {};
    Object.values(PROVIDERS).forEach((provider) => {
      initialState[provider.id] = createInitialProviderState(provider.id);
    });
    return initialState;
  });

  // State update handler for individual provider updates
  const updateProviderState = (
    providerId: string,
    updates: Partial<ProviderState>,
  ) => {
    setProviderStates((prev) => ({
      ...prev,
      [providerId]: { ...prev[providerId]!, ...updates },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold mb-[20px]">API Keys</h1>
        <p className="text-muted-foreground">
          Manage API keys for various AI services and integrations
        </p>
      </div>

      <div className="space-y-4">
        {Object.values(PROVIDERS).map((provider) => {
          const providerState = providerStates[provider.id];
          if (!providerState) {
            return null;
          }

          return (
            <ProviderCard
              key={provider.id}
              provider={{
                id: provider.id,
                name: provider.name,
                defaultBaseUrl: provider.defaultBaseUrl,
              }}
              apiKey={providerState.apiKey}
              baseUrl={providerState.baseUrl}
              status={providerState.status}
              showApiKey={providerState.showApiKey}
              showAdvanced={providerState.showAdvanced}
              onApiKeyChange={(value) =>
                updateProviderState(provider.id, { apiKey: value })
              }
              onBaseUrlChange={(value) =>
                updateProviderState(provider.id, { baseUrl: value })
              }
              onToggleApiKey={() =>
                updateProviderState(provider.id, {
                  showApiKey: !providerState.showApiKey,
                })
              }
              onToggleAdvanced={() =>
                updateProviderState(provider.id, {
                  showAdvanced: !providerState.showAdvanced,
                })
              }
              onTest={() => {
                // Visual feedback only - no actual API testing yet
                updateProviderState(provider.id, { status: "connected" });
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
