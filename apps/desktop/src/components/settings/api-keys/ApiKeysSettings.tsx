import React, { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProviderCard } from "../ProviderCard";
import {
  PROVIDERS,
  createInitialProviderState,
  createProviderFormSchema,
  validateProviderData,
  type ProviderState,
  type ProviderFormData,
} from "@fishbowl-ai/shared";
import { useDebounce } from "../../../hooks/useDebounce";

/**
 * Create comprehensive validation schema for all providers
 */
const createApiKeysFormSchema = () => {
  const providerSchemas = Object.values(PROVIDERS).reduce(
    (acc, provider) => {
      acc[provider.id] = createProviderFormSchema(provider);
      return acc;
    },
    {} as Record<string, z.ZodSchema>,
  );

  return z.object(providerSchemas);
};

type ApiKeysFormData = z.infer<ReturnType<typeof createApiKeysFormSchema>>;

/**
 * Enhanced API Keys state interface with validation support
 */
interface ApiKeysState {
  [providerId: string]: ProviderState & {
    errors?: { apiKey?: string; baseUrl?: string };
    isValidating?: boolean;
  };
}

/**
 * API Keys Settings component that renders provider cards for OpenAI and Anthropic
 * with centralized state management for all provider configurations.
 */
export function ApiKeysSettings() {
  // Initialize form with validation
  const formSchema = useMemo(() => createApiKeysFormSchema(), []);
  const form = useForm<ApiKeysFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: Object.values(PROVIDERS).reduce(
      (acc, provider) => {
        acc[provider.id] = {
          apiKey: "",
          baseUrl: provider.defaultBaseUrl,
          providerId: provider.id,
        };
        return acc;
      },
      {} as Record<string, ProviderFormData>,
    ),
    mode: "onChange", // Enable real-time validation
  });

  // Enhanced state with validation
  const [providerStates, setProviderStates] = useState<ApiKeysState>(() => {
    const initialState: ApiKeysState = {};
    Object.values(PROVIDERS).forEach((provider) => {
      initialState[provider.id] = {
        ...createInitialProviderState(provider.id),
        errors: undefined,
        isValidating: false,
      };
    });
    return initialState;
  });

  // Debounced validation for performance
  const debouncedValidation = useDebounce((...args: unknown[]) => {
    const [providerId, data] = args as [string, Partial<ProviderFormData>];
    const result = validateProviderData(providerId, data);
    if (!result.success) {
      // Set provider-specific errors
      const errors = result.error.issues.reduce(
        (acc, issue) => {
          const path = issue.path[0] as keyof typeof acc;
          if (path === "apiKey" || path === "baseUrl") {
            acc[path] = issue.message;
          }
          return acc;
        },
        {} as { apiKey?: string; baseUrl?: string },
      );

      setProviderStates((prev) => ({
        ...prev,
        [providerId]: {
          ...prev[providerId]!,
          errors,
          isValidating: false,
        },
      }));
    } else {
      // Clear errors
      setProviderStates((prev) => ({
        ...prev,
        [providerId]: {
          ...prev[providerId]!,
          errors: undefined,
          isValidating: false,
        },
      }));
    }
  }, 300);

  // Enhanced update handler with validation
  const updateProviderState = useCallback(
    (providerId: string, field: "apiKey" | "baseUrl", value: string) => {
      // Update form state
      const fieldPath = `${providerId}.${field}` as keyof ApiKeysFormData;
      form.setValue(fieldPath, value);

      // Update provider state
      setProviderStates((prev) => ({
        ...prev,
        [providerId]: {
          ...prev[providerId]!,
          [field]: value,
          isValidating: true,
        },
      }));

      // Trigger debounced validation
      const formValues = form.getValues();
      const providerData = formValues[
        providerId as keyof typeof formValues
      ] as ProviderFormData;
      const currentData = {
        ...providerData,
        [field]: value,
      };
      debouncedValidation(providerId, currentData);
    },
    [form, debouncedValidation],
  );

  // Basic state update for non-form fields
  const updateProviderUIState = (
    providerId: string,
    updates: Partial<
      Pick<ProviderState, "status" | "showApiKey" | "showAdvanced">
    >,
  ) => {
    setProviderStates((prev) => ({
      ...prev,
      [providerId]: { ...prev[providerId]!, ...updates },
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold">API Keys</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage API keys for various AI services and integrations
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
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
              errors={providerState.errors}
              isValidating={providerState.isValidating}
              onApiKeyChange={(value) =>
                updateProviderState(provider.id, "apiKey", value)
              }
              onBaseUrlChange={(value) =>
                updateProviderState(provider.id, "baseUrl", value)
              }
              onToggleApiKey={() =>
                updateProviderUIState(provider.id, {
                  showApiKey: !providerState.showApiKey,
                })
              }
              onToggleAdvanced={() =>
                updateProviderUIState(provider.id, {
                  showAdvanced: !providerState.showAdvanced,
                })
              }
              onTest={() => {
                // Visual feedback only - no actual API testing yet
                updateProviderUIState(provider.id, { status: "connected" });
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
