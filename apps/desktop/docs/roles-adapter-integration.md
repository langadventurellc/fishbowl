# Roles Adapter Integration Guide

This document describes how the desktop roles persistence system is integrated and how to use it in the Fishbowl desktop application.

## Overview

The roles persistence system allows the desktop application to save, load, and reset user-defined roles. It follows the same architectural pattern as the settings system, using:

- **Adapter Pattern**: Platform-specific implementation (`DesktopRolesAdapter`)
- **React Context**: Provider pattern for dependency injection (`RolesProvider`)
- **Electron IPC**: Communication between renderer and main process
- **File System**: Persistent storage in user data directory

## Architecture Components

### 1. Desktop Roles Adapter (`apps/desktop/src/adapters/desktopRolesAdapter.ts`)

The `DesktopRolesAdapter` implements the `RolesPersistenceAdapter` interface and handles:

```typescript
export class DesktopRolesAdapter implements RolesPersistenceAdapter {
  async save(roles: PersistedRolesSettingsData): Promise<void>;
  async load(): Promise<PersistedRolesSettingsData | null>;
  async reset(): Promise<void>;
}

// Singleton instance ready for use
export const desktopRolesAdapter = new DesktopRolesAdapter();
```

**Key Features:**

- Uses Electron IPC (`window.electronAPI.roles`) for file operations
- Maps Electron errors to `RolesPersistenceError` with context
- Returns `null` for missing files (not an error condition)
- Preserves existing `RolesPersistenceError` instances from IPC layer

### 2. React Context Provider (`apps/desktop/src/contexts/RolesProvider.tsx`)

Provides the adapter instance to the React component tree:

```typescript
export const RolesProvider: React.FC<RolesProviderProps> = ({ children }) => {
  return (
    <RolesPersistenceAdapterContext.Provider value={desktopRolesAdapter}>
      {children}
    </RolesPersistenceAdapterContext.Provider>
  );
};

export const useRolesAdapter = (): RolesPersistenceAdapter => {
  const adapter = useContext(RolesPersistenceAdapterContext);
  if (!adapter) {
    throw new Error("useRolesAdapter must be used within a RolesProvider");
  }
  return adapter;
};
```

### 3. Main Process Integration (`apps/desktop/src/electron/main.ts`)

The main process initializes:

- Roles repository manager with userData directory
- IPC handlers for file operations
- Proper error handling and logging

```typescript
// Initialize roles repository manager with userData path
const { rolesRepositoryManager } = await import(
  "../data/repositories/rolesRepositoryManager.js"
);
rolesRepositoryManager.initialize(userDataPath);

// Setup Roles IPC handlers
setupRolesHandlers();
```

## Usage Patterns

### Basic Component Usage

```typescript
import React from 'react';
import { useRolesAdapter } from '../contexts/RolesProvider';

export const MyComponent = () => {
  const rolesAdapter = useRolesAdapter();
  const [roles, setRoles] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Load roles on component mount
  React.useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await rolesAdapter.load();
        setRoles(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoles();
  }, [rolesAdapter]);

  // Save roles function
  const handleSaveRoles = async (newRoles) => {
    try {
      await rolesAdapter.save(newRoles);
      setRoles(newRoles);
      setError(null);
    } catch (err) {
      setError(err);
    }
  };

  // Reset roles function
  const handleResetRoles = async () => {
    try {
      await rolesAdapter.reset();
      setRoles(null);
      setError(null);
    } catch (err) {
      setError(err);
    }
  };

  if (isLoading) return <div>Loading roles...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* Your component UI */}
      <button onClick={() => handleSaveRoles(someRoles)}>Save Roles</button>
      <button onClick={handleResetRoles}>Reset Roles</button>
    </div>
  );
};
```

### Error Handling Best Practices

The roles adapter throws `RolesPersistenceError` for all error conditions except when no roles file exists (returns `null`):

```typescript
import { RolesPersistenceError } from "@fishbowl-ai/ui-shared";

const handleRolesOperation = async () => {
  try {
    const data = await rolesAdapter.load();
    if (data === null) {
      // No roles file exists - normal condition for new users
      console.log("No saved roles found, using defaults");
      return getDefaultRoles();
    }
    return data;
  } catch (error) {
    if (error instanceof RolesPersistenceError) {
      // Handle known persistence errors
      console.error(`Roles ${error.operation} failed:`, error.message);

      // Show user-friendly error message
      if (error.operation === "save") {
        showToast("Failed to save roles. Please try again.");
      } else if (error.operation === "load") {
        showToast("Failed to load roles. Using defaults.");
      }
    } else {
      // Handle unexpected errors
      console.error("Unexpected error:", error);
      showToast("An unexpected error occurred.");
    }
  }
};
```

