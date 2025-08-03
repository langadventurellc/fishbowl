---
kind: task
id: T-implement-advanced-settings
title: Implement advanced settings loading on application startup with tests
status: open
priority: normal
prerequisites:
  - T-create-runtime-settings
created: "2025-08-03T17:35:53.131855"
updated: "2025-08-03T17:35:53.131855"
schema_version: "1.1"
parent: F-advanced-settings-connection
---

# Implement advanced settings loading on application startup with tests

## Context

Following the pattern from appearance settings where theme is loaded and applied on startup, we need to implement loading and application of advanced settings when the application starts. This ensures debug logging and other runtime settings are applied immediately.

## Implementation Requirements

### 1. Create Advanced Settings Initialization Hook

Create a new file `apps/desktop/src/hooks/useInitializeAdvancedSettings.ts`:

```typescript
import { useEffect } from "react";
import { useDesktopSettingsPersistence } from "@fishbowl-ai/ui-shared";
import { applyAdvancedSettings } from "@/utils";
import { logger } from "@fishbowl-ai/shared";

/**
 * Hook to initialize advanced settings on application startup
 * Loads persisted settings and applies them immediately
 */
export function useInitializeAdvancedSettings(): void {
  const { settings } = useDesktopSettingsPersistence();

  useEffect(() => {
    if (settings?.advanced) {
      logger.info("Applying advanced settings from persistence");
      applyAdvancedSettings(settings.advanced);
    }
  }, [settings]);
}
```

### 2. Add Hook to App Component

In `apps/desktop/src/App.tsx`, add the initialization hook:

```typescript
import { useInitializeAdvancedSettings } from "@/hooks/useInitializeAdvancedSettings";

function App() {
  // Initialize theme (existing)
  useInitializeTheme();

  // Initialize advanced settings
  useInitializeAdvancedSettings();

  // ... rest of App component
}
```

### 3. Update Main Process Integration

If needed, ensure the main process respects the debug logging setting on startup. This might require updating the preload script to expose the necessary APIs:

```typescript
// In preload script (if not already present)
contextBridge.exposeInMainWorld("electronAPI", {
  // ... existing APIs
  setDebugLogging: (enabled: boolean) =>
    ipcRenderer.invoke("set-debug-logging", enabled),
});
```

### 4. Create Tests for Initialization Hook

Create `apps/desktop/src/hooks/__tests__/useInitializeAdvancedSettings.test.ts`:

```typescript
import { renderHook } from "@testing-library/react";
import { useDesktopSettingsPersistence } from "@fishbowl-ai/ui-shared";
import { applyAdvancedSettings } from "@/utils";
import { useInitializeAdvancedSettings } from "../useInitializeAdvancedSettings";

jest.mock("@fishbowl-ai/ui-shared");
jest.mock("@/utils");

const mockUseDesktopSettingsPersistence =
  useDesktopSettingsPersistence as jest.MockedFunction<
    typeof useDesktopSettingsPersistence
  >;

describe("useInitializeAdvancedSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should apply advanced settings when they are loaded", () => {
    const mockSettings = {
      advanced: {
        debugLogging: true,
        experimentalFeatures: false,
      },
    };

    mockUseDesktopSettingsPersistence.mockReturnValue({
      settings: mockSettings,
      isLoading: false,
      error: null,
      saveSettings: jest.fn(),
    });

    renderHook(() => useInitializeAdvancedSettings());

    expect(applyAdvancedSettings).toHaveBeenCalledWith({
      debugLogging: true,
      experimentalFeatures: false,
    });
  });

  it("should not apply settings when settings are not loaded", () => {
    mockUseDesktopSettingsPersistence.mockReturnValue({
      settings: null,
      isLoading: true,
      error: null,
      saveSettings: jest.fn(),
    });

    renderHook(() => useInitializeAdvancedSettings());

    expect(applyAdvancedSettings).not.toHaveBeenCalled();
  });

  it("should not apply settings when advanced settings are missing", () => {
    mockUseDesktopSettingsPersistence.mockReturnValue({
      settings: { general: {}, appearance: {} },
      isLoading: false,
      error: null,
      saveSettings: jest.fn(),
    });

    renderHook(() => useInitializeAdvancedSettings());

    expect(applyAdvancedSettings).not.toHaveBeenCalled();
  });
});
```

### 5. Update App Tests

Update `apps/desktop/src/App.test.tsx` to include advanced settings initialization:

```typescript
// Add mock for useInitializeAdvancedSettings
jest.mock("@/hooks/useInitializeAdvancedSettings", () => ({
  useInitializeAdvancedSettings: jest.fn(),
}));

describe("App advanced settings initialization", () => {
  it("should initialize advanced settings on mount", () => {
    render(<App />);

    expect(useInitializeAdvancedSettings).toHaveBeenCalled();
  });
});
```

### 6. Add Integration with Logging System

Ensure the logger respects the debug setting from the start:

```typescript
// In logger configuration or initialization
export async function initializeLogger() {
  // Load settings to determine initial log level
  const settings = await window.electronAPI?.settings?.load();

  if (settings?.advanced?.debugLogging) {
    logger.setLevel("debug");
  } else {
    logger.setLevel("info");
  }
}
```

## Acceptance Criteria

- ✓ Advanced settings are loaded on application startup
- ✓ Debug logging is applied immediately when app starts
- ✓ Hook integrates seamlessly with existing initialization
- ✓ No errors if settings are not yet loaded
- ✓ Logger level is set correctly based on saved preference
- ✓ Electron API is called if available
- ✓ Unit tests verify initialization behavior
- ✓ App tests verify hook is called on mount

## Testing Requirements

Write unit tests to verify:

- Hook applies settings when loaded
- Hook handles missing settings gracefully
- Hook doesn't apply settings while loading
- Integration with App component works
- Logger initialization respects debug setting
- No memory leaks or infinite loops

## File Locations

- Create hook: `apps/desktop/src/hooks/useInitializeAdvancedSettings.ts`
- Create tests: `apps/desktop/src/hooks/__tests__/useInitializeAdvancedSettings.test.ts`
- Update App: `apps/desktop/src/App.tsx`
- Update App tests: `apps/desktop/src/App.test.tsx`

### Log
