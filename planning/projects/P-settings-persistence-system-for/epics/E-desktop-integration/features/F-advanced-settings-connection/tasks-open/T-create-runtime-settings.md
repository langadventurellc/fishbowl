---
kind: task
id: T-create-runtime-settings
title: Create runtime settings application utilities with unit tests
status: open
priority: high
prerequisites: []
created: "2025-08-03T17:33:49.938307"
updated: "2025-08-03T17:33:49.938307"
schema_version: "1.1"
parent: F-advanced-settings-connection
---

# Create runtime settings application utilities with unit tests

## Context

Following the pattern established by the `applyTheme` utility for appearance settings, we need to create utilities for applying advanced settings that take effect immediately, such as debug logging. This will enable real-time application of settings without requiring a restart.

## Implementation Requirements

### 1. Create applyAdvancedSettings Utility

Create a new file `apps/desktop/src/utils/applyAdvancedSettings.ts`:

```typescript
import type { AdvancedSettingsFormData } from "@fishbowl-ai/ui-shared";
import { logger } from "@fishbowl-ai/shared";

/**
 * Apply advanced settings that take effect immediately
 * @param settings - The advanced settings to apply
 */
export function applyAdvancedSettings(
  settings: AdvancedSettingsFormData,
): void {
  // Apply debug logging setting
  if (settings.debugLogging) {
    enableDebugLogging();
  } else {
    disableDebugLogging();
  }

  // Note: experimentalFeatures will be handled separately as it requires restart
}

/**
 * Enable debug logging throughout the application
 */
export function enableDebugLogging(): void {
  // Set logger to debug level
  logger.setLevel("debug");

  // If Electron API is available, notify main process
  if (window.electronAPI?.setDebugLogging) {
    window.electronAPI.setDebugLogging(true);
  }

  logger.debug("Debug logging enabled");
}

/**
 * Disable debug logging throughout the application
 */
export function disableDebugLogging(): void {
  // Set logger to default level (info)
  logger.setLevel("info");

  // If Electron API is available, notify main process
  if (window.electronAPI?.setDebugLogging) {
    window.electronAPI.setDebugLogging(false);
  }

  logger.info("Debug logging disabled");
}
```

### 2. Create Settings That Require Restart Checker

Create utility to check which settings require restart:

```typescript
/**
 * Check if a settings change requires application restart
 * @param oldSettings - Previous settings values
 * @param newSettings - New settings values
 * @returns true if restart is required
 */
export function requiresRestart(
  oldSettings: AdvancedSettingsFormData | undefined,
  newSettings: AdvancedSettingsFormData,
): boolean {
  // Experimental features require restart
  if (oldSettings?.experimentalFeatures !== newSettings.experimentalFeatures) {
    return true;
  }

  return false;
}

/**
 * Get list of settings that require restart when changed
 */
export function getRestartRequiredSettings(): Array<
  keyof AdvancedSettingsFormData
> {
  return ["experimentalFeatures"];
}
```

### 3. Export from Utils Index

Add to `apps/desktop/src/utils/index.ts`:

```typescript
export {
  applyAdvancedSettings,
  enableDebugLogging,
  disableDebugLogging,
  requiresRestart,
  getRestartRequiredSettings,
} from "./applyAdvancedSettings";
```

### 4. Create Unit Tests

Create `apps/desktop/src/utils/__tests__/applyAdvancedSettings.test.ts`:

```typescript
import { logger } from "@fishbowl-ai/shared";
import {
  applyAdvancedSettings,
  enableDebugLogging,
  disableDebugLogging,
  requiresRestart,
} from "../applyAdvancedSettings";

// Mock logger
jest.mock("@fishbowl-ai/shared", () => ({
  logger: {
    setLevel: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock window.electronAPI
const mockSetDebugLogging = jest.fn();

describe("applyAdvancedSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "electronAPI", {
      value: { setDebugLogging: mockSetDebugLogging },
      writable: true,
    });
  });

  it("should enable debug logging when debugLogging is true", () => {
    applyAdvancedSettings({ debugLogging: true, experimentalFeatures: false });

    expect(logger.setLevel).toHaveBeenCalledWith("debug");
    expect(mockSetDebugLogging).toHaveBeenCalledWith(true);
  });

  it("should disable debug logging when debugLogging is false", () => {
    applyAdvancedSettings({ debugLogging: false, experimentalFeatures: false });

    expect(logger.setLevel).toHaveBeenCalledWith("info");
    expect(mockSetDebugLogging).toHaveBeenCalledWith(false);
  });
});

describe("requiresRestart", () => {
  it("should return true when experimentalFeatures changes", () => {
    const oldSettings = { debugLogging: false, experimentalFeatures: false };
    const newSettings = { debugLogging: false, experimentalFeatures: true };

    expect(requiresRestart(oldSettings, newSettings)).toBe(true);
  });

  it("should return false when only debugLogging changes", () => {
    const oldSettings = { debugLogging: false, experimentalFeatures: false };
    const newSettings = { debugLogging: true, experimentalFeatures: false };

    expect(requiresRestart(oldSettings, newSettings)).toBe(false);
  });
});
```

## Acceptance Criteria

- ✓ applyAdvancedSettings utility is created and exported
- ✓ Debug logging can be enabled/disabled at runtime
- ✓ Logger level changes immediately when debug logging is toggled
- ✓ Electron API is called if available to notify main process
- ✓ requiresRestart utility correctly identifies settings needing restart
- ✓ All utilities have comprehensive unit tests
- ✓ Utilities handle missing window.electronAPI gracefully
- ✓ Code follows established patterns from applyTheme

## Testing Requirements

Unit tests must verify:

- Debug logging enables/disables correctly
- Logger level is set appropriately
- Electron API is called when available
- Utilities work without Electron API
- Restart detection works correctly
- Edge cases are handled properly

## File Locations

- Create utility: `apps/desktop/src/utils/applyAdvancedSettings.ts`
- Create tests: `apps/desktop/src/utils/__tests__/applyAdvancedSettings.test.ts`
- Update exports: `apps/desktop/src/utils/index.ts`

### Log
