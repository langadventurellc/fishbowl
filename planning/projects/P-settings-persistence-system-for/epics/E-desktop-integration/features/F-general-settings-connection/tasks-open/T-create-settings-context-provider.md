---
kind: task
id: T-create-settings-context-provider
title: Create settings context provider for the application
status: open
priority: normal
prerequisites: []
created: "2025-08-02T21:03:49.501834"
updated: "2025-08-02T21:03:49.501834"
schema_version: "1.1"
parent: F-general-settings-connection
---

# Create settings context provider for the application

## Context

The desktop application needs a settings context provider to make the desktop settings adapter available throughout the app. This will enable the settings modal and other components to access the persistence functionality.

## Implementation Requirements

### 1. Create Settings Provider Component

Create a new file `apps/desktop/src/contexts/SettingsProvider.tsx`:

```typescript
import React, { ReactNode } from 'react';
import { SettingsAdapterContext } from '@fishbowl-ai/ui-shared';
import { desktopSettingsAdapter } from '../adapters/desktopSettingsAdapter';

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  return (
    <SettingsAdapterContext.Provider value={desktopSettingsAdapter}>
      {children}
    </SettingsAdapterContext.Provider>
  );
}
```

### 2. Create Barrel Export

Add export to `apps/desktop/src/contexts/index.ts`:

```typescript
export { SettingsProvider } from "./SettingsProvider";
```

### 3. Wrap Application with Provider

Update the main application entry point (likely in `apps/desktop/src/App.tsx` or `apps/desktop/src/main.tsx`):

- Import the SettingsProvider
- Wrap the app content with the provider at a high level, but below any error boundaries
- Ensure it wraps the settings modal and any components that need settings access

Example structure:

```typescript
import { SettingsProvider } from './contexts';

function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        {/* Rest of app content including settings modal */}
      </SettingsProvider>
    </ErrorBoundary>
  );
}
```

## Acceptance Criteria

- ✓ SettingsProvider component created and exports properly
- ✓ Provider supplies desktopSettingsAdapter to context
- ✓ Application wrapped with SettingsProvider
- ✓ Settings modal can access the adapter through context
- ✓ No prop drilling needed for settings adapter

## Testing Requirements

Write unit tests to verify:

- SettingsProvider renders children correctly
- Context provides the desktop settings adapter
- Components can access the adapter through useContext

## File Locations

- New provider: `apps/desktop/src/contexts/SettingsProvider.tsx`
- Context to use: `SettingsAdapterContext` from `@fishbowl-ai/ui-shared`
- Adapter: `desktopSettingsAdapter` from `apps/desktop/src/adapters/desktopSettingsAdapter.ts`
- App entry point: Check `apps/desktop/src/App.tsx` or `apps/desktop/src/main.tsx`

## Notes

- The SettingsAdapterContext should already exist in the ui-shared package from the previous feature implementation
- Make sure to place the provider at the right level in the component tree to avoid unnecessary re-renders

### Log
