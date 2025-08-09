---
id: T-add-graceful-safestorage
title: Add graceful safeStorage fallback handling for headless environments
status: open
priority: medium
prerequisites:
  - T-fix-ci-environment-variables
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T02:41:27.624Z
updated: 2025-08-09T02:41:27.624Z
---

# Add Graceful safeStorage Fallback Handling for Headless Environments

## Context

While fixing the CI environment variable should resolve the immediate issue, the application should be more resilient to safeStorage failures in various deployment scenarios (different CI systems, Docker containers, headless servers, etc.).

## Problem Details

- Electron's safeStorage can fail or be unavailable in various environments
- Current implementation likely doesn't handle safeStorage write failures gracefully
- Modal close operations depend on successful storage operations completing
- Need defensive programming to prevent UI hangs when storage fails

## Research References

- Electron docs: `safeStorage.isEncryptionAvailable()` can return false in headless environments
- `safeStorage.getSelectedStorageBackend()` returns "basic_text" when no proper keychain is available
- Command line flag `--password-store="basic"` forces basic text storage

## Implementation Requirements

### 1. Find Current safeStorage Usage

**Location**: Search codebase for safeStorage usage in LLM configuration save logic

- Look in `apps/desktop/src/` for main process code handling LLM configs
- Find where API keys are stored using safeStorage
- Identify the save flow that's causing modals to hang

### 2. Add Storage Backend Detection

**File**: Main process file handling LLM configuration storage

Add detection logic:

```javascript
import { safeStorage } from "electron";

function getStorageCapabilities() {
  const isAvailable = safeStorage.isEncryptionAvailable();
  const backend = safeStorage.getSelectedStorageBackend();

  return {
    encryptionAvailable: isAvailable,
    backend: backend,
    isSecure: backend !== "basic_text",
  };
}
```

### 3. Implement Fallback Storage Strategy

**Options to consider**:

- A) Use basic text storage with warning when secure storage fails
- B) Store in regular JSON with user notification about reduced security
- C) Fail fast with clear error message to user

**Recommended Approach**: Option A with user notification

```javascript
async function saveApiKey(configId, apiKey) {
  const capabilities = getStorageCapabilities();

  if (!capabilities.encryptionAvailable) {
    console.warn("Secure storage unavailable, using basic encryption");
    // Store with basic encryption or in config file with warning
  }

  try {
    // Attempt safeStorage save with timeout
    return await Promise.race([
      safeStorage.encryptString(apiKey),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Storage timeout")), 5000),
      ),
    ]);
  } catch (error) {
    console.error("safeStorage failed, using fallback:", error);
    // Implement fallback storage strategy
    return handleStorageFallback(configId, apiKey);
  }
}
```

### 4. Add Command Line Flag Support for Testing

**File**: Main process initialization

```javascript
// Add command line flag support for testing
if (app.commandLine.hasSwitch("password-store")) {
  const storageType = app.commandLine.getSwitchValue("password-store");
  if (storageType === "basic") {
    console.log("Using basic password storage for testing");
  }
}
```

### 5. Update Test Configuration

**File**: `tests/desktop/helpers/createElectronApp.ts` (or similar)

Add command line flag for test environments:

```javascript
// For CI/test environments, use basic storage
const electronArgs = process.env.CI ? ["--password-store=basic"] : [];
```

## Acceptance Criteria

- [ ] Application detects safeStorage capabilities on startup
- [ ] Graceful fallback when safeStorage is unavailable or fails
- [ ] API key save operations complete within reasonable time (< 1 second)
- [ ] Modal close operations no longer hang on storage failures
- [ ] User receives appropriate notification when secure storage is unavailable
- [ ] Tests pass in both secure and basic storage modes
- [ ] Unit tests cover storage fallback scenarios
- [ ] Documentation explains storage security implications

## Testing Instructions

1. Test with `--password-store=basic` flag to simulate CI environment
2. Create mock scenarios where safeStorage operations timeout
3. Verify modal close behavior with both successful and failed storage
4. Test configuration creation/editing in various storage modes
5. Confirm user experience remains smooth with clear error messages

## Files to Modify

- Main process IPC handlers for LLM configuration
- Electron main process initialization
- Error handling in configuration save flows
- Test helper utilities for Electron app creation

## Security Considerations

- When fallback storage is used, clearly indicate reduced security to users
- Consider encrypting with app-specific key even in fallback mode
- Document security implications of different storage backends
- Ensure fallback doesn't expose sensitive data in plain text files

## Dependencies

- Should be implemented after CI environment fix is verified working
- May require updates to test utilities and documentation
- Consider impact on existing user configurations
