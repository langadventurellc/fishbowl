---
kind: task
id: T-create-provider-configuration
parent: F-api-keys-section-implementation
status: done
title: Create provider configuration system with validation schemas
priority: high
prerequisites: []
created: "2025-07-27T22:22:57.915444"
updated: "2025-07-27T22:37:40.367127"
schema_version: "1.1"
worktree: null
---

# Create Provider Configuration System

## Context

The API Keys section needs a flexible configuration system that defines provider-specific settings (names, default URLs, validation rules) and implements form validation using Zod schemas.

## Implementation Requirements

### Provider Configuration File

Create: `apps/desktop/src/components/settings/api-keys/providers.ts`

### Provider Definition Structure

```tsx
interface ProviderConfig {
  id: string;
  name: string;
  defaultBaseUrl: string;
  apiKeyValidation: {
    minLength: number;
    pattern?: RegExp;
    placeholder: string;
  };
}

export const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    defaultBaseUrl: "https://api.openai.com/v1",
    apiKeyValidation: {
      minLength: 10,
      placeholder: "Enter your OpenAI API key",
    },
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    apiKeyValidation: {
      minLength: 10,
      placeholder: "Enter your Anthropic API key",
    },
  },
};
```

### Validation Schema

Create comprehensive Zod validation schemas for form data:

```tsx
import { z } from "zod";

export const ApiKeySchema = z.object({
  openai: z.object({
    apiKey: z.string().min(10, "API key too short").optional(),
    baseUrl: z
      .string()
      .url("Invalid URL format")
      .refine((url) => url.startsWith("https://"), "Base URL must use HTTPS"),
  }),
  anthropic: z.object({
    apiKey: z.string().min(10, "API key too short").optional(),
    baseUrl: z
      .string()
      .url("Invalid URL format")
      .refine((url) => url.startsWith("https://"), "Base URL must use HTTPS"),
  }),
});

export type ApiKeysFormData = z.infer<typeof ApiKeySchema>;
```

### State Management Types

Define TypeScript interfaces for component state:

```tsx
export interface ProviderState {
  apiKey: string;
  baseUrl: string;
  status: "connected" | "error" | "untested";
  showApiKey: boolean;
  showAdvanced: boolean;
}

export interface ApiKeysState {
  [providerId: string]: ProviderState;
}
```

### Utility Functions

Create helper functions for provider management:

```tsx
export const getProviderById = (id: string): ProviderConfig | undefined => {
  return PROVIDERS[id];
};

export const getAllProviders = (): ProviderConfig[] => {
  return Object.values(PROVIDERS);
};

export const createInitialProviderState = (
  provider: ProviderConfig,
): ProviderState => {
  return {
    apiKey: "",
    baseUrl: provider.defaultBaseUrl,
    status: "untested",
    showApiKey: false,
    showAdvanced: false,
  };
};
```

### Acceptance Criteria

- [ ] Provider configuration objects define all required properties for OpenAI and Anthropic
- [ ] Zod schemas validate API keys with minimum length requirements
- [ ] Base URL validation enforces HTTPS and proper URL format
- [ ] TypeScript interfaces provide strong typing for component state
- [ ] Utility functions enable easy provider lookup and state initialization
- [ ] Configuration system is extensible for future providers
- [ ] All validation error messages are user-friendly and descriptive
- [ ] Unit tests verify schema validation works correctly for valid/invalid inputs

### Security Considerations

- HTTPS enforcement for all base URLs
- Proper validation of user input to prevent injection attacks
- No hardcoded API keys or sensitive data in configuration

### Testing Requirements

- Unit tests for provider lookup functions
- Schema validation tests for various input scenarios
- Type checking to ensure interfaces are properly implemented

### Log

**2025-07-28T03:51:46.971029Z** - Successfully implemented comprehensive provider configuration system with validation schemas for API Keys section. Created modular file structure following clean code "one export per file" rule. System includes robust Zod validation with HTTPS enforcement, provider-specific API key patterns, comprehensive utility functions for provider management, and extensive unit test coverage (26 passing tests). All provider configurations are extensible for future providers while maintaining type safety throughout.

- filesChanged: ["apps/desktop/src/components/settings/api-keys/providerConfig.ts", "apps/desktop/src/components/settings/api-keys/providersConfig.ts", "apps/desktop/src/components/settings/api-keys/validation.ts", "apps/desktop/src/components/settings/api-keys/providerFormData.ts", "apps/desktop/src/components/settings/api-keys/providerState.ts", "apps/desktop/src/components/settings/api-keys/providerValidationError.ts", "apps/desktop/src/components/settings/api-keys/providerId.ts", "apps/desktop/src/components/settings/api-keys/getProviderConfig.ts", "apps/desktop/src/components/settings/api-keys/getAllProviders.ts", "apps/desktop/src/components/settings/api-keys/validateProviderData.ts", "apps/desktop/src/components/settings/api-keys/createInitialProviderState.ts", "apps/desktop/src/components/settings/api-keys/isValidProvider.ts", "apps/desktop/src/components/settings/api-keys/index.ts", "apps/desktop/src/components/settings/api-keys/__tests__/providers.test.ts"]
