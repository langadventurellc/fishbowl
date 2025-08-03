---
kind: task
id: T-implement-platform-detection
status: done
title: Implement platform detection utility with unit tests
priority: high
prerequisites:
  - T-create-logging-folder-structure
created: "2025-08-02T11:47:17.853765"
updated: "2025-08-02T12:20:21.512335"
schema_version: "1.1"
worktree: null
---

## Implement platform detection utility with unit tests

### Context

Create a utility function that detects the current platform (Electron, React Native, or Web). This is needed by the StructuredLogger to include platform information in log entries.

### Implementation Requirements

1. Create platform detection logic that identifies Electron, React Native, or Web environments
2. Handle edge cases and provide reliable detection
3. Write comprehensive unit tests covering all platforms

### Technical Approach

#### File: packages/shared/src/logging/utils/platform.ts

```typescript
export type Platform = "electron" | "react-native" | "web";

export function detectPlatform(): Platform {
  // Check for Electron renderer process
  if (typeof window !== "undefined" && window.process?.type === "renderer") {
    return "electron";
  }

  // Check for Electron main process
  if (typeof process !== "undefined" && process.versions?.electron) {
    return "electron";
  }

  // Check for React Native
  if (typeof global !== "undefined" && global.__DEV__ !== undefined) {
    return "react-native";
  }

  // Check for React Native using navigator.product
  if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
    return "react-native";
  }

  // Default to web
  return "web";
}
```

#### File: packages/shared/src/logging/utils/**tests**/platform.test.ts

```typescript
import { detectPlatform } from "../platform";

describe("detectPlatform", () => {
  // Save original values
  const originalWindow = global.window;
  const originalProcess = global.process;
  const originalGlobal = global.global;
  const originalNavigator = global.navigator;

  beforeEach(() => {
    // Reset all globals
    delete (global as any).window;
    delete (global as any).process;
    delete (global as any).global;
    delete (global as any).navigator;
  });

  afterAll(() => {
    // Restore original values
    global.window = originalWindow;
    global.process = originalProcess;
    global.global = originalGlobal;
    global.navigator = originalNavigator;
  });

  it("should detect Electron renderer process", () => {
    (global as any).window = {
      process: { type: "renderer" },
    };

    expect(detectPlatform()).toBe("electron");
  });

  it("should detect Electron main process", () => {
    (global as any).process = {
      versions: { electron: "28.0.0" },
    };

    expect(detectPlatform()).toBe("electron");
  });

  it("should detect React Native via __DEV__", () => {
    (global as any).global = {
      __DEV__: true,
    };

    expect(detectPlatform()).toBe("react-native");
  });

  it("should detect React Native via navigator.product", () => {
    (global as any).navigator = {
      product: "ReactNative",
    };

    expect(detectPlatform()).toBe("react-native");
  });

  it("should default to web when no specific platform detected", () => {
    (global as any).window = {};
    (global as any).navigator = { userAgent: "Mozilla/5.0" };

    expect(detectPlatform()).toBe("web");
  });

  it("should handle undefined globals gracefully", () => {
    // All globals are undefined
    expect(detectPlatform()).toBe("web");
  });
});
```

#### File: packages/shared/src/logging/utils/index.ts

```typescript
export { detectPlatform } from "./platform";
export type { Platform } from "./platform";
```

### Acceptance Criteria

- [ ] Platform detection correctly identifies Electron environments (main and renderer)
- [ ] Platform detection correctly identifies React Native environments
- [ ] Platform detection defaults to 'web' for browser environments
- [ ] Unit tests cover all detection scenarios
- [ ] Unit tests achieve 100% code coverage
- [ ] TypeScript compilation succeeds
- [ ] `pnpm quality` passes without issues

### Testing Requirements

- Test Electron renderer process detection
- Test Electron main process detection
- Test React Native detection via **DEV** global
- Test React Native detection via navigator.product
- Test web platform as default
- Test handling of undefined globals
- Ensure no runtime errors in any environment

### Log

**2025-08-02T17:30:02.328402Z** - Successfully implemented platform detection utility with comprehensive unit tests and 100% coverage. The utility reliably detects Electron (main/renderer), React Native, and Web environments using runtime checks of global objects like process.type, window.process, navigator.product, and global.**DEV**. Implemented with caching for performance, following the project's one-export-per-file rule, and passing all quality checks (lint, format, type-check). All 517 tests pass including the new platform detection test suite.

- filesChanged: ["packages/shared/src/logging/utils/platformTypes.ts", "packages/shared/src/logging/utils/PlatformInfo.ts", "packages/shared/src/logging/utils/detectPlatform.ts", "packages/shared/src/logging/utils/getPlatform.ts", "packages/shared/src/logging/utils/resetPlatformCache.ts", "packages/shared/src/logging/utils/PlatformCache.ts", "packages/shared/src/logging/utils/__tests__/detectPlatform.test.ts", "packages/shared/src/logging/utils/__tests__/getPlatform.test.ts", "packages/shared/src/logging/utils/__tests__/resetPlatformCache.test.ts", "packages/shared/src/logging/utils/index.ts"]