### Provider Setup in Application

The `RolesProvider` should be placed high in the component tree, typically alongside other providers:

```typescript
// In App.tsx
import { SettingsProvider, RolesProvider } from './contexts';

export default function App() {
  return (
    <SettingsProvider>
      <RolesProvider>
        {/* Your app components */}
        <Routes>...</Routes>
      </RolesProvider>
    </SettingsProvider>
  );
}
```

### Custom Hooks Pattern

For complex roles logic, create custom hooks:

```typescript
// useRolesPersistence.ts
import React from "react";
import { useRolesAdapter } from "../contexts/RolesProvider";
import type { PersistedRolesSettingsData } from "@fishbowl-ai/shared";

export const useRolesPersistence = () => {
  const adapter = useRolesAdapter();
  const [roles, setRoles] = React.useState<PersistedRolesSettingsData | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const loadRoles = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adapter.load();
      setRoles(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [adapter]);

  const saveRoles = React.useCallback(
    async (newRoles: PersistedRolesSettingsData) => {
      try {
        await adapter.save(newRoles);
        setRoles(newRoles);
        setError(null);
      } catch (err) {
        setError(err as Error);
        throw err; // Re-throw to let caller handle
      }
    },
    [adapter],
  );

  const resetRoles = React.useCallback(async () => {
    try {
      await adapter.reset();
      setRoles(null);
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [adapter]);

  // Load roles on mount
  React.useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return {
    roles,
    isLoading,
    error,
    saveRoles,
    resetRoles,
    reload: loadRoles,
  };
};
```

## Relationship to Settings System

The roles persistence system follows the same architectural patterns as the settings system:

| Aspect           | Settings                        | Roles                 |
| ---------------- | ------------------------------- | --------------------- |
| **Adapter**      | `DesktopSettingsAdapter`        | `DesktopRolesAdapter` |
| **Context**      | `SettingsProvider`              | `RolesProvider`       |
| **Hook**         | `useSettingsPersistenceAdapter` | `useRolesAdapter`     |
| **IPC Channel**  | `settings:*`                    | `roles:*`             |
| **Storage File** | `preferences.json`              | `roles.json`          |
| **Repository**   | `SettingsRepository`            | `RolesRepository`     |

**Key Differences:**

- Settings return default values when no file exists; roles return `null`
- Settings have schema versioning; roles use simpler structure
- Settings support partial updates; roles save complete data

## File System Storage

Roles are stored in the Electron userData directory:

- **Path**: `app.getPath('userData')/roles.json`
- **Format**: JSON with roles array
- **Permissions**: User-accessible, app-controlled
- **Backup**: None (user should export important roles)

## Testing Integration

The integration test verifies:

```typescript
// Full flow testing
describe("Full Integration Flow", () => {
  it("should complete full save, load, and reset cycle", async () => {
    // Test save
    await desktopRolesAdapter.save(mockRolesData);

    // Test load
    const loadedData = await desktopRolesAdapter.load();
    expect(loadedData).toEqual(mockRolesData);

    // Test reset
    await desktopRolesAdapter.reset();
  });
});

// React context integration
describe("Roles Provider Integration", () => {
  it("should provide adapter through context", () => {
    const { result } = renderHook(() => useRolesAdapter(), {
      wrapper: ({ children }) => <RolesProvider>{children}</RolesProvider>,
    });
    expect(result.current).toBe(desktopRolesAdapter);
  });
});
```

## Troubleshooting

### Common Issues

1. **"useRolesAdapter must be used within a RolesProvider"**
   - Ensure component is wrapped in `<RolesProvider>`
   - Check provider hierarchy in App.tsx

2. **File permission errors**
   - Verify userData directory exists and is writable
   - Check Electron security policies

3. **IPC communication failures**
   - Verify main process handlers are registered
   - Check preload script exposes `window.electronAPI.roles`

### Debug Tips

Enable debug logging in main process:

```typescript
mainLogger?.debug("Roles operation completed", {
  operation: "save",
  dataSize: JSON.stringify(roles).length,
});
```

Monitor IPC calls in renderer:

```typescript
console.log("Calling roles IPC:", operation, data);
const result = await window.electronAPI.roles[operation](data);
console.log("Roles IPC result:", result);
```
