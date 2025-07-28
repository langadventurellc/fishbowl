---
kind: task
id: T-implement-api-keys-main-section
title: Implement API Keys main section with provider cards rendering
status: open
priority: normal
prerequisites:
  - T-create-providercard-base
  - T-create-provider-configuration
created: "2025-07-27T22:23:28.887563"
updated: "2025-07-27T22:23:28.887563"
schema_version: "1.1"
parent: F-api-keys-section-implementation
---

# Implement API Keys Main Section

## Context

Replace the placeholder ApiKeysSettings component in SettingsContent.tsx with a fully functional implementation that renders ProviderCard components for OpenAI and Anthropic with proper state management and form handling.

## Implementation Requirements

### Update SettingsContent.tsx

Replace the existing ApiKeysSettings placeholder (around line 387-390) with a proper component implementation.

### Main Component Structure

Create: `apps/desktop/src/components/settings/api-keys/ApiKeysSettings.tsx`

```tsx
import React, { useState } from "react";
import { ProviderCard } from "./ProviderCard";
import {
  PROVIDERS,
  createInitialProviderState,
  ApiKeysState,
} from "./providers";

export const ApiKeysSettings: React.FC = () => {
  // Initialize state for all providers
  const [providerStates, setProviderStates] = useState<ApiKeysState>(() => {
    const initialState: ApiKeysState = {};
    Object.values(PROVIDERS).forEach((provider) => {
      initialState[provider.id] = createInitialProviderState(provider);
    });
    return initialState;
  });

  // State update handlers
  const updateProviderState = (
    providerId: string,
    updates: Partial<ProviderState>,
  ) => {
    setProviderStates((prev) => ({
      ...prev,
      [providerId]: { ...prev[providerId], ...updates },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">API Keys</h1>
        <p className="text-muted-foreground">
          Manage API keys for various AI services and integrations
        </p>
      </div>

      <div className="space-y-4">
        {Object.values(PROVIDERS).map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            {...providerStates[provider.id]}
            onApiKeyChange={(value) =>
              updateProviderState(provider.id, { apiKey: value })
            }
            onBaseUrlChange={(value) =>
              updateProviderState(provider.id, { baseUrl: value })
            }
            onToggleApiKey={() =>
              updateProviderState(provider.id, {
                showApiKey: !providerStates[provider.id].showApiKey,
              })
            }
            onToggleAdvanced={() =>
              updateProviderState(provider.id, {
                showAdvanced: !providerStates[provider.id].showAdvanced,
              })
            }
            onTest={() => {
              // Visual feedback only - no actual API testing yet
              updateProviderState(provider.id, { status: "connected" });
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

### Section Title and Description

- **Title**: "API Keys" with exact 24px font-size and 20px margin-bottom
- **Description**: "Manage API keys for various AI services and integrations"
- Match existing settings section styling patterns

### Provider Cards Layout

- **Card Spacing**: 16px margin between provider cards using `space-y-4`
- **Card Order**: OpenAI first, then Anthropic
- **Responsive Behavior**: Cards stack vertically on all screen sizes
- **Container**: Proper max-width container following existing settings patterns

### State Management

- **Centralized State**: Single state object managing all provider configurations
- **State Updates**: Individual provider state updates without affecting others
- **Initial State**: Proper initialization using provider configuration defaults
- **Type Safety**: Full TypeScript support for all state operations

### Update SettingsContent.tsx Import

Update the sectionComponents object to use the new ApiKeysSettings:

```tsx
import { ApiKeysSettings } from "./api-keys/ApiKeysSettings";

const sectionComponents = {
  general: GeneralSettings,
  "api-keys": ApiKeysSettings, // Replace existing placeholder
  // ... other components
} as const;
```

### Acceptance Criteria

- [ ] Section title displays "API Keys" with exact 24px font-size and proper margins
- [ ] Section description text appears below title with muted foreground color
- [ ] OpenAI and Anthropic provider cards render in correct order
- [ ] Cards have proper 16px spacing between them using Tailwind space-y-4
- [ ] Each provider card receives correct configuration and state props
- [ ] State management works correctly for individual provider updates
- [ ] Form interactions (typing, toggling) update state without affecting other providers
- [ ] Test button provides visual feedback by updating status to "connected"
- [ ] Component integrates properly with existing SettingsContent structure
- [ ] Unit tests verify state management and provider card rendering

### Integration Requirements

- Update import in SettingsContent.tsx to use new ApiKeysSettings component
- Ensure proper TypeScript typing throughout the component chain
- Follow existing settings section patterns for styling and layout
- Maintain accessibility standards with proper ARIA attributes

### Performance Considerations

- Efficient state updates that don't cause unnecessary re-renders
- Proper React key props for provider card list rendering
- Minimal component re-mounting during state changes

### Dependencies

- ProviderCard component (T-create-providercard-base)
- Provider configuration system (T-create-provider-configuration)
- React useState for state management
- Existing SettingsContent integration patterns

### Log
